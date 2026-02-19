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

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { addresses } = useSelector((state) => state.auth);
  const { items, loading: cartLoading } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const total = useSelector(selectCartTotal);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    dispatch(fetchAddresses());
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
    if (defaultAddr) setSelectedAddressId(defaultAddr._id);
  }, [addresses]);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a._id === selectedAddressId),
    [addresses, selectedAddressId]
  );

  const handlePay = async () => {
    if (!selectedAddress) {
      addToast('Please select a shipping address', 'info');
      return;
    }

    if (!items.length) {
      addToast('Your cart is empty', 'info');
      return;
    }

    setPaying(true);

    try {
      const ok = await loadRazorpayScript();
      if (!ok) {
        addToast('Unable to load Razorpay. Check your connection.', 'error');
        setPaying(false);
        return;
      }

      const orderRes = await dispatch(
        createOrderThunk({
          fromCart: true,
          shippingAddress: {
            fullName: selectedAddress.fullName,
            phone: selectedAddress.phone,
            addressLine1: selectedAddress.addressLine1,
            addressLine2: selectedAddress.addressLine2,
            city: selectedAddress.city,
            state: selectedAddress.state,
            postalCode: selectedAddress.postalCode,
            country: selectedAddress.country,
          },
        })
      ).unwrap();

      const paymentInit = await createRazorpayOrder(orderRes._id || orderRes.id);

      const options = {
        key: paymentInit.key,
        amount: paymentInit.amount,
        currency: paymentInit.currency,
        name: 'VoltCart Electricals',
        description: `Order ${orderRes._id || orderRes.id}`,
        order_id: paymentInit.orderId,
        handler: async (response) => {
          try {
            const result = await verifyPayment(response);
            if (result && result.status === 'success') {
              addToast('Payment successful', 'success');
              await dispatch(clearCartAsync());
              navigate(`/payment-status?status=success&paymentId=${response.razorpay_payment_id}`);
            } else {
              navigate(`/payment-status?status=pending&paymentId=${response.razorpay_payment_id}`);
            }
          } catch (err) {
            if (err?.response?.status === 503) {
              navigate(`/payment-status?status=pending&paymentId=${response.razorpay_payment_id}`);
            } else {
              navigate(`/payment-status?status=failed&paymentId=${response.razorpay_payment_id}`);
            }
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: selectedAddress.phone,
        },
        theme: {
          color: '#0B1F3B',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        navigate('/payment-status?status=failed');
      });
      rzp.open();
    } catch (err) {
      addToast(err?.message || 'Payment failed to start', 'error');
    } finally {
      setPaying(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="page-container">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="page-container checkout-page">
      <h1 className="page-title">Checkout</h1>
      <div className="checkout-layout">
        <section className="card checkout-addresses">
          <h2>Shipping Address</h2>
          {addresses.length === 0 ? (
            <p>No addresses saved yet. Add one in your profile.</p>
          ) : (
            <div className="address-list">
              {addresses.map((addr) => (
                <label key={addr._id} className="address-item">
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === addr._id}
                    onChange={() => setSelectedAddressId(addr._id)}
                  />
                  <div>
                    <div className="address-line">
                      {addr.fullName} {addr.isDefault && <span className="address-default">Default</span>}
                    </div>
                    <div className="address-line">{addr.addressLine1}</div>
                    <div className="address-line">
                      {addr.city}, {addr.state} - {addr.postalCode}
                    </div>
                    <div className="address-line">{addr.country}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </section>

        <section className="card checkout-summary">
          <h2>Order Summary</h2>
          <ul className="summary-list">
            {items.map((item) => (
              <li key={item._id}>
                <span>
                  {item.product?.name || item.name} × {item.quantity}
                </span>
                <span>₹{((item.product?.price || item.price || 0) * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="summary-total">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <button type="button" className="accent-btn checkout-pay-btn" disabled={paying} onClick={handlePay}>
            {paying ? 'Processing...' : 'Pay with Razorpay'}
          </button>
        </section>
      </div>
    </div>
  );
};

export default Checkout;
