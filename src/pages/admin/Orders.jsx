import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAdminOrders,
  updateAdminOrderStatus,
} from '../../redux/slices/adminSlice.js';
import Spinner from '../../components/Spinner/Spinner.jsx';
import './AdminCommon.css';
import './AdminOrders.css';

const STATUSES = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

const STATUS_COLOR = {
  Pending: '#fef9c3:#a16207',
  Confirmed: '#e0e7ff:#3730a3',
  Packed: '#e0e7ff:#6d28d9',
  Shipped: '#dbeafe:#1d4ed8',
  'Out for Delivery': '#fff7ed:#c2410c',
  Delivered: '#dcfce7:#16a34a',
  Cancelled: '#fee2e2:#dc2626',
};

const StatusBadge = ({ status }) => {
  const [bg, color] = (STATUS_COLOR[status] || '#f3f4f6:#374151').split(':');
  return <span className="ado-badge" style={{ background: bg, color }}>{status}</span>;
};

const AdminOrders = () => {
  const dispatch = useDispatch();
  const { orders, ordersLoading } = useSelector((s) => s.admin);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState({});

  useEffect(() => { dispatch(fetchAdminOrders()); }, [dispatch]);

  const filtered = (orders || []).filter((o) => {
    const matchStatus = filter === 'All' || o.orderStatus === filter;
    const matchSearch = !search ||
      o._id?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleStatus = async (id, status) => {
    setUpdating((u) => ({ ...u, [id]: true }));
    await dispatch(updateAdminOrderStatus({ id, status }));
    setUpdating((u) => ({ ...u, [id]: false }));
  };

  const tabs = ['All', ...STATUSES];

  return (
    <div className="ado">
      <div className="ado-header">
        <div>
          <h1 className="ado-title">Orders</h1>
          <p className="ado-subtitle">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <input
          className="ado-search"
          placeholder="Search by ID or customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Status filter tabs */}
      <div className="ado-tabs">
        {tabs.map((t) => (
          <button
            key={t}
            className={`ado-tab${filter === t ? ' ado-tab--active' : ''}`}
            onClick={() => setFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {ordersLoading ? (
        <Spinner />
      ) : (
        <div className="ado-table-wrap">
          <table className="ado-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="ado-empty">No orders found</td></tr>
              ) : filtered.map((o) => (
                <tr key={o._id}>
                  <td><span className="ado-mono"># {o._id.slice(-8).toUpperCase()}</span></td>
                  <td>
                    <div className="ado-customer">
                      <span className="ado-cname">{o.user?.name || 'Unknown'}</span>
                      <span className="ado-cemail">{o.user?.email}</span>
                    </div>
                  </td>
                  <td className="ado-muted">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="ado-muted">{o.orderItems?.length ?? 0}</td>
                  <td><strong>₹{Number(o.totalPrice || 0).toLocaleString('en-IN')}</strong></td>
                  <td>
                    <span className={`ado-badge ${o.isPaid ? 'ado-badge--paid' : 'ado-badge--unpaid'}`}>
                      {o.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td><StatusBadge status={o.orderStatus} /></td>
                  <td>
                    <select
                      className="ado-select"
                      value={o.orderStatus}
                      disabled={updating[o._id]}
                      onChange={(e) => handleStatus(o._id, e.target.value)}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
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

