import './OrderTimeline.css';

const STATUSES = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

const STATUS_ICONS = {
  Pending:             'hourglass_empty',
  Confirmed:           'check_circle',
  Packed:              'inventory',
  Shipped:             'local_shipping',
  'Out for Delivery':  'directions_bike',
  Delivered:           'task_alt',
  Cancelled:           'cancel',
};

const OrderTimeline = ({ currentStatus }) => {
  if (currentStatus === 'Cancelled') {
    return (
      <div className="otl-cancelled">
        <span className="material-icons otl-cancelled-icon">cancel</span>
        <span>Order Cancelled</span>
      </div>
    );
  }

  const currentIndex = STATUSES.indexOf(currentStatus);

  return (
    <div className="otl">
      {STATUSES.map((status, index) => {
        const isCompleted = currentIndex > index;
        const isActive    = currentIndex === index;
        const lineActive  = currentIndex >= index;

        return (
          <div key={status} className="otl-step">
            {index > 0 && (
              <div className={`otl-line${lineActive ? ' otl-line--done' : ''}`} />
            )}
            <div className={`otl-dot${
              isCompleted ? ' otl-dot--done' :
              isActive    ? ' otl-dot--active' : ''
            }`}>
              <span className="material-icons otl-icon">{STATUS_ICONS[status]}</span>
            </div>
            <span className={`otl-label${
              isCompleted ? ' otl-label--done' :
              isActive    ? ' otl-label--active' : ''
            }`}>{status}</span>
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
