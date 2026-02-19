import { useLocation, useNavigate } from 'react-router-dom';
import './PaymentStatus.css';

const PaymentStatus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const status = params.get('status') || 'pending';
  const paymentId = params.get('paymentId');

  let title = 'Payment Pending';
  let description = 'Your payment status is being verified. You will receive an update shortly.';
  let variant = 'pending';

  if (status === 'success') {
    title = 'Payment Successful';
    description = 'Thank you! Your order has been confirmed.';
    variant = 'success';
  } else if (status === 'failed') {
    title = 'Payment Failed';
    description = 'The payment could not be completed. You may retry the payment from your orders page.';
    variant = 'failed';
  }

  return (
    <div className="page-container payment-page">
      <div className={`card payment-card payment-${variant}`}>
        <h1 className="payment-title">{title}</h1>
        <p className="payment-description">{description}</p>
        {paymentId && (
          <p className="payment-meta">
            Transaction ID: <span>{paymentId}</span>
          </p>
        )}
        <div className="payment-actions">
          <button type="button" className="primary-btn" onClick={() => navigate('/orders')}>
            View Orders
          </button>
          <button type="button" className="accent-btn" onClick={() => navigate('/')}> 
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;
