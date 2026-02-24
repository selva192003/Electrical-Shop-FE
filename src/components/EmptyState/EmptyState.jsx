import React from 'react';
import { Link } from 'react-router-dom';
import './EmptyState.css';

const EmptyState = ({
  icon,
  title = 'Nothing here yet',
  message = 'Try adjusting your filters or search terms.',
  actionLabel,
  actionTo,
  onAction,
}) => {
  const iconEl = icon !== undefined
    ? (typeof icon === 'string' ? <span className="material-icons">{icon}</span> : icon)
    : <span className="material-icons">inventory_2</span>;
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{iconEl}</div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__message">{message}</p>
      {actionLabel && actionTo && (
        <Link className="empty-state__btn" to={actionTo}>
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button className="empty-state__btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
