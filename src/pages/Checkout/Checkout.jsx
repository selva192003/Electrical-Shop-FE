import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAddresses } from '../../redux/slices/authSlice.js';
import { fetchCart, selectCartSubtotal, selectCartGstTotal, selectCartTotal, clearCartAsync } from '../../redux/slices/cartSlice.js';
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
  const subtotal                = useSelector(selectCartSubtotal);
  const gstTotal                = useSelector(selectCartGstTotal);
  const total                   = useSelector(selectCartTotal);

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [useNewAddress, setUseNewAddress]         = useState(false);
  const [newAddr, setNewAddr]                     = useState({
    fullName: '', phone: '', addressLine1: '', addressLine2: '',
    city: '', state: 'Tamil Nadu', postalCode: '', country: 'India',
  }); // state & country are fixed — delivery within Tamil Nadu only
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

  const selectedAddress = useMemo(() => {
    if (useNewAddress) {
      // only treat as valid once name is filled
      return newAddr.fullName ? newAddr : null;
    }
    return addresses.find((a) => a._id === selectedAddressId) || null;
  }, [addresses, selectedAddressId, useNewAddress, newAddr]);

  /* ── Delivery charge calculation ──
     Delivery is within Tamil Nadu only.
     - Erode city        → always FREE
     - Order ≥ ₹100      → FREE
     - Order < ₹100      → ₹40
  */
  const deliveryCharge = useMemo(() => {
    if (!selectedAddress || !subtotal) return 0;
    const city = (selectedAddress.city || '').trim().toLowerCase();
    if (city === 'erode') return 0;
    if (subtotal >= 100)  return 0;
    return 40;
  }, [selectedAddress, subtotal]);

  const grandTotal = total + deliveryCharge;

  /* ── Build shipping address object ── */
  const buildShipping = () => {
    const addr = useNewAddress ? newAddr : selectedAddress;
    return {
      fullName:     addr.fullName,
      phone:        addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city:         addr.city,
      state:        addr.state,
      postalCode:   addr.postalCode,
      country:      addr.country,
    };
  };

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
    if (useNewAddress) {
      const { fullName, phone, addressLine1, city, postalCode } = newAddr;
      if (!fullName || !phone || !addressLine1 || !city || !postalCode) {
        addToast('Please fill all required address fields', 'info');
        return;
      }
    } else if (!selectedAddress) {
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
            {/* ── Saved addresses ── */}
            {addresses.length > 0 && (
              <div className="address-list">
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`address-item${!useNewAddress && selectedAddressId === addr._id ? ' address-item--selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={!useNewAddress && selectedAddressId === addr._id}
                      onChange={() => { setUseNewAddress(false); setSelectedAddressId(addr._id); }}
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

            {/* ── Deliver to a different / new address ── */}
            <label className={`address-item address-item--new${useNewAddress ? ' address-item--selected' : ''}`}>
              <input
                type="radio"
                name="address"
                checked={useNewAddress}
                onChange={() => setUseNewAddress(true)}
              />
              <div className="address-item__body">
                <div className="address-line address-line--name">
                  <span className="material-icons" style={{fontSize:'15px'}}>add_location_alt</span>
                  {addresses.length === 0 ? 'Enter delivery address' : 'Deliver to a different address'}
                </div>
              </div>
            </label>

            {/* ── Inline new address form ── */}
            {useNewAddress && (
              <div className="new-address-form">
                <div className="new-address-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="input-field" value={newAddr.fullName}
                      onChange={(e) => setNewAddr((p) => ({ ...p, fullName: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <input className="input-field" value={newAddr.phone}
                      onChange={(e) => setNewAddr((p) => ({ ...p, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address Line 1 *</label>
                  <input className="input-field" value={newAddr.addressLine1}
                    onChange={(e) => setNewAddr((p) => ({ ...p, addressLine1: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Address Line 2 <span className="opt-label">(optional)</span></label>
                  <input className="input-field" value={newAddr.addressLine2}
                    onChange={(e) => setNewAddr((p) => ({ ...p, addressLine2: e.target.value }))} />
                </div>
                <div className="new-address-row">
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input className="input-field" value={newAddr.city}
                      onChange={(e) => setNewAddr((p) => ({ ...p, city: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Postal Code *</label>
                    <input className="input-field" value={newAddr.postalCode}
                      onChange={(e) => setNewAddr((p) => ({ ...p, postalCode: e.target.value }))} />
                  </div>
                </div>
                <div className="new-address-info-row">
                  <span className="material-icons">location_on</span>
                  Tamil Nadu, India
                </div>
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
                  {(() => {
                    const unitPrice = item.product?.price || item.price || 0;
                    const base = unitPrice * item.quantity;
                    const rate =
                      item.product?.gstRate ??
                      (typeof item.gstRate === 'number' ? item.gstRate : 0);
                    const gst = (base * (rate || 0)) / 100;
                    const lineTotal = base + gst;
                    return `₹${lineTotal.toFixed(2)}${rate ? ` (incl. GST ${rate}% )` : ''}`;
                  })()}
                </span>
              </li>
            ))}
          </ul>

          <div className="summary-divider" />

          <div className="summary-charge-row">
            <span>Items Subtotal (before GST)</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-charge-row">
            <span>GST</span>
            <span>₹{gstTotal.toFixed(2)}</span>
          </div>
          <div className="summary-charge-row">
            <span>Delivery Charge</span>
            <span className={deliveryCharge === 0 ? 'summary-free' : ''}>
              {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge.toFixed(2)}`}
            </span>
          </div>

          {deliveryCharge === 0 && selectedAddress && (
            <div className="checkout-delivery-notice checkout-delivery-notice--free">
              <span className="material-icons">local_shipping</span>
              {(selectedAddress.city || '').trim().toLowerCase() === 'erode'
                ? 'Free delivery within Erode!'
                : 'Free delivery on orders ₹100 and above!'}
            </div>
          )}
          {deliveryCharge > 0 && selectedAddress && (
            <div className="checkout-delivery-notice checkout-delivery-notice--charge">
              <span className="material-icons">info</span>
              ₹{deliveryCharge} delivery charge applies for orders below ₹100 outside Erode.
            </div>
          )}

          <div className="summary-divider" />
          <div className="summary-total">
            <span>Total</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>

          {paymentMethod === 'COD' && (
            <div className="checkout-cod-notice">
              <span className="material-icons">info</span>
              Pay ₹{grandTotal.toFixed(2)} in cash upon delivery.
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
                Pay ₹{grandTotal.toFixed(2)} with Razorpay
              </>
            )}
          </button>
        </section>

      </div>
    </div>
  );
};

export default Checkout;
