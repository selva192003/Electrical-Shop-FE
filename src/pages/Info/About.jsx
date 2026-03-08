import './InfoPage.css';

const HIGHLIGHTS = [
  { icon: 'storefront',  label: 'Established',     value: '2015' },
  { icon: 'star',        label: 'JustDial Rating',  value: '5.0 / 5' },
  { icon: 'schedule',   label: 'Store Hours',       value: 'Mon – Sat  9 AM – 9 PM' },
  { icon: 'verified',   label: 'Experience',        value: '10+ Years' },
];

const PRODUCT_CATEGORIES = [
  { icon: 'wind_power',          name: 'Ceiling &amp; Exhaust Fans' },
  { icon: 'battery_charging_full', name: 'Batteries &amp; Inverters (Luminous, Amaron)' },
  { icon: 'cable',               name: 'Electrical Wires &amp; Cables' },
  { icon: 'lightbulb',           name: 'LED Lights &amp; Lighting Solutions' },
  { icon: 'power',               name: 'Switchgear, MCBs &amp; Distribution Boards' },
  { icon: 'electrical_services', name: 'Switches, Sockets &amp; Wiring Accessories' },
  { icon: 'devices_other',       name: 'UPS Systems &amp; Power Backup' },
  { icon: 'construction',        name: 'Hardware &amp; Electrical Tools' },
];

const About = () => (
  <div className="page-container">
    <div className="info-page">

      {/* Hero */}
      <div className="info-page__hero">
        <div className="info-page__badge">About Us</div>
        <h1 className="info-page__title">Sri Murugan electricals &amp; Hardwares</h1>
        <p className="info-page__meta">
          MKM Complex, Nayara Bunk Opposite, Kanjikoil Road, Perundurai West, Perundurai&nbsp;–&nbsp;638052, Tamil&nbsp;Nadu
        </p>
      </div>

      {/* Highlights */}
      <div className="info-page__section">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {HIGHLIGHTS.map((h) => (
            <div key={h.label} style={{ background: 'var(--bg-subtle, #f8fafc)', borderRadius: '12px', padding: '1.25rem 1rem', textAlign: 'center' }}>
              <span className="material-icons" style={{ fontSize: '2rem', color: 'var(--accent, #2563eb)', display: 'block', marginBottom: '0.4rem' }}>{h.icon}</span>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{h.value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)', marginTop: '0.15rem' }}>{h.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Our Story */}
      <div className="info-page__section">
        <div className="info-page__section-header">
          <span className="info-page__section-number">01</span>
          <h2 className="info-page__section-title">Our Story</h2>
        </div>
        <p>
          Founded in <strong>2015</strong>, Sri Murugan electricals &amp; Hardwares started as a neighbourhood electrical
          shop in <strong>Perundurai West, Tamil Nadu</strong>. Over the past decade we have grown into one of the most
          trusted electrical and hardware retailers in the Erode district, serving homeowners, electricians, contractors,
          and industrial clients alike.
        </p>
        <p>
          Located at <strong>MKM Complex, opposite the Nayara Bunk on Kanjikoil Road</strong>, we are easy to find and
          always stocked with the brands and products our customers rely on. Our journey has been built on three
          pillars: <em>genuine products</em>, <em>transparent pricing</em>, and <em>expert guidance</em>.
        </p>
        <div className="info-page__highlight">
          <p>
            A proud <strong>5-star rated</strong> business on JustDial — a testament to years of honest service
            and thousands of satisfied customers across Perundurai and the surrounding region.
          </p>
        </div>
      </div>

      {/* What We Sell */}
      <div className="info-page__section">
        <div className="info-page__section-header">
          <span className="info-page__section-number">02</span>
          <h2 className="info-page__section-title">What We Stock</h2>
        </div>
        <p>
          We are an authorised, multi-brand distributor carrying a comprehensive range of electrical and hardware
          products — all genuine, all warranted by the respective manufacturers.
        </p>
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '0.6rem 1.5rem' }}>
          {PRODUCT_CATEGORIES.map((c) => (
            <li key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border,#e2e8f0)' }}>
              <span className="material-icons" style={{ fontSize: '1.2rem', color: 'var(--accent,#2563eb)' }}>{c.icon}</span>
              <span dangerouslySetInnerHTML={{ __html: c.name }} />
            </li>
          ))}
        </ul>
      </div>

      {/* Why Us */}
      <div className="info-page__section">
        <div className="info-page__section-header">
          <span className="info-page__section-number">03</span>
          <h2 className="info-page__section-title">Why Customers Choose Us</h2>
        </div>
        <ul>
          <li><strong>Authorised &amp; Genuine</strong> — Every product is sourced directly from manufacturers or certified distributors, complete with standard brand warranty.</li>
          <li><strong>Expert Advice</strong> — Our staff have in-depth product knowledge and help you choose the right specification for your project, big or small.</li>
          <li><strong>Competitive Pricing</strong> — Fair, transparent pricing with bulk discounts for contractors and regular customers.</li>
          <li><strong>Fast Availability</strong> — Wide in-store stock means most items are available same-day, with quick restock on popular lines.</li>
          <li><strong>Trusted by the Community</strong> — Serving Perundurai and Erode district since 2015, with a <strong>5-star JustDial rating</strong> backed by real customer reviews.</li>
        </ul>
      </div>

      {/* Visit Us */}
      <div className="info-page__section">
        <div className="info-page__section-header">
          <span className="info-page__section-number">04</span>
          <h2 className="info-page__section-title">Visit Our Store</h2>
        </div>
        <ul>
          <li><strong>Address:</strong> MKM Complex, Nayara Bunk Opposite, Kanjikoil Road, Perundurai West, Perundurai&nbsp;–&nbsp;638052, Tamil Nadu</li>
          <li><strong>Phone:</strong> <a href="tel:+917373717175">+91 73737 17175</a></li>
          <li><strong>Hours:</strong> Monday – Saturday, 9:00 AM – 9:00 PM</li>
          <li>
            <strong>Directions:</strong>{' '}
            <a href="https://maps.google.com/?q=Sri+Murugan+Electricals+Hardwares+Perundurai+West+638052" target="_blank" rel="noopener noreferrer">
              Open in Google Maps
            </a>
          </li>
        </ul>
      </div>

    </div>
  </div>
);

export default About;
