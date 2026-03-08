import './InfoPage.css';

const ShippingPolicy = () => (
  <div className="page-container">
    <div className="info-page">

      <div className="info-page__hero">
        <div className="info-page__badge">Shipping</div>
        <h1 className="info-page__title">Shipping &amp; Delivery Policy</h1>
        <p className="info-page__meta">Last updated: March 2026</p>
      </div>

      <div className="info-page__section">
        <p>
          At Sri Murugan electricals &amp; Hardwares we aim to deliver your order safely and on time.
          Please read the following policy before placing your order.
        </p>
      </div>

      <div className="info-page__section">
        <div className="info-page__section-header">
          <span className="info-page__section-number">1</span>
          <h2 className="info-page__section-title">Delivery Areas</h2>
        </div>
        <p>
          We currently ship to addresses within <strong>Tamil Nadu</strong>. Delivery to Perundurai and
          nearby towns (Erode, Sathyamangalam, Bhavani, Gobichettipalayam) is typically faster.
          Availability for specific pin codes is shown at checkout.
        </p>
      </div>

      <div className="info-page__section">
        <div className="info-page__section-header">
          <span className="info-page__section-number">2</span>
          <h2 className="info-page__section-title">Delivery Time</h2>
        </div>
        <ul>
          <li><strong>Perundurai &amp; surrounding areas (within 20 km):</strong> 1&ndash;2 business days.</li>
          <li><strong>Rest of Tamil Nadu:</strong> 3&ndash;5 business days.</li>
          <li><strong>Remote or difficult-to-reach locations:</strong> up to 7 business days.</li>
        </ul>
        <p>
          Delivery timelines are estimates and may be affected by carrier delays, public holidays, or
          adverse weather conditions.
        </p>
      </div>

      <div className="info-page__section">
        <div className="info-page__section-header">
          <span className="info-page__section-number">3</span>
          <h2 className="info-page__section-title">Shipping Charges</h2>
        </div>
        <p>
          Shipping charges are calculated at checkout based on order weight, dimensions, and delivery
          pin code. Orders above a minimum threshold (shown at checkout) may qualify for free delivery
          within select pin codes.
        </p>
      </div>

      <div className="info-page__section">
        <div className="info-page__section-header">
          <span className="info-page__section-number">4</span>
          <h2 className="info-page__section-title">Order Processing</h2>
        </div>
        <ul>
          <li>Orders placed before <strong>5:00 PM</strong> on business days are typically processed the same day.</li>
          <li>Orders placed after 5:00 PM, on Sundays, or on public holidays are processed the next business day.</li>
          <li>You will receive an SMS and email notification with tracking details once your order is dispatched.</li>
        </ul>
      </div>

      <div className="info-page__section">
        <div className="info-page__section-header">
          <span className="info-page__section-number">5</span>
          <h2 className="info-page__section-title">Store Pickup</h2>
        </div>
        <p>
          You may also choose to collect your order from our store at no delivery charge:
        </p>
        <ul>
          <li><strong>Address:</strong> MKM Complex, Nayara Bunk Opposite, Kanjikoil Road, Perundurai West, Perundurai&nbsp;&ndash;&nbsp;638052</li>
          <li><strong>Pickup Hours:</strong> Monday&nbsp;&ndash;&nbsp;Saturday, 9:00&nbsp;AM&nbsp;&ndash;&nbsp;9:00&nbsp;PM</li>
        </ul>
        <p>Please bring your order confirmation when collecting.</p>
      </div>

      <div className="info-page__section">
        <div className="info-page__section-header">
          <span className="info-page__section-number">6</span>
          <h2 className="info-page__section-title">Damaged or Missing Parcels</h2>
        </div>
        <p>
          If your parcel arrives damaged or if items are missing, please contact us within
          <strong> 48 hours</strong> of delivery via our <a href="/support">Support</a> page
          or call <a href="tel:+917373717175">+91 73737 17175</a>. Keep the original packaging for
          inspection. We will arrange a replacement or refund promptly.
        </p>
      </div>

    </div>
  </div>
);

export default ShippingPolicy;
