import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminInsights } from '../../../redux/slices/adminSlice.js';
import Spinner from '../../../components/Spinner/Spinner.jsx';
import './Insights.css';

/* ── Urgency badge ── */
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

/* ── Score bar ── */
const ScoreBar = ({ score }) => {
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <div className="ins-score-wrap">
      <div className="ins-score-bar" style={{ width: `${score}%`, background: color }} />
      <span className="ins-score-label" style={{ color }}>{score}%</span>
    </div>
  );
};

/* ── Section header ── */
const Section = ({ icon, title, subtitle, children, empty, emptyMsg }) => (
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

const AdminInsights = () => {
  const dispatch = useDispatch();
  const { insights, insightsLoading } = useSelector((s) => s.admin);

  useEffect(() => { dispatch(fetchAdminInsights()); }, [dispatch]);

  if (insightsLoading || !insights) {
    return <div className="ins-loading"><Spinner /><p>Analysing your store data…</p></div>;
  }

  const { restockAlerts = [], deadStock = [], anomaly, coupons = [] } = insights;

  return (
    <div className="ins">
      {/* Page header */}
      <div className="ins-header">
        <div>
          <h1 className="ins-title"><span className="material-icons" style={{verticalAlign:'middle',marginRight:'0.3rem'}}>psychology</span> Store Intelligence</h1>
          <p className="ins-subtitle">Real-time insights, predictions and anomaly detection — powered by your own data.</p>
        </div>
        <button className="ins-refresh-btn" onClick={() => dispatch(fetchAdminInsights())}>
          <span className="material-icons">refresh</span> Refresh
        </button>
      </div>

      {/* ── Anomaly Alert Banner ── */}
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

      {/* ── Restock Predictions ── */}
      <Section
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
                <th>Product</th>
                <th>Brand</th>
                <th>Stock Left</th>
                <th>Sales / Day</th>
                <th>Days Remaining</th>
                <th>Reorder Qty</th>
                <th>Urgency</th>
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
      </Section>

      {/* ── Dead Stock Detector ── */}
      <Section
        icon={<span className="material-icons">inventory_2</span>}
        title="Dead Stock Detector"
        subtitle={`${deadStock.length} product${deadStock.length !== 1 ? 's' : ''} with zero sales in the last 30 days`}
        empty={deadStock.length === 0}
        emptyMsg="No dead stock detected — all products sold at least once in the last 30 days."
      >
        <div className="ins-dead-grid">
          {deadStock.map((d) => (
            <div key={d.productId} className="ins-dead-card">
              <div className="ins-dead-icon"><span className="material-icons" style={{fontSize:'1.6rem',color:'#9ca3af'}}>bedtime</span></div>
              <div className="ins-dead-info">
                <span className="ins-dead-name">{d.name}</span>
                <span className="ins-dead-brand">{d.brand} · {d.stock} units in stock</span>
              </div>
              <div className="ins-dead-actions">
                <span className="ins-tip"><span className="material-icons" style={{fontSize:'0.9em'}}>local_offer</span> Apply a discount coupon</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Coupon Performance Scorer ── */}
      <Section
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
                <th>Code</th>
                <th>Discount</th>
                <th>Redeemed</th>
                <th>Usage Rate</th>
                <th>Status</th>
                <th>Effectiveness</th>
                <th>Expires</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.code}>
                  <td><code className="ins-code">{c.code}</code></td>
                  <td>
                    {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                  </td>
                  <td>{c.usedCount}</td>
                  <td>{c.usageRate !== null ? `${c.usageRate}%` : '—'}</td>
                  <td>
                    <span className={`ins-badge ${c.isActive ? 'ins-badge--ok' : 'ins-badge--off'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ minWidth: 140 }}>
                    <ScoreBar score={c.effectivenessScore} />
                  </td>
                  <td className="ins-muted">{new Date(c.expiresAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
};

export default AdminInsights;
