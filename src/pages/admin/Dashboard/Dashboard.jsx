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
import { fetchAdminStats, fetchAdminInsights } from '../../../redux/slices/adminSlice.js';
import Spinner from '../../../components/Spinner/Spinner.jsx';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

const STATUS_COLORS = {
  Pending: '#f59e0b', Confirmed: '#3b82f6', Packed: '#8b5cf6',
  Shipped: '#06b6d4', 'Out for Delivery': '#f97316', Delivered: '#22c55e', Cancelled: '#ef4444',
};

/* ─── Stat Card ─── */
const StatCard = ({ icon, label, value, color, to }) => {
  const inner = (
    <div className={`adb-stat-card${to ? ' adb-stat-card--link' : ''}`} style={{ '--stat-color': color }}>
      <div className="adb-stat-icon">{icon}</div>
      <div className="adb-stat-body">
        <span className="adb-stat-value">{value}</span>
        <span className="adb-stat-label">{label}</span>
      </div>
      {to && <span className="material-icons adb-stat-arrow">arrow_forward</span>}
    </div>
  );
  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{inner}</Link> : inner;
};

/* ─── Urgency Badge ─── */
const UrgencyBadge = ({ urgency }) => {
  const map = {
    critical: ['ins-badge--crit', 'error',   'Critical'],
    high:     ['ins-badge--high', 'warning', 'High'],
    medium:   ['ins-badge--med',  'info',    'Medium'],
  };
  const [cls, iconName, label] = map[urgency] || ['ins-badge--med', 'info', urgency];
  return (
    <span className={`ins-badge ${cls}`}>
      <span className="material-icons" style={{ fontSize: '0.9em', verticalAlign: 'middle' }}>{iconName}</span> {label}
    </span>
  );
};

/* ─── Score Bar ─── */
const ScoreBar = ({ score }) => {
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <div className="ins-score-wrap">
      <div className="ins-score-bar" style={{ width: `${score}%`, background: color }} />
      <span className="ins-score-label" style={{ color }}>{score}%</span>
    </div>
  );
};

/* ─── Intelligence Section Shell ─── */
const InsSection = ({ icon, title, subtitle, children, empty, emptyMsg }) => (
  <div className="ins-section">
    <div className="ins-section-head">
      <span className="ins-section-icon">{icon}</span>
      <div>
        <h2 className="ins-section-title">{title}</h2>
        {subtitle && <p className="ins-section-sub">{subtitle}</p>}
      </div>
    </div>
    {empty ? <p className="ins-empty">{emptyMsg}</p> : children}
  </div>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, statsLoading, insights, insightsLoading } = useSelector((s) => s.admin);

  useEffect(() => {
    dispatch(fetchAdminStats());
    dispatch(fetchAdminInsights());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchAdminStats());
    dispatch(fetchAdminInsights());
  };

  if (statsLoading || !stats) return <div className="adb-loading"><Spinner /></div>;

  /* ── Chart data ── */
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

  /* ── Insights data ── */
  const { restockAlerts = [], deadStock = [], anomaly, coupons = [] } = insights || {};

  return (
    <div className="adb">
      {/* ── Header ── */}
      <div className="adb-header">
        <div>
          <h1 className="adb-title">Dashboard</h1>
          <p className="adb-subtitle">Welcome back! Store overview and intelligence at a glance.</p>
        </div>
        <button className="adb-refresh-btn" onClick={handleRefresh}>
          <span className="material-icons">refresh</span> Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="adb-stats-grid">
        <StatCard icon={<span className="material-icons">inventory_2</span>}     label="Total Products" value={stats.totalProducts} color="#8b5cf6" />
        <StatCard icon={<span className="material-icons">shopping_cart</span>}   label="Total Orders"   value={stats.totalOrders}   color="#06b6d4" />
        <StatCard icon={<span className="material-icons">currency_rupee</span>}  label="Total Revenue"  value={`₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`} color="#22c55e" />
        <StatCard icon={<span className="material-icons">hourglass_empty</span>} label="Pending Orders" value={stats.pendingOrders} color="#f59e0b" />
        <StatCard icon={<span className="material-icons">warning</span>}         label="Low Stock (≤5)"  value={stats.lowStock}     color="#f59e0b" to="/admin/low-stock" />
      </div>

      {/* ── Charts ── */}
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

      {/* ── Top Products + Recent Orders ── */}
      <div className="adb-bottom-row">
        <div className="adb-table-card">
          <h3 className="adb-section-title"><span className="material-icons">emoji_events</span> Top Selling Products</h3>
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
            <h3 className="adb-section-title"><span className="material-icons">receipt</span> Recent Orders</h3>
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

      {/* ════════════════════════════════════
          STORE INTELLIGENCE
          ════════════════════════════════════ */}
      <div className="adb-intelligence-header">
        <h2 className="adb-intelligence-title">
          <span className="material-icons">psychology</span> Store Intelligence
        </h2>
        <p className="adb-intelligence-sub">Predictions, anomaly detection &amp; coupon performance — powered by your own data.</p>
      </div>

      {insightsLoading && (
        <div className="ins-loading"><Spinner /><p>Analysing store data…</p></div>
      )}

      {!insightsLoading && insights && (
        <>
          {/* Anomaly Alert Banner */}
          {anomaly && (
            <div className={`ins-anomaly ins-anomaly--${anomaly.type}`}>
              <span className="ins-anomaly-icon material-icons">{anomaly.type === 'drop' ? 'trending_down' : 'trending_up'}</span>
              <div>
                <strong>{anomaly.type === 'drop' ? 'Revenue Drop Detected' : 'Revenue Spike Detected'}</strong>
                <p>
                  Today ₹{anomaly.todayRevenue.toLocaleString('en-IN')} vs ₹{anomaly.lastWeekRevenue.toLocaleString('en-IN')} same day last week
                  — a <strong>{Math.abs(anomaly.changePercent)}% {anomaly.type === 'drop' ? 'decrease' : 'increase'}</strong>.
                  {anomaly.type === 'drop'
                    ? ' Check for out-of-stock items or payment gateway issues.'
                    : ' Great momentum! Consider running a flash deal to maximise it.'}
                </p>
              </div>
            </div>
          )}

          {/* Restock Predictions */}
          <InsSection
            icon={<span className="material-icons">bolt</span>}
            title="Restock Predictions"
            subtitle={`${restockAlerts.length} product${restockAlerts.length !== 1 ? 's' : ''} need attention within 30 days`}
            empty={restockAlerts.length === 0}
            emptyMsg="All products have sufficient stock for the next 30 days."
          >
            <div className="ins-table-wrap">
              <table className="ins-table">
                <thead>
                  <tr>
                    <th>Product</th><th>Brand</th><th>Stock Left</th>
                    <th>Sales / Day</th><th>Days Remaining</th><th>Reorder Qty</th><th>Urgency</th>
                  </tr>
                </thead>
                <tbody>
                  {restockAlerts.map((r) => (
                    <tr key={r.productId} className={r.urgency === 'critical' ? 'ins-row--crit' : ''}>
                      <td className="ins-prod-name">{r.name}</td>
                      <td className="ins-muted">{r.brand}</td>
                      <td><strong>{r.stock}</strong></td>
                      <td>{r.dailyRate} units</td>
                      <td>
                        <span className={`ins-days ins-days--${r.urgency}`}>
                          {r.daysRemaining === 0 ? 'Today!' : `${r.daysRemaining}d`}
                        </span>
                      </td>
                      <td className="ins-reorder">{r.recommendedReorder} units</td>
                      <td><UrgencyBadge urgency={r.urgency} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </InsSection>

          {/* Dead Stock Detector */}
          <InsSection
            icon={<span className="material-icons">inventory_2</span>}
            title="Dead Stock Detector"
            subtitle={`${deadStock.length} product${deadStock.length !== 1 ? 's' : ''} with zero sales in the last 30 days`}
            empty={deadStock.length === 0}
            emptyMsg="No dead stock detected — all products sold at least once in the last 30 days."
          >
            <div className="ins-dead-grid">
              {deadStock.map((d) => (
                <div key={d.productId} className="ins-dead-card">
                  <div className="ins-dead-icon"><span className="material-icons" style={{ fontSize: '1.6rem', color: '#9ca3af' }}>bedtime</span></div>
                  <div className="ins-dead-info">
                    <span className="ins-dead-name">{d.name}</span>
                    <span className="ins-dead-brand">{d.brand} · {d.stock} units in stock</span>
                  </div>
                  <div className="ins-dead-actions">
                    <span className="ins-tip"><span className="material-icons" style={{ fontSize: '0.9em' }}>star</span> Mark as featured</span>
                    <span className="ins-tip"><span className="material-icons" style={{ fontSize: '0.9em' }}>local_offer</span> Apply a discount coupon</span>
                  </div>
                </div>
              ))}
            </div>
          </InsSection>

          {/* Coupon Performance Scorer */}
          <InsSection
            icon={<span className="material-icons">confirmation_number</span>}
            title="Coupon Performance Scorer"
            subtitle="Effectiveness score based on usage, redemption rate, and active status"
            empty={coupons.length === 0}
            emptyMsg="No coupons have been redeemed yet."
          >
            <div className="ins-table-wrap">
              <table className="ins-table">
                <thead>
                  <tr>
                    <th>Code</th><th>Discount</th><th>Redeemed</th>
                    <th>Usage Rate</th><th>Status</th><th>Effectiveness</th><th>Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.code}>
                      <td><code className="ins-code">{c.code}</code></td>
                      <td>{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                      <td>{c.usedCount}</td>
                      <td>{c.usageRate !== null ? `${c.usageRate}%` : '—'}</td>
                      <td>
                        <span className={`ins-badge ${c.isActive ? 'ins-badge--ok' : 'ins-badge--off'}`}>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ minWidth: 140 }}><ScoreBar score={c.effectivenessScore} /></td>
                      <td className="ins-muted">{new Date(c.expiresAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </InsSection>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
