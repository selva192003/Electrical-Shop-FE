import { useState } from 'react';
import './LoadCalculator.css';

const voltage = 230; // standard single-phase supply

const LoadCalculator = () => {
  const [inputs, setInputs] = useState({ bulbs: 0, fans: 0, ac: 0 });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: Number(value) || 0 }));
  };

  const handleCalculate = () => {
    const bulbWatt = 9; // LED
    const fanWatt = 75;
    const acWatt = 1500;

    const totalWatt = inputs.bulbs * bulbWatt + inputs.fans * fanWatt + inputs.ac * acWatt;
    const current = totalWatt / voltage;

    let mcb = 6;
    if (current > 6 && current <= 10) mcb = 10;
    else if (current > 10 && current <= 16) mcb = 16;
    else if (current > 16 && current <= 20) mcb = 20;
    else if (current > 20) mcb = 32;

    setResult({ totalWatt, current, mcb });
  };

  return (
    <div className="page-container load-page">
      <h1 className="page-title">Electrical Load Calculator</h1>
      <div className="card load-card">
        <p className="load-description">
          Quickly estimate your connected load and get a recommended MCB rating for a residential circuit. This helps in
          planning safe electrical layouts.
        </p>
        <div className="load-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="bulbs">
              Number of LED bulbs (9W)
            </label>
            <input
              id="bulbs"
              name="bulbs"
              type="number"
              min="0"
              className="input-field"
              value={inputs.bulbs}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="fans">
              Number of ceiling fans (75W)
            </label>
            <input
              id="fans"
              name="fans"
              type="number"
              min="0"
              className="input-field"
              value={inputs.fans}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="ac">
              Number of AC units (1.5T ~1500W)
            </label>
            <input
              id="ac"
              name="ac"
              type="number"
              min="0"
              className="input-field"
              value={inputs.ac}
              onChange={handleChange}
            />
          </div>
        </div>
        <button type="button" className="accent-btn load-btn" onClick={handleCalculate}>
          Calculate Load
        </button>

        {result && (
          <div className="load-result">
            <div className="load-result-row">
              <span>Total connected load</span>
              <span>{result.totalWatt.toFixed(0)} W</span>
            </div>
            <div className="load-result-row">
              <span>Estimated current (at 230V)</span>
              <span>{result.current.toFixed(2)} A</span>
            </div>
            <div className="load-result-row highlight">
              <span>Suggested MCB rating</span>
              <span>{result.mcb} A</span>
            </div>
            <p className="load-note">Recommendation is indicative. Always consult a licensed electrician for final sizing.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadCalculator;
