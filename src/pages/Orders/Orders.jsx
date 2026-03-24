import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyOrders, cancelOrderThunk } from '../../redux/slices/orderSlice.js';
import { patchProductRating } from '../../redux/slices/productSlice.js';
import Spinner from '../../components/Spinner/Spinner.jsx';
import OrderTimeline from '../../components/OrderTimeline/OrderTimeline.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import { submitReview, getMyReview } from '../../services/reviewService.js';
import './Orders.css';

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
const fmtTime = (d) =>
  new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

/* ─────────────────────────── Status meta ─────────────────────────── */
const STATUS_META = {
  Pending:            { label: 'Pending',          color: '#d97706', bg: '#fffbeb', icon: 'hourglass_empty'  },
  Confirmed:          { label: 'Confirmed',         color: '#2563eb', bg: '#eff6ff', icon: 'check_circle'     },
  Packed:             { label: 'Packed',            color: '#7c3aed', bg: '#f5f3ff', icon: 'inventory'         },
  Shipped:            { label: 'Shipped',           color: '#0891b2', bg: '#ecfeff', icon: 'local_shipping'    },
  'Out for Delivery': { label: 'Out for Delivery',  color: '#ea580c', bg: '#fff7ed', icon: 'directions_bike'   },
  Delivered:          { label: 'Delivered',         color: '#16a34a', bg: '#f0fdf4', icon: 'task_alt'          },
  Cancelled:          { label: 'Cancelled',         color: '#dc2626', bg: '#fef2f2', icon: 'cancel'            },
};

/* ─────────────────────────── Star Rating ──────────────────────────── */
const StarRating = ({ value, onChange, readonly = false, size = 'md' }) => {
  const [hover, setHover] = useState(0);
  const active = readonly ? value : (hover || value);
  return (
    <div className={`ord-stars ord-stars--${size}`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={`material-icons ord-star${active >= s ? ' ord-star--on' : ''}`}
          onMouseEnter={() => !readonly && setHover(s)}
          onMouseLeave={() => !readonly && setHover(0)}
          onClick={() => !readonly && onChange?.(s)}
          role={readonly ? undefined : 'button'}
          aria-label={`${s} star`}
        >
          {active >= s ? 'star' : 'star_border'}
        </span>
      ))}
    </div>
  );
};

/* ─────────────────────── Per-product Feedback Card ───────────────── */
const FeedbackCard = ({ productId, productName, productImage }) => {
  const dispatch = useDispatch();
  const [rating, setRating]     = useState(0);
  const [comment, setComment]   = useState('');
  const [existing, setExisting] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSub]    = useState(false);
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    getMyReview(productId)
      .then((r) => {
        setExisting(r.data);
        setRating(r.data.rating);
        setComment(r.data.comment || '');
        setDone(true);
      })
      .catch(() => {})            /* 404 = not reviewed yet, silent */
      .finally(() => setLoading(false));
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { setError('Please select a star rating.'); return; }
    setSub(true);
    setError('');
    try {
      const res = await submitReview(productId, { rating, comment: comment.trim() });
      setExisting(res.data.review);
      setDone(true);
      // Immediately patch all cached product lists in Redux
      if (res.data.updatedRatings) {
        dispatch(patchProductRating(res.data.updatedRatings));
      }
    } catch {
      setError('Could not submit review. Please try again.');
    } finally {
      setSub(false);
    }
  };

  if (loading) {
    return (
      <div className="ord-fb-card ord-fb-card--loading">
        <div className="ord-fb-card__product">
          {productImage && <img src={productImage} alt={productName} className="ord-fb-card__img" />}
          <span className="ord-fb-card__name">{productName}</span>
        </div>
        <div style={{ padding: '1rem' }}><Spinner /></div>
      </div>
    );
  }

  return (
    <div className={`ord-fb-card${done ? ' ord-fb-card--done' : ''}`}>
      <div className="ord-fb-card__product">
        {productImage ? (
          <img src={productImage} alt={productName} className="ord-fb-card__img" />
        ) : (
          <div className="ord-fb-card__img ord-fb-card__img--ph">
            <span className="material-icons">bolt</span>
          </div>
        )}
        <span className="ord-fb-card__name">{productName}</span>
        {done && (
          <span className="ord-fb-card__verified">
            <span className="material-icons">verified</span>
            Reviewed
          </span>
        )}
      </div>

      {done ? (
        <div className="ord-fb-card__readonly">
          <StarRating value={rating} readonly size="sm" />
          {existing?.comment && (
            <p className="ord-fb-card__comment">"{existing.comment}"</p>
          )}
        </div>
      ) : (
        <form className="ord-fb-card__form" onSubmit={handleSubmit}>
          <p className="ord-fb-card__prompt">How would you rate this product?</p>
          <StarRating value={rating} onChange={setRating} size="lg" />
          <textarea
            className="ord-fb-card__textarea"
            placeholder="Share your experience (optional)…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={500}
          />
          <div className="ord-fb-card__footer">
            <span className="ord-fb-card__char">{comment.length}/500</span>
            {error && <p className="ord-fb-card__error">{error}</p>}
            <button
              type="submit"
              className="ord-fb-card__submit"
              disabled={!rating || submitting}
            >
              {submitting
                ? <><span className="material-icons spin-icon">sync</span> Submitting…</>
                : <><span className="material-icons">rate_review</span> Submit Review</>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

/* ─────────────────────── Cancel Order Panel ──────────────────────── */
const CancelOrderPanel = ({ order, onCancelled }) => {
  const dispatch = useDispatch();
  const { cancelling, cancelError } = useSelector((s) => s.orders);
  const [open, setOpen]       = useState(false);
  const [reason, setReason]   = useState('');
  const [success, setSuccess] = useState(false);
  const textareaRef = useRef(null);

  const canCancel = ['Pending', 'Confirmed'].includes(order.orderStatus);
  if (!canCancel) return null;

  const handleOpen = () => {
    setOpen(true);
    setReason('');
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleSubmit = async () => {
    if (!reason.trim()) { textareaRef.current?.focus(); return; }
    const result = await dispatch(cancelOrderThunk({ id: order._id, reason: reason.trim() }));
    if (!result.error) {
      setSuccess(true);
      setTimeout(() => onCancelled?.(), 1800);
    }
  };

  if (success) {
    const isRazorpayPaid = order.paymentInfo?.method === 'Razorpay' && order.isPaid;
    return (
      <div className="ord-cancel-success">
        <span className="material-icons">check_circle</span>
        <div>
          <p className="ord-cancel-success__title">Order Cancelled Successfully</p>
          <p className="ord-cancel-success__sub">
            {isRazorpayPaid
              ? `A refund of ₹${order.totalPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })} will be credited to your original payment method within 5–7 business days.`
              : 'Your order has been cancelled. No charge has been made.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ord-cancel-panel">
      {!open ? (
        <button className="ord-cancel-trigger" onClick={handleOpen} type="button">
          <span className="material-icons">cancel</span>
          Cancel Order
        </button>
      ) : (
        <div className="ord-cancel-form">
          <div className="ord-cancel-form__header">
            <span className="material-icons">report_problem</span>
            <div>
              <p className="ord-cancel-form__title">Why are you cancelling?</p>
              <p className="ord-cancel-form__sub">Your feedback helps us serve you better.</p>
            </div>
          </div>

          <div className="ord-cancel-presets">
            {['Changed my mind', 'Found a better price', 'Ordered by mistake',
              'Delivery taking too long', 'Product no longer needed'].map((preset) => (
              <button
                key={preset}
                type="button"
                className={`ord-cancel-preset${reason === preset ? ' ord-cancel-preset--active' : ''}`}
                onClick={() => setReason(preset)}
              >
                {preset}
              </button>
            ))}
          </div>

          <textarea
            ref={textareaRef}
            className="ord-cancel-textarea"
            placeholder="Or describe your reason here…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={400}
          />
          <div className="ord-cancel-form__char">{reason.length}/400</div>

          {cancelError && (
            <div className="ord-cancel-error">
              <span className="material-icons">error_outline</span>
              {cancelError}
            </div>
          )}

          <div className="ord-cancel-form__actions">
            <button className="ord-cancel-form__keep" onClick={() => setOpen(false)} type="button">
              <span className="material-icons">undo</span> Keep Order
            </button>
            <button
              className="ord-cancel-form__confirm"
              onClick={handleSubmit}
              disabled={!reason.trim() || cancelling}
              type="button"
            >
              {cancelling
                ? <><span className="material-icons spin-icon">sync</span> Cancelling…</>
                : <><span className="material-icons">cancel</span> Confirm Cancellation</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ──────────────────────────── Main Page ──────────────────────────── */
const Orders = () => {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.orders);
  const [selected, setSelected] = useState(null);
  const [fbOpen, setFbOpen]     = useState(false);

  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);

  /* Close modal on Escape */
  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  const openModal = useCallback((order) => {
    setSelected(order);
    // Auto-expand feedback section if this order is delivered (prompt user to rate)
    setFbOpen(order.orderStatus === 'Delivered');
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setSelected(null);
    setFbOpen(false);
    document.body.style.overflow = '';
  }, []);

  const handleCancelled = useCallback(() => {
    dispatch(fetchMyOrders());
    closeModal();
  }, [dispatch, closeModal]);

  /* ── Order List Card ── */
  const OrderCard = ({ order }) => {
    const meta  = STATUS_META[order.orderStatus] || STATUS_META.Pending;
    const items = order.orderItems || [];
    const MAX   = 4;
    const extra = items.length - MAX;
    const isActive = selected?._id === order._id;

    return (
      <article
        className={`ord-card${isActive ? ' ord-card--active' : ''}`}
        onClick={() => openModal(order)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && openModal(order)}
        aria-label={`Order ${order._id.slice(-8).toUpperCase()}, ${meta.label}`}
      >
        {/* Product image strip */}
        <div className="ord-card__imgs">
          {items.slice(0, MAX).map((item, i) =>
            item.image ? (
              <img
                key={i}
                src={item.image}
                alt={item.name}
                className="ord-card__thumb"
                title={item.name}
                loading="lazy"
              />
            ) : (
              <div key={i} className="ord-card__thumb ord-card__thumb--ph">
                <span className="material-icons">bolt</span>
              </div>
            )
          )}
          {extra > 0 && (
            <div className="ord-card__thumb ord-card__thumb--more">+{extra}</div>
          )}
        </div>

        {/* Meta block */}
        <div className="ord-card__body">
          <div className="ord-card__top">
            <div>
              <div className="ord-card__id">#{order._id.slice(-8).toUpperCase()}</div>
              <div className="ord-card__date">
                <span className="material-icons">calendar_today</span>
                {fmtDate(order.createdAt)}
              </div>
            </div>
            <span
              className="ord-badge"
              style={{ '--badge-color': meta.color, '--badge-bg': meta.bg }}
            >
              <span className="material-icons">{meta.icon}</span>
              {meta.label}
            </span>
          </div>
          <div className="ord-card__bottom">
            <span className="ord-card__items-count">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </span>
            <span className="ord-card__amount">
              ₹{order.totalPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <span className="material-icons ord-card__arrow">chevron_right</span>
      </article>
    );
  };

  /* ── Full-Screen Order Modal ── */
  const OrderModal = ({ order }) => {
    const meta        = STATUS_META[order.orderStatus] || STATUS_META.Pending;
    const isDelivered = order.orderStatus === 'Delivered';
    const isCancelled = order.orderStatus === 'Cancelled';
    const isCOD       = order.paymentInfo?.method === 'COD';
    const isPaid      = order.isPaid;

    return (
      <div className="ord-modal-overlay" role="dialog" aria-modal="true" aria-label="Order Details">
        <div className="ord-modal">

          {/* Top bar */}
          <div className="ord-modal__topbar">
            <div className="ord-modal__topbar-left">
              <span className="material-icons ord-modal__topbar-icon">receipt_long</span>
              <div>
                <h2 className="ord-modal__title">Order Details</h2>
                <p className="ord-modal__subtitle">
                  Placed on {fmtDate(order.createdAt)} · #{order._id.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
            <button className="ord-modal__close" onClick={closeModal} aria-label="Close modal">
              <span className="material-icons">close</span>
            </button>
          </div>

          {/* Scrollable body */}
          <div className="ord-modal__body">
            <div className="ord-modal__grid">

              {/* ════ LEFT ════ */}
              <div className="ord-modal__col ord-modal__col--left">

                {/* Status banner */}
                <div className="card ord-modal-status" style={{ '--banner-color': meta.color, '--banner-bg': meta.bg }}>
                  <div className="ord-modal-status__left">
                    <span className="material-icons ord-modal-status__icon" style={{ color: meta.color }}>
                      {meta.icon}
                    </span>
                    <div>
                      <div className="ord-modal-status__label" style={{ color: meta.color }}>{meta.label}</div>
                      <div className="ord-modal-status__sub">Order status</div>
                    </div>
                  </div>
                  {isCOD ? (
                    <div className="ord-pay-badge ord-pay-badge--cod">
                      <span className="material-icons">local_shipping</span> Pay on Delivery
                    </div>
                  ) : isPaid ? (
                    <div className="ord-pay-badge ord-pay-badge--paid">
                      <span className="material-icons">verified</span> Paid
                    </div>
                  ) : (
                    <div className="ord-pay-badge ord-pay-badge--pending">
                      <span className="material-icons">hourglass_empty</span> Payment Pending
                    </div>
                  )}
                </div>

                {/* Order Tracking */}
                {!isCancelled && (
                  <div className="card ord-modal-section">
                    <div className="ord-modal-section__head">
                      <span className="material-icons">local_shipping</span> Order Tracking
                    </div>
                    <OrderTimeline currentStatus={order.orderStatus} />
                  </div>
                )}

                {/* Cancelled info */}
                {isCancelled && (
                  <div className="card ord-modal-section ord-modal-section--cancelled">
                    <div className="ord-modal-section__head" style={{ color: '#dc2626' }}>
                      <span className="material-icons">cancel</span> Order Cancelled
                    </div>
                    <div className="ord-cancelled-info">
                      <p><strong>Reason:</strong> {order.cancelReason || 'No reason provided'}</p>
                      {order.cancelledAt && (
                        <p className="ord-cancelled-info__date">
                          <span className="material-icons">schedule</span>
                          {fmtDate(order.cancelledAt)} at {fmtTime(order.cancelledAt)}
                        </p>
                      )}
                      {isPaid && (
                        <div className="ord-refund-notice">
                          <span className="material-icons">account_balance</span>
                          {order.paymentInfo?.method === 'Razorpay'
                            ? `Refund of ₹${order.totalPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })} will be credited to your original Razorpay payment method within 5–7 business days.`
                            : `Refund of ₹${order.totalPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })} will be processed within 5–7 business days.`}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="card ord-modal-section">
                  <div className="ord-modal-section__head">
                    <span className="material-icons">shopping_bag</span>
                    Items Ordered ({order.orderItems?.length})
                  </div>
                  <div className="ord-items">
                    {order.orderItems?.map((item, idx) => (
                      <div key={idx} className="ord-item">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="ord-item__img" />
                        ) : (
                          <div className="ord-item__img ord-item__img--ph">
                            <span className="material-icons">bolt</span>
                          </div>
                        )}
                        <div className="ord-item__info">
                          <p className="ord-item__name">{item.name}</p>
                          {(item.variant?.watt || item.variant?.voltage || item.variant?.brand) && (
                            <p className="ord-item__variant">
                              {[item.variant.brand, item.variant.watt, item.variant.voltage].filter(Boolean).join(' · ')}
                            </p>
                          )}
                          <p className="ord-item__qty">Qty: {item.quantity}</p>
                        </div>
                        <div className="ord-item__price">
                          {(() => {
                            const base = item.price * item.quantity;
                            const rate =
                              typeof item.gstRate === 'number' ? item.gstRate : 0;
                            const gst =
                              typeof item.gstAmount === 'number'
                                ? item.gstAmount
                                : (base * (rate || 0)) / 100;
                            const lineTotal = base + gst;
                            return `₹${lineTotal.toLocaleString('en-IN')} ${
                              rate ? `(incl. GST ${rate}% )` : ''
                            }`;
                          })()}
                        </div>
                      </div>
                    ))}
                    <div className="ord-total-row">
                      <span>Items Subtotal (before GST)</span>
                      <span className="ord-total-val">
                        ₹{(order.itemsSubtotal || 0).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="ord-total-row">
                      <span>GST</span>
                      <span className="ord-total-val">
                        ₹{(order.gstTotal || 0).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="ord-total-row">
                      <span>Order Total (incl. GST)</span>
                      <span className="ord-total-val">
                        ₹{order.totalPrice?.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Feedback — Delivered only */}
                {isDelivered && (
                  <div className="card ord-modal-section ord-modal-section--feedback">
                    <button
                      className={`ord-fb-toggle${fbOpen ? ' ord-fb-toggle--open' : ''}`}
                      onClick={() => setFbOpen((v) => !v)}
                    >
                      <span className="material-icons">rate_review</span>
                      <span>Rate Your Purchase</span>
                      <span className="material-icons ord-chevron">{fbOpen ? 'expand_less' : 'expand_more'}</span>
                    </button>
                    {fbOpen && (
                      <div className="ord-fb-list">
                        <p className="ord-fb-list__hint">Your honest feedback helps other shoppers make better decisions.</p>
                        {order.orderItems.map((item, idx) => (
                          <FeedbackCard
                            key={item.product?._id || String(item.product) || idx}
                            productId={item.product?._id || String(item.product)}
                            productName={item.name}
                            productImage={item.image}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* ════ RIGHT ════ */}
              <div className="ord-modal__col ord-modal__col--right">

                {/* Payment info */}
                <div className="card ord-modal-section">
                  <div className="ord-modal-section__head">
                    <span className="material-icons">payment</span> Payment Information
                  </div>
                  <div className="ord-info-table">
                    <div className="ord-info-row">
                      <span className="ord-info-key">Method</span>
                      <span className="ord-info-val ord-info-val--method">
                        {isCOD
                          ? <><span className="material-icons">local_shipping</span> Cash on Delivery</>
                          : <><span className="material-icons">credit_card</span> Razorpay</>}
                      </span>
                    </div>
                    <div className="ord-info-row">
                      <span className="ord-info-key">Status</span>
                      <span className={`ord-pay-status ${isCOD ? 'ord-pay-status--cod' : isPaid ? 'ord-pay-status--paid' : 'ord-pay-status--pending'}`}>
                        <span className="material-icons">
                          {isCOD ? 'local_shipping' : isPaid ? 'check_circle' : 'hourglass_empty'}
                        </span>
                        {isCOD ? 'Pay on Delivery' : isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                    {isPaid && order.paidAt && (
                      <div className="ord-info-row">
                        <span className="ord-info-key">Paid On</span>
                        <span className="ord-info-val">{fmtDate(order.paidAt)}</span>
                      </div>
                    )}
                    {order.paymentInfo?.razorpayPaymentId && (
                      <div className="ord-info-row">
                        <span className="ord-info-key">Transaction ID</span>
                        <span className="ord-info-val ord-info-val--txn">{order.paymentInfo.razorpayPaymentId}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery address */}
                <div className="card ord-modal-section">
                  <div className="ord-modal-section__head">
                    <span className="material-icons">location_on</span> Delivery Address
                  </div>
                  <div className="ord-addr">
                    <p className="ord-addr__name">{order.shippingAddress?.fullName}</p>
                    <p>{order.shippingAddress?.addressLine1}</p>
                    {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                    <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} – {order.shippingAddress?.postalCode}</p>
                    <p>{order.shippingAddress?.country}</p>
                    <p className="ord-addr__phone">
                      <span className="material-icons">phone</span>{order.shippingAddress?.phone}
                    </p>
                  </div>
                </div>

                {/* Order summary */}
                <div className="card ord-modal-section">
                  <div className="ord-modal-section__head">
                    <span className="material-icons">receipt</span> Order Summary
                  </div>
                  <div className="ord-info-table">
                    <div className="ord-info-row">
                      <span className="ord-info-key">Order ID</span>
                      <span className="ord-info-val ord-info-val--id">#{order._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="ord-info-row">
                      <span className="ord-info-key">Order Status</span>
                      <span className="ord-order-status-badge" style={{ '--s-color': meta.color, '--s-bg': meta.bg }}>
                        <span className="material-icons">{meta.icon}</span>{meta.label}
                      </span>
                    </div>
                    <div className="ord-info-row">
                      <span className="ord-info-key">Items</span>
                      <span className="ord-info-val">{order.orderItems?.length}</span>
                    </div>
                    <div className="ord-info-row ord-info-row--total">
                      <span className="ord-info-key">Total Amount</span>
                      <span className="ord-info-val ord-info-val--price">
                        ₹{order.totalPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cancel Order */}
                <CancelOrderPanel order={order} onCancelled={handleCancelled} />

                {/* Actions */}
                <div className="ord-modal-actions">
                  <button className="ord-btn ord-btn--secondary" onClick={closeModal}>
                    <span className="material-icons">list_alt</span> All Orders
                  </button>
                  <Link to="/products" className="accent-btn ord-btn" onClick={closeModal}>
                    <span className="material-icons">storefront</span> Continue Shopping
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container orders-page">
      <div className="orders-page__header">
        <h1 className="page-title">My Orders</h1>
        {!loading && list.length > 0 && (
          <span className="orders-page__count">
            {list.length} order{list.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <div className="orders-page__loader"><Spinner /></div>
      ) : list.length === 0 ? (
        <EmptyState
          icon="receipt_long"
          title="No orders yet"
          message="Your orders will appear here once you make a purchase."
        />
      ) : (
        <div className="orders-list">
          {list.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}

      {selected && <OrderModal order={selected} />}
    </div>
  );
};

export default Orders;
