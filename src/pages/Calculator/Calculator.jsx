/**
 * Calculator.jsx — Professional Electrical Load Calculator
 * Follows IS 732, IS 3043, IE Rules 1956 (India)
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  APPLIANCE_SECTIONS,
  runCalculation,
  buildShoppingList,
  DEFAULT_TARIFF,
} from '../../utils/electricalCalculator';
import {
  matchCalculatorProducts,
  addCalculatorToCart,
  saveCalculatorAsProject,
} from '../../services/calculatorService';
import { fetchCart } from '../../redux/slices/cartSlice.js';
import { useToast } from '../../components/Toast/ToastProvider';
import './Calculator.css';

// ─── Step labels ──────────────────────────────────────────────────────────────
const STEPS = [
  { id: 0, label: 'Property Details' },
  { id: 1, label: 'Load Input'       },
  { id: 2, label: 'Results'          },
  { id: 3, label: 'Shopping List'    },
];

// ─── Property types ───────────────────────────────────────────────────────────
const PROPERTY_TYPES = [
  { id: '1bhk',    label: '1 BHK',           icon: 'home',     floors: 1, projectType: 'Residential' },
  { id: '2bhk',    label: '2 BHK',           icon: 'home',     floors: 1, projectType: 'Residential' },
  { id: '3bhk',    label: '3 BHK',           icon: 'home',     floors: 2, projectType: 'Residential' },
  { id: '4bhk',    label: '4 BHK+',          icon: 'home',     floors: 2, projectType: 'Residential' },
  { id: 'villa',   label: 'Villa / Bungalow', icon: 'villa',    floors: 3, projectType: 'Residential' },
  { id: 'office',  label: 'Office',           icon: 'business', floors: 2, projectType: 'Commercial'  },
  { id: 'shop',    label: 'Shop / Retail',    icon: 'store',    floors: 1, projectType: 'Commercial'  },
  { id: 'factory', label: 'Factory',          icon: 'factory',  floors: 1, projectType: 'Industrial'  },
];

// ─── Build initial state ──────────────────────────────────────────────────────
function buildInitialSelections() {
  const sel = {};
  for (const section of APPLIANCE_SECTIONS) {
    for (const a of section.appliances) {
      sel[a.id] = { qty: 0, watts: a.wattDefault };
    }
  }
  return sel;
}

function buildInitialHours() {
  const hrs = {};
  for (const section of APPLIANCE_SECTIONS) {
    for (const a of section.appliances) {
      let h = 4;
      if (section.id === 'lighting')    h = 6;
      if (section.id === 'cooling')     h = a.id.startsWith('ac_') ? 8 : 10;
      if (section.id === 'kitchen')     h = 1;
      if (section.id === 'heavy')       h = a.id === 'geyser' ? 1 : 2;
      if (section.id === 'electronics') h = 6;
      if (section.id === 'workshop')    h = 3;
      hrs[a.id] = h;
    }
  }
  return hrs;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const Calculator = () => {
  const { user }   = useSelector((s) => s.auth);
  const dispatch   = useDispatch();
  const toast      = useToast();
  const navigate   = useNavigate();
  const printRef   = useRef(null);

  // ── Step & property ─────────────────────────────────────────────────────
  const [step, setStep]                 = useState(0);
  const [propertyType, setPropertyType] = useState('');
  const [floors, setFloors]             = useState(1);
  const [tariff, setTariff]             = useState(DEFAULT_TARIFF);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ── Appliance inputs ───────────────────────────────────────────────────
  const [selections, setSelections]       = useState(buildInitialSelections);
  const [hoursPerDay, setHoursPerDay]     = useState(buildInitialHours);
  const [wattOverrides, setWattOverrides] = useState({});
  const [openSections, setOpenSections]   = useState(() => {
    const s = {};
    APPLIANCE_SECTIONS.forEach((sec) => { s[sec.id] = !sec.optional; });
    return s;
  });

  // ── Results ────────────────────────────────────────────────────────────
  const [calcResult, setCalcResult] = useState(null);
  const [calcErrors, setCalcErrors] = useState([]);

  // ── Live load preview ─────────────────────────────────────────────────
  const [liveLoad, setLiveLoad] = useState(0);

  // ── Shopping list & catalog matching ──────────────────────────────────
  const [shoppingList, setShoppingList] = useState([]);
  const [matchedItems, setMatchedItems] = useState([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [pickedIdx, setPickedIdx]       = useState({});

  // ── Actions ───────────────────────────────────────────────────────────
  const [cartLoading, setCartLoading] = useState(false);
  const [projLoading, setProjLoading] = useState(false);

  // ── Real-time load preview ────────────────────────────────────────────
  useEffect(() => {
    let total = 0;
    for (const [id, entry] of Object.entries(selections)) {
      if (entry.qty > 0) total += entry.qty * entry.watts;
    }
    setLiveLoad(total);
  }, [selections]);

  // ─────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────

  const setQty = useCallback((id, val) => {
    const qty = Math.max(0, parseInt(val) || 0);
    let maxQty = 50;
    for (const sec of APPLIANCE_SECTIONS) {
      const a = sec.appliances.find((x) => x.id === id);
      if (a) { maxQty = a.maxQty; break; }
    }
    setSelections((prev) => ({ ...prev, [id]: { ...prev[id], qty: Math.min(qty, maxQty) } }));
  }, []);

  const setWatts = useCallback((id, val) => {
    const w = parseInt(val) || 0;
    setSelections((prev) => ({ ...prev, [id]: { ...prev[id], watts: w } }));
    setWattOverrides((prev) => ({ ...prev, [id]: true }));
  }, []);

  const setHours = useCallback((id, val) => {
    const h = Math.min(24, Math.max(0.5, parseFloat(val) || 0));
    setHoursPerDay((prev) => ({ ...prev, [id]: h }));
  }, []);

  const toggleSection = (id) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const totalSelectedCount = Object.values(selections).filter((e) => e.qty > 0).length;

  const resetAll = () => {
    setSelections(buildInitialSelections());
    setHoursPerDay(buildInitialHours());
    setWattOverrides({});
    setCalcResult(null);
    setCalcErrors([]);
    setMatchedItems([]);
    setShoppingList([]);
    setPickedIdx({});
    setStep(1);
  };

  // ── Calculate ─────────────────────────────────────────────────────────
  const handleCalculate = () => {
    setCalcErrors([]);
    const result = runCalculation(selections, hoursPerDay, { floors, tariff });
    if (result.error) { setCalcErrors(result.errors); return; }
    setCalcResult(result);
    const list = buildShoppingList(result, selections, floors);
    setShoppingList(list);
    setStep(2);
  };

  // ── Match products ────────────────────────────────────────────────────
  const handleMatchProducts = async () => {
    if (!shoppingList.length) return;
    setMatchLoading(true);
    setMatchedItems([]);
    setPickedIdx({});
    setStep(3);
    try {
      const data = await matchCalculatorProducts(shoppingList);
      setMatchedItems(data.items || []);
    } catch {
      setMatchedItems(shoppingList.map((s) => ({ ...s, matches: [], picked: null })));
    } finally {
      setMatchLoading(false);
    }
  };

  // ── Cart & project ────────────────────────────────────────────────────
  const getEffectivePick = (item, idx) => {
    const override = pickedIdx[idx];
    if (override !== undefined) return item.matches[override] || null;
    return item.picked || null;
  };

  const matchedCount = matchedItems.filter((item, idx) => getEffectivePick(item, idx)).length;

  const handleAddAllToCart = async () => {
    if (!user) { navigate('/login'); return; }
    const payload = matchedItems
      .map((item, idx) => ({ product: getEffectivePick(item, idx), qty: item.qty }))
      .filter((x) => x.product)
      .map((x) => ({ productId: x.product._id, quantity: x.qty }));
    if (!payload.length) {
      toast.error('No products matched. Browse the catalog to find items.');
      return;
    }
    setCartLoading(true);
    try {
      const res = await addCalculatorToCart(payload);
      dispatch(fetchCart());
      toast.success(`${res.added} item(s) added to your cart!${res.skipped > 0 ? ` (${res.skipped} out of stock skipped)` : ''}`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add to cart.');
    } finally {
      setCartLoading(false);
    }
  };

  const handleSaveAsProject = async () => {
    if (!user) { navigate('/login'); return; }
    const itemsPayload = matchedItems
      .map((item, idx) => {
        const product = getEffectivePick(item, idx);
        return product ? { productId: product._id, quantity: item.qty, label: item.label } : null;
      })
      .filter(Boolean);
    if (!itemsPayload.length) {
      toast.error('No matched products to save.');
      return;
    }
    const pType = PROPERTY_TYPES.find((p) => p.id === propertyType);
    setProjLoading(true);
    try {
      const project = await saveCalculatorAsProject({
        name: `${pType?.label || 'Property'} — Electrical Wiring Plan`,
        projectType: pType?.projectType || 'Residential',
        description: `Auto-generated from Load Calculator: ${pType?.label}, ${floors} floor(s), ${calcResult ? (calcResult.totalWatts / 1000).toFixed(2) : '?'} kW total load.`,
        items: itemsPayload,
      });
      toast.success(`Project "${project.name}" saved!`);
      setTimeout(() => navigate('/wishlist?tab=projects'), 1200);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save project.');
    } finally {
      setProjLoading(false);
    }
  };

  const WarningBadge = ({ level, message }) => (
    <div className={`warning-badge warning-${level}`}>
      <span className="material-icons warning-icon">
        {level === 'danger' ? 'error' : level === 'warning' ? 'warning' : 'info'}
      </span>
      <span>{message}</span>
    </div>
  );


  // ─────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="calc-page" ref={printRef}>

      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="calc-page-header">
        <div className="calc-page-header-left">
          <div className="calc-badge">Professional Tool</div>
          <h1>Electrical Load Calculator</h1>
          <p>
            Professional electrical planning for residential, commercial &amp; industrial spaces.
            Based on IS 732, IS 3043 &amp; IE Rules 1956.
          </p>
        </div>
        {liveLoad > 0 && step === 1 && (
          <div className="live-load-pill">
            <span className="live-dot" />
            Live: <strong>{(liveLoad / 1000).toFixed(2)} kW</strong>
            <span className="live-amps">≈ {(liveLoad / (230 * 0.85)).toFixed(1)} A</span>
          </div>
        )}
      </div>

      {/* ── Step Indicator ──────────────────────────────────────────── */}
      <div className="calc-step-bar">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`calc-step-item ${i === step ? 'active' : ''} ${i < step ? 'done' : ''} ${i > step ? 'upcoming' : ''}`}
            onClick={() => i < step && setStep(i)}
            style={{ cursor: i < step ? 'pointer' : 'default' }}
          >
            <div className="calc-step-circle">
              {i < step ? <span className="material-icons" style={{fontSize:'16px',lineHeight:1}}>check</span> : <span>{i + 1}</span>}
            </div>
            <span className="calc-step-label">{s.label}</span>
            {i < STEPS.length - 1 && <div className="calc-step-connector" />}
          </div>
        ))}
      </div>

      {/* ═══════ STEP 0 — PROPERTY DETAILS ═══════ */}
      {step === 0 && (
        <div className="calc-card">
          <div className="calc-card-head">
            <h2>Select Property Type</h2>
            <p>Choose your property to get accurate wiring estimates.</p>
          </div>

          <div className="section-block">
            <label className="section-label">Property Type</label>
            <div className="property-grid">
              {PROPERTY_TYPES.map((p) => (
                <button
                  key={p.id}
                  className={`property-card ${propertyType === p.id ? 'selected' : ''}`}
                  onClick={() => { setPropertyType(p.id); setFloors(p.floors); }}
                >
                  <span className="material-icons property-icon">{p.icon}</span>
                  <span className="property-name">{p.label}</span>
                  <span className="property-type-tag">{p.projectType}</span>
                </button>
              ))}
            </div>
          </div>

          {propertyType && (
            <>
              <div className="section-block">
                <label className="section-label">Number of Floors</label>
                <div className="inline-control">
                  <div className="qty-ctrl">
                    <button onClick={() => setFloors((f) => Math.max(1, f - 1))}>−</button>
                    <span>{floors}</span>
                    <button onClick={() => setFloors((f) => Math.min(10, f + 1))}>+</button>
                  </div>
                  <span className="ctrl-hint">Affects conduit &amp; wiring length estimates</span>
                </div>
              </div>

              <div className="section-block">
                <button className="advanced-toggle" onClick={() => setShowAdvanced((v) => !v)}>
                  {showAdvanced ? '▾' : '▸'} Advanced Settings
                </button>
                {showAdvanced && (
                  <div className="advanced-panel">
                    <div className="adv-row">
                      <label>Electricity Tariff (₹/kWh)</label>
                      <input
                        type="number" min="2" max="20" step="0.5"
                        value={tariff}
                        onChange={(e) => setTariff(parseFloat(e.target.value) || DEFAULT_TARIFF)}
                        className="adv-input"
                      />
                      <span className="adv-hint">Your DISCOM rate (default ₹7/kWh)</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="calc-footer-nav">
            <div />
            <button className="btn-primary" disabled={!propertyType} onClick={() => setStep(1)}>
              Next: Enter Appliance Load <span className="material-icons" style={{fontSize:'16px',verticalAlign:'middle'}}>arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* ═══════ STEP 1 — LOAD INPUT ═══════ */}
      {step === 1 && (
        <div className="calc-card">
          <div className="calc-card-head">
            <div>
              <h2>Appliance Load Input</h2>
              <p>
                Enter quantity and usage hours for each appliance.
                Watt values are pre-filled with realistic defaults — edit if your appliance differs.
              </p>
            </div>
            {liveLoad > 0 && (
              <div className="live-load-badge">
                <span>Live Load</span>
                <strong>{(liveLoad / 1000).toFixed(2)} kW</strong>
                <span className="live-load-amps">≈ {(liveLoad / (230 * 0.85)).toFixed(1)} A</span>
              </div>
            )}
          </div>

          {APPLIANCE_SECTIONS.map((section) => {
            const sectionLoad = section.appliances.reduce((sum, a) => {
              const e = selections[a.id];
              return sum + (e?.qty > 0 ? e.qty * e.watts : 0);
            }, 0);
            const hasActive = section.appliances.some((a) => selections[a.id]?.qty > 0);

            return (
              <div key={section.id} className={`appliance-section ${hasActive ? 'has-active' : ''}`}>
                <button
                  className="section-header-btn"
                  onClick={() => toggleSection(section.id)}
                  style={{ '--section-color': section.color }}
                >
                  <div className="section-header-left">
                    <span className="material-icons section-icon">{section.icon}</span>
                    <div>
                      <span className="section-title">{section.label}</span>
                      {section.optional && <span className="optional-tag">Optional</span>}
                    </div>
                  </div>
                  <div className="section-header-right">
                    {sectionLoad > 0 && (
                      <span className="section-load-pill">
                        {sectionLoad >= 1000 ? `${(sectionLoad / 1000).toFixed(2)} kW` : `${sectionLoad} W`}
                      </span>
                    )}
                    <span className="section-chevron">{openSections[section.id] ? '▾' : '▸'}</span>
                  </div>
                </button>

                {openSections[section.id] && (
                  <div className="appliance-grid">
                    {section.appliances.map((appliance) => {
                      const entry  = selections[appliance.id] || { qty: 0, watts: appliance.wattDefault };
                      const ovr    = wattOverrides[appliance.id];
                      const hrs    = hoursPerDay[appliance.id] ?? 4;
                      const active = entry.qty > 0;
                      const itemLoad = active ? entry.qty * entry.watts : 0;

                      return (
                        <div key={appliance.id} className={`appliance-row ${active ? 'active' : ''}`}>
                          <div className="arow-name-col">
                            <span className="arow-name">{appliance.name}</span>
                            <span className="arow-range">{appliance.wattMin}W – {appliance.wattMax}W</span>
                          </div>
                          <div className="arow-watt-col">
                            <label className="mini-label">Watts/unit</label>
                            <input
                              type="number"
                              className={`watt-input ${ovr ? 'overridden' : ''}`}
                              min={appliance.wattMin}
                              max={appliance.wattMax}
                              value={entry.watts}
                              onChange={(e) => setWatts(appliance.id, e.target.value)}
                            />
                          </div>
                          <div className="arow-qty-col">
                            <label className="mini-label">Qty (max {appliance.maxQty})</label>
                            <div className="qty-ctrl small">
                              <button onClick={() => setQty(appliance.id, entry.qty - 1)}>−</button>
                              <input
                                type="number" min="0" max={appliance.maxQty}
                                value={entry.qty}
                                onChange={(e) => setQty(appliance.id, e.target.value)}
                                className="qty-input-direct"
                              />
                              <button onClick={() => setQty(appliance.id, entry.qty + 1)}>+</button>
                            </div>
                          </div>
                          <div className="arow-hours-col">
                            <label className="mini-label">{hrs}h/day</label>
                            <input
                              type="range" min="0.5" max="24" step="0.5"
                              value={hrs}
                              className="hours-slider"
                              disabled={!active}
                              onChange={(e) => setHours(appliance.id, e.target.value)}
                            />
                          </div>
                          <div className="arow-load-col">
                            {active ? (
                              <span className="item-load-pill">
                                {itemLoad >= 1000 ? `${(itemLoad / 1000).toFixed(2)} kW` : `${itemLoad} W`}
                              </span>
                            ) : (
                              <span className="item-load-zero">—</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {calcErrors.length > 0 && (
            <div className="validation-errors">
              <strong>Fix the following before calculating:</strong>
              <ul>{calcErrors.map((e, i) => <li key={i}>{e}</li>)}</ul>
            </div>
          )}

          <div className="calc-footer-nav">
            <button className="btn-secondary" onClick={() => setStep(0)}><span className="material-icons" style={{fontSize:'16px',verticalAlign:'middle'}}>arrow_back</span> Back</button>
            <div className="footer-nav-right">
              <button className="btn-ghost" onClick={resetAll}>↺ Reset</button>
              <button className="btn-primary" disabled={totalSelectedCount === 0} onClick={handleCalculate}>
                Calculate Requirements <span className="material-icons" style={{fontSize:'16px',verticalAlign:'middle'}}>arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ STEP 2 — RESULTS ═══════ */}
      {step === 2 && calcResult && (
        <div className="calc-card" id="printable-results">
          <div className="calc-card-head results-head">
            <div>
              <h2>Electrical Load Analysis Report</h2>
              <p>
                Property: <strong>{PROPERTY_TYPES.find((p) => p.id === propertyType)?.label || '—'}</strong>
                &nbsp;·&nbsp;Floors: <strong>{floors}</strong>
                &nbsp;·&nbsp;Safety margin: <strong>25%</strong>
                &nbsp;·&nbsp;Voltage: <strong>230V / pf 0.85</strong>
              </p>
            </div>
            <button className="btn-print" onClick={() => window.print()} title="Print / Save as PDF">
              Print / PDF
            </button>
          </div>

          {/* Safety Warnings */}
          <div className="warnings-panel">
            {calcResult.warnings.map((w, i) => (
              <WarningBadge key={i} level={w.level} message={w.message} />
            ))}
          </div>

          {/* Summary Cards */}
          <div className="results-summary-grid">
            {[
              { label: 'Total Connected Load',   value: `${calcResult.totalWatts.toLocaleString('en-IN')} W`, sub: `${(calcResult.totalWatts/1000).toFixed(2)} kW`,      color: '#1e3a5f', icon: 'bolt' },
              { label: 'Design Load (25% margin)',value: `${calcResult.designWatts.toLocaleString('en-IN')} W`,sub: `+${calcResult.marginWatts} W safety buffer`,           color: '#c0392b', icon: 'security' },
              { label: 'Design Current',          value: `${calcResult.designCurrent.toFixed(2)} A`,           sub: 'At 230V, power factor 0.85',                           color: '#c0392b', icon: 'electric_bolt' },
              { label: 'Recommended MCB',         value: calcResult.mcbRating ? `${calcResult.mcbRating} A` : 'Engineer Reqd.', sub: calcResult.requiresEngineer ? 'Over 100A — consult engineer' : 'Main isolator (C-Curve)', color: '#16a34a', icon: 'power_off' },
              { label: 'Main Wire Gauge',         value: calcResult.wireGauge.gauge,                           sub: calcResult.wireGauge.use,                               color: '#d97706', icon: 'cable' },
              { label: 'Phase Requirement',       value: calcResult.phaseResult.phase,                         sub: 'Supply connection type',                               color: calcResult.phaseResult.code === 'single' ? '#16a34a' : '#c0392b', icon: 'waves' },
              { label: 'Distribution Board',      value: `${calcResult.dbResult.recommendedDB}-Way DB`,        sub: `× ${calcResult.dbResult.dbsNeeded} nos. | ${calcResult.dbResult.subCircuits} sub-circuits`, color: '#7c3aed', icon: 'inventory_2' },
              { label: 'Earthing Conductor',      value: calcResult.earthingResult.conductor,                  sub: calcResult.earthingResult.rod,                          color: '#0891b2', icon: 'public' },
              { label: 'Monthly Consumption',     value: `${calcResult.monthlyKwh} kWh`,                       sub: 'At entered usage hours',                               color: '#6d28d9', icon: 'calendar_month' },
              { label: 'Monthly Bill Estimate',   value: `₹${calcResult.monthlyCost.toLocaleString('en-IN')}`, sub: `@ ₹${tariff}/kWh`,                                     color: '#0f766e', icon: 'payments' },
            ].map((card) => (
              <div key={card.label} className="result-summary-card" style={{ '--card-color': card.color }}>
                <div className="rsc-icon"><span className="material-icons">{card.icon}</span></div>
                <div className="rsc-body">
                  <span className="rsc-label">{card.label}</span>
                  <span className="rsc-value" style={{ color: card.color }}>{card.value}</span>
                  <span className="rsc-sub">{card.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Wiring Specification Summary */}
          <div className="wiring-summary-section">
            <h3>Wiring Specification Summary</h3>
            <div className="wiring-summary-grid">
              {[
                ['Main Feed Cable',    `${calcResult.wireGauge.gauge} copper FR PVC`],
                ['Main MCB (Isolator)',calcResult.mcbRating ? `${calcResult.mcbRating}A SP/DP C-Curve (IS 60898)` : 'Engineer required'],
                ['RCCB',              '40A / 30mA sensitivity (IS 12640)'],
                ['Distribution Board',`${calcResult.dbResult.recommendedDB}-way DB × ${calcResult.dbResult.dbsNeeded} nos.`],
                ['Sub-Circuits',      `${calcResult.dbResult.subCircuits} circuits (≤3kW each, IS 732)`],
                ['Earthing Conductor',calcResult.earthingResult.conductor],
                ['Earth Electrodes',  calcResult.earthingResult.rod],
                ['Supply Connection', calcResult.phaseResult.phase],
              ].map(([label, value]) => (
                <div key={label} className="wspec-item">
                  <span className="wspec-label">{label}</span>
                  <span className="wspec-value">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Load Breakdown Table */}
          <div className="breakdown-section">
            <h3>Load Breakdown by Appliance</h3>
            <div className="table-wrapper">
              <table className="breakdown-table">
                <thead>
                  <tr>
                    <th>Appliance</th><th>Section</th><th>Qty</th>
                    <th>W/Unit</th><th>Total Load</th><th>Hrs/Day</th><th>kWh/Month</th>
                  </tr>
                </thead>
                <tbody>
                  {calcResult.detailedBreakdown.map((item, i) => (
                    <tr key={i}>
                      <td className="tbl-name">{item.name}</td>
                      <td className="tbl-section">{item.sectionLabel.replace(/^Section [A-F] \u2013 /, '')}</td>
                      <td className="tbl-center">{item.qty}</td>
                      <td className="tbl-center">{item.watts} W</td>
                      <td className="tbl-load">{item.load >= 1000 ? `${(item.load/1000).toFixed(2)} kW` : `${item.load} W`}</td>
                      <td className="tbl-center">{item.hrs}h</td>
                      <td className="tbl-center">{item.kwh.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4}><strong>Total Connected Load</strong></td>
                    <td className="tbl-load"><strong>{(calcResult.totalWatts/1000).toFixed(2)} kW</strong></td>
                    <td /><td className="tbl-center"><strong>{calcResult.monthlyKwh} kWh</strong></td>
                  </tr>
                  <tr className="tbl-margin-row">
                    <td colSpan={4}><strong>Design Load (25% safety margin)</strong></td>
                    <td className="tbl-load"><strong>{(calcResult.designWatts/1000).toFixed(2)} kW</strong></td>
                    <td /><td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="disclaimer-box">
            <div className="disclaimer-icon"><span className="material-icons">warning</span></div>
            <div className="disclaimer-text">
              <strong>Professional Disclaimer</strong>
              <p>
                This calculation is an estimation tool only. It does not replace formal electrical
                engineering design. Final conductor sizing, MCB selection and earthing system must be
                reviewed and certified by a licensed electrical contractor holding a valid permit under
                the Indian Electricity Rules 1956. All wiring must comply with IS 732, IS 3043, and
                applicable local DISCOM regulations.
              </p>
            </div>
          </div>

          <div className="calc-footer-nav">
            <button className="btn-secondary" onClick={() => setStep(1)}><span className="material-icons" style={{fontSize:'16px',verticalAlign:'middle'}}>arrow_back</span> Edit Load</button>
            <div className="footer-nav-right">
              <button className="btn-ghost" onClick={() => window.print()}>Print Report</button>
              <button className="btn-primary" onClick={handleMatchProducts}>
                View Material List &amp; Shop <span className="material-icons" style={{fontSize:'16px',verticalAlign:'middle'}}>arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ STEP 3 — SHOPPING LIST ═══════ */}
      {step === 3 && (
        <div className="calc-card">
          <div className="calc-card-head">
            <div>
              <h2>Material &amp; Shopping List</h2>
              <p>Products matched from our catalog based on your wiring requirements.</p>
            </div>
            {!matchLoading && matchedItems.length > 0 && (
              <div className="match-count-badge">
                {matchedCount} / {matchedItems.length} matched
              </div>
            )}
          </div>

          {matchLoading ? (
            <div className="match-skeleton-list">
              {[1,2,3,4,5].map((n) => <div key={n} className="match-skeleton-row" />)}
              <p className="match-loading-msg">Searching catalog for best matches…</p>
            </div>
          ) : (
            <div className="smart-shopping-list">
              {matchedItems.map((item, idx) => {
                const activePick = getEffectivePick(item, idx);
                const hasMatch   = item.matches && item.matches.length > 0;
                return (
                  <div key={idx} className={`smart-item ${hasMatch ? 'has-match' : 'no-match'}`}>
                    <div className="si-req">
                      <span className="si-label">{item.label}</span>
                      <span className="si-note">{item.note}</span>
                      <span className="si-qty">Required: {item.qty} {item.unit}</span>
                    </div>
                    <div className="si-product">
                      {activePick ? (
                        <div className="si-matched">
                          {activePick.images?.[0]?.url && (
                            <img src={activePick.images[0].url} alt={activePick.name} className="si-img" />
                          )}
                          <div className="si-info">
                            <span className="si-pname">{activePick.name}</span>
                            <span className="si-brand">{activePick.brand}</span>
                            <span className="si-price">
                              ₹{activePick.price?.toLocaleString('en-IN')}
                              <em> × {item.qty} = ₹{(activePick.price * item.qty).toLocaleString('en-IN')}</em>
                            </span>
                          </div>
                          {item.matches.length > 1 && (
                            <div className="si-alt-picks">
                              <span className="alt-label">Options:</span>
                              {item.matches.map((m, mi) => (
                                <button
                                  key={m._id}
                                  className={`alt-btn ${(pickedIdx[idx] ?? 0) === mi ? 'active' : ''}`}
                                  onClick={() => setPickedIdx((p) => ({ ...p, [idx]: mi }))}
                                  title={m.name}
                                >{mi + 1}</button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="si-no-match">
                          <span>Not in catalog yet</span>
                          <button
                            className="btn-browse"
                            onClick={() => navigate(`/products?keyword=${encodeURIComponent(item.searchTerm)}`)}
                          >Browse <span className="material-icons" style={{fontSize:'14px',verticalAlign:'middle'}}>arrow_forward</span></button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!matchLoading && matchedItems.length > 0 && (
            <div className="cost-total-row">
              {(() => {
                const total = matchedItems.reduce((sum, item, idx) => {
                  const p = getEffectivePick(item, idx);
                  return sum + (p ? p.price * item.qty : 0);
                }, 0);
                return (
                  <>
                    <span className="cost-total-label">Estimated Material Cost</span>
                    <span className="cost-total-value">₹{total.toLocaleString('en-IN')}</span>
                  </>
                );
              })()}
            </div>
          )}

          {!matchLoading && matchedCount > 0 && (
            <div className="cta-actions">
              <button className="btn-add-cart" onClick={handleAddAllToCart} disabled={cartLoading || projLoading}>
                {cartLoading ? 'Adding…' : `Add All ${matchedCount} Items to Cart`}
              </button>
              {user ? (
                <button className="btn-save-project" onClick={handleSaveAsProject} disabled={cartLoading || projLoading}>
                  {projLoading ? 'Saving…' : 'Save as Project'}
                </button>
              ) : (
                <p className="login-hint">
                  <button className="link-btn" onClick={() => navigate('/login')}>Log in</button>
                  {' '}to save this as a named project.
                </p>
              )}
            </div>
          )}

          <div className="calc-footer-nav">
            <button className="btn-secondary" onClick={() => setStep(2)}><span className="material-icons" style={{fontSize:'16px',verticalAlign:'middle'}}>arrow_back</span> Back to Results</button>
            <button className="btn-ghost" onClick={() => navigate('/products')}>Browse Catalog <span className="material-icons" style={{fontSize:'16px',verticalAlign:'middle'}}>arrow_forward</span></button>
          </div>
        </div>
      )}

      {/* ── Disclaimer footer ──────────────────────────────────────────── */}
      <div className="calc-disclaimer-footer">
        <strong>Disclaimer:</strong>{' '}
        This calculation is an estimation tool. Final electrical planning must be approved by a
        licensed electrician as per IS 732, IS 3043 and the Indian Electricity Rules 1956.
      </div>
    </div>
  );
};

export default Calculator;
