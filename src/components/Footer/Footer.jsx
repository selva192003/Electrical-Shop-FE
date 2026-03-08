import { Link } from 'react-router-dom';
import logo from '../../assets/sri-murugan-logo.png';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-inner">
          <section className="footer-column footer-column-wide" aria-labelledby="footer-about-heading">
            <div className="footer-brand-row">
              <div className="footer-logo" aria-hidden="true">
                <img
                  src={logo}
                  alt="Sri Murugan Electricals and Hardwares logo"
                  className="footer-logo-image"
                />
              </div>
              <div>
                <h2 id="footer-about-heading" className="footer-heading footer-heading-large">
                  Sri Murugan Electrical &amp; Hardware Store
                </h2>
                <p className="footer-tagline">Trusted partner for safe, reliable electrical solutions.</p>
              </div>
            </div>
            <p className="footer-description">
              Authorised multi-brand electrical distributor serving homes, businesses, and projects with genuine
              products and trusted expertise.
            </p>
            <div className="footer-badges">
              <span className="footer-badge">Genuine Products</span>
              <span className="footer-badge">Trusted Service</span>
            </div>
          </section>

          <nav className="footer-column" aria-labelledby="footer-quick-links-heading">
            <h3 id="footer-quick-links-heading" className="footer-heading">
              Quick Links
            </h3>
            <ul className="footer-list">
              <li>
                <Link to="/" className="footer-link">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="footer-link">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/categories" className="footer-link">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/calculator" className="footer-link">
                  Calculator
                </Link>
              </li>
              <li>
                <Link to="/orders" className="footer-link">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/about" className="footer-link">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="footer-link">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/support" className="footer-link">
                  Customer Support
                </Link>
              </li>
            </ul>
          </nav>

          <section className="footer-column footer-column-map" aria-labelledby="footer-map-heading">
            <h3 id="footer-map-heading" className="footer-heading">
              Find Us
            </h3>
            <div className="footer-map">
              <div className="footer-map-embed">
                <iframe
                  title="Sri Murugan Electrical &amp; Hardware Store Location"
                  src="https://maps.google.com/maps?q=Sri+Murugan+Electricals+and+Hardwares,+Perundurai,+Tamil+Nadu+638052&z=16&output=embed"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

            </div>
          </section>

          <section className="footer-column" aria-labelledby="footer-contact-heading">
            <h3 id="footer-contact-heading" className="footer-heading">
              Contact Us
            </h3>
            <ul className="footer-list footer-contact-list">
              <li>
                <div className="footer-contact-row">
                  <span className="footer-icon" aria-hidden="true">
                    <span className="material-icons">phone</span>
                  </span>
                  <a href="tel:+917373717175" className="footer-link">
                    +91 73737 17175
                  </a>
                </div>
              </li>
              <li>
                <div className="footer-contact-row">
                  <span className="footer-icon" aria-hidden="true">
                    <span className="material-icons">email</span>
                  </span>
                  <a href="mailto:support@srimuruganelectricals.com" className="footer-link">
                    support@srimuruganelectricals.com
                  </a>
                </div>
              </li>
              <li>
                <div className="footer-contact-row">
                  <span className="footer-icon" aria-hidden="true">
                    <span className="material-icons">location_on</span>
                  </span>
                  <address style={{ fontStyle: 'normal' }}>
                    MKM Complex, Nayara Bunk Opposite,<br />
                    Kanjikoil Road, Perundurai West,<br />
                    Perundurai &ndash; 638052, Tamil Nadu
                  </address>
                </div>
              </li>
              <li>
                <div className="footer-contact-row">
                  <span className="footer-icon" aria-hidden="true">
                    <span className="material-icons">schedule</span>
                  </span>
                  <div>Mon – Sat: 9:00 AM – 9:00 PM</div>
                </div>
              </li>
            </ul>
          </section>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p className="footer-copy-left">© {year} Sri Murugan Electrical &amp; Hardware Store. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy" className="footer-bottom-link">
              Privacy Policy
            </Link>
            <span className="footer-bottom-separator" aria-hidden="true">
              |
            </span>
            <Link to="/terms" className="footer-bottom-link">
              Terms &amp; Conditions
            </Link>
            <span className="footer-bottom-separator" aria-hidden="true">
              |
            </span>
            <Link to="/support" className="footer-bottom-link">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
