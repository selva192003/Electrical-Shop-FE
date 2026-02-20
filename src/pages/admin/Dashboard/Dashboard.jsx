import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  PointElement, LineElement,
  ArcElement,
  Tooltip, Legend,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { fetchAdminStats } from '../../../redux/slices/adminSlice.js';
import Spinner from '../../../components/Spinner/Spinner.jsx';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

const STATUS_COLORS = {
  Pending: '#f59e0b', Confirmed: '#3b82f6', Packed: '#8b5cf6',
  Shipped: '#06b6d4', 'Out for Delivery': '#f97316', Delivered: '#22c55e', Cancelled: '#ef4444',
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="adb-stat-card" style={{ '--stat-color': color }}>
    <div className="adb-stat-icon">{icon}</div>
    <div className="adb-stat-body">
      <span className="adb-stat-value">{value}</span>
      <span className="adb-stat-label">{label}</span>
    </div>
  </div>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, statsLoading } = useSelector((s) => s.admin);

  useEffect(() => { dispatch(fetchAdminStats()); }, [dispatch]);

  if (statsLoading || !stats) return <div className="adb-loading"><Spinner /></div>;

  const salesLabels = (stats.monthlySales || []).map(
    (m) => new Date(2000, m._id.month - 1).toLocaleString('en', { month: 'short' }) + ' ' + m._id.year
  );
  const salesValues = (stats.monthlySales || []).map((m) => m.totalSales);
  const lineData = {
    labels: salesLabels,
    datasets: [{ label: 'Revenue (₹)', data: salesValues, borderColor: '#f5b400', backgroundColor: 'rgba(245,180,0,0.12)', tension: 0.4, pointBackgroundColor: '#f5b400', fill: true }],
  };

  const breakdown = stats.orderStatusBreakdown || [];
  const doughnutData = {
    labels: breakdown.map((b) => b._id || 'Unknown'),
    datasets: [{ data: breakdown.map((b) => b.count), backgroundColor: breakdown.map((b) => STATUS_COLORS[b._id] || '#94a3b8'), borderWidth: 0 }],
  };

  return (
    <div className="adb">
      <div className="adb-header">
        <div>
          <h1 className="adb-title">Dashboard</h1>
          <p className="adb-subtitle">Welcome back! Here's your store overview.</p>
        </div>
        <button className="adb-refresh-btn" onClick={() => dispatch(fetchAdminStats())}>↻ Refresh</button>
      </div>

      <div className="adb-stats-grid">
        <StatCard icon="👥" label="Total Users"    value={stats.totalUsers}    color="#3b82f6" />
        <StatCard icon="📦" label="Total Products" value={stats.totalProducts} color="#8b5cf6" />
        <StatCard icon="🛒" label="Total Orders"   value={stats.totalOrders}   color="#06b6d4" />
        <StatCard icon="💰" label="Total Revenue"  value={`₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`} color="#22c55e" />
        <StatCard icon="⏳" label="Pending Orders" value={stats.pendingOrders} color="#f59e0b" />
        <StatCard icon="⚠️" label="Out of Stock"   value={stats.outOfStock}    color="#ef4444" />
      </div>

      <div className="adb-charts-row">
        <div className="adb-chart-card">
          <h3 className="adb-chart-title">Monthly Sales Trend</h3>
          {salesLabels.length > 0
            ? <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            : <p className="adb-no-data">No sales data yet</p>}
        </div>
        <div className="adb-chart-card adb-chart-card--sm">
          <h3 className="adb-chart-title">Order Status</h3>
          {breakdown.length > 0
            ? <Doughnut data={doughnutData} options={{ plugins: { legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } } }, cutout: '65%' }} />
            : <p className="adb-no-data">No orders yet</p>}
        </div>
      </div>

      <div className="adb-bottom-row">
        <div className="adb-table-card">
          <h3 className="adb-section-title">🏆 Top Selling Products</h3>
          {stats.topProducts?.length > 0 ? (
            <table className="adb-table">
              <thead><tr><th>Product</th><th>Qty Sold</th><th>Revenue</th></tr></thead>
              <tbody>
                {stats.topProducts.map((p, i) => (
                  <tr key={p._id || i}>
                    <td>{p.name || `Product #${String(p._id).slice(-6)}`}</td>
                    <td>{p.totalQuantity}</td>
                    <td>₹{(p.revenue || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="adb-no-data">No sales data yet</p>}
        </div>

        <div className="adb-table-card">
          <div className="adb-section-header">
            <h3 className="adb-section-title">📋 Recent Orders</h3>
            <Link to="/admin/orders" className="adb-view-all">View all →</Link>
          </div>
          {stats.recentOrders?.length > 0 ? (
            <table className="adb-table">
              <thead><tr><th>ID</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o._id}>
                    <td className="adb-mono">#{String(o._id).slice(-6).toUpperCase()}</td>
                    <td>{o.user?.name || '–'}</td>
                    <td>₹{o.totalPrice?.toLocaleString('en-IN')}</td>
                    <td><span className="adb-status-badge" style={{ background: `${STATUS_COLORS[o.orderStatus] || '#94a3b8'}22`, color: STATUS_COLORS[o.orderStatus] || '#64748b' }}>{o.orderStatus}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="adb-no-data">No orders yet</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
