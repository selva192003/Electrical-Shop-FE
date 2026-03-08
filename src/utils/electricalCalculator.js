/**
 * electricalCalculator.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Professional Electrical Load Calculation Utility
 * Follows Indian Electrical Standards (IS 732, IS 3043, IE Rules 1956)
 * Voltage: 230V single-phase / 400V three-phase (50 Hz)
 *
 * Designed to simulate the reasoning of an experienced licensed electrician.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** India standard single-phase supply voltage (IS 13234) */
export const VOLTAGE_SINGLE_PHASE = 230;

/** India standard three-phase line voltage */
export const VOLTAGE_THREE_PHASE = 400;

/** Safety / diversity factor – 25% headroom above calculated current */
export const SAFETY_MARGIN = 1.25;

/** Average India domestic electricity tariff ₹/kWh */
export const DEFAULT_TARIFF = 7;

/**
 * Standard MCB trip ratings available in India (IS 60898).
 * Never recommend a non-standard value.
 */
export const MCB_STANDARD_RATINGS = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100];

/**
 * Wire gauge table for PVC insulated copper conductors (IS 694).
 * Current capacity values are based on IS 732 Table 4 (clipped/enclosed in conduit,
 * ambient 30°C, single-phase two-wire circuit).
 *
 * Each entry: { gauge, maxAmps, use }
 */
export const WIRE_GAUGE_TABLE = [
  { gauge: '1.0 sq.mm',  maxAmps: 10,  use: 'Lighting circuits only' },
  { gauge: '1.5 sq.mm',  maxAmps: 14,  use: 'Lights, fans, small loads' },
  { gauge: '2.5 sq.mm',  maxAmps: 20,  use: 'Socket circuits, AC units, small appliances' },
  { gauge: '4.0 sq.mm',  maxAmps: 27,  use: 'Geysers, washing machines, heavy appliances' },
  { gauge: '6.0 sq.mm',  maxAmps: 34,  use: 'Sub-mains, heavy loads, water pumps' },
  { gauge: '10 sq.mm',   maxAmps: 46,  use: 'Main feeders, industrial sub-circuits' },
  { gauge: '16 sq.mm',   maxAmps: 61,  use: 'Industrial mains, large sub-panels' },
  { gauge: '25 sq.mm',   maxAmps: 80,  use: 'Industrial main supply cables' },
];

/**
 * Earhing conductor sizing guide (IS 3043).
 */
export const EARTHING_TABLE = [
  { maxAmps: 10,  conductor: '1.5 sq.mm copper',  rod: '1× 600mm × 12mm GI rod' },
  { maxAmps: 20,  conductor: '2.5 sq.mm copper',  rod: '1× 900mm × 12mm GI rod' },
  { maxAmps: 32,  conductor: '4.0 sq.mm copper',  rod: '1× 1200mm × 14mm GI rod' },
  { maxAmps: 63,  conductor: '6.0 sq.mm copper',  rod: '2× 1200mm × 14mm GI rod' },
  { maxAmps: 100, conductor: '10 sq.mm copper',   rod: '2× 1500mm × 16mm GI rod' },
  { maxAmps: Infinity, conductor: '16 sq.mm copper', rod: '3× 1500mm × 16mm GI rod' },
];

/**
 * Defined appliance sections with realistic default watt values
 * and validation constraints.
 *
 * wattDefault – realistic Indian market default
 * wattMin / wattMax – hard validation bounds (prevents absurd entries)
 * maxQty – maximum realistic quantity to prevent accidental huge loads
 */
export const APPLIANCE_SECTIONS = [
  {
    id: 'lighting',
    label: 'Section A – Lighting',
    icon: 'lightbulb',
    color: '#f59e0b',
    appliances: [
      { id: 'led_bulb',      name: 'LED Bulb',               wattDefault: 9,    wattMin: 3,   wattMax: 20,   maxQty: 50,  unit: 'bulbs' },
      { id: 'tube_light',    name: 'LED Tube Light (4 ft)',   wattDefault: 18,   wattMin: 9,   wattMax: 36,   maxQty: 30,  unit: 'pcs' },
      { id: 'panel_light',   name: 'LED Panel Light',         wattDefault: 20,   wattMin: 10,  wattMax: 45,   maxQty: 20,  unit: 'pcs' },
      { id: 'downlight',     name: 'Recessed Downlight',      wattDefault: 12,   wattMin: 6,   wattMax: 25,   maxQty: 30,  unit: 'pcs' },
      { id: 'deco_light',    name: 'Decorative / Strip LED',  wattDefault: 15,   wattMin: 5,   wattMax: 100,  maxQty: 20,  unit: 'sets' },
      { id: 'cfl',           name: 'CFL (legacy)',            wattDefault: 23,   wattMin: 11,  wattMax: 36,   maxQty: 20,  unit: 'bulbs' },
      { id: 'outdoor_light', name: 'Outdoor / Garden Light',  wattDefault: 15,   wattMin: 5,   wattMax: 50,   maxQty: 20,  unit: 'pcs' },
    ],
  },
  {
    id: 'cooling',
    label: 'Section B – Cooling & Ventilation',
    icon: 'ac_unit',
    color: '#3b82f6',
    appliances: [
      { id: 'ceiling_fan',   name: 'Ceiling Fan (Regular)',   wattDefault: 75,   wattMin: 50,  wattMax: 100,  maxQty: 20,  unit: 'fans' },
      { id: 'bldc_fan',      name: 'Ceiling Fan (BLDC)',      wattDefault: 28,   wattMin: 20,  wattMax: 50,   maxQty: 20,  unit: 'fans' },
      { id: 'exhaust_fan',   name: 'Exhaust Fan',             wattDefault: 30,   wattMin: 20,  wattMax: 55,   maxQty: 10,  unit: 'fans' },
      { id: 'ac_1ton',       name: 'AC – 1 Ton (split)',      wattDefault: 1000, wattMin: 800, wattMax: 1200, maxQty: 10,  unit: 'units' },
      { id: 'ac_15ton',      name: 'AC – 1.5 Ton (split)',    wattDefault: 1500, wattMin: 1200,wattMax: 1800, maxQty: 10,  unit: 'units' },
      { id: 'ac_2ton',       name: 'AC – 2 Ton (split)',      wattDefault: 2000, wattMin: 1700,wattMax: 2400, maxQty: 10,  unit: 'units' },
      { id: 'cooler',        name: 'Air Cooler',              wattDefault: 180,  wattMin: 100, wattMax: 300,  maxQty: 10,  unit: 'units' },
      { id: 'pedestal_fan',  name: 'Pedestal / Table Fan',    wattDefault: 55,   wattMin: 30,  wattMax: 100,  maxQty: 10,  unit: 'fans' },
    ],
  },
  {
    id: 'kitchen',
    label: 'Section C – Kitchen Appliances',
    icon: 'kitchen',
    color: '#ef4444',
    appliances: [
      { id: 'refrigerator',  name: 'Refrigerator (200–300L)',  wattDefault: 200,  wattMin: 100, wattMax: 400,  maxQty: 3,   unit: 'units' },
      { id: 'microwave',     name: 'Microwave Oven',           wattDefault: 1000, wattMin: 700, wattMax: 1600, maxQty: 3,   unit: 'units' },
      { id: 'induction',     name: 'Induction Stove (2-burner)',wattDefault: 2000, wattMin: 1000,wattMax: 3000, maxQty: 3,   unit: 'units' },
      { id: 'mixer',         name: 'Mixer / Grinder',          wattDefault: 750,  wattMin: 300, wattMax: 1200, maxQty: 5,   unit: 'units' },
      { id: 'water_purifier',name: 'Water Purifier (RO/UV)',   wattDefault: 45,   wattMin: 25,  wattMax: 100,  maxQty: 5,   unit: 'units' },
      { id: 'toaster',       name: 'Toaster / Sandwich Maker', wattDefault: 800,  wattMin: 400, wattMax: 1400, maxQty: 3,   unit: 'units' },
      { id: 'electric_oven', name: 'Electric Oven (OTG)',      wattDefault: 1500, wattMin: 800, wattMax: 3000, maxQty: 3,   unit: 'units' },
      { id: 'dishwasher',    name: 'Dishwasher',               wattDefault: 1500, wattMin: 1000,wattMax: 2200, maxQty: 2,   unit: 'units' },
    ],
  },
  {
    id: 'heavy',
    label: 'Section D – Heavy Appliances',
    icon: 'bolt',
    color: '#f97316',
    appliances: [
      { id: 'washing_machine',name: 'Washing Machine (5–8kg)', wattDefault: 500,  wattMin: 300, wattMax: 2500, maxQty: 5,   unit: 'units' },
      { id: 'geyser',         name: 'Water Heater / Geyser',   wattDefault: 2000, wattMin: 1000,wattMax: 3000, maxQty: 5,   unit: 'units' },
      { id: 'water_pump',     name: 'Water Pump (0.5 HP)',     wattDefault: 373,  wattMin: 200, wattMax: 750,  maxQty: 5,   unit: 'units' },
      { id: 'water_pump_1hp', name: 'Water Pump (1 HP)',       wattDefault: 746,  wattMin: 500, wattMax: 1100, maxQty: 5,   unit: 'units' },
      { id: 'iron_box',       name: 'Electric Iron Box',       wattDefault: 1000, wattMin: 750, wattMax: 2000, maxQty: 5,   unit: 'units' },
      { id: 'ev_charger',     name: 'EV Charger (7.4 kW)',     wattDefault: 7400, wattMin: 3300,wattMax: 11000,maxQty: 2,   unit: 'units' },
    ],
  },
  {
    id: 'electronics',
    label: 'Section E – Electronics & Entertainment',
    icon: 'tv',
    color: '#8b5cf6',
    appliances: [
      { id: 'tv_led',          name: 'LED TV (32–43 inch)',     wattDefault: 60,   wattMin: 30,  wattMax: 200,  maxQty: 10,  unit: 'units' },
      { id: 'tv_large',        name: 'LED TV (55+ inch)',       wattDefault: 120,  wattMin: 80,  wattMax: 300,  maxQty: 5,   unit: 'units' },
      { id: 'desktop',         name: 'Desktop Computer + Monitor',wattDefault:250, wattMin: 100, wattMax: 600,  maxQty: 20,  unit: 'units' },
      { id: 'laptop',          name: 'Laptop (charger)',        wattDefault: 65,   wattMin: 30,  wattMax: 200,  maxQty: 20,  unit: 'units' },
      { id: 'router',          name: 'WiFi Router / Modem',     wattDefault: 15,   wattMin: 5,   wattMax: 30,   maxQty: 10,  unit: 'units' },
      { id: 'set_top_box',     name: 'Set-Top Box / DTH',       wattDefault: 18,   wattMin: 10,  wattMax: 30,   maxQty: 10,  unit: 'units' },
      { id: 'music_system',    name: 'Music / Home Theatre',    wattDefault: 150,  wattMin: 30,  wattMax: 500,  maxQty: 5,   unit: 'units' },
      { id: 'printer',         name: 'Printer / Scanner',       wattDefault: 200,  wattMin: 50,  wattMax: 500,  maxQty: 10,  unit: 'units' },
    ],
  },
  {
    id: 'workshop',
    label: 'Section F – Tools / Workshop (Optional)',
    icon: 'build',
    color: '#6b7280',
    optional: true,
    appliances: [
      { id: 'drill',           name: 'Electric Drill',          wattDefault: 500,  wattMin: 200, wattMax: 1500, maxQty: 5,   unit: 'units' },
      { id: 'angle_grinder',   name: 'Angle Grinder',           wattDefault: 850,  wattMin: 500, wattMax: 2500, maxQty: 5,   unit: 'units' },
      { id: 'welding',         name: 'Welding Machine',         wattDefault: 5000, wattMin: 2000,wattMax: 15000,maxQty: 3,   unit: 'units' },
      { id: 'air_compressor',  name: 'Air Compressor (1 HP)',   wattDefault: 746,  wattMin: 500, wattMax: 3000, maxQty: 3,   unit: 'units' },
      { id: 'lathe',           name: 'Bench / Mini Lathe',      wattDefault: 750,  wattMin: 300, wattMax: 3000, maxQty: 3,   unit: 'units' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates a single appliance entry.
 * Returns { valid, errors[] }
 */
export function validateApplianceEntry(appliance, qty, watts) {
  const errors = [];

  if (!Number.isInteger(qty) || qty < 0) {
    errors.push(`${appliance.name}: Quantity must be a non-negative integer.`);
  }
  if (qty > appliance.maxQty) {
    errors.push(`${appliance.name}: Maximum realistic quantity is ${appliance.maxQty}.`);
  }
  if (typeof watts !== 'number' || isNaN(watts)) {
    errors.push(`${appliance.name}: Wattage must be a number.`);
  }
  if (watts < appliance.wattMin || watts > appliance.wattMax) {
    errors.push(
      `${appliance.name}: Wattage must be between ${appliance.wattMin}W and ${appliance.wattMax}W.`
    );
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Runs full validation over all sections.
 * Returns { valid, errors[] }
 */
export function validateAllInputs(selections) {
  const allErrors = [];

  for (const section of APPLIANCE_SECTIONS) {
    for (const appliance of section.appliances) {
      const entry = selections[appliance.id];
      if (!entry) continue;
      const { qty, watts } = entry;
      if (qty === 0) continue; // zero-qty entries are acceptable
      const result = validateApplianceEntry(appliance, qty, watts);
      allErrors.push(...result.errors);
    }
  }

  return { valid: allErrors.length === 0, errors: allErrors };
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE CALCULATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate total connected load in Watts (integer, no float drift).
 * @param {Object} selections – { applianceId: { qty, watts } }
 * @returns {{ totalWatts: number, breakdown: Array }}
 */
export function calculateConnectedLoad(selections) {
  let totalWatts = 0;
  const breakdown = [];

  for (const section of APPLIANCE_SECTIONS) {
    for (const appliance of section.appliances) {
      const entry = selections[appliance.id];
      if (!entry || entry.qty <= 0) continue;

      // Integer arithmetic to avoid floating-point errors
      const watts = Math.round(entry.watts);
      const qty   = Math.round(entry.qty);
      const load  = watts * qty;

      totalWatts += load;
      breakdown.push({
        sectionId:   section.id,
        sectionLabel: section.label,
        applianceId: appliance.id,
        name:        appliance.name,
        qty,
        watts,
        load,
      });
    }
  }

  return { totalWatts, breakdown };
}

/**
 * Apply safety margin and return design load.
 * @param {number} totalWatts
 * @returns {{ designWatts: number, marginWatts: number }}
 */
export function applyMargin(totalWatts) {
  // Round up to nearest whole watt
  const designWatts = Math.ceil(totalWatts * SAFETY_MARGIN);
  const marginWatts = designWatts - totalWatts;
  return { designWatts, marginWatts };
}

/**
 * Calculate current from watts at given voltage.
 * Uses P = V × I (power factor assumed 0.8 for mixed load – realistic for residential).
 * For purely resistive loads pf=1; for AC motors pf≈0.8.
 * We use pf=0.85 to be realistic and slightly conservative.
 */
const POWER_FACTOR = 0.85;

export function calculateCurrent(watts, voltage = VOLTAGE_SINGLE_PHASE) {
  if (voltage <= 0) throw new Error('Voltage must be positive');
  // I = P / (V × PF) — single phase
  return watts / (voltage * POWER_FACTOR);
}

/**
 * Recommend the next standard MCB rating above the given current.
 * Returns the MCB ampere rating as a number.
 * Throws if exceeds 100A (would need custom arrangement + engineer sign-off).
 */
export function recommendMCB(designAmps) {
  const rating = MCB_STANDARD_RATINGS.find((r) => r >= designAmps);
  if (!rating) {
    return { rating: null, requiresEngineer: true };
  }
  return { rating, requiresEngineer: false };
}

/**
 * Suggest wire gauge for a given current (IS 694 / IS 732).
 * Returns the table entry matching the current.
 */
export function suggestWireGauge(designAmps) {
  const entry = WIRE_GAUGE_TABLE.find((g) => designAmps <= g.maxAmps);
  return entry || WIRE_GAUGE_TABLE[WIRE_GAUGE_TABLE.length - 1];
}

/**
 * Determine phase recommendation.
 * Indian regulations and utility norms:
 *  - Single phase up to 5 kW sanctioned load is standard.
 *  - Three phase is mandatory for >7.5 kW in most DISCOMs.
 *  - Advisory range 5–7.5 kW: suggest three phase upgrade.
 */
export function recommendPhase(designWatts) {
  const kw = designWatts / 1000;
  if (kw <= 5) {
    return {
      phase: 'Single Phase',
      code: 'single',
      note: 'Standard single-phase 230V supply is adequate.',
    };
  }
  if (kw <= 7.5) {
    return {
      phase: 'Three Phase (Recommended)',
      code: 'three_recommended',
      note: `Load ${kw.toFixed(1)} kW approaches single-phase limits. Apply for three-phase connection to your DISCOM.`,
    };
  }
  return {
    phase: 'Three Phase (Mandatory)',
    code: 'three_mandatory',
    note: `Load ${kw.toFixed(1)} kW exceeds single-phase limit. A three-phase 400V connection is required by DISCOM regulations.`,
  };
}

/**
 * Suggest distribution board size.
 * Each sub-circuit should not exceed 3000W for residential (IS 732).
 * Add 2 spare ways as standard practice.
 */
export function suggestDistributionBoard(totalWatts, floors = 1) {
  const subCircuits   = Math.ceil(totalWatts / 3000);
  const spareWays     = 2;
  const minWays       = subCircuits + spareWays;
  // Standard DB sizes available in India
  const dbSizes       = [4, 6, 8, 12, 16, 20, 24, 32];
  const recommendedDB = dbSizes.find((s) => s >= minWays) || 32;
  const dbsNeeded     = floors;

  return {
    subCircuits,
    recommendedDB,
    dbsNeeded,
    note: `${subCircuits} load circuits + ${spareWays} spare ways = ${minWays} minimum; use ${recommendedDB}-way DB`,
  };
}

/**
 * Suggest earthing system (IS 3043).
 * Returns conductor size and rod specification.
 */
export function suggestEarthing(designAmps) {
  return EARTHING_TABLE.find((e) => designAmps <= e.maxAmps) || EARTHING_TABLE[EARTHING_TABLE.length - 1];
}

/**
 * Estimate monthly power consumption and cost.
 * @param {Array} breakdown – from calculateConnectedLoad
 * @param {Object} hoursPerDay – { applianceId: hours }
 * @param {number} tariff – ₹/kWh
 * @returns {{ monthlyKwh: number, monthlyCost: number }}
 */
export function estimateMonthlyCost(breakdown, hoursPerDay, tariff = DEFAULT_TARIFF) {
  let totalKwh = 0;

  const detailedBreakdown = breakdown.map((item) => {
    const hrs   = Math.min(24, Math.max(0, hoursPerDay[item.applianceId] ?? 4));
    const kwh   = (item.load / 1000) * hrs * 30;  // 30 days/month
    totalKwh   += kwh;
    return { ...item, hrs, kwh: Math.round(kwh * 10) / 10 };
  });

  const roundedKwh = Math.round(totalKwh * 10) / 10;
  const monthlyCost = Math.round(roundedKwh * tariff);

  return { monthlyKwh: roundedKwh, monthlyCost, detailedBreakdown };
}

// ─────────────────────────────────────────────────────────────────────────────
// SAFETY WARNINGS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate safety warning objects.
 * Returns array of { level: 'info'|'warning'|'danger', message }
 */
export function generateSafetyWarnings(totalWatts, designWatts, designAmps, phaseResult) {
  const warnings = [];
  const kw = totalWatts / 1000;

  if (kw > 10) {
    warnings.push({
      level: 'danger',
      message: `Total load ${kw.toFixed(1)} kW exceeds safe single-phase residential limits (10 kW). A three-phase connection and licensed electrical contractor planning is mandatory.`,
    });
  } else if (kw > 5) {
    warnings.push({
      level: 'warning',
      message: `Total load ${kw.toFixed(1)} kW approaches single-phase capacity. Contact your DISCOM to apply for a three-phase connection before installation.`,
    });
  }

  if (designAmps > 63) {
    warnings.push({
      level: 'danger',
      message: `Calculated design current (${designAmps.toFixed(1)}A) exceeds 63A. This installation requires engineer-approved electrical drawings and a licensed contractor.`,
    });
  } else if (designAmps > 32) {
    warnings.push({
      level: 'warning',
      message: `Calculated design current (${designAmps.toFixed(1)}A) is above 32A. Verify supply cable sizing and main fuse with a licensed electrician.`,
    });
  }

  if (phaseResult.code === 'three_mandatory') {
    warnings.push({
      level: 'danger',
      message: phaseResult.note,
    });
  } else if (phaseResult.code === 'three_recommended') {
    warnings.push({
      level: 'warning',
      message: phaseResult.note,
    });
  }

  if (warnings.length === 0) {
    warnings.push({
      level: 'info',
      message: 'Load is within normal residential parameters. Ensure a licensed electrician reviews and executes all wiring work.',
    });
  }

  // Always append the mandatory professional consultation reminder
  warnings.push({
    level: 'info',
    message: 'This calculator provides estimates only. All wiring must comply with IS 732, IS 3043, and the Indian Electricity Rules 1956. Final approval must be obtained from a licensed electrical contractor.',
  });

  return warnings;
}

// ─────────────────────────────────────────────────────────────────────────────
// MASTER CALCULATION ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Run the full calculation pipeline.
 * @param {Object} selections – { applianceId: { qty, watts } }
 * @param {Object} hoursPerDay – { applianceId: hours }
 * @param {Object} options – { floors, tariff, propertyType }
 * @returns {Object} Complete results object
 */
export function runCalculation(selections, hoursPerDay, options = {}) {
  const { floors = 1, tariff = DEFAULT_TARIFF } = options;

  // 1. Validate inputs
  const validation = validateAllInputs(selections);
  if (!validation.valid) {
    return { error: true, errors: validation.errors };
  }

  // 2. Connected load
  const { totalWatts, breakdown } = calculateConnectedLoad(selections);

  if (totalWatts === 0) {
    return { error: true, errors: ['No appliances selected. Please add at least one appliance.'] };
  }

  // 3. Safety margin
  const { designWatts, marginWatts } = applyMargin(totalWatts);

  // 4. Current (design, with safety margin)
  const rawCurrent   = calculateCurrent(totalWatts);
  const designCurrent = calculateCurrent(designWatts);

  // 5. MCB recommendation — based on design current
  const { rating: mcbRating, requiresEngineer } = recommendMCB(designCurrent);

  // 6. Wire gauge — for main feed
  const wireGauge = suggestWireGauge(designCurrent);

  // 7. Phase recommendation
  const phaseResult = recommendPhase(designWatts);

  // 8. Distribution board
  const dbResult = suggestDistributionBoard(totalWatts, floors);

  // 9. Earthing
  const earthingResult = suggestEarthing(designCurrent);

  // 10. Monthly cost
  const { monthlyKwh, monthlyCost, detailedBreakdown } = estimateMonthlyCost(breakdown, hoursPerDay, tariff);

  // 11. Safety warnings
  const warnings = generateSafetyWarnings(totalWatts, designWatts, designCurrent, phaseResult);

  return {
    error: false,
    totalWatts,
    designWatts,
    marginWatts,
    rawCurrent:    Math.round(rawCurrent * 100) / 100,
    designCurrent: Math.round(designCurrent * 100) / 100,
    mcbRating,
    requiresEngineer,
    wireGauge,
    phaseResult,
    dbResult,
    earthingResult,
    monthlyKwh,
    monthlyCost,
    breakdown,
    detailedBreakdown,
    warnings,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SHOPPING LIST BUILDER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a proportional, appliance-aware shopping list.
 *
 * Scales correctly from the simplest case (1 LED bulb → ~5 items)
 * to complex installs (4 BHK / factory → 20-28 items).
 *
 * Rules:
 * - Infrastructure items (DB, RCCB, earthing electrode) are only added
 *   when the install is large enough to warrant them.
 * - Wire gauges for lighting/fan circuits are MERGED (both 1.5 sq.mm)
 *   to avoid duplicate line items.
 * - Main feeder cable is only a separate item when it is a HEAVIER gauge
 *   than the sub-circuit wire (i.e. total load is large enough).
 * - Junction boxes use actual circuit count, no artificial minimum.
 * - Quantities are honest: 1 LED bulb needs 1 roll of wire, not two.
 *
 * @param {Object} calcResult  – return value of runCalculation()
 * @param {Object} selections  – { applianceId: { qty, watts } }
 * @param {number} floors      – number of floors
 * @returns {Array}  Array of { label, searchTerm, qty, unit, note }
 */
export function buildShoppingList(calcResult, selections = {}, floors = 1) {
  if (!calcResult || calcResult.error) return [];

  const { mcbRating, wireGauge, dbResult, earthingResult, designCurrent, totalWatts } = calcResult;

  const sel = (id) => (selections?.[id]?.qty || 0);
  const items = [];
  const add   = (item) => { if (item.qty > 0) items.push(item); };

  // ── Appliance group totals ────────────────────────────────────────────────
  const LIGHT_IDS      = ['led_bulb','tube_light','panel_light','downlight','deco_light','cfl','outdoor_light'];
  const FAN_IDS        = ['ceiling_fan','bldc_fan','exhaust_fan','pedestal_fan'];
  const AC_IDS         = ['ac_1ton','ac_15ton','ac_2ton'];
  const HEAVY4_IDS     = ['geyser','washing_machine','water_pump','water_pump_1hp','iron_box'];
  const GENERAL_IDS    = ['refrigerator','microwave','induction','mixer','water_purifier',
                          'toaster','electric_oven','dishwasher','cooler',
                          'tv_led','tv_large','desktop','laptop','router',
                          'set_top_box','music_system','printer'];
  const INDUSTRIAL_IDS = ['ev_charger','welding','air_compressor','lathe','drill','angle_grinder'];

  const totalLights     = LIGHT_IDS.reduce((s, id) => s + sel(id), 0);
  const totalFans       = FAN_IDS.reduce((s, id) => s + sel(id), 0);
  const totalACs        = AC_IDS.reduce((s, id) => s + sel(id), 0);
  const totalHeavy4     = HEAVY4_IDS.reduce((s, id) => s + sel(id), 0);
  const totalGeneral    = GENERAL_IDS.reduce((s, id) => s + sel(id), 0);
  const totalIndustrial = INDUSTRIAL_IDS.reduce((s, id) => s + sel(id), 0);

  // ── Sub-circuit counts (IS 732: ≤ 3 kW per domestic circuit) ─────────────
  const lightCircuits   = totalLights   > 0 ? Math.max(1, Math.ceil(totalLights   / 8)) : 0;
  const fanCircuits     = totalFans     > 0 ? Math.max(1, Math.ceil(totalFans     / 6)) : 0;
  const acCircuits      = totalACs;
  const heavy4Circuits  = totalHeavy4;
  const generalCircuits = totalGeneral  > 0 ? Math.max(1, Math.ceil(totalGeneral  / 4)) : 0;
  const industCircuits  = totalIndustrial;
  const totalCircuits   = lightCircuits + fanCircuits + acCircuits + heavy4Circuits + generalCircuits + industCircuits;

  // ── Sizing helpers ────────────────────────────────────────────────────────
  // Realistic run length per circuit (metres): shorter for few circuits
  const runPerCircuit   = totalCircuits <= 2 ? 12 : totalCircuits <= 5 ? 18 : 25;
  const wireMetres      = (c) => Math.ceil(c * runPerCircuit * floors * 1.1);
  // 90m roll standard in India; min 1 roll only when truly needed
  const rolls           = (m) => Math.max(1, Math.ceil(m / 90));

  // Size thresholds for infrastructure decisions
  const isTinyInstall   = totalCircuits <= 2 && totalWatts <= 1500;   // e.g. 1–2 lights/fans only
  const isSmallInstall  = totalCircuits <= 4 && totalWatts <= 3000;   // 1 BHK basic
  const needsSeparateDB = !isSmallInstall;                            // small: wall-mount MCBs, no full DB box needed
  const needsRCCB       = !isTinyInstall;                            // RCCB from 3+ circuits or load >1500W
  const needsEarthingKit= designCurrent > 10;                        // earthing rod only when current justifies

  // ── SECTION A: Wiring Cables ──────────────────────────────────────────────

  // Merged 1.5 sq.mm wire for lighting + fans in ONE line item (same gauge)
  const lightFanCircuits = lightCircuits + fanCircuits;
  if (lightFanCircuits > 0) {
    // For tiny installs the "main feeder" IS this wire; label accordingly
    const label = isTinyInstall
      ? `1.5 sq.mm Copper FR Wire (Lighting / Fan Circuit)`
      : `1.5 sq.mm Copper FR Wire (Lighting & Fan Circuits)`;
    add({
      label,
      searchTerm: 'copper wire 1.5 sqmm electrical',
      qty:        rolls(wireMetres(lightFanCircuits)),
      unit:       'rolls (90m)',
      note:       `${lightFanCircuits} circuit(s) for ${totalLights} light + ${totalFans} fan point(s)`,
    });
  }

  // 2.5 sq.mm — general socket circuits (merged with AC if same gauge needed)
  const gen25Circuits = generalCircuits + acCircuits;
  if (gen25Circuits > 0) {
    const parts = [];
    if (generalCircuits > 0) parts.push(`${generalCircuits} general socket circuit(s) for ${totalGeneral} appliance(s)`);
    if (acCircuits      > 0) parts.push(`${acCircuits} dedicated AC circuit(s) for ${totalACs} unit(s)`);
    add({
      label:      `2.5 sq.mm Copper FR Wire (Socket / AC Circuits)`,
      searchTerm: 'copper wire 2.5 sqmm electrical',
      qty:        rolls(wireMetres(gen25Circuits)),
      unit:       'rolls (90m)',
      note:       parts.join(' + '),
    });
  }

  // 4.0 sq.mm — dedicated heavy-appliance circuits
  if (heavy4Circuits > 0) {
    add({
      label:      `4.0 sq.mm Copper FR Wire (Geyser / Washing Machine / Pump)`,
      searchTerm: 'copper wire 4 sqmm electrical',
      qty:        rolls(wireMetres(heavy4Circuits)),
      unit:       'rolls (90m)',
      note:       `${heavy4Circuits} dedicated circuit(s) — 1 per unit (geyser, WM, pump)`,
    });
  }

  // 6.0 sq.mm — industrial / EV circuits
  if (industCircuits > 0) {
    add({
      label:      `6.0 sq.mm Copper FR Wire (Industrial / EV Circuits)`,
      searchTerm: 'copper wire 6 sqmm electrical',
      qty:        rolls(wireMetres(industCircuits)),
      unit:       'rolls (90m)',
      note:       `${industCircuits} dedicated circuit(s) — EV charger, welding, compressor, etc.`,
    });
  }

  // Main feeder cable — only add as a SEPARATE line when feeder gauge > sub-circuit gauge
  // (i.e. the load is large enough to need a heavier incoming cable)
  const feederGaugeIsHeavier =
    wireGauge.gauge !== '1.0 sq.mm'  &&
    wireGauge.gauge !== '1.5 sq.mm'  &&
    !isTinyInstall;
  if (feederGaugeIsHeavier) {
    add({
      label:      `Main Feeder Cable ${wireGauge.gauge} Copper FR`,
      searchTerm: `copper wire ${wireGauge.gauge}`,
      qty:        rolls(Math.ceil(30 * floors)),   // meter-board → main DB run
      unit:       'rolls (90m)',
      note:       `${wireGauge.use} — meter board to main DB (IS 694)`,
    });
  }

  // ── SECTION B: Circuit Breakers ──────────────────────────────────────────

  // Main MCB / isolator (always needed — size depends on total load)
  add({
    label:      `Main MCB ${mcbRating}A ${isTinyInstall ? 'SP' : 'DP'}`,
    searchTerm: `${mcbRating}a ${isTinyInstall ? 'single' : 'double'} pole mcb isolator`,
    qty:        dbResult.dbsNeeded,
    unit:       'pcs',
    note:       `Main isolator — C-Curve, IS 60898`,
  });

  // 10A SP MCBs — lighting & fan sub-circuits (skip if < 2 circuits; MCB doubling covered by main)
  if (lightFanCircuits >= 2) {
    add({
      label:      `MCB 10A Single Pole (Lighting & Fan Sub-circuits)`,
      searchTerm: '10a single pole mcb circuit breaker',
      qty:        lightFanCircuits,
      unit:       'pcs',
      note:       `${lightCircuits} lighting + ${fanCircuits} fan sub-circuit MCBs`,
    });
  }

  // 16A SP MCBs — general socket circuits
  if (generalCircuits > 0) {
    add({
      label:      `MCB 16A Single Pole (General Socket Circuits)`,
      searchTerm: '16a single pole mcb circuit breaker',
      qty:        generalCircuits,
      unit:       'pcs',
      note:       `${generalCircuits} socket sub-circuit MCB(s)`,
    });
  }

  // 20A SP MCBs — dedicated AC circuits
  if (acCircuits > 0) {
    add({
      label:      `MCB 20A Single Pole (AC Dedicated Circuits)`,
      searchTerm: '20a single pole mcb circuit breaker',
      qty:        acCircuits,
      unit:       'pcs',
      note:       `1× 20A MCB per AC unit (${totalACs} AC unit(s))`,
    });
  }

  // 25A SP MCBs — heavy appliances
  if (heavy4Circuits > 0) {
    add({
      label:      `MCB 25A Single Pole (Geyser / Washing Machine / Pump)`,
      searchTerm: '25a single pole mcb',
      qty:        heavy4Circuits,
      unit:       'pcs',
      note:       `1× 25A MCB per unit (${totalHeavy4} unit(s))`,
    });
  }

  // 32A MCBs — industrial / EV
  if (industCircuits > 0) {
    add({
      label:      `MCB 32A (Industrial / EV Charger Circuits)`,
      searchTerm: '32a single pole mcb',
      qty:        industCircuits,
      unit:       'pcs',
      note:       `1× 32A MCB per industrial / EV load (${totalIndustrial} unit(s))`,
    });
  }

  // RCCB — not needed for tiny single-point installs
  if (needsRCCB) {
    const rccbRating = designCurrent <= 25 ? '25A' : '40A';
    add({
      label:      `RCCB ${rccbRating} / 30mA (Earth Leakage Protection)`,
      searchTerm: `rccb ${rccbRating.toLowerCase()} residual current circuit breaker`,
      qty:        dbResult.dbsNeeded,
      unit:       'pcs',
      note:       `IS 12640 — mandatory earth-leakage protection per DB`,
    });
  }

  // ── SECTION C: Distribution Board ────────────────────────────────────────
  // Only add a proper DB box when there are enough circuits to justify it
  if (needsSeparateDB) {
    add({
      label:      `Distribution Board ${dbResult.recommendedDB}-Way DB Box`,
      searchTerm: `distribution board ${dbResult.recommendedDB} way db box`,
      qty:        dbResult.dbsNeeded,
      unit:       'pcs',
      note:       dbResult.note,
    });
  }

  // ── SECTION D: Switches & Sockets ────────────────────────────────────────

  // One-way 6A switches: 1 per light point + 1 per fan
  if (totalLights + totalFans > 0) {
    add({
      label:      `Modular 6A One-Way Switch`,
      searchTerm: '6a one way modular switch electrical',
      qty:        totalLights + totalFans,
      unit:       'pcs',
      note:       `${totalLights} light + ${totalFans} fan control point(s)`,
    });
  }

  // 16A sockets — 1 per AC + 1 per heavy + 1 per industrial unit
  const heavySockets = totalACs + totalHeavy4 + totalIndustrial;
  if (heavySockets > 0) {
    const parts = [];
    if (totalACs        > 0) parts.push(`${totalACs} AC`);
    if (totalHeavy4     > 0) parts.push(`${totalHeavy4} heavy appliance`);
    if (totalIndustrial > 0) parts.push(`${totalIndustrial} industrial`);
    add({
      label:      `Modular 16A Power Socket`,
      searchTerm: '16a power socket outlet modular',
      qty:        heavySockets,
      unit:       'pcs',
      note:       parts.join(' + ') + ' socket(s)',
    });
  }

  // 5A/6A sockets — for general appliances + 20% spare (rounded up to whole number)
  if (totalGeneral > 0) {
    const spareCount = Math.ceil(totalGeneral * 0.2);
    add({
      label:      `Modular 5A/6A Socket (General Appliances)`,
      searchTerm: '5a 6a socket outlet modular',
      qty:        totalGeneral + spareCount,
      unit:       'pcs',
      note:       `${totalGeneral} appliance point(s) + ${spareCount} spare`,
    });
  }

  // ── SECTION E: Conduit & Fittings ─────────────────────────────────────────

  // PVC conduit pipes are 3m each in Indian market.
  // Express qty in PIPE COUNT so that product_price × qty is correct.
  const conduitRunMetres = isTinyInstall
    ? Math.ceil(8 * floors)
    : Math.ceil(totalCircuits * 18 * floors * 1.1);
  const conduitPipes = Math.max(1, Math.ceil(conduitRunMetres / 3));
  add({
    label:      `PVC Conduit Pipe 20mm (ISI Mark)`,
    searchTerm: 'pvc conduit pipe 20mm electrical',
    qty:        conduitPipes,
    unit:       'pipes (3m each)',
    note:       isTinyInstall
      ? `${conduitRunMetres}m run ÷ 3m/pipe = ${conduitPipes} pipe(s) for ${totalCircuits} circuit(s)`
      : `${conduitRunMetres}m total run ÷ 3m/pipe = ${conduitPipes} pipe(s) for ${totalCircuits} circuit(s) across ${floors} floor(s)`,
  });

  // Junction boxes: actual count — 1 at source + 1 at each point minimum
  const junctionBoxCount = Math.max(totalLights + totalFans + heavySockets + totalGeneral,
                                     totalCircuits * Math.ceil(floors));
  add({
    label:      `PVC Junction Box (3×3 in)`,
    searchTerm: 'electrical junction box pvc',
    qty:        Math.max(1, junctionBoxCount),
    unit:       'pcs',
    note:       `1 box per switch/socket point + 1 source box per circuit`,
  });

  // ── SECTION F: Earthing ───────────────────────────────────────────────────
  // Only recommend the physical earthing rod kit when load is significant.
  // For tiny loads just note to use an existing earth point.
  if (needsEarthingKit) {
    add({
      label:      `GI Earthing Electrode / Rod Kit`,
      searchTerm: 'gi earth electrode earthing rod kit',
      qty:        Math.max(1, Math.ceil(designCurrent / 63) + (dbResult.dbsNeeded - 1)),
      unit:       'sets',
      note:       earthingResult.rod + ' — IS 3043 compliant',
    });
  }

  return items;
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIT TESTS (INLINE EXAMPLES — remove in production)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Example test cases for manual verification:
 *
 * TEST 1: 1 BHK, 1× AC 1-ton, 3× LED bulbs, 2× ceiling fans
 *   selections = {
 *     ac_1ton:     { qty: 1, watts: 1000 },
 *     led_bulb:    { qty: 3, watts: 9    },
 *     ceiling_fan: { qty: 2, watts: 75   },
 *   }
 *   totalWatts = 1000 + 27 + 150 = 1177W
 *   designWatts = ceil(1177 * 1.25) = 1472W
 *   designCurrent = 1472 / (230 * 0.85) = 7.53A
 *   mcbRating = 10A  ✔
 *   wire = 1.5 sq.mm ✔ (max 14A, covers 7.53A)
 *   phase = Single Phase ✔ (1.47kW well under 5kW)
 *
 * TEST 2: Large office, multiple ACs
 *   selections = {
 *     ac_15ton:    { qty: 5, watts: 1500 },
 *     desktop:     { qty: 10, watts: 250 },
 *     led_bulb:    { qty: 20, watts: 9   },
 *   }
 *   totalWatts = 7500 + 2500 + 180 = 10180W → WARNING: see danger threshold
 *
 * TEST 3: Workshop with welding machine
 *   selections = {
 *     welding: { qty: 1, watts: 5000 }
 *   }
 *   totalWatts = 5000W → Three Phase Recommended
 */
