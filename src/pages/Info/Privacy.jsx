import { Link } from 'react-router-dom';
import './InfoPage.css';

const SECTIONS = [
  { id: 'information-we-collect', label: 'Information We Collect' },
  { id: 'how-we-use', label: 'How We Use Your Information' },
  { id: 'sharing', label: 'Sharing of Information' },
  { id: 'cookies', label: 'Cookies & Tracking' },
  { id: 'data-security', label: 'Data Security' },
  { id: 'your-rights', label: 'Your Rights' },
  { id: 'data-retention', label: 'Data Retention' },
  { id: 'third-party', label: 'Third-Party Links' },
  { id: 'children', label: "Children's Privacy" },
  { id: 'changes', label: 'Changes to This Policy' },
];

const Privacy = () => (
  <div className="page-container">
    <div className="info-page">

      {/* Hero */}
      <div className="info-page__hero">
        <div className="info-page__badge">Legal</div>
        <h1 className="info-page__title">Privacy Policy</h1>
        <p className="info-page__meta">Last updated: February 25, 2026 &nbsp;|&nbsp; Effective date: February 25, 2026</p>
      </div>

      {/* Intro */}
      <div className="info-page__section">
        <p>
          Sri Murugan Electrical &amp; Hardware Store (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;),
          located at MKM Complex, Nayara Bunk Opposite, Kanjikoil Road, Perundurai West,
          Perundurai &ndash; 638052, Tamil Nadu, is committed to protecting your personal information.
          This Privacy Policy explains what data we collect, why we collect it, how we use it,
          and your rights regarding your personal data when you use our website or place an order with us.
        </p>
        <div className="info-page__highlight">
          <p>
            By using our website or services, you agree to the collection and use of information
            in accordance with this policy. If you do not agree, please do not use our services.
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
      <div className="info-page__section" id="information-we-collect">
        <div className="info-page__section-header">
          <span className="info-page__section-number">1</span>
          <h2 className="info-page__section-title">Information We Collect</h2>
        </div>
        <p>We collect information you provide directly to us and information that is generated automatically when you use our services.</p>
        <p><strong>Information you provide:</strong></p>
        <ul>
          <li><strong>Account data</strong> &ndash; name, email address, and password when you register.</li>
          <li><strong>Profile data</strong> &ndash; phone number, profile picture, and delivery addresses you add to your account.</li>
          <li><strong>Order data</strong> &ndash; products purchased, quantities, delivery address, and payment transaction reference numbers.</li>
          <li><strong>Communication data</strong> &ndash; messages you send through our support ticket system or contact form.</li>
          <li><strong>Review data</strong> &ndash; product ratings and written reviews you submit.</li>
        </ul>
        <p><strong>Information collected automatically:</strong></p>
        <ul>
          <li>Browser type, operating system, and device information.</li>
          <li>IP address and approximate geographic location.</li>
          <li>Pages visited, time spent, and navigation paths on our website.</li>
          <li>Referring URL (how you arrived at our site).</li>
        </ul>
        <p><strong>Information from third parties:</strong></p>
        <ul>
          <li>If you sign in with Google, we receive your name, email address, and Google account ID from Google OAuth. We do not receive your Google password.</li>
          <li>Razorpay, our payment processor, handles card and UPI data directly. We only receive a transaction confirmation reference and never store your card or banking details.</li>
        </ul>
      </div>

      {/* 2 */}
      <div className="info-page__section" id="how-we-use">
        <div className="info-page__section-header">
          <span className="info-page__section-number">2</span>
          <h2 className="info-page__section-title">How We Use Your Information</h2>
        </div>
        <p>We use the information we collect for the following purposes:</p>
        <ul>
          <li>To create and manage your account.</li>
          <li>To process orders, arrange delivery, and generate invoices.</li>
          <li>To send order confirmations, shipping updates, and support replies by email.</li>
          <li>To handle return requests, refunds, and complaints.</li>
          <li>To improve our product catalogue, website performance, and user experience.</li>
          <li>To detect and prevent fraud, abuse, or unauthorised access.</li>
          <li>To comply with applicable Indian laws and regulations, including the Information Technology Act, 2000.</li>
          <li>To send periodic promotional emails, <strong>only if you have opted in</strong>. You may unsubscribe at any time.</li>
        </ul>
      </div>

      {/* 3 */}
      <div className="info-page__section" id="sharing">
        <div className="info-page__section-header">
          <span className="info-page__section-number">3</span>
          <h2 className="info-page__section-title">Sharing of Information</h2>
        </div>
        <p>We <strong>do not sell, rent, or trade</strong> your personal information to third parties. We may share your data only in the following limited circumstances:</p>
        <ul>
          <li><strong>Service providers</strong> &ndash; Razorpay (payment processing), Cloudinary (image hosting), and email service providers, each acting under strict confidentiality obligations.</li>
          <li><strong>Delivery partners</strong> &ndash; your name, address, and phone number are shared solely to fulfil your order.</li>
          <li><strong>Legal obligations</strong> &ndash; if required by a court order, government authority, or applicable law.</li>
          <li><strong>Business transfers</strong> &ndash; in the event of a merger, acquisition, or sale of assets, your data may transfer to the new entity, which will be bound by this policy.</li>
        </ul>
      </div>

      {/* 4 */}
      <div className="info-page__section" id="cookies">
        <div className="info-page__section-header">
          <span className="info-page__section-number">4</span>
          <h2 className="info-page__section-title">Cookies &amp; Tracking</h2>
        </div>
        <p>
          We use browser <strong>localStorage</strong> to keep you signed in (authentication token) and to remember your cart.
          We do not currently use third-party advertising or analytics cookies.
        </p>
        <p>You can clear your browser storage at any time via your browser settings, which will sign you out of your account.</p>
      </div>

      {/* 5 */}
      <div className="info-page__section" id="data-security">
        <div className="info-page__section-header">
          <span className="info-page__section-number">5</span>
          <h2 className="info-page__section-title">Data Security</h2>
        </div>
        <p>We implement industry-standard measures to protect your personal data:</p>
        <ul>
          <li>Passwords are hashed using bcrypt before storage &ndash; we never store plain-text passwords.</li>
          <li>All data transmitted between your browser and our server is encrypted via HTTPS/TLS.</li>
          <li>Authentication is token-based (JWT) with expiry to limit session risk.</li>
          <li>Payment data is handled entirely by Razorpay, which is PCI-DSS compliant.</li>
        </ul>
        <p>
          Despite these measures, no method of electronic transmission is 100% secure.
          If you suspect any unauthorised access to your account, please contact us immediately.
        </p>
      </div>

      {/* 6 */}
      <div className="info-page__section" id="your-rights">
        <div className="info-page__section-header">
          <span className="info-page__section-number">6</span>
          <h2 className="info-page__section-title">Your Rights</h2>
        </div>
        <p>You have the following rights regarding your personal data:</p>
        <ul>
          <li><strong>Access</strong> &ndash; request a copy of the personal data we hold about you.</li>
          <li><strong>Correction</strong> &ndash; update inaccurate or incomplete information via your Profile page.</li>
          <li><strong>Deletion</strong> &ndash; request deletion of your account and associated data (subject to legal retention requirements).</li>
          <li><strong>Objection</strong> &ndash; opt out of promotional communications at any time.</li>
          <li><strong>Portability</strong> &ndash; request your data in a structured, machine-readable format.</li>
        </ul>
        <p>To exercise any of these rights, please contact us at <a href="mailto:support@srimuruganelectricals.com">support@srimuruganelectricals.com</a>. We will respond within 30 days.</p>
      </div>

      {/* 7 */}
      <div className="info-page__section" id="data-retention">
        <div className="info-page__section-header">
          <span className="info-page__section-number">7</span>
          <h2 className="info-page__section-title">Data Retention</h2>
        </div>
        <p>
          We retain your personal data for as long as your account is active or as necessary to provide services.
          Order records are kept for a minimum of <strong>5 years</strong> to comply with Indian accounting and tax regulations.
          If you delete your account, personal data will be anonymised or erased within 30 days except where retention is legally required.
        </p>
      </div>

      {/* 8 */}
      <div className="info-page__section" id="third-party">
        <div className="info-page__section-header">
          <span className="info-page__section-number">8</span>
          <h2 className="info-page__section-title">Third-Party Links</h2>
        </div>
        <p>
          Our website may contain links to external websites. We are not responsible for the privacy practices
          or content of those sites. We encourage you to review the privacy policy of every website you visit.
        </p>
      </div>

      {/* 9 */}
      <div className="info-page__section" id="children">
        <div className="info-page__section-header">
          <span className="info-page__section-number">9</span>
          <h2 className="info-page__section-title">Children&rsquo;s Privacy</h2>
        </div>
        <p>
          Our services are not directed at individuals under the age of 18. We do not knowingly collect
          personal data from minors. If we become aware that a minor has provided us with personal data,
          we will delete it promptly.
        </p>
      </div>

      {/* 10 */}
      <div className="info-page__section" id="changes">
        <div className="info-page__section-header">
          <span className="info-page__section-number">10</span>
          <h2 className="info-page__section-title">Changes to This Policy</h2>
        </div>
        <p>
          We may update this Privacy Policy from time to time. When we do, we will revise the
          &ldquo;Last updated&rdquo; date at the top. Continued use of our services after any changes
          constitutes your acceptance of the updated policy. We encourage you to review this page periodically.
        </p>
      </div>

      {/* Contact card */}
      <div className="info-page__contact-card">
        <div className="info-page__contact-card-icon">
          <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
        </div>
        <div className="info-page__contact-card-body">
          <h4>Questions about this Privacy Policy?</h4>
          <p>Sri Murugan Electrical &amp; Hardware Store<br />MKM Complex, Nayara Bunk Opposite, Kanjikoil Road, Perundurai West, Perundurai &ndash; 638052, Tamil Nadu</p>
          <p>Email: <a href="mailto:support@srimuruganelectricals.com">support@srimuruganelectricals.com</a></p>
          <p>Also see our <Link to="/terms">Terms &amp; Conditions</Link>.</p>
        </div>
      </div>

    </div>
  </div>
);

export default Privacy;

