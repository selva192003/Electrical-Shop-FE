import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById } from '../../redux/slices/orderSlice.js';
import { requestCancelOtp, verifyCancelOtp } from '../../services/orderService.js';
import Spinner from '../../components/Spinner/Spinner.jsx';
import OrderTimeline from '../../components/OrderTimeline/OrderTimeline.jsx';
import './OrderDetail.css';

/* ── Static star display ── */
const Stars = ({ value = 0 }) => {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="od-stars">
      {Array.from({ length: 5 }, (_, i) => {
        if (i < full) return <span key={i} className="material-icons od-star od-star--full">star</span>;
        if (i === full && half) return <span key={i} className="material-icons od-star od-star--half">star_half</span>;
        return <span key={i} className="material-icons od-star od-star--empty">star_border</span>;
      })}
    </span>
  );
};

const STATUS_META = {
  Pending:            { label: 'Pending',          color: '#d97706', bg: '#fffbeb', icon: 'hourglass_empty'  },
  Confirmed:          { label: 'Confirmed',         color: '#2563eb', bg: '#eff6ff', icon: 'check_circle'     },
  Packed:             { label: 'Packed',            color: '#7c3aed', bg: '#f5f3ff', icon: 'inventory'         },
  Shipped:            { label: 'Shipped',           color: '#0891b2', bg: '#ecfeff', icon: 'local_shipping'    },
  'Out for Delivery': { label: 'Out for Delivery',  color: '#ea580c', bg: '#fff7ed', icon: 'directions_bike'   },
  Delivered:          { label: 'Delivered',         color: '#16a34a', bg: '#f0fdf4', icon: 'task_alt'          },
  Cancelled:          { label: 'Cancelled',         color: '#dc2626', bg: '#fef2f2', icon: 'cancel'            },
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

const OrderDetail = () => {
  const { id }    = useParams();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { current: order, loading, error } = useSelector((s) => s.orders);

  // ── Cancel OTP modal state ──
  const [cancelStep,   setCancelStep]   = useState(null); // null | 'reason' | 'method' | 'otp'
  const [cancelReason, setCancelReason] = useState('');
  const [otpMethod,    setOtpMethod]    = useState('email'); // 'email' | 'sms'
  const [otpValue,     setOtpValue]     = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError,   setModalError]   = useState('');
  const [maskedDest,   setMaskedDest]   = useState('');

  const openCancelModal = () => {
    setCancelStep('reason');
    setCancelReason('');
    setOtpValue('');
    setOtpMethod('email');
    setModalError('');
  };

  const closeCancelModal = () => {
    setCancelStep(null);
    setModalError('');
    setOtpValue('');
  };

  const handleRequestOtp = async () => {
    setModalLoading(true);
    setModalError('');
    try {
      const res = await requestCancelOtp(order._id, otpMethod);
      setMaskedDest(res.data?.message || `OTP sent via ${otpMethod}`);
      setCancelStep('otp');
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpValue || otpValue.length !== 6) {
      setModalError('Please enter the 6-digit OTP.');
      return;
    }
    setModalLoading(true);
    setModalError('');
    try {
      await verifyCancelOtp(order._id, otpValue, cancelReason);
      closeCancelModal();
      dispatch(fetchOrderById(order._id)); // refresh order
    } catch (err) {
      setModalError(err.response?.data?.message || 'Invalid OTP. Try again.');
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    if (id) dispatch(fetchOrderById(id));
  }, [id, dispatch]);

  if (loading) return <div className="page-container od-state"><Spinner /></div>;

  if (error || !order) {
    return (
      <div className="page-container od-state">
        <span className="material-icons od-state__icon od-state__icon--err">error_outline</span>
        <p className="od-state__text">{error || 'Order not found.'}</p>
        <button className="od-back-btn" onClick={() => navigate('/orders')}>
          <span className="material-icons">arrow_back</span> Back to Orders
        </button>
      </div>
    );
  }

  const meta      = STATUS_META[order.orderStatus] || STATUS_META.Pending;
  const isCOD     = order.paymentInfo?.method === 'COD';
  const isPaid    = order.isPaid;
  const isCancelled = order.orderStatus === 'Cancelled';
  const canCancel   = ['Pending', 'Confirmed'].includes(order.orderStatus);

  return (
    <>
    <div className="page-container od-page">

      {/* ── Breadcrumb ── */}
      <nav className="od-breadcrumb">
        <Link to="/">Home</Link>
        <span className="material-icons">chevron_right</span>
        <Link to="/orders">My Orders</Link>
        <span className="material-icons">chevron_right</span>
        <span>#{order._id.slice(-8).toUpperCase()}</span>
      </nav>

      {/* ── Page header ── */}
      <div className="od-page-header">
        <div>
          <h1 className="od-page-title">Order Details</h1>
          <p className="od-page-subtitle">
            Placed on {fmtDate(order.createdAt)} · #{order._id.slice(-8).toUpperCase()}
          </p>
        </div>
        <button className="od-back-btn" onClick={() => navigate('/orders')}>
          <span className="material-icons">arrow_back</span>
          All Orders
        </button>
      </div>

      <div className="od-grid">

        {/* ════════ LEFT COLUMN ════════ */}
        <div className="od-col od-col--left">

          {/* Status banner */}
          <div
            className="card od-status-banner"
            style={{ '--banner-color': meta.color, '--banner-bg': meta.bg }}
          >
            <div className="od-status-banner__left">
              <span
                className="material-icons od-status-banner__icon"
                style={{ color: meta.color }}
              >
                {meta.icon}
              </span>
              <div>
                <div className="od-status-banner__label" style={{ color: meta.color }}>
                  {meta.label}
                </div>
                <div className="od-status-banner__sub">Order status</div>
              </div>
            </div>

            {/* Payment badge */}
            {isCOD ? (
              <div className="od-pay-badge od-pay-badge--cod">
                <span className="material-icons">local_shipping</span>
                Pay on Delivery
              </div>
            ) : isPaid ? (
              <div className="od-pay-badge od-pay-badge--paid">
                <span className="material-icons">verified</span>
                Paid
              </div>
            ) : (
              <div className="od-pay-badge od-pay-badge--pending">
                <span className="material-icons">hourglass_empty</span>
                Payment Pending
              </div>
            )}
          </div>

          {/* Order timeline */}
          {!isCancelled && (
            <div className="card od-section">
              <div className="od-section__head">
                <span className="material-icons">local_shipping</span>
                Order Tracking
              </div>
              <OrderTimeline currentStatus={order.orderStatus} />
            </div>
          )}

          {/* Items */}
          <div className="card od-section">
            <div className="od-section__head">
              <span className="material-icons">shopping_bag</span>
              Items Ordered ({order.orderItems?.length})
            </div>
            <div className="od-items">
              {order.orderItems?.map((item, idx) => (
                <div key={idx} className="od-item">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="od-item__img" />
                  ) : (
                    <div className="od-item__img od-item__img--ph">
                      <span className="material-icons">bolt</span>
                    </div>
                  )}
                  <div className="od-item__info">
                    <p className="od-item__name">{item.name}</p>
                    {(item.variant?.watt || item.variant?.voltage || item.variant?.brand) && (
                      <p className="od-item__variant">
                        {[item.variant.brand, item.variant.watt, item.variant.voltage]
                          .filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <p className="od-item__qty">Qty: {item.quantity}</p>
                  </div>
                  <div className="od-item__price">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}

              <div className="od-total-row">
                <span>Order Total</span>
                <span className="od-total-val">
                  ₹{order.totalPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* ════════ RIGHT COLUMN ════════ */}
        <div className="od-col od-col--right">

          {/* Payment info */}
          <div className="card od-section">
            <div className="od-section__head">
              <span className="material-icons">payment</span>
              Payment Information
            </div>
            <div className="od-info-table">
              <div className="od-info-row">
                <span className="od-info-key">Method</span>
                <span className="od-info-val od-info-val--method">
                  {isCOD ? (
                    <>
                      <span className="material-icons">local_shipping</span>
                      Cash on Delivery
                    </>
                  ) : (
                    <>
                      <span className="material-icons">credit_card</span>
                      Razorpay
                    </>
                  )}
                </span>
              </div>
              <div className="od-info-row">
                <span className="od-info-key">Status</span>
                <span
                  className={`od-pay-status ${
                    isCOD
                      ? 'od-pay-status--cod'
                      : isPaid
                      ? 'od-pay-status--paid'
                      : 'od-pay-status--pending'
                  }`}
                >
                  <span className="material-icons">
                    {isCOD ? 'local_shipping' : isPaid ? 'check_circle' : 'hourglass_empty'}
                  </span>
                  {isCOD ? 'Pay on Delivery' : isPaid ? 'Paid' : 'Pending'}
                </span>
              </div>
              {isPaid && order.paidAt && (
                <div className="od-info-row">
                  <span className="od-info-key">Paid On</span>
                  <span className="od-info-val">{fmtDate(order.paidAt)}</span>
                </div>
              )}
              {order.paymentInfo?.razorpayPaymentId && (
                <div className="od-info-row">
                  <span className="od-info-key">Transaction ID</span>
                  <span className="od-info-val od-info-val--txn">
                    {order.paymentInfo.razorpayPaymentId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping address */}
          <div className="card od-section">
            <div className="od-section__head">
              <span className="material-icons">location_on</span>
              Delivery Address
            </div>
            <div className="od-addr">
              <p className="od-addr__name">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && (
                <p>{order.shippingAddress.addressLine2}</p>
              )}
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                – {order.shippingAddress?.postalCode}
              </p>
              <p>{order.shippingAddress?.country}</p>
              <p className="od-addr__phone">
                <span className="material-icons">phone</span>
                {order.shippingAddress?.phone}
              </p>
            </div>
          </div>

          {/* Order summary */}
          <div className="card od-section">
            <div className="od-section__head">
              <span className="material-icons">receipt</span>
              Order Summary
            </div>
            <div className="od-info-table">
              <div className="od-info-row">
                <span className="od-info-key">Order ID</span>
                <span className="od-info-val od-info-val--id">
                  #{order._id.slice(-8).toUpperCase()}
                </span>
              </div>
              <div className="od-info-row">
                <span className="od-info-key">Order Status</span>
                <span
                  className="od-order-status-badge"
                  style={{ '--s-color': meta.color, '--s-bg': meta.bg }}
                >
                  <span className="material-icons">{meta.icon}</span>
                  {meta.label}
                </span>
              </div>
              <div className="od-info-row">
                <span className="od-info-key">Items</span>
                <span className="od-info-val">{order.orderItems?.length}</span>
              </div>
              <div className="od-info-row od-info-row--total">
                <span className="od-info-key">Total Amount</span>
                <span className="od-info-val od-info-val--price">
                  ₹{order.totalPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="od-actions">
            <Link to="/orders" className="od-btn od-btn--secondary">
              <span className="material-icons">list_alt</span>
              All Orders
            </Link>
            <Link to="/products" className="accent-btn od-btn">
              <span className="material-icons">storefront</span>
              Continue Shopping
            </Link>
            {canCancel && (
              <button className="od-btn od-btn--cancel" onClick={openCancelModal}>
                <span className="material-icons">cancel</span>
                Cancel Order
              </button>
            )}
          </div>

        </div>
      </div>
    </div>

    {/* ════════ CANCEL OTP MODAL ════════ */}
    {cancelStep && (
      <div className="od-modal-overlay" onClick={closeCancelModal}>
        <div className="od-modal" onClick={(e) => e.stopPropagation()}>

          {/* Modal header */}
          <div className="od-modal__header">
            <div className="od-modal__title">
              <span className="material-icons od-modal__icon">cancel</span>
              Cancel Order #{order._id.slice(-8).toUpperCase()}
            </div>
            <button className="od-modal__close" onClick={closeCancelModal}>
              <span className="material-icons">close</span>
            </button>
          </div>

          {/* ── Step 1: Reason ── */}
          {cancelStep === 'reason' && (
            <div className="od-modal__body">
              <p className="od-modal__desc">
                Please tell us why you want to cancel this order.
              </p>
              <label className="od-modal__label">Reason for cancellation</label>
              <textarea
                className="od-modal__textarea"
                rows={3}
                placeholder="e.g. Changed my mind, found a better deal..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              {modalError && <p className="od-modal__error">{modalError}</p>}
              <div className="od-modal__footer">
                <button className="od-btn od-btn--secondary" onClick={closeCancelModal} disabled={modalLoading}>
                  Go Back
                </button>
                <button className="od-btn od-btn--danger" onClick={() => { setModalError(''); setCancelStep('method'); }}>
                  <span className="material-icons">arrow_forward</span> Next
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Choose OTP Method ── */}
          {cancelStep === 'method' && (
            <div className="od-modal__body">
              <p className="od-modal__desc">Choose how you want to receive your OTP to confirm cancellation.</p>
              <div className="od-otp-methods">
                <button
                  className={`od-otp-method-card${otpMethod === 'email' ? ' od-otp-method-card--active' : ''}`}
                  onClick={() => setOtpMethod('email')}
                >
                  <span className="material-icons od-otp-method-card__icon">email</span>
                  <div>
                    <div className="od-otp-method-card__title">Email OTP</div>
                    <div className="od-otp-method-card__sub">Sent to your registered email</div>
                  </div>
                  {otpMethod === 'email' && <span className="material-icons od-otp-method-card__check">check_circle</span>}
                </button>
                <button
                  className={`od-otp-method-card${otpMethod === 'sms' ? ' od-otp-method-card--active' : ''}`}
                  onClick={() => setOtpMethod('sms')}
                >
                  <span className="material-icons od-otp-method-card__icon">sms</span>
                  <div>
                    <div className="od-otp-method-card__title">SMS OTP</div>
                    <div className="od-otp-method-card__sub">Sent to your registered phone</div>
                  </div>
                  {otpMethod === 'sms' && <span className="material-icons od-otp-method-card__check">check_circle</span>}
                </button>
              </div>
              {modalError && <p className="od-modal__error">{modalError}</p>}
              <div className="od-modal__footer">
                <button className="od-btn od-btn--secondary" onClick={() => { setCancelStep('reason'); setModalError(''); }} disabled={modalLoading}>
                  Back
                </button>
                <button className="od-btn od-btn--danger" onClick={handleRequestOtp} disabled={modalLoading}>
                  {modalLoading
                    ? <><span className="material-icons od-spin">refresh</span> Sending...</>
                    : <><span className="material-icons">send</span> Send OTP</>
                  }
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: OTP Entry ── */}
          {cancelStep === 'otp' && (
            <div className="od-modal__body">
              <div className="od-modal__otp-info">
                <span className="material-icons od-modal__otp-icon">{otpMethod === 'sms' ? 'sms' : 'mark_email_read'}</span>
                <p className="od-modal__desc">
                  {maskedDest}.<br/>Enter the 6-digit OTP below to confirm cancellation.
                </p>
              </div>
              <label className="od-modal__label">Enter OTP</label>
              <input
                className="od-modal__otp-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="- - - - - -"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
              <p className="od-modal__otp-hint">OTP expires in 10 minutes. <button className="od-modal__resend" onClick={handleRequestOtp} disabled={modalLoading}>Resend OTP</button></p>
              {modalError && <p className="od-modal__error">{modalError}</p>}
              <div className="od-modal__footer">
                <button className="od-btn od-btn--secondary" onClick={() => { setCancelStep('method'); setModalError(''); }} disabled={modalLoading}>
                  Back
                </button>
                <button className="od-btn od-btn--danger" onClick={handleVerifyOtp} disabled={modalLoading || otpValue.length !== 6}>
                  {modalLoading
                    ? <><span className="material-icons od-spin">refresh</span> Verifying...</>
                    : <><span className="material-icons">check_circle</span> Confirm Cancellation</>
                  }
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    )}
    </>
  );
};

export default OrderDetail;
