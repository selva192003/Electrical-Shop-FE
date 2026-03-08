import './InfoPage.css';

const FAQS = [
  {
    q: 'Where is the store located?',
    a: 'We are at MKM Complex, Nayara Bunk Opposite, Kanjikoil Road, Perundurai West, Perundurai\u2013638052, Tamil Nadu. We are easy to find, directly opposite the Nayara petrol bunk on Kanjikoil Road.',
  },
  {
    q: 'What are your store hours?',
    a: 'We are open Monday to Saturday, 9:00\u202fAM to 9:00\u202fPM. We are closed on Sundays and national public holidays.',
  },
  {
    q: 'What brands do you stock?',
    a: 'We carry authorised products from leading brands including Luminous, Amaron, Havells, Finolex, Anchor, Polycab, Philips, Crompton, Orient, and more. All products are genuine and come with standard manufacturer warranties.',
  },
  {
    q: 'Do you sell inverter batteries and UPS systems?',
    a: 'Yes. We are authorised dealers for Luminous inverter batteries and Amaron UPS batteries. We can advise you on the right battery and inverter capacity for your home or business load requirements.',
  },
  {
    q: 'Do you offer bulk pricing for contractors?',
    a: 'Yes. We offer special rates for electricians, electrical contractors, and bulk buyers. Bring your material list or project requirements to the store and we will provide a competitive quotation.',
  },
  {
    q: 'Can I order online and pick up in store?',
    a: 'Yes. Place your order through our website and select the store pickup option at checkout. Your order will be ready for collection within a few hours during store hours.',
  },
  {
    q: 'Do you deliver to nearby areas?',
    a: 'Yes, we deliver to Perundurai and surrounding areas. Delivery charges and timelines are calculated at checkout based on your pin code. Orders within Perundurai typically arrive in 1\u20132 business days.',
  },
  {
    q: 'How do I know which wire gauge to buy for my project?',
    a: 'Our in-store team is happy to advise based on the load, distance, and type of circuit. For wiring projects, bring your floor plan or load list and we will recommend the right cable specifications.',
  },
  {
    q: 'Are products covered under warranty?',
    a: 'All products sold by us are genuine and carry the standard manufacturer warranty. Warranty terms vary by brand and product. Please retain your purchase invoice as proof of purchase for any warranty claims.',
  },
  {
    q: 'How do I contact you for product availability or pricing?',
    a: 'Call us at +91\u202073737\u202017175 (Mon\u2013Sat, 9\u202fAM\u2013\u20119\u202fPM) or use the Support page on this website to send a query. You can also WhatsApp us for quick responses.',
  },
];

const Faq = () => (
  <div className="page-container">
    <div className="info-page">

      <div className="info-page__hero">
        <div className="info-page__badge">Help</div>
        <h1 className="info-page__title">Frequently Asked Questions</h1>
        <p className="info-page__meta">Quick answers about our store, products, delivery, and more.</p>
      </div>

      <div className="info-page__section">
        <dl style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {FAQS.map(({ q, a }) => (
            <div key={q} style={{ borderBottom: '1px solid var(--border,#e2e8f0)', paddingBottom: '1.25rem' }}>
              <dt style={{ fontWeight: 700, marginBottom: '0.4rem', fontSize: '1rem' }}>{q}</dt>
              <dd style={{ margin: 0, color: 'var(--text-muted,#4b5563)', lineHeight: 1.7 }}>{a}</dd>
            </div>
          ))}
        </dl>
      </div>

    </div>
  </div>
);

export default Faq;
