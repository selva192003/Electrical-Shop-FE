import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyReturns } from '../../redux/slices/returnSlice.js';
import Spinner from '../../components/Spinner/Spinner.jsx';
import './Returns.css';

const STATUS_COLORS = {
  pending: '#f5b400',
  approved: '#22c55e',
  rejected: '#ef4444',
  picked_up: '#3b82f6',
  refunded: '#8b5cf6',
};

const Returns = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.returns);

  useEffect(() => {
    dispatch(fetchMyReturns());
  }, [dispatch]);

  if (loading) return <Spinner />;

  return (
    <div className="returns-page page-wrapper">
      <div className="returns-header">
        <h1 className="returns-title">My Return Requests</h1>
        <Link to="/orders" className="btn primary-btn">
          View Orders
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="returns-empty">
          <p>No return requests yet.</p>
          <p className="returns-empty-hint">
            You can request a return from a delivered order in the&nbsp;
            <Link to="/orders">Orders</Link> page.
          </p>
        </div>
      ) : (
        <div className="returns-list">
          {items.map((ret) => (
            <div key={ret._id} className="returns-item card">
              <div className="returns-item-top">
                <div>
                  <span className="returns-item-label">Order: </span>
                  <span className="returns-item-value">#{ret.order?._id?.slice(-8)}</span>
                </div>
                <span
                  className="returns-item-status"
                  style={{
                    background: STATUS_COLORS[ret.status] + '22',
                    color: STATUS_COLORS[ret.status],
                  }}
                >
                  {ret.status?.replace('_', ' ')}
                </span>
              </div>
              <div className="returns-item-meta">
                <span>Reason: <strong>{ret.reason?.replace('_', ' ')}</strong></span>
                <span>Date: <strong>{new Date(ret.createdAt).toLocaleDateString('en-IN')}</strong></span>
                {ret.refundAmount > 0 && (
                  <span>Refund: <strong>₹{ret.refundAmount.toLocaleString('en-IN')}</strong></span>
                )}
              </div>
              {ret.adminNote && (
                <p className="returns-item-note">Admin Note: {ret.adminNote}</p>
              )}
              <div className="returns-item-products">
                {ret.items?.map((item, idx) => (
                  <span key={idx} className="returns-item-product-tag">
                    {item.name} ×{item.quantity}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Returns;
