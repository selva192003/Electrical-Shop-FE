import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAdminTickets,
  fetchAdminTicketById,
  replyAdminTicket,
  closeAdminTicket,
  clearSelectedTicket,
} from '../../redux/slices/adminSlice.js';
import Spinner from '../../components/Spinner/Spinner.jsx';
import './AdminFeedback.css';

const STATUS_OPTIONS = ['all', 'open', 'in_progress', 'resolved', 'closed'];

const StatusBadge = ({ status }) => {
  const map = {
    open: ['#dcfce7', '#16a34a'],
    in_progress: ['#dbeafe', '#1d4ed8'],
    resolved: ['#f3f4f6', '#6b7280'],
    closed: ['#fee2e2', '#dc2626'],
  };
  const [bg, color] = map[status] || ['#f3f4f6', '#374151'];
  return (
    <span className="adf-badge" style={{ background: bg, color }}>
      {status?.replace('_', ' ')}
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
      dispatch(fetchAdminTicketById(selectedTicket._id));
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleClose = async (status) => {
    if (!selectedTicket) return;
    await dispatch(closeAdminTicket({ id: selectedTicket._id, status }));
    dispatch(fetchAdminTickets({ status: statusFilter === 'all' ? '' : statusFilter }));
    dispatch(fetchAdminTicketById(selectedTicket._id));
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
                  <span className="adf-ticket-user">👤 {t.user?.name || 'Unknown'}</span>
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
            <div className="adf-conv-placeholder-icon">💬</div>
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
                    from <strong>{selectedTicket.user?.name}</strong> · {fmt(selectedTicket.createdAt)}
                  </span>
                </div>
              </div>
              <div className="adf-conv-actions">
                {selectedTicket.status !== 'resolved' && (
                  <button className="adf-action-btn adf-action-btn--resolve" onClick={() => handleClose('resolved')}>
                    ✓ Resolve
                  </button>
                )}
                {selectedTicket.status !== 'closed' && (
                  <button className="adf-action-btn adf-action-btn--close" onClick={() => handleClose('closed')}>
                    ✕ Close
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="adf-messages">
              {(selectedTicket.messages || []).map((m, i) => {
                const isAdmin = m.sender === 'admin' || m.senderRole === 'admin';
                return (
                  <div key={i} className={`adf-msg ${isAdmin ? 'adf-msg--admin' : 'adf-msg--user'}`}>
                    <div className="adf-msg-bubble">
                      <p className="adf-msg-text">{m.message || m.text}</p>
                      <span className="adf-msg-time">{fmt(m.createdAt || m.sentAt)}</span>
                    </div>
                    <span className="adf-msg-label">{isAdmin ? 'Admin' : (selectedTicket.user?.name || 'User')}</span>
                  </div>
                );
              })}
            </div>

            {/* Reply box */}
            {selectedTicket.status !== 'closed' && (
              <form className="adf-reply-form" onSubmit={handleReply}>
                <textarea
                  className="adf-reply-input"
                  placeholder="Type your reply…"
                  rows={3}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                <button type="submit" className="adf-send-btn" disabled={sending || !reply.trim()}>
                  {sending ? 'Sending…' : 'Send Reply'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminFeedback;
