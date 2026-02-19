import './OrderTimeline.css';

const STATUSES = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

const OrderTimeline = ({ currentStatus }) => {
  return (
    <div className="timeline">
      {STATUSES.map((status) => {
        const index = STATUSES.indexOf(status);
        const currentIndex = STATUSES.indexOf(currentStatus);
        const isCompleted = currentIndex > index;
        const isActive = currentIndex === index;

        return (
          <div key={status} className="timeline-step">
            <div className={`timeline-dot ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`} />
            <div className="timeline-label">{status}</div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
