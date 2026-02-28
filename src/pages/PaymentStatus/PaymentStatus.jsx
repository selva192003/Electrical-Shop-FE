import { useLocation, useNavigate } from 'react-router-dom';
import './PaymentStatus.css';

const PaymentStatus = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const params    = new URLSearchParams(location.search);
  const status    = params.get('status') || 'pending';
  const paymentId = params.get('paymentId');
  const orderId   = params.get('orderId');

  let title       = 'Payment Pending';
  let description = 'Your payment status is being verified. You will receive an update shortly.';
  let variant     = 'pending';
  let icon        = 'hourglass_empty';

  if (status === 'success') {
    title       = 'Payment Successful!';
    description = 'Thank you! Your order has been confirmed. You can track it from your orders page.';
    variant     = 'success';
    icon        = 'check_circle';
  } else if (status === 'failed') {
    title       = 'Payment Failed';
    description = 'The payment could not be completed. Please try again from your orders page.';
    variant     = 'failed';
    icon        = 'cancel';
  }

  const goToOrder = () =>
    orderId ? navigate(`/orders/${orderId}`) : navigate('/orders');

  return (
    <div className="page-container payment-page">
      <div className={`card payment-card payment-${variant}`}>
        <span className={`material-icons payment-icon payment-icon--${variant}`}>{icon}</span>
        <h1 className="payment-title">{title}</h1>
        <p className="payment-description">{description}</p>
        {paymentId && (
          <p className="payment-meta">
            Transaction ID: <span>{paymentId}</span>
          </p>
        )}
        <div className="payment-actions">
          <button type="button" className="accent-btn" onClick={goToOrder}>
            {orderId ? 'View Order' : 'View Orders'}
          </button>
          <button type="button" className="primary-btn" onClick={() => navigate('/')}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;

