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

  return (
    <div className="ticket-detail-page page-wrapper">
      <button className="btn btn-sm accent-btn" onClick={() => navigate('/support/tickets')} style={{ marginBottom: '1.5rem' }}>
        ← Back
      </button>

      <div className="ticket-detail-header card">
        <h1 className="ticket-detail-subject">{currentTicket.subject}</h1>
        <div className="ticket-detail-meta">
          <span>Category: <strong>{currentTicket.category?.replace('_', ' ')}</strong></span>
          <span>Status: <strong>{currentTicket.status?.replace('_', ' ')}</strong></span>
          <span>Created: <strong>{new Date(currentTicket.createdAt).toLocaleDateString('en-IN')}</strong></span>
        </div>
        <div className="ticket-detail-description">
          <p>{currentTicket.description}</p>
        </div>
      </div>

      <div className="ticket-replies">
        <h2 className="ticket-replies-title">Replies</h2>
        {currentTicket.replies?.length === 0 && (
          <p className="ticket-no-replies">No replies yet. Our team will respond shortly.</p>
        )}
        {currentTicket.replies?.map((reply, idx) => (
          <div
            key={idx}
            className={`ticket-reply ${reply.sender === 'admin' ? 'ticket-reply--admin' : 'ticket-reply--user'}`}
          >
            <span className="ticket-reply-sender">{reply.sender === 'admin' ? 'Support Team' : 'You'}</span>
            <p className="ticket-reply-message">{reply.message}</p>
            <span className="ticket-reply-date">{new Date(reply.createdAt).toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>

      {currentTicket.status !== 'closed' && currentTicket.status !== 'resolved' && (
        <form className="ticket-reply-form card" onSubmit={handleSubmit(onReply)}>
          <h3>Send Reply</h3>
          <textarea
            {...register('message', { required: true })}
            rows={3}
            placeholder="Type your reply..."
          />
          <button type="submit" className="btn primary-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      )}
    </div>
  );
};

export default TicketDetail;
