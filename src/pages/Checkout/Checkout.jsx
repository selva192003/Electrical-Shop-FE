import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAddresses } from '../../redux/slices/authSlice.js';
import { fetchCart, selectCartTotal, clearCartAsync } from '../../redux/slices/cartSlice.js';
import { createOrderThunk } from '../../redux/slices/orderSlice.js';
import { createRazorpayOrder, verifyPayment } from '../../services/paymentService.js';
import Spinner from '../../components/Spinner/Spinner.jsx';
import { useToast } from '../../components/Toast/ToastProvider.jsx';
import './Checkout.css';

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

const Checkout = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { addToast } = useToast();

  const { addresses }           = useSelector((s) => s.auth);
  const { items, loading: cartLoading } = useSelector((s) => s.cart);
  const { user }                = useSelector((s) => s.auth);
  const total                   = useSelector(selectCartTotal);

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod]         = useState('Razorpay');
  const [paying, setPaying]                       = useState(false);

  useEffect(() => {
    dispatch(fetchAddresses());
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    const def = addresses.find((a) => a.isDefault) || addresses[0];
    if (def) setSelectedAddressId(def._id);
  }, [addresses]);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a._id === selectedAddressId),
    [addresses, selectedAddressId]
  );

  /* ── Build shipping address object ── */
  const buildShipping = () => ({
    fullName:     selectedAddress.fullName,
    phone:        selectedAddress.phone,
    addressLine1: selectedAddress.addressLine1,
    addressLine2: selectedAddress.addressLine2,
    city:         selectedAddress.city,
    state:        selectedAddress.state,
    postalCode:   selectedAddress.postalCode,
    country:      selectedAddress.country,
  });

  /* ════════════════ COD FLOW ════════════════ */
  const handleCOD = async () => {
    setPaying(true);
    try {
      const order = await dispatch(
        createOrderThunk({
          fromCart: true,
          paymentMethod: 'COD',
          shippingAddress: buildShipping(),
        })
      ).unwrap();

      // Sync frontend cart state (DB cart cleared by backend)
      await dispatch(clearCartAsync());

      addToast(
        'Order Placed Successfully! Please pay at the time of delivery.',
        'success'
      );
      navigate(`/orders/${order._id}`);
    } catch (err) {
      addToast(err?.message || 'Could not place order. Please try again.', 'error');
    } finally {
      setPaying(false);
    }
  };

  /* ════════════════ RAZORPAY FLOW ════════════════ */
  const handleRazorpay = async () => {
    setPaying(true);
    try {
      const ok = await loadRazorpayScript();
      if (!ok) {
        addToast('Unable to load Razorpay. Check your connection.', 'error');
        setPaying(false);
        return;
      }

      /* Step 1 — create DB order (Pending, unpaid) */
      const orderRes = await dispatch(
        createOrderThunk({
          fromCart: true,
          paymentMethod: 'Razorpay',
          shippingAddress: buildShipping(),
        })
      ).unwrap();

      const dbOrderId = orderRes._id;

      /* Step 2 — create Razorpay payment order */
      const paymentInit = await createRazorpayOrder(dbOrderId);

      /* Step 3 — open Razorpay checkout */
      const options = {
        key:         paymentInit.key,
        amount:      paymentInit.amount,
        currency:    paymentInit.currency,
        name:        'VoltCart Electricals',
        description: `Order ${dbOrderId}`,
        order_id:    paymentInit.orderId,

        /* Step 4 — on payment success */
        handler: async (response) => {
          try {
            await verifyPayment(response);
            // Payment verified → clear cart → go to order detail
            await dispatch(clearCartAsync());
            addToast(
              'Payment Successful! Your order has been placed successfully.',
              'success'
            );
            navigate(`/orders/${dbOrderId}`);
          } catch (verifyErr) {
            const status =
              verifyErr?.response?.status === 503 ? 'pending' : 'failed';
            navigate(
              `/payment-status?status=${status}&paymentId=${response.razorpay_payment_id}&orderId=${dbOrderId}`
            );
          }
        },

        prefill: {
          name:    user?.name,
          email:   user?.email,
          contact: selectedAddress.phone,
        },
        theme: { color: '#0B1F3B' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        addToast('Payment Failed. Please try again.', 'error');
        navigate(`/payment-status?status=failed&orderId=${dbOrderId}`);
      });
      rzp.open();
    } catch (err) {
      addToast(err?.message || 'Payment failed to start', 'error');
    } finally {
      setPaying(false);
    }
  };

  /* ════════════════ MASTER HANDLER ════════════════ */
  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      addToast('Please select a shipping address', 'info');
      return;
    }
    if (!items.length) {
      addToast('Your cart is empty', 'info');
      return;
    }
    if (paymentMethod === 'COD') handleCOD();
    else handleRazorpay();
  };

  if (cartLoading) {
    return <div className="page-container"><Spinner /></div>;
  }

  return (
    <div className="page-container checkout-page">
      <h1 className="page-title">Checkout</h1>

      <div className="checkout-layout">

        {/* ── Left column ── */}
        <div className="checkout-left">

          {/* Shipping address */}
          <section className="card checkout-addresses">
            <h2>Shipping Address</h2>
            {addresses.length === 0 ? (
              <p className="checkout-empty-notice">
                No addresses saved yet. Add one in your profile.
              </p>
            ) : (
              <div className="address-list">
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`address-item${selectedAddressId === addr._id ? ' address-item--selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr._id}
                      onChange={() => setSelectedAddressId(addr._id)}
                    />
                    <div className="address-item__body">
                      <div className="address-line address-line--name">
                        {addr.fullName}
                        {addr.isDefault && (
                          <span className="address-default">Default</span>
                        )}
                      </div>
                      <div className="address-line">{addr.addressLine1}</div>
                      {addr.addressLine2 && (
                        <div className="address-line">{addr.addressLine2}</div>
                      )}
                      <div className="address-line">
                        {addr.city}, {addr.state} – {addr.postalCode}
                      </div>
                      <div className="address-line">{addr.country}</div>
                      <div className="address-line address-line--phone">
                        <span className="material-icons">phone</span>
                        {addr.phone}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* Payment method */}
          <section className="card checkout-payment-method">
            <h2>Payment Method</h2>
            <div className="payment-method-options">

              <label className={`payment-option${paymentMethod === 'Razorpay' ? ' payment-option--active' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Razorpay"
                  checked={paymentMethod === 'Razorpay'}
                  onChange={() => setPaymentMethod('Razorpay')}
                />
                <span className="payment-option__icon">
                  <span className="material-icons">credit_card</span>
                </span>
                <span className="payment-option__body">
                  <span className="payment-option__title">Razorpay</span>
                  <span className="payment-option__desc">
                    Pay securely via UPI, card, net banking or wallet
                  </span>
                </span>
                {paymentMethod === 'Razorpay' && (
                  <span className="payment-option__check material-icons">check_circle</span>
                )}
              </label>

              <label className={`payment-option${paymentMethod === 'COD' ? ' payment-option--active' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                />
                <span className="payment-option__icon payment-option__icon--cod">
                  <span className="material-icons">local_shipping</span>
                </span>
                <span className="payment-option__body">
                  <span className="payment-option__title">Cash on Delivery</span>
                  <span className="payment-option__desc">
                    Pay in cash when your order arrives
                  </span>
                </span>
                {paymentMethod === 'COD' && (
                  <span className="payment-option__check material-icons">check_circle</span>
                )}
              </label>

            </div>
          </section>
        </div>

        {/* ── Right column — Order Summary ── */}
        <section className="card checkout-summary">
          <h2>Order Summary</h2>

          <ul className="summary-list">
            {items.map((item) => (
              <li key={item._id}>
                <span>
                  {item.product?.name || item.name} × {item.quantity}
                </span>
                <span>
                  ₹{((item.product?.price || item.price || 0) * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>

          <div className="summary-divider" />
          <div className="summary-total">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>

          {paymentMethod === 'COD' && (
            <div className="checkout-cod-notice">
              <span className="material-icons">info</span>
              Pay ₹{total.toFixed(2)} in cash upon delivery.
            </div>
          )}

          <button
            type="button"
            className={`accent-btn checkout-pay-btn${paying ? ' checkout-pay-btn--loading' : ''}`}
            disabled={paying || !items.length}
            onClick={handlePlaceOrder}
          >
            {paying ? (
              <>
                <span className="checkout-spinner" />
                Processing…
              </>
            ) : paymentMethod === 'COD' ? (
              <>
                <span className="material-icons">shopping_bag</span>
                Place Order
              </>
            ) : (
              <>
                <span className="material-icons">lock</span>
                Pay ₹{total.toFixed(2)} with Razorpay
              </>
            )}
          </button>
        </section>

      </div>
    </div>
  );
};

export default Checkout;
