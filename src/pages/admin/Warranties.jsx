import { useState, useEffect } from 'react';
import { getAllWarranties } from '../../services/warrantyService.js';
import Spinner from '../../components/Spinner/Spinner.jsx';
import './AdminCommon.css';

const STATUS_COLORS = {
  active: '#22c55e',
  expired: '#ef4444',
  claimed: '#3b82f6',
};

export default function AdminWarranties() {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAllWarranties()
      .then(setWarranties)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = warranties.filter(w => {
    if (filter !== 'all' && w.status !== filter) return false;
    if (search && !w.productName?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <Spinner />;

  const active = warranties.filter(w => w.status === 'active').length;
  const claimed = warranties.filter(w => w.status === 'claimed').length;
  const expired = warranties.filter(w => w.status === 'expired').length;

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">🛡️ Warranty Management</h1>

      <div className="admin-stats-row">
        <div className="admin-stat-card" style={{borderLeftColor:'#22c55e'}}>
          <div className="admin-stat-number">{active}</div>
          <div className="admin-stat-label">Active Warranties</div>
        </div>
        <div className="admin-stat-card" style={{borderLeftColor:'#3b82f6'}}>
          <div className="admin-stat-number">{claimed}</div>
          <div className="admin-stat-label">Claims Filed</div>
        </div>
        <div className="admin-stat-card" style={{borderLeftColor:'#ef4444'}}>
          <div className="admin-stat-number">{expired}</div>
          <div className="admin-stat-label">Expired</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-filter-row">
          <input
            className="admin-search-input"
            placeholder="Search by product name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="admin-select" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="claimed">Claimed</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Customer</th>
              <th>Purchase Date</th>
              <th>Expiry Date</th>
              <th>Warranty</th>
              <th>Status</th>
              <th>Claim Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(w => (
              <tr key={w._id}>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <img src={w.productImage} alt="" style={{width:36,height:36,objectFit:'contain'}} />
                    <span style={{fontSize:13}}>{w.productName}</span>
                  </div>
                </td>
                <td>{w.user?.name || w.user?.email || '—'}</td>
                <td>{new Date(w.purchaseDate).toLocaleDateString('en-IN')}</td>
                <td>{new Date(w.expiryDate).toLocaleDateString('en-IN')}</td>
                <td>{w.warrantyMonths} months</td>
                <td>
                  <span style={{
                    background: `${STATUS_COLORS[w.status]}22`,
                    color: STATUS_COLORS[w.status],
                    padding:'3px 10px',
                    borderRadius:20,
                    fontSize:12,
                    fontWeight:700,
                    textTransform:'capitalize'
                  }}>
                    {w.status}
                  </span>
                </td>
                <td>{w.claimDetails || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p style={{textAlign:'center',color:'#888',padding:'24px'}}>No warranties found</p>
        )}
      </div>
    </div>
  );
}
