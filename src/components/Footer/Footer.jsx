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
                <Link to="/" className="footer-link">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/" className="footer-link">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/orders" className="footer-link">
                  Orders
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
                  src="https://www.google.com/maps?q=Tamil+Nadu,+India&output=embed"
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
                    <svg viewBox="0 0 24 24" focusable="false">
                      <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5s2.5 1.1 2.5 2.5S13.4 11.5 12 11.5z" />
                    </svg>
                  </span>
                  <div>
                    <div className="footer-contact-name">Sri Murugan Electrical &amp; Hardware Store</div>
                    <div>
                      MKM Complex, Nayara Bunk Opposite, Kanjikoil Road, Perundurai West, Perundurai-638052, Tamil
                      Nadu
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="footer-contact-row">
                  <span className="footer-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                      <path d="M6.6 10.8c1.2 2.3 3.1 4.2 5.4 5.4l1.8-1.8c.2-.2.6-.3.9-.2 1 .3 2 .5 3.1.5.5 0 .9.4.9.9V20c0 .5-.4 1-1 1C10.5 21 3 13.5 3 4c0-.5.4-1 1-1h3.5c.5 0 .9.4.9.9 0 1.1.2 2.1.5 3.1.1.3 0 .7-.2.9L6.6 10.8z" />
                    </svg>
                  </span>
                  <a href="tel:+919876543210" className="footer-link">
                    +91 98765 43210
                  </a>
                </div>
              </li>
              <li>
                <div className="footer-contact-row">
                  <span className="footer-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v.01L12 13 20 6.01V6H4zm0 12h16V9l-8 7-8-7v9z" />
                    </svg>
                  </span>
                  <a href="mailto:support@srmuruganelectricals.com" className="footer-link">
                    support@srmuruganelectricals.com
                  </a>
                </div>
              </li>
              <li>
                <div className="footer-contact-row">
                  <span className="footer-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                      <path d="M12 8c-3.3 0-6 2.2-6 5s2.7 5 6 5 6-2.2 6-5-2.7-5-6-5zm0-6C9.8 2 8 3.8 8 6v1h2V6c0-1.1.9-2 2-2s2 .9 2 2v1h2V6c0-2.2-1.8-4-4-4z" />
                    </svg>
                  </span>
                  <div>Mon – Sat: 9:00 AM – 8:00 PM</div>
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
              •
            </span>
            <Link to="/terms" className="footer-bottom-link">
              Terms &amp; Conditions
            </Link>
            <span className="footer-bottom-separator" aria-hidden="true">
              •
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
