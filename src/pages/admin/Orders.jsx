import { useEffect, useState } from 'react';
import { useToast } from '../../components/Toast/ToastProvider.jsx';
import { getAllOrdersAdmin, updateOrderStatusAdmin } from '../../services/orderService.js';
import Spinner from '../../components/Spinner/Spinner.jsx';
import './AdminCommon.css';

const STATUSES = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

const AdminOrders = () => {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await getAllOrdersAdmin();
      setOrders(res.data);
    } catch (err) {
      addToast(err.message || 'Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (order, status) => {
    try {
      await updateOrderStatusAdmin(order._id, status);
      addToast('Order status updated', 'success');
      setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, orderStatus: status } : o)));
    } catch (err) {
      addToast(err.message || 'Update failed', 'error');
    }
  };

  return (
    <div className="page-container admin-page">
      <h1 className="page-title">Manage Orders</h1>
      {loading ? (
        <Spinner />
      ) : (
        <div className="card admin-table-card">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>{o._id.slice(-6)}</td>
                  <td>{o.user?.name}</td>
                  <td>₹{o.totalPrice}</td>
                  <td>{o.orderStatus}</td>
                  <td>
                    <select
                      className="input-field admin-status-select"
                      value={o.orderStatus}
                      onChange={(e) => handleStatusChange(o, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
