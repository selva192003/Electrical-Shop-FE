import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
} from '../../redux/slices/notificationSlice.js';
import { useToast } from '../../components/Toast/ToastProvider.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import './Notifications.css';

const TYPE_ICONS = {
  order: '📦',
  support: '🎫',
  return: '↩️',
  coupon: '🏷️',
  system: '🔔',
};

const Notifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { items, loading, unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkRead = async (notification) => {
    if (!notification.isRead) {
      await dispatch(markNotificationRead(notification._id));
    }
    if (notification.link) navigate(notification.link);
  };

  const handleMarkAll = async () => {
    await dispatch(markAllNotificationsRead());
    addToast('All marked as read', 'success');
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await dispatch(deleteNotification(id));
  };

  const handleClear = async () => {
    await dispatch(clearAllNotifications());
    addToast('Notifications cleared', 'info');
  };

  if (loading) return <Spinner />;

  return (
    <div className="notifications-page page-wrapper">
      <div className="notifications-header">
        <h1 className="notifications-title">
          Notifications
          {unreadCount > 0 && <span className="notifications-badge">{unreadCount}</span>}
        </h1>
        <div className="notifications-actions">
          {unreadCount > 0 && (
            <button className="btn btn-sm accent-btn" onClick={handleMarkAll}>
              Mark all read
            </button>
          )}
          {items.length > 0 && (
            <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#dc2626' }} onClick={handleClear}>
              Clear all
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="notifications-empty">
          <span className="notifications-empty-icon">🔔</span>
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {items.map((n) => (
            <div
              key={n._id}
              className={`notification-item card ${!n.isRead ? 'notification-item--unread' : ''}`}
              onClick={() => handleMarkRead(n)}
            >
              <span className="notification-icon">{TYPE_ICONS[n.type] || '🔔'}</span>
              <div className="notification-content">
                <p className="notification-title">{n.title}</p>
                <p className="notification-message">{n.message}</p>
                <span className="notification-date">
                  {new Date(n.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
              <button
                className="notification-delete-btn"
                title="Delete"
                onClick={(e) => handleDelete(e, n._id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
