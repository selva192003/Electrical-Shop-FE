import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { createSupportTicket } from '../../redux/slices/supportSlice.js';
import './Support.css';

/* ─── FAQ data ─── */
const FAQ_ITEMS = [
  {
    q: 'How do I track my order?',
    a: 'Once your order is placed, visit the Orders page from your account menu. Each order shows a live status timeline — from confirmation through dispatch to delivery.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major UPI apps (GPay, PhonePe, Paytm), debit/credit cards, net banking, and cash-on-delivery for eligible pin codes. All online payments are powered by Razorpay.',
  },
  {
    q: 'Can I return or exchange a product?',
    a: 'Yes. Most products are eligible for return within 7 days of delivery if they are unused and in original packaging. Visit your Orders page and initiate a return request. Defective or wrong items are covered under a 30-day replacement warranty.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Orders within Tamil Nadu are typically delivered in 2–4 business days. Remote areas may take up to 7 days. You will receive an SMS/email notification once your order is shipped.',
  },
  {
    q: 'Are all products genuine and certified?',
    a: 'Absolutely. We are an authorised multi-brand distributor. Every product is sourced directly from manufacturers or certified distributors and comes with a standard brand warranty.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept UPI, credit/debit cards, net banking, and Cash on Delivery (COD). All online transactions are secured and processed through a trusted payment gateway.',
  },
  {
    q: 'My payment was deducted but order was not placed — what should I do?',
    a: 'Do not worry. If money left your account but the order was not confirmed, the amount will automatically be refunded to your original payment method within 5–7 business days. You can also raise a ticket below for faster assistance.',
  },
  {
    q: 'How do I contact support for urgent issues?',
    a: 'Use the form on this page to raise a ticket and our team will respond within 24 hours. For urgent matters, call us directly at +91 73737 17175 during business hours (Mon–Sat, 9 AM–9 PM).',
  },
];

/* ─── Quick-help cards ─── */
const QUICK_HELP = [
  {
    icon: 'inventory_2',
    bg: '#eff6ff',
    title: 'Order Issues',
    desc: 'Track, modify or cancel your order',
    category: 'order_issue',
  },
  {
    icon: 'payment',
    bg: '#fff7ed',
    title: 'Payment Help',
    desc: 'Refunds, failed payments & billing',
    category: 'payment_issue',
  },
  {
    icon: 'sync_alt',
    bg: '#f0fdf4',
    title: 'Returns',
    desc: 'Initiate returns or exchanges',
    category: 'return_request',
  },
  {
    icon: 'bolt',
    bg: '#fefce8',
    title: 'Product Query',
    desc: 'Specs, compatibility & stock',
    category: 'product_query',
  },
];

/* ─── Single FAQ item ─── */
const FaqItem = ({ q, a, open, onToggle }) => (
  <div className={`sup-faq__item${open ? ' sup-faq__item--open' : ''}`}>
    <button className="sup-faq__trigger" onClick={onToggle} aria-expanded={open}>
      <span className="sup-faq__question">{q}</span>
      <span className="material-icons sup-faq__chevron">expand_more</span>
    </button>
    <div className="sup-faq__answer">{a}</div>
  </div>
);

/* ─── Main Support page ─── */
const Support = () => {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const formRef = useRef(null);

  /* FAQ state */
  const [openFaq, setOpenFaq] = useState(null);

  /* Form state */
  const [form, setForm] = useState({ subject: '', category: 'other', description: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState('');

  const DESC_MAX = 1000;

  /* Pre-select category and scroll to form */
  const selectCategory = (cat) => {
    setForm((f) => ({ ...f, category: cat }));
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleFaq = (i) => setOpenFaq((prev) => (prev === i ? null : i));

  /* Client-side validation */
  const validate = () => {
    const e = {};
    if (!form.subject.trim()) e.subject = 'Subject is required.';
    else if (form.subject.trim().length < 5) e.subject = 'Subject must be at least 5 characters.';
    if (!form.description.trim()) e.description = 'Please describe your issue.';
    else if (form.description.trim().length < 20)
      e.description = 'Description must be at least 20 characters.';
    return e;
  };

  /* Form submit — uses Redux thunk so new ticket lands in the tickets list immediately */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      await dispatch(
        createSupportTicket({
          subject: form.subject.trim(),
          category: form.category,
          description: form.description.trim(),
        })
      ).unwrap();
      setSubmitted(true);
    } catch (err) {
      setApiError(typeof err === 'string' ? err : (err?.message || 'Something went wrong. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: '' }));
  };

  const descLen = form.description.length;

  return (
    <>
      {/* ── Hero ── */}
      <section className="sup-hero">
        <div className="sup-hero__content">
          <div className="sup-hero__badge">
            <span className="material-icons" style={{ fontSize: '14px' }}>help_outline</span>
            Customer Support
          </div>
          <h1 className="sup-hero__title">
            How can we <span>help you?</span>
          </h1>
          <p className="sup-hero__subtitle">
            Browse our FAQs for instant answers, or submit a support ticket and our team
            will get back to you within 24 hours — guaranteed.
          </p>
          <div className="sup-hero__actions">
            <button
              className="sup-hero__btn sup-hero__btn--primary"
              onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              <span className="material-icons" style={{ fontSize: '16px' }}>chat</span>
              Raise a Ticket
            </button>
            {user && (
              <Link to="/support/tickets" className="sup-hero__btn sup-hero__btn--ghost">
                <span className="material-icons" style={{ fontSize: '16px' }}>description</span>
                My Tickets
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="sup-body">
        {/* ── Quick Help ── */}
        <section className="sup-quickhelp">
          <span className="sup-section-label">Quick Help</span>
          <h2 className="sup-section-title">What do you need help with?</h2>
          <p className="sup-section-desc">
            Click a topic to auto-select the category and jump to the support form.
          </p>
          <div className="sup-cards">
            {QUICK_HELP.map((item) => (
              <button
                key={item.category}
                className="sup-card"
                onClick={() => selectCategory(item.category)}
                aria-label={`Get help with ${item.title}`}
              >
                <div className="sup-card__icon" style={{ background: item.bg }}>
                  <span className="material-icons">{item.icon}</span>
                </div>
                <div className="sup-card__title">{item.title}</div>
                <div className="sup-card__desc">{item.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Two-column: FAQ left, Form right ── */}
        <div className="sup-main-grid">
          {/* FAQ */}
          <section className="sup-faq">
            <span className="sup-section-label">FAQs</span>
            <h2 className="sup-section-title">Frequently Asked Questions</h2>
            <p className="sup-section-desc">
              Quick answers to the questions we hear most often. Can&apos;t find what you need?
              Use the form.
            </p>
            <div className="sup-faq__list">
              {FAQ_ITEMS.map((item, i) => (
                <FaqItem
                  key={i}
                  q={item.q}
                  a={item.a}
                  open={openFaq === i}
                  onToggle={() => toggleFaq(i)}
                />
              ))}
            </div>
          </section>

          {/* Support Form */}
          <section ref={formRef}>
            <span className="sup-section-label">Contact Us</span>
            <h2 className="sup-section-title">Submit a Support Ticket</h2>
            <p className="sup-section-desc">
              Our support team responds within <strong>24 hours</strong> on business days.
            </p>
            <div className="sup-form-wrap">
              {submitted ? (
                /* ── Success ── */
                <div className="sup-form__success">
                  <div className="sup-form__success-icon">
                    <span className="material-icons" style={{ fontSize: '28px' }}>check_circle</span>
                  </div>
                  <div className="sup-form__success-title">Ticket Submitted!</div>
                  <div className="sup-form__success-desc">
                    We&apos;ve received your message and will respond to your registered email
                    within 24 hours. Track your ticket status any time.
                  </div>
                  <button
                    className="sup-hero__btn sup-hero__btn--primary"
                    style={{ margin: '0 auto' }}
                    onClick={() => navigate('/support/tickets')}
                  >
                    <span className="material-icons" style={{ fontSize: '16px' }}>description</span>
                    View My Tickets
                  </button>
                </div>
              ) : !user ? (
                /* ── Login notice ── */
                <div className="sup-form__login-notice">
                  <strong>Sign in to submit a ticket.</strong> Our support system requires an
                  account so we can link your ticket to your orders and reply effectively.{' '}
                  <Link to="/login" state={{ from: { pathname: '/support' } }}>Log in here</Link>
                  {' '}or{' '}
                  <Link to="/register">create a free account</Link>.
                </div>
              ) : (
                /* ── Form ── */
                <>
                  <div className="sup-form__heading">Tell us about your issue</div>
                  <div className="sup-form__subheading">
                    Fields marked <span style={{ color: '#ef4444' }}>*</span> are required.
                    We&apos;ll reply to your registered email address.
                  </div>

                  {apiError && (
                    <div className="sup-alert sup-alert--error" style={{ marginBottom: 16 }}>
                      {apiError}
                    </div>
                  )}

                  <form className="sup-form" onSubmit={handleSubmit} noValidate>
                    {/* Read-only name + email */}
                    <div className="sup-form__row">
                      <div className="sup-form__group">
                        <label className="sup-form__label">Your Name</label>
                        <input
                          className="sup-form__input"
                          type="text"
                          value={user.name || ''}
                          readOnly
                        />
                      </div>
                      <div className="sup-form__group">
                        <label className="sup-form__label">Email Address</label>
                        <input
                          className="sup-form__input"
                          type="email"
                          value={user.email || ''}
                          readOnly
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div className="sup-form__group">
                      <label className="sup-form__label">
                        Category <span className="sup-form__required">*</span>
                      </label>
                      <select
                        className="sup-form__select"
                        value={form.category}
                        onChange={handleChange('category')}
                      >
                        <option value="order_issue">Order Issue</option>
                        <option value="payment_issue">Payment Issue</option>
                        <option value="product_query">Product Query</option>
                        <option value="return_request">Return Request</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Subject */}
                    <div className="sup-form__group">
                      <label className="sup-form__label">
                        Subject <span className="sup-form__required">*</span>
                      </label>
                      <input
                        className="sup-form__input"
                        type="text"
                        placeholder="e.g. My order hasn't arrived yet"
                        value={form.subject}
                        onChange={handleChange('subject')}
                        maxLength={120}
                      />
                      {errors.subject && (
                        <span className="sup-form__error">{errors.subject}</span>
                      )}
                    </div>

                    {/* Description */}
                    <div className="sup-form__group">
                      <label className="sup-form__label">
                        Message / Description <span className="sup-form__required">*</span>
                      </label>
                      <textarea
                        className="sup-form__textarea"
                        placeholder="Please describe your issue in detail — include order numbers, product names, or any relevant information so we can help faster."
                        value={form.description}
                        onChange={handleChange('description')}
                        maxLength={DESC_MAX}
                      />
                      <div
                        className={`sup-form__char-count${
                          descLen > DESC_MAX * 0.9
                            ? descLen >= DESC_MAX
                              ? ' sup-form__char-count--danger'
                              : ' sup-form__char-count--warn'
                            : ''
                        }`}
                      >
                        {descLen} / {DESC_MAX}
                      </div>
                      {errors.description && (
                        <span className="sup-form__error">{errors.description}</span>
                      )}
                    </div>

                    <button
                      type="submit"
                      className={`sup-form__submit${submitting ? ' sup-form__submit--loading' : ''}`}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="material-icons sup-form__submit-spinner">sync</span>
                          Submitting…
                        </>
                      ) : (
                        <>
                          <span className="material-icons" style={{ fontSize: '17px' }}>send</span>
                          Submit Ticket
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </section>
        </div>

        {/* ── Contact Strip ── */}
        <div className="sup-contact">
          <div className="sup-contact__item">
            <div className="sup-contact__icon">
              <span className="material-icons">phone</span>
            </div>
            <div>
              <div className="sup-contact__label">Phone</div>
              <div className="sup-contact__value">+91 73737 17175</div>
              <div className="sup-contact__sub">Mon – Sat, 9 AM – 9 PM</div>
            </div>
          </div>

          <div className="sup-contact__item">
            <div className="sup-contact__icon">
              <span className="material-icons">email</span>
            </div>
            <div>
              <div className="sup-contact__label">Email</div>
              <div className="sup-contact__value">support@srimuruganelectricals.com</div>
              <div className="sup-contact__sub">Response within 24 hours</div>
            </div>
          </div>

          <div className="sup-contact__item">
            <div className="sup-contact__icon">
              <span className="material-icons">location_on</span>
            </div>
            <div>
              <div className="sup-contact__label">Store Address</div>
              <div className="sup-contact__value">Perundurai West, Tamil Nadu</div>
              <div className="sup-contact__sub">MKM Complex, Kanjikoil Road – 638052</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Support;
