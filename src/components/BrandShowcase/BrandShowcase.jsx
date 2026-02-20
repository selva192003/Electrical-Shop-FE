import './BrandShowcase.css';

const BRANDS = [
  'Havells',
  'Anchor',
  'Polycab',
  'Finolex',
  'Crompton',
  'Philips',
  'Syska',
  'Legrand',
  'Schneider Electric',
  'Bajaj Electricals',
];

const BrandShowcase = () => {
  return (
    <section className="brand-section card" aria-label="Brands we deal with">
      <div className="brand-section-header">
        <h2 className="brand-section-title">Brands We Deal With</h2>
        <p className="brand-section-subtitle">
          Partnering with trusted industry-leading electrical brands to ensure quality and reliability.
        </p>
      </div>

      <div className="brand-strip-wrapper">
        <div className="brand-strip-gradient brand-strip-gradient-left" aria-hidden="true" />
        <div className="brand-strip-gradient brand-strip-gradient-right" aria-hidden="true" />

        <div className="brand-strip" role="list" aria-label="Electrical brands">
          <div className="brand-strip-track">
            {BRANDS.map((brand) => (
              <span key={brand} className="brand-pill" role="listitem">
                {brand}
              </span>
            ))}
            {BRANDS.map((brand) => (
              <span key={`${brand}-duplicate`} className="brand-pill" aria-hidden="true">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="brand-trust-text">
        Authorized distributor of leading electrical brands, delivering genuine products with certified quality standards.
      </p>
    </section>
  );
};

export default BrandShowcase;
