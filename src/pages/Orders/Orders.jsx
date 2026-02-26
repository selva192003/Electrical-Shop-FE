import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../../redux/slices/orderSlice.js';
import { patchProductRating } from '../../redux/slices/productSlice.js';
import Spinner from '../../components/Spinner/Spinner.jsx';
import OrderTimeline from '../../components/OrderTimeline/OrderTimeline.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import { submitReview, getMyReview } from '../../services/reviewService.js';
import './Orders.css';

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

/* ──────────────────────────── Main Page ──────────────────────────── */
const Orders = () => {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.orders);
  const [selected, setSelected]   = useState(null);
  const [trackOpen, setTrackOpen] = useState(false);
  const [fbOpen, setFbOpen]       = useState(false);

  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);

  /* Close drawer on Escape */
  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => { if (e.key === 'Escape') closeDrawer(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  const openDrawer = useCallback((order) => {
    setSelected(order);
    setTrackOpen(false);
    setFbOpen(false);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeDrawer = useCallback(() => {
    setSelected(null);
    setTrackOpen(false);
    setFbOpen(false);
    document.body.style.overflow = '';
  }, []);

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const fmtTime = (d) =>
    new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

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
        onClick={() => openDrawer(order)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && openDrawer(order)}
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

  /* ── Order Detail Drawer ── */
  const OrderDrawer = ({ order }) => {
    const meta        = STATUS_META[order.orderStatus] || STATUS_META.Pending;
    const isDelivered = order.orderStatus === 'Delivered';
    const isCancelled = order.orderStatus === 'Cancelled';

    return (
      <>
        <div className="ord-overlay" onClick={closeDrawer} />

        <aside className="ord-drawer" role="dialog" aria-modal="true" aria-label="Order Details">

          {/* Header */}
          <div className="ord-drawer__header">
            <div className="ord-drawer__header-left">
              <span className="material-icons ord-drawer__header-icon">receipt_long</span>
              <div>
                <h2 className="ord-drawer__title">Order Details</h2>
                <span className="ord-drawer__id">#{order._id.slice(-8).toUpperCase()}</span>
              </div>
            </div>
            <button className="ord-drawer__close" onClick={closeDrawer} aria-label="Close">
              <span className="material-icons">close</span>
            </button>
          </div>

          <div className="ord-drawer__body">

            {/* Status banner */}
            <div
              className="ord-status-banner"
              style={{ '--banner-color': meta.color, '--banner-bg': meta.bg }}
            >
              <div className="ord-status-banner__left">
                <span className="material-icons ord-status-banner__icon">{meta.icon}</span>
                <div>
                  <div className="ord-status-banner__label">{meta.label}</div>
                  <div className="ord-status-banner__time">
                    <span className="material-icons">schedule</span>
                    {fmtDate(order.createdAt)} · {fmtTime(order.createdAt)}
                  </div>
                </div>
              </div>
              {order.isPaid && (
                <div className="ord-status-banner__paid">
                  <span className="material-icons">verified</span>
                  Paid
                </div>
              )}
            </div>

            {/* Items */}
            <section className="ord-section">
              <div className="ord-section__head">
                <span className="material-icons">shopping_bag</span>
                Items Ordered
              </div>
              <div className="ord-items-list">
                {order.orderItems.map((item, idx) => (
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
                          {[item.variant.brand, item.variant.watt, item.variant.voltage]
                            .filter(Boolean).join(' · ')}
                        </p>
                      )}
                      <p className="ord-item__qty">Qty: {item.quantity}</p>
                    </div>
                    <div className="ord-item__price">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
                <div className="ord-total-row">
                  <span>Order Total</span>
                  <span className="ord-total-val">
                    ₹{order.totalPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </section>

            {/* Track Order */}
            <section className="ord-section">
              <button
                className={`ord-track-btn${trackOpen ? ' ord-track-btn--open' : ''}${isCancelled ? ' ord-track-btn--cancelled' : ''}`}
                onClick={() => setTrackOpen((v) => !v)}
              >
                <span className="material-icons">
                  {isCancelled ? 'cancel' : 'local_shipping'}
                </span>
                <span>Track Order</span>
                <span className="material-icons ord-chevron">
                  {trackOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              {trackOpen && (
                <div className="ord-track-body">
                  <OrderTimeline currentStatus={order.orderStatus} />
                </div>
              )}
            </section>

            {/* Shipping Address */}
            <section className="ord-section">
              <div className="ord-section__head">
                <span className="material-icons">location_on</span>
                Delivery Address
              </div>
              <div className="ord-addr">
                <p className="ord-addr__name">{order.shippingAddress?.fullName}</p>
                <p>{order.shippingAddress?.addressLine1}</p>
                {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                  – {order.shippingAddress?.postalCode}
                </p>
                <p>{order.shippingAddress?.country}</p>
                <p className="ord-addr__phone">
                  <span className="material-icons">phone</span>
                  {order.shippingAddress?.phone}
                </p>
              </div>
            </section>

            {/* Payment Info */}
            <section className="ord-section">
              <div className="ord-section__head">
                <span className="material-icons">payment</span>
                Payment Information
              </div>
              <div className="ord-payment">
                <div className="ord-payment__row">
                  <span className="ord-payment__key">Method</span>
                  <span className="ord-payment__val">{order.paymentInfo?.method || 'Razorpay'}</span>
                </div>
                <div className="ord-payment__row">
                  <span className="ord-payment__key">Status</span>
                  <span className={`ord-payment__status${order.isPaid ? ' ord-payment__status--paid' : ' ord-payment__status--pending'}`}>
                    <span className="material-icons">
                      {order.isPaid ? 'check_circle' : 'hourglass_empty'}
                    </span>
                    {order.isPaid ? 'Paid' : 'Pending'}
                  </span>
                </div>
                {order.paidAt && (
                  <div className="ord-payment__row">
                    <span className="ord-payment__key">Paid On</span>
                    <span className="ord-payment__val">{fmtDate(order.paidAt)}</span>
                  </div>
                )}
                {order.paymentInfo?.razorpayPaymentId && (
                  <div className="ord-payment__row">
                    <span className="ord-payment__key">Transaction ID</span>
                    <span className="ord-payment__txn">{order.paymentInfo.razorpayPaymentId}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Feedback — Delivered only */}
            {isDelivered && (
              <section className="ord-section ord-section--feedback">
                <button
                  className={`ord-fb-toggle${fbOpen ? ' ord-fb-toggle--open' : ''}`}
                  onClick={() => setFbOpen((v) => !v)}
                >
                  <span className="material-icons">rate_review</span>
                  <span>Rate Your Purchase</span>
                  <span className="material-icons ord-chevron">
                    {fbOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {fbOpen && (
                  <div className="ord-fb-list">
                    <p className="ord-fb-list__hint">
                      Your honest feedback helps other shoppers make better decisions.
                    </p>
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
              </section>
            )}

          </div>
        </aside>
      </>
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

      {selected && <OrderDrawer order={selected} />}
    </div>
  );
};

export default Orders;
