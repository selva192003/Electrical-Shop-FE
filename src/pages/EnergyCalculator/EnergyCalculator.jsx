import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EnergyCalculator.css';

const APPLIANCES = [
  // { id, name, watts, defaultHours, inefficientAlt, efficientAlt, savingsPercent }
  { id: 'old_ac',    name: 'Old Window AC (1.5T, 3-star)',  watts: 1800, defaultHours: 8,  efficientName: 'Inverter AC (5-star)', efficientWatts: 1100, searchTerm: '5 star inverter ac' },
  { id: 'old_fridge',name: 'Old Refrigerator (250L, 2-star)',watts: 250,  defaultHours: 24, efficientName: 'BEE 5-star Refrigerator', efficientWatts: 130, searchTerm: '5 star refrigerator' },
  { id: 'old_fan',   name: 'Old Ceiling Fan (non-BLDC)',    watts: 80,   defaultHours: 12, efficientName: 'BLDC Energy-Saving Fan', efficientWatts: 28, searchTerm: 'bldc ceiling fan' },
  { id: 'incandescent', name: 'Incandescent Bulb (60W)', watts: 60, defaultHours: 8, efficientName: 'LED Bulb (equivalent)', efficientWatts: 8, searchTerm: 'led bulb' },
  { id: 'cfl',       name: 'CFL Bulb (23W)',               watts: 23,   defaultHours: 8,  efficientName: 'LED Bulb (equivalent)', efficientWatts: 9, searchTerm: 'led bulb 9w' },
  { id: 'old_geyser',name: 'Storage Geyser (15L)',         watts: 2000, defaultHours: 1,  efficientName: 'Instant Geyser (3L)', efficientWatts: 3000, searchTerm: 'instant water heater' },
  { id: 'old_pump',  name: 'Old Water Pump (0.5HP)',        watts: 373,  defaultHours: 2,  efficientName: 'Energy-Efficient Pump', efficientWatts: 280, searchTerm: 'energy efficient water pump' },
];

const TARIFF = 7; // ₹ per kWh

const EnergyCalculator = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState({});
  const [hours, setHours] = useState({});
  const [qty, setQty] = useState({});
  const [results, setResults] = useState(null);

  const toggleAppliance = (id) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const calculate = () => {
    let currentMonthlyKwh = 0;
    let efficientMonthlyKwh = 0;
    const breakdown = [];

    for (const appliance of APPLIANCES) {
      if (!selected[appliance.id]) continue;
      const h = hours[appliance.id] || appliance.defaultHours;
      const q = qty[appliance.id] || 1;

      const currentKwh = (appliance.watts * h * 30 * q) / 1000;
      const efficientKwh = (appliance.efficientWatts * h * 30 * q) / 1000;

      currentMonthlyKwh += currentKwh;
      efficientMonthlyKwh += efficientKwh;

      breakdown.push({
        ...appliance,
        h, q,
        currentKwh: currentKwh.toFixed(1),
        efficientKwh: efficientKwh.toFixed(1),
        monthlySaving: ((currentKwh - efficientKwh) * TARIFF).toFixed(0),
        yearlySaving: ((currentKwh - efficientKwh) * TARIFF * 12).toFixed(0),
        savingsPercent: Math.round(((appliance.watts - appliance.efficientWatts) / appliance.watts) * 100),
      });
    }

    const currentBill = currentMonthlyKwh * TARIFF;
    const efficientBill = efficientMonthlyKwh * TARIFF;
    const monthlySaving = currentBill - efficientBill;
    const yearlySaving = monthlySaving * 12;
    const co2Reduction = ((currentMonthlyKwh - efficientMonthlyKwh) * 0.82).toFixed(1); // 0.82 kg CO2 per kWh

    setResults({ currentMonthlyKwh: currentMonthlyKwh.toFixed(1), efficientMonthlyKwh: efficientMonthlyKwh.toFixed(1), currentBill: currentBill.toFixed(0), efficientBill: efficientBill.toFixed(0), monthlySaving: monthlySaving.toFixed(0), yearlySaving: yearlySaving.toFixed(0), co2Reduction, breakdown });
  };

  const selectedCount = Object.values(selected).filter(Boolean).length;

  return (
    <div className="energy-calc-page">
      <div className="energy-header">
        <h1>💡 Energy Bill Calculator</h1>
        <p>Discover how much you can save by switching to energy-efficient appliances</p>
      </div>

      <div className="energy-card">
        <h2>Select your current appliances</h2>
        <div className="energy-appliances">
          {APPLIANCES.map((appliance) => {
            const isSelected = !!selected[appliance.id];
            const q = qty[appliance.id] || 1;
            const h = hours[appliance.id] || appliance.defaultHours;
            return (
              <div key={appliance.id} className={`energy-item ${isSelected ? 'active' : ''}`}>
                <div className="energy-item-header" onClick={() => toggleAppliance(appliance.id)}>
                  <span className={`energy-checkbox ${isSelected ? 'checked' : ''}`}>{isSelected ? '✓' : ''}</span>
                  <div className="energy-item-info">
                    <span className="energy-item-name">{appliance.name}</span>
                    <span className="energy-item-watts">{appliance.watts}W</span>
                  </div>
                </div>
                {isSelected && (
                  <div className="energy-item-controls">
                    <div className="energy-control-group">
                      <label>Quantity</label>
                      <div className="qty-control small">
                        <button onClick={() => setQty((p) => ({ ...p, [appliance.id]: Math.max(1, (p[appliance.id] || 1) - 1) }))}>−</button>
                        <span>{q}</span>
                        <button onClick={() => setQty((p) => ({ ...p, [appliance.id]: (p[appliance.id] || 1) + 1 }))}>+</button>
                      </div>
                    </div>
                    <div className="energy-control-group">
                      <label>{h}h/day use</label>
                      <input type="range" min="0.5" max="24" step="0.5" value={h}
                        onChange={(e) => setHours((p) => ({ ...p, [appliance.id]: parseFloat(e.target.value) }))}
                        style={{ accentColor: '#003566' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          className="energy-calc-btn"
          disabled={selectedCount === 0}
          onClick={calculate}
        >
          Calculate My Savings ({selectedCount} appliance{selectedCount !== 1 ? 's' : ''})
        </button>
      </div>

      {results && (
        <div className="energy-results">
          <h2>Your Potential Savings</h2>

          <div className="savings-hero">
            <div className="savings-box current">
              <span className="savings-label">Current Monthly Bill</span>
              <span className="savings-amount">₹{Number(results.currentBill).toLocaleString('en-IN')}</span>
              <span className="savings-kwh">{results.currentMonthlyKwh} kWh</span>
            </div>
            <div className="savings-arrow">→</div>
            <div className="savings-box efficient">
              <span className="savings-label">With Efficient Products</span>
              <span className="savings-amount">₹{Number(results.efficientBill).toLocaleString('en-IN')}</span>
              <span className="savings-kwh">{results.efficientMonthlyKwh} kWh</span>
            </div>
            <div className="savings-box highlight">
              <span className="savings-label">Monthly Savings</span>
              <span className="savings-amount green">₹{Number(results.monthlySaving).toLocaleString('en-IN')}</span>
              <span className="savings-kwh">₹{Number(results.yearlySaving).toLocaleString('en-IN')}/year</span>
            </div>
            <div className="savings-box eco">
              <span className="savings-label">CO₂ Reduction</span>
              <span className="savings-amount eco-green">{results.co2Reduction} kg</span>
              <span className="savings-kwh">per month 🌱</span>
            </div>
          </div>

          {results.breakdown.map((item, i) => (
            <div key={i} className="savings-item-card">
              <div className="savings-item-header">
                <span className="savings-item-name">{item.name}</span>
                <span className="savings-badge">Save ₹{Number(item.yearlySaving).toLocaleString('en-IN')}/year</span>
              </div>
              <div className="savings-comparison">
                <div className="savings-old">
                  <span>Current: {item.currentKwh} kWh/month</span>
                </div>
                <div className="savings-new">
                  <span>If switched to <strong>{item.efficientName}</strong>: {item.efficientKwh} kWh/month</span>
                  <span className="savings-percent">-{item.savingsPercent}% energy</span>
                </div>
              </div>
              <button className="view-efficient-btn" onClick={() => navigate(`/products?keyword=${encodeURIComponent(item.searchTerm)}`)}>
                View {item.efficientName} →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnergyCalculator;
