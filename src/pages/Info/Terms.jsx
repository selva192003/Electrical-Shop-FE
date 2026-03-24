import { Link } from 'react-router-dom';
import './InfoPage.css';

const SECTIONS = [
  { id: 'acceptance', label: 'Acceptance of Terms' },
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'account', label: 'Your Account' },
  { id: 'products-orders', label: 'Products & Orders' },
  { id: 'pricing-payment', label: 'Pricing & Payment' },
  { id: 'shipping-delivery', label: 'Shipping & Delivery' },
  { id: 'returns-refunds', label: 'Returns & Refunds' },
  { id: 'intellectual-property', label: 'Intellectual Property' },
  { id: 'prohibited', label: 'Prohibited Conduct' },
  { id: 'disclaimer', label: 'Disclaimer of Warranties' },
  { id: 'liability', label: 'Limitation of Liability' },
  { id: 'governing-law', label: 'Governing Law' },
  { id: 'changes', label: 'Changes to Terms' },
];

const Terms = () => (
  <div className="page-container">
    <div className="info-page">

      {/* Hero */}
      <div className="info-page__hero">
        <div className="info-page__badge">Legal</div>
        <h1 className="info-page__title">Terms &amp; Conditions</h1>
        <p className="info-page__meta">Last updated: February 25, 2026 &nbsp;|&nbsp; Effective date: February 25, 2026</p>
      </div>

      {/* Intro */}
      <div className="info-page__section">
        <p>
          Welcome to Sri Murugan Electrical &amp; Hardware Store (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;).
          By accessing or using our website and services, you agree to be bound by these Terms &amp; Conditions.
          Please read them carefully before placing an order or using any feature of our platform.
        </p>
        <div className="info-page__highlight">
          <p>
            If you do not agree to any part of these Terms, you must not use our website or services.
            These Terms constitute a legally binding agreement between you and Sri Murugan Electrical &amp; Hardware Store.
          </p>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="info-page__toc">
        <div className="info-page__toc-title">Contents</div>
        <ol className="info-page__toc-list">
          {SECTIONS.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`}>{i + 1}. {s.label}</a>
            </li>
          ))}
        </ol>
      </div>

      {/* 1 */}
      <div className="info-page__section" id="acceptance">
        <div className="info-page__section-header">
          <span className="info-page__section-number">1</span>
          <h2 className="info-page__section-title">Acceptance of Terms</h2>
        </div>
        <p>
          By registering an account, browsing our catalogue, or placing an order, you confirm that you have read,
          understood, and agree to these Terms &amp; Conditions and our <Link to="/privacy">Privacy Policy</Link>.
          These Terms apply to all visitors, users, and customers of our platform.
        </p>
      </div>

      {/* 2 */}
      <div className="info-page__section" id="eligibility">
        <div className="info-page__section-header">
          <span className="info-page__section-number">2</span>
          <h2 className="info-page__section-title">Eligibility</h2>
        </div>
        <p>To use our services, you must:</p>
        <ul>
          <li>Be at least <strong>18 years of age</strong>.</li>
          <li>Be legally capable of entering into a binding contract under the Indian Contract Act, 1872.</li>
          <li>Provide accurate, current, and complete information during registration and checkout.</li>
          <li>Not be a person barred from receiving services under applicable Indian laws.</li>
        </ul>
      </div>

      {/* 3 */}
      <div className="info-page__section" id="account">
        <div className="info-page__section-header">
          <span className="info-page__section-number">3</span>
          <h2 className="info-page__section-title">Your Account</h2>
        </div>
        <p>You are responsible for:</p>
        <ul>
          <li>Maintaining the confidentiality of your login credentials.</li>
          <li>All activity that occurs under your account, whether or not authorised by you.</li>
          <li>Notifying us immediately at <a href="mailto:srimuruganelectricals75@gmail.com">srimuruganelectricals75@gmail.com</a> if you suspect unauthorised use of your account.</li>
        </ul>
        <p>
          We reserve the right to suspend or terminate accounts that are found to be in violation of these Terms,
          engaged in fraudulent activity, or inactive for an extended period without notice.
        </p>
      </div>

      {/* 4 */}
      <div className="info-page__section" id="products-orders">
        <div className="info-page__section-header">
          <span className="info-page__section-number">4</span>
          <h2 className="info-page__section-title">Products &amp; Orders</h2>
        </div>
        <p>
          All product listings, including descriptions, images, and specifications, are provided in good faith.
          We reserve the right to correct any errors, inaccuracies, or omissions and to change or update
          information at any time without prior notice.
        </p>
        <ul>
          <li>Placing an order constitutes an <strong>offer to purchase</strong>. The contract is formed only once we confirm your order and dispatch the goods.</li>
          <li>We reserve the right to refuse or cancel any order at our sole discretion, including if a product is out of stock, if there is an error in pricing, or if we suspect fraudulent activity.</li>
          <li>Product images are for illustrative purposes only; actual product appearance may vary slightly.</li>
          <li>Stock availability shown on the website is indicative and subject to change without notice.</li>
        </ul>
      </div>

      {/* 5 */}
      <div className="info-page__section" id="pricing-payment">
        <div className="info-page__section-header">
          <span className="info-page__section-number">5</span>
          <h2 className="info-page__section-title">Pricing &amp; Payment</h2>
        </div>
        <ul>
          <li>All prices are listed in <strong>Indian Rupees (INR)</strong>. Any applicable taxes or charges will be clearly shown at checkout.</li>
          <li>We reserve the right to change prices at any time. The price charged will be the price displayed at the time of placing your order.</li>
          <li>Payments are processed securely through <strong>Razorpay</strong>. We accept UPI, credit/debit cards, and net banking.</li>
          <li>In the event of a payment failure, please do not retry multiple times. Contact our support team to verify the transaction status before attempting again.</li>
          <li>Promotional discounts and coupon codes are subject to their own terms and cannot be combined unless explicitly stated.</li>
        </ul>
      </div>

      {/* 6 */}
      <div className="info-page__section" id="shipping-delivery">
        <div className="info-page__section-header">
          <span className="info-page__section-number">6</span>
          <h2 className="info-page__section-title">Shipping &amp; Delivery</h2>
        </div>
        <ul>
          <li>Estimated delivery timelines are provided at checkout and are indicative, not guaranteed.</li>
          <li>Delivery timelines may be affected by factors outside our control, including courier delays, natural events, or government restrictions.</li>
          <li>Risk of loss and title for products passes to you upon delivery to the shipping address provided.</li>
          <li>You are responsible for providing a complete, accurate delivery address. We are not liable for failed deliveries due to incorrect address information.</li>
          <li>If an order is returned to us due to non-delivery, re-shipping charges may apply.</li>
        </ul>
      </div>

      {/* 7 */}
      <div className="info-page__section" id="returns-refunds">
        <div className="info-page__section-header">
          <span className="info-page__section-number">7</span>
          <h2 className="info-page__section-title">Returns &amp; Refunds</h2>
        </div>
        <ul>
          <li>Returns are accepted within <strong>7 days</strong> of delivery for items that are defective, damaged in transit, or incorrectly supplied.</li>
          <li>Items must be returned in their original packaging with all accessories and documentation included.</li>
          <li>Customised, cut-to-length, or perishable electrical consumables are <strong>not eligible</strong> for return.</li>
          <li>Approved refunds will be processed to the original payment method within <strong>5&ndash;7 business days</strong>.</li>
          <li>To initiate a return, log in to your account, navigate to <em>Orders &rarr; Return Request</em>, and submit the details along with supporting photographs.</li>
        </ul>
        <div className="info-page__highlight">
          <p>We reserve the right to reject return requests that do not meet the above criteria or appear to be fraudulent.</p>
        </div>
      </div>

      {/* 8 */}
      <div className="info-page__section" id="intellectual-property">
        <div className="info-page__section-header">
          <span className="info-page__section-number">8</span>
          <h2 className="info-page__section-title">Intellectual Property</h2>
        </div>
        <p>
          All content on this website &mdash; including text, graphics, logos, product images, and software &mdash;
          is the property of Sri Murugan Electrical &amp; Hardware Store or its respective brand partners and is
          protected under applicable intellectual property laws.
        </p>
        <p>
          You may not reproduce, distribute, modify, or create derivative works from any content on this site
          without our prior written consent.
        </p>
      </div>

      {/* 9 */}
      <div className="info-page__section" id="prohibited">
        <div className="info-page__section-header">
          <span className="info-page__section-number">9</span>
          <h2 className="info-page__section-title">Prohibited Conduct</h2>
        </div>
        <p>You agree not to:</p>
        <ul>
          <li>Use our website for any unlawful purpose or in violation of applicable laws.</li>
          <li>Use automated scripts, bots, or crawlers to access our website without permission.</li>
          <li>Attempt to gain unauthorised access to any part of our systems or databases.</li>
          <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity.</li>
          <li>Submit false, misleading, or defamatory product reviews.</li>
          <li>Interfere with or disrupt the integrity or performance of our services.</li>
        </ul>
      </div>

      {/* 10 */}
      <div className="info-page__section" id="disclaimer">
        <div className="info-page__section-header">
          <span className="info-page__section-number">10</span>
          <h2 className="info-page__section-title">Disclaimer of Warranties</h2>
        </div>
        <p>
          Our website and services are provided on an <strong>&ldquo;as is&rdquo;</strong> and
          <strong>&ldquo;as available&rdquo;</strong> basis without any warranties, express or implied.
          We do not warrant that the website will be uninterrupted, error-free, or free of viruses.
        </p>
        <p>
          Product warranties, where applicable, are governed by the respective manufacturer&rsquo;s warranty terms.
          We are a distributor and do not independently warrant the fitness of any product for a particular purpose.
        </p>
      </div>

      {/* 11 */}
      <div className="info-page__section" id="liability">
        <div className="info-page__section-header">
          <span className="info-page__section-number">11</span>
          <h2 className="info-page__section-title">Limitation of Liability</h2>
        </div>
        <p>
          To the maximum extent permitted by law, Sri Murugan Electrical &amp; Hardware Store shall not be liable
          for any indirect, incidental, special, or consequential damages arising from your use of our services,
          including but not limited to loss of profits, data, goodwill, or business opportunities.
        </p>
        <p>
          Our total liability in connection with any claim arising out of or relating to these Terms or your
          use of the services shall not exceed the amount paid by you for the specific order that gave rise to the claim.
        </p>
      </div>

      {/* 12 */}
      <div className="info-page__section" id="governing-law">
        <div className="info-page__section-header">
          <span className="info-page__section-number">12</span>
          <h2 className="info-page__section-title">Governing Law &amp; Disputes</h2>
        </div>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of India.
          Any disputes arising from or relating to these Terms shall first be attempted to be resolved
          amicably. If unresolved, disputes shall be subject to the exclusive jurisdiction of the courts
          at <strong>Erode, Tamil Nadu, India</strong>.
        </p>
      </div>

      {/* 13 */}
      <div className="info-page__section" id="changes">
        <div className="info-page__section-header">
          <span className="info-page__section-number">13</span>
          <h2 className="info-page__section-title">Changes to Terms</h2>
        </div>
        <p>
          We reserve the right to modify these Terms at any time. Changes will be effective immediately upon
          posting on this page. Your continued use of our services after any changes constitutes your
          acceptance of the revised Terms. We recommend reviewing this page periodically.
        </p>
      </div>

      {/* Contact card */}
      <div className="info-page__contact-card">
        <div className="info-page__contact-card-icon">
          <span className="material-icons">email</span>
        </div>
        <div className="info-page__contact-card-body">
          <h4>Questions about these Terms?</h4>
          <p>Sri Murugan Electrical &amp; Hardware Store<br />MKM Complex, Nayara Bunk Opposite, Kanjikoil Road, Perundurai West, Perundurai &ndash; 638052, Tamil Nadu</p>
          <p>Email: <a href="mailto:srimuruganelectricals75@gmail.com">srimuruganelectricals75@gmail.com</a></p>
          <p>Also see our <Link to="/privacy">Privacy Policy</Link>.</p>
        </div>
      </div>

    </div>
  </div>
);

export default Terms;

