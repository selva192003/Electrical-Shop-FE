import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { fetchTicket, replyTicket } from '../../redux/slices/supportSlice.js';
import { useToast } from '../../components/Toast/ToastProvider.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import './SupportTickets.css';

const TicketDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { currentTicket, loading } = useSelector((state) => state.support);
  const { user } = useSelector((state) => state.auth);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    dispatch(fetchTicket(id));
  }, [dispatch, id]);

  const onReply = async (data) => {
    try {
      await dispatch(replyTicket({ id, message: data.message })).unwrap();
      addToast('Reply sent', 'success');
      reset();
    } catch (err) {
      addToast(err || 'Failed to send reply', 'error');
    }
  };

  if (loading || !currentTicket) return <Spinner />;

  const isActive = currentTicket.status === 'open' || currentTicket.status === 'in_progress';
  const isResolved = currentTicket.status === 'resolved' || currentTicket.status === 'closed';

  const STATUS_COLORS = {
    open:        { bg: '#fef9c3', color: '#b45309' },
    in_progress: { bg: '#dbeafe', color: '#1d4ed8' },
    resolved:    { bg: '#dcfce7', color: '#16a34a' },
    closed:      { bg: '#f3f4f6', color: '#6b7280' },
  };
  const sc = STATUS_COLORS[currentTicket.status] || STATUS_COLORS.closed;

  return (
    <div className="ticket-detail-page page-wrapper">
      <button className="btn btn-sm accent-btn" onClick={() => navigate('/support/tickets')} style={{ marginBottom: '1.5rem' }}>
        ← Back to My Tickets
      </button>

      {/* Header */}
      <div className="ticket-detail-header card">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <h1 className="ticket-detail-subject">{currentTicket.subject}</h1>
          <span
            className="support-item-status"
            style={{ background: sc.bg, color: sc.color, flexShrink: 0, fontSize: '0.82rem', fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}
          >
            {currentTicket.status?.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="ticket-detail-meta">
          <span>Category: <strong>{currentTicket.category?.replace(/_/g, ' ')}</strong></span>
          <span>Raised on: <strong>{new Date(currentTicket.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></span>
        </div>
      </div>

      {/* Resolved banner */}
      {isResolved && (
        <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 18px', marginBottom: '1rem', color: '#15803d', fontSize: '0.9rem', fontWeight: 500 }}>
          ✓ This ticket has been <strong>resolved</strong>. If you have a follow-up question, please raise a new ticket.
        </div>
      )}

      {/* Full conversation thread */}
      <div className="ticket-replies">
        <h2 className="ticket-replies-title">Conversation</h2>

        {/* Initial description as first message */}
        <div className="ticket-reply ticket-reply--user">
          <span className="ticket-reply-sender">You</span>
          <p className="ticket-reply-message">{currentTicket.description}</p>
          <span className="ticket-reply-date">{new Date(currentTicket.createdAt).toLocaleString('en-IN')}</span>
        </div>

        {/* All replies */}
        {currentTicket.replies?.length === 0 ? (
          <p className="ticket-no-replies">No replies yet — our support team will respond shortly (within 24 hours).</p>
        ) : (
          currentTicket.replies.map((reply, idx) => (
            <div
              key={idx}
              className={`ticket-reply ${reply.sender === 'admin' ? 'ticket-reply--admin' : 'ticket-reply--user'}`}
            >
              <span className="ticket-reply-sender">{reply.sender === 'admin' ? 'Support Team' : 'You'}</span>
              <p className="ticket-reply-message">{reply.message}</p>
              <span className="ticket-reply-date">{new Date(reply.createdAt).toLocaleString('en-IN')}</span>
            </div>
          ))
        )}
      </div>

      {/* Reply form — only when ticket is open/in_progress */}
      {isActive ? (
        <form className="ticket-reply-form card" onSubmit={handleSubmit(onReply)}>
          <h3>Send a Reply</h3>
          <textarea
            {...register('message', { required: true })}
            rows={3}
            placeholder="Type your message to the support team…"
          />
          <button type="submit" className="btn primary-btn" disabled={loading}>
            {loading ? 'Sending…' : 'Send Reply'}
          </button>
        </form>
      ) : (
        <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
          Need more help? <a href="/support" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Raise a new ticket</a>.
        </div>
      )}
    </div>
  );
};

export default TicketDetail;
