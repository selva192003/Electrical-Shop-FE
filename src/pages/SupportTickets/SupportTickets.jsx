import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  fetchMyTickets,
  createSupportTicket,
} from '../../redux/slices/supportSlice.js';
import { useToast } from '../../components/Toast/ToastProvider.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import './SupportTickets.css';

const STATUS_COLORS = {
  open: '#f5b400',
  in_progress: '#3b82f6',
  resolved: '#22c55e',
  closed: '#6b7280',
};

const SupportTickets = () => {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { tickets, loading } = useSelector((state) => state.support);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    dispatch(fetchMyTickets());
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      await dispatch(createSupportTicket(data)).unwrap();
      addToast('Support ticket submitted!', 'success');
      reset();
      setShowForm(false);
    } catch (err) {
      addToast(err || 'Failed to create ticket', 'error');
    }
  };

  return (
    <div className="support-page page-wrapper">
      <div className="support-header">
        <h1 className="support-title">Support Tickets</h1>
        <button className="btn primary-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Ticket'}
        </button>
      </div>

      {showForm && (
        <form className="support-form card" onSubmit={handleSubmit(onSubmit)}>
          <h2 className="support-form-title">New Support Ticket</h2>
          <div className="form-group">
            <label>Subject *</label>
            <input
              {...register('subject', { required: 'Subject is required' })}
              placeholder="Brief subject of your issue"
            />
            {errors.subject && <span className="form-error">{errors.subject.message}</span>}
          </div>
          <div className="form-group">
            <label>Category</label>
            <select {...register('category')}>
              <option value="other">Other</option>
              <option value="order_issue">Order Issue</option>
              <option value="payment_issue">Payment Issue</option>
              <option value="product_query">Product Query</option>
              <option value="return_request">Return Request</option>
            </select>
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={4}
              placeholder="Describe your issue in detail..."
            />
            {errors.description && <span className="form-error">{errors.description.message}</span>}
          </div>
          <button type="submit" className="btn primary-btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>
      )}

      {loading && !showForm ? (
        <Spinner />
      ) : tickets.length === 0 ? (
        <div className="support-empty">
          <p>No support tickets yet.</p>
        </div>
      ) : (
        <div className="support-list">
          {tickets.map((ticket) => (
            <Link to={`/support/tickets/${ticket._id}`} key={ticket._id} className="support-item card">
              <div className="support-item-top">
                <span className="support-item-subject">{ticket.subject}</span>
                <span
                  className="support-item-status"
                  style={{ background: STATUS_COLORS[ticket.status] + '22', color: STATUS_COLORS[ticket.status] }}
                >
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
              <div className="support-item-meta">
                <span className="support-item-category">{ticket.category?.replace('_', ' ')}</span>
                <span className="support-item-date">
                  {new Date(ticket.createdAt).toLocaleDateString('en-IN')}
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
