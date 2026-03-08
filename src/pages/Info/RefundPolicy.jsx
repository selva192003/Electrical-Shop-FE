import './InfoPage.css';

const RefundPolicy = () => (
  <div className="page-container">
    <div className="info-page">

      <div className="info-page__hero">
        <div className="info-page__badge">Returns</div>
        <h1 className="info-page__title">Return &amp; Refund Policy</h1>
        <p className="info-page__meta">Last updated: March 2026</p>
      </div>

      <div className="info-page__section">
        <p>
          We want you to be completely satisfied with your purchase. If something is not right,
          we are here to help. Please read our return and refund policy below.
        </p>
        <div className="info-page__highlight">
          <p>
            To initiate a return, visit your <strong>Orders</strong> page, select the order,
            and click &ldquo;Request Return&rdquo;. You can also contact us at{' '}
            <a href="tel:+917373717175">+91 73737 17175</a> or via our{' '}
            <a href="/support">Support</a> page.
          </p>
        </div>
      </div>

      <div className="info-page__section">
        <div className="info-page__section-header">
          <span className="info-page__section-number">1</span>
          <h2 className="info-page__section-title">Eligibility for Returns</h2>
        </div>
        <p>A product is eligible for return if:</p>
        <ul>
          <li>It is returned within <strong>7 days</strong> of the delivery date.</li>
          <li>It is <strong>unused</strong>, in its <strong>original packaging</strong>, with all accessories and documentation.</li>
          <li>It is not from the non-returnable categories listed below.</li>
        </ul>
      </div>

      <div className="info-page__section">
        <div className="info-page__section-header">
          <span className="info-page__section-number">2</span>
          <h2 className="info-page__section-title">Defective or Wrong Items</h2>
        </div>
        <p>
          If you receive a <strong>defective, damaged, or incorrect product</strong>, you are covered
          under a <strong>30-day replacement warranty</strong> from the date of delivery. Contact us
          within this period with your order number and photographs of the issue.
        </p>
        <ul>
          <li>We will arrange a free pick-up or ask you to bring the item to our store.</li>
          <li>A replacement will be dispatched once the defect is verified, or a full refund will be issued.</li>
        </ul>
      </div>

      <div className="info-page__section">
        <div className="info-page__section-header">
          <span className="info-page__section-number">3</span>
          <h2 className="info-page__section-title">Non-Returnable Items</h2>
        </div>
        <p>The following cannot be returned except in the case of manufacturer defect:</p>
        <ul>
          <li>Cut wires and cables (sold by the metre).</li>
          <li>Opened or used batteries.</li>
          <li>Custom-ordered or specially procured items.</li>
          <li>Products with broken seals, altered serial numbers, or missing brand packaging.</li>
        </ul>
      </div>

      <div className="info-page__section">
        <div className="info-page__section-header">
          <span className="info-page__section-number">4</span>
          <h2 className="info-page__section-title">Refund Process</h2>
        </div>
        <ul>
          <li>Once the returned item is received and inspected, we will notify you of the approval or rejection of your refund.</li>
          <li>Approved refunds are processed to the <strong>original payment method</strong> within <strong>5&ndash;7 business days</strong>.</li>
          <li>For Cash on Delivery orders, refunds are issued via bank transfer &mdash; please have your account details ready.</li>
          <li>If a payment was deducted but the order was not confirmed, the amount will be automatically reversed within 5&ndash;7 business days.</li>
        </ul>
      </div>

      <div className="info-page__section">
        <div className="info-page__section-header">
          <span className="info-page__section-number">5</span>
          <h2 className="info-page__section-title">Brand Warranty Claims</h2>
        </div>
        <p>
          All products are genuine and carry the standard manufacturer warranty. For warranty claims
          beyond our 30-day window, please contact the respective brand’s authorised service centre
          with your original purchase invoice. We are happy to assist with guidance.
        </p>
      </div>

    </div>
  </div>
);

export default RefundPolicy;
