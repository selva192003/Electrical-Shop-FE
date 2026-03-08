import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyTickets } from '../../redux/slices/supportSlice.js';
import Spinner from '../../components/Spinner/Spinner.jsx';
import './SupportTickets.css';

const STATUS_COLORS = {
  open: '#f5b400',
  in_progress: '#3b82f6',
  resolved: '#22c55e',
  closed: '#6b7280',
};

const CATEGORY_LABELS = {
  order_issue: 'Order Issue',
  payment_issue: 'Payment Issue',
  product_query: 'Product Query',
  return_request: 'Return Request',
  other: 'Other',
};

const SupportTickets = () => {
  const dispatch = useDispatch();
  const { tickets, loading } = useSelector((state) => state.support);

  useEffect(() => {
    dispatch(fetchMyTickets());
  }, [dispatch]);

  return (
    <div className="support-page page-wrapper">
      <div className="support-header">
        <h1 className="support-title">My Support Tickets</h1>
        <Link to="/support" className="btn primary-btn">
          + New Ticket
        </Link>
      </div>

      {loading ? (
        <Spinner />
      ) : tickets.length === 0 ? (
        <div className="support-empty">
          <p>You have no support tickets yet.</p>
          <Link to="/support" className="btn primary-btn" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Raise your first ticket
          </Link>
        </div>
      ) : (
        <div className="support-list">
          {tickets.map((ticket) => (
            <Link to={`/support/tickets/${ticket._id}`} key={ticket._id} className="support-item card">
              <div className="support-item-top">
                <span className="support-item-subject">{ticket.subject}</span>
                <span
                  className="support-item-status"
                  style={{
                    background: STATUS_COLORS[ticket.status] + '22',
                    color: STATUS_COLORS[ticket.status],
                  }}
                >
                  {ticket.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="support-item-meta">
                <span className="support-item-category">
                  {CATEGORY_LABELS[ticket.category] ?? ticket.category?.replace(/_/g, ' ')}
                </span>
                <span className="support-item-date">
                  {new Date(ticket.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupportTickets;
