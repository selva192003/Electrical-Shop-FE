import './InfoPage.css';

const Contact = () => (
  <div className="page-container">
    <div className="info-page">

      <div className="info-page__hero">
        <div className="info-page__badge">Get in Touch</div>
        <h1 className="info-page__title">Contact Us</h1>
        <p className="info-page__meta">
          We are open Monday &ndash; Saturday, 9:00&nbsp;AM &ndash; 9:00&nbsp;PM.
          Walk in, call, or send us a message.
        </p>
      </div>

      <div className="info-page__section">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.25rem' }}>

          <div style={{ background: 'var(--bg-subtle,#f8fafc)', borderRadius: '12px', padding: '1.5rem', display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
            <span className="material-icons" style={{ color: 'var(--accent,#2563eb)', fontSize: '1.6rem', marginTop: '2px' }}>phone</span>
            <div>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Phone &amp; WhatsApp</div>
              <a href="tel:+917373717175" style={{ display: 'block', color: 'inherit' }}>+91 73737 17175</a>
              <a href="https://wa.me/917373717175" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.82rem', color: 'var(--accent,#2563eb)' }}>Chat on WhatsApp &rarr;</a>
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle,#f8fafc)', borderRadius: '12px', padding: '1.5rem', display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
            <span className="material-icons" style={{ color: 'var(--accent,#2563eb)', fontSize: '1.6rem', marginTop: '2px' }}>email</span>
            <div>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Email</div>
              <a href="mailto:srimuruganelectricals75@gmail.com" style={{ color: 'inherit' }}>srimuruganelectricals75@gmail.com</a>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted,#64748b)', marginTop: '0.2rem' }}>Response within 24 hours</div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle,#f8fafc)', borderRadius: '12px', padding: '1.5rem', display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
            <span className="material-icons" style={{ color: 'var(--accent,#2563eb)', fontSize: '1.6rem', marginTop: '2px' }}>location_on</span>
            <div>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Store Address</div>
              <address style={{ fontStyle: 'normal', lineHeight: 1.6 }}>
                MKM Complex, Nayara Bunk Opposite,<br />
                Kanjikoil Road, Perundurai West,<br />
                Perundurai &ndash; 638052, Tamil Nadu
              </address>
              <a
                href="https://maps.google.com/?q=Sri+Murugan+Electricals+Hardwares+Perundurai+West+638052"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.82rem', color: 'var(--accent,#2563eb)', marginTop: '0.3rem', display: 'inline-block' }}
              >
                Get Directions &rarr;
              </a>
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle,#f8fafc)', borderRadius: '12px', padding: '1.5rem', display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
            <span className="material-icons" style={{ color: 'var(--accent,#2563eb)', fontSize: '1.6rem', marginTop: '2px' }}>schedule</span>
            <div>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Store Hours</div>
              <div>Monday &ndash; Saturday</div>
              <div style={{ fontWeight: 600 }}>9:00 AM &ndash; 9:00 PM</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted,#64748b)', marginTop: '0.2rem' }}>Closed on Sundays &amp; public holidays</div>
            </div>
          </div>

        </div>
      </div>

      <div className="info-page__section">
        <div className="info-page__section-header">
          <span className="info-page__section-number"></span>
          <h2 className="info-page__section-title">Need More Help?</h2>
        </div>
        <p>
          For order-related queries, returns, or technical support, please use our{' '}
          <a href="/support">Support page</a> to raise a ticket. Our team will respond within
          24 hours on business days.
        </p>
      </div>

    </div>
  </div>
);

export default Contact;
