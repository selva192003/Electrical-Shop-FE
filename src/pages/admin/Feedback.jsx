import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAdminTickets,
  fetchAdminTicketById,
  replyAdminTicket,
  closeAdminTicket,
  clearSelectedTicket,
  clearOpenTicketsCount,
} from '../../redux/slices/adminSlice.js';
import Spinner from '../../components/Spinner/Spinner.jsx';
import './AdminFeedback.css';

const STATUS_OPTIONS = ['all', 'open', 'in_progress', 'resolved'];

const StatusBadge = ({ status }) => {
  const map = {
    open:        ['#fef9c3', '#b45309'],
    in_progress: ['#dbeafe', '#1d4ed8'],
    resolved:    ['#dcfce7', '#16a34a'],
    closed:      ['#f3f4f6', '#6b7280'],
  };
  const [bg, color] = map[status] || ['#f3f4f6', '#374151'];
  return (
    <span className="adf-badge" style={{ background: bg, color }}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

const AdminFeedback = () => {
  const dispatch = useDispatch();
  const { tickets, ticketsLoading, selectedTicket, ticketLoading } = useSelector((s) => s.admin);
  const [statusFilter, setStatusFilter] = useState('all');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminTickets({ status: statusFilter === 'all' ? '' : statusFilter }));
  }, [dispatch, statusFilter]);

  // Clear the sidebar badge as soon as admin opens this page
  useEffect(() => {
    dispatch(clearOpenTicketsCount());
  }, [dispatch]);

  const selectTicket = (id) => {
    if (selectedTicket?._id === id) return;
    dispatch(fetchAdminTicketById(id));
    setReply('');
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !selectedTicket) return;
    setSending(true);
    try {
      await dispatch(replyAdminTicket({ id: selectedTicket._id, message: reply.trim() })).unwrap();
      setReply('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedTicket) return;
    await dispatch(closeAdminTicket({ id: selectedTicket._id, status: 'resolved' })).unwrap();
    dispatch(fetchAdminTickets({ status: statusFilter === 'all' ? '' : statusFilter }));
  };

  const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="adf">
      {/* Left: Ticket list */}
      <div className="adf-list-col">
        <div className="adf-list-header">
          <h1 className="adf-title">Support Tickets</h1>
          <div className="adf-filter-tabs">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                className={`adf-ftab${statusFilter === s ? ' adf-ftab--active' : ''}`}
                onClick={() => { setStatusFilter(s); dispatch(clearSelectedTicket()); }}
              >
                {s === 'all' ? 'All' : s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {ticketsLoading ? (
          <Spinner />
        ) : (
          <div className="adf-ticket-list">
            {(tickets || []).length === 0 ? (
              <p className="adf-empty">No tickets found</p>
            ) : (tickets || []).map((t) => (
              <div
                key={t._id}
                className={`adf-ticket-item${selectedTicket?._id === t._id ? ' adf-ticket-item--active' : ''}`}
                onClick={() => selectTicket(t._id)}
              >
                <div className="adf-ticket-top">
                  <span className="adf-ticket-subject">{t.subject}</span>
                  <StatusBadge status={t.status} />
                </div>
                <div className="adf-ticket-meta">
                  <span className="adf-ticket-user"><span className="material-icons" style={{fontSize:'14px',verticalAlign:'middle',marginRight:'3px'}}>person</span>{t.user?.name || 'Unknown'}</span>
                  <span className="adf-ticket-date">{fmt(t.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Conversation */}
      <div className="adf-conv-col">
        {!selectedTicket ? (
          <div className="adf-conv-placeholder">
            <div className="adf-conv-placeholder-icon"><span className="material-icons">forum</span></div>
            <p>Select a ticket to view the conversation</p>
          </div>
        ) : ticketLoading ? (
          <Spinner />
        ) : (
          <>
            {/* Ticket header */}
            <div className="adf-conv-header">
              <div>
                <h2 className="adf-conv-subject">{selectedTicket.subject}</h2>
                <div className="adf-conv-info">
                  <StatusBadge status={selectedTicket.status} />
                  <span className="adf-conv-meta">
                    from <strong>{selectedTicket.user?.name}</strong>
                    &nbsp;·&nbsp;{selectedTicket.category?.replace(/_/g, ' ')}
                    &nbsp;·&nbsp;{fmt(selectedTicket.createdAt)}
                  </span>
                </div>
              </div>
              <div className="adf-conv-actions">
                {(selectedTicket.status === 'open' || selectedTicket.status === 'in_progress') && (
                  <button
                    className="adf-action-btn adf-action-btn--resolve"
                    onClick={handleResolve}
                  >
                    ✓ Mark Resolved
                  </button>
                )}
                {selectedTicket.status === 'resolved' && (
                  <span className="adf-resolved-tag">✓ Resolved</span>
                )}
              </div>
            </div>

            {/* Conversation: description first, then replies */}
            <div className="adf-messages">
              {/* Initial description bubble */}
              <div className="adf-msg adf-msg--user">
                <div className="adf-msg-bubble adf-msg-bubble--desc">
                  <p className="adf-msg-text">{selectedTicket.description}</p>
                  <span className="adf-msg-time">{fmt(selectedTicket.createdAt)}</span>
                </div>
                <span className="adf-msg-label">{selectedTicket.user?.name || 'User'}</span>
              </div>

              {/* Replies */}
              {(selectedTicket.replies || []).map((m, i) => {
                const isAdmin = m.sender === 'admin';
                return (
                  <div key={i} className={`adf-msg ${isAdmin ? 'adf-msg--admin' : 'adf-msg--user'}`}>
                    <div className="adf-msg-bubble">
                      <p className="adf-msg-text">{m.message}</p>
                      <span className="adf-msg-time">{fmt(m.createdAt)}</span>
                    </div>
                    <span className="adf-msg-label">
                      {isAdmin ? 'Support Team' : (selectedTicket.user?.name || 'User')}
                    </span>
                  </div>
                );
              })}

              {selectedTicket.status === 'resolved' && (selectedTicket.replies || []).length === 0 && (
                <p className="adf-no-replies">No replies yet — ticket was resolved directly.</p>
              )}
            </div>

            {/* Reply form — always visible for admin so they can respond at any stage */}
            <form className="adf-reply-form" onSubmit={handleReply}>
              {selectedTicket.status === 'resolved' && (
                <p className="adf-reply-warning">
                  ℹ️ This ticket is resolved. Sending a reply will move it back to <strong>In Progress</strong>.
                </p>
              )}
              <textarea
                className="adf-reply-input"
                placeholder="Type your reply to the customer…"
                rows={3}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              <button type="submit" className="adf-send-btn" disabled={sending || !reply.trim()}>
                {sending ? 'Sending…' : 'Send Reply'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminFeedback;
