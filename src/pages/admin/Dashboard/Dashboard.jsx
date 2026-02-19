import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { fetchDashboardSummary } from '../../../redux/slices/dashboardSlice.js';
import Spinner from '../../../components/Spinner/Spinner.jsx';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { summary, loading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardSummary());
  }, [dispatch]);

  const salesData = summary?.monthlySales || [];
  const labels = salesData.map((m) => `${m._id.month}/${m._id.year}`);
  const revenueValues = salesData.map((m) => m.totalSales);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Monthly Revenue (₹)',
        data: revenueValues,
        borderColor: '#facc15',
        backgroundColor: 'rgba(250, 204, 21, 0.2)',
        tension: 0.35,
      },
    ],
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">Admin</div>
        <nav className="admin-nav">
          <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? 'admin-link active' : 'admin-link')}>
            Overview
          </NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => (isActive ? 'admin-link active' : 'admin-link')}>
            Products
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => (isActive ? 'admin-link active' : 'admin-link')}>
            Users
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? 'admin-link active' : 'admin-link')}>
            Orders
          </NavLink>
        </nav>
      </aside>
      <main className="admin-main page-container">
        <h1 className="page-title">Dashboard</h1>
        {loading || !summary ? (
          <Spinner />
        ) : (
          <>
            <div className="admin-stats">
              <div className="card admin-stat">
                <div className="admin-stat-label">Total Users</div>
                <div className="admin-stat-value">{summary.totalUsers}</div>
              </div>
              <div className="card admin-stat">
                <div className="admin-stat-label">Total Revenue</div>
                <div className="admin-stat-value">₹{summary.totalRevenue}</div>
              </div>
              <div className="card admin-stat">
                <div className="admin-stat-label">Total Orders</div>
                <div className="admin-stat-value">{summary.orderStatusBreakdown?.reduce((acc, o) => acc + o.count, 0)}</div>
              </div>
            </div>
            <div className="card admin-chart-card">
              <h2 className="admin-chart-title">Sales Trend</h2>
              <Line data={chartData} />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
