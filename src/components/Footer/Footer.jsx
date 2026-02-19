import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">VoltCart Electricals</div>
        <div className="footer-links">
          <span>Secure Payments</span>
          <span>Genuine Products</span>
          <span>24x7 Support</span>
        </div>
        <div className="footer-copy">© {new Date().getFullYear()} VoltCart. All rights reserved.</div>
      </div>
    </footer>
  );
};

export default Footer;
