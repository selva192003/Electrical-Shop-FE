import './BulkPricing.css';

export default function BulkPricing({ tiers = [] }) {
  if (!tiers || tiers.length === 0) return null;

  return (
    <div className="bulk-pricing">
      <h3 className="bulk-pricing-title">Bulk / Business Pricing</h3>
      <div className="bulk-pricing-table">
        <div className="bulk-pricing-header-row">
          <span>Quantity</span>
          <span>Price per Unit</span>
          <span>Savings</span>
        </div>
        {tiers.map((tier, i) => (
          <div key={i} className={`bulk-pricing-row ${i === 0 ? 'highlighted' : ''}`}>
            <span className="bulk-qty">
              {tier.minQty}{tier.maxQty ? ` – ${tier.maxQty}` : '+'} units
            </span>
            <span className="bulk-price">₹{tier.price?.toLocaleString('en-IN')}</span>
            <span className="bulk-disc">{tier.discount}% off</span>
          </div>
        ))}
      </div>
      <p className="bulk-note">Bulk pricing applied automatically based on cart quantity.</p>
    </div>
  );
}
