import { useState } from 'react';
import { useSelector } from 'react-redux';
import { subscribeRestock, unsubscribeRestock } from '../../services/flashSaleService.js';
import { useToast } from '../Toast/ToastProvider.jsx';
import './RestockButton.css';

export default function RestockButton({ productId, initialSubscribed = false }) {
  const toast = useToast();
  const { user } = useSelector(s => s.auth);
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!user) { toast.error('Please login to get restock notifications'); return; }
    setLoading(true);
    try {
      if (subscribed) {
        await unsubscribeRestock(productId);
        setSubscribed(false);
        toast.success('Removed from restock notification list');
      } else {
        await subscribeRestock(productId);
        setSubscribed(true);
        toast.success('We\'ll notify you when this item is back in stock!');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update notification');
    } finally { setLoading(false); }
  };

  return (
    <button
      className={`restock-btn ${subscribed ? 'subscribed' : ''}`}
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? '…' : subscribed ? (
        <><span className="material-icons restock-icon">notifications_active</span> Notifying You</>
      ) : (
        <><span className="material-icons restock-icon">notification_add</span> Notify When Back</>
      )}
    </button>
  );
}
