import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../../redux/slices/orderSlice.js';
import Spinner from '../../components/Spinner/Spinner.jsx';
import OrderTimeline from '../../components/OrderTimeline/OrderTimeline.jsx';
import './Orders.css';

const Orders = () => {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  return (
    <div className="page-container orders-page">
      <h1 className="page-title">My Orders</h1>
      {loading ? (
        <Spinner />
      ) : list.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <div className="orders-list">
          {list.map((order) => (
            <div key={order._id} className="card order-item-card">
              <div className="order-header">
                <div>
                  <div className="order-id">Order #{order._id.slice(-6)}</div>
                  <div className="order-date">{new Date(order.createdAt).toLocaleString()}</div>
                </div>
                <div className="order-amount">₹{order.totalPrice?.toFixed(2)}</div>
              </div>
              <div className="order-body">
                <OrderTimeline currentStatus={order.orderStatus} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
