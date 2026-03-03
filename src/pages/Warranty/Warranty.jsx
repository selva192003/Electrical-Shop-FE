import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyWarranties, fileWarrantyClaim } from '../../services/warrantyService.js';
import Spinner from '../../components/Spinner/Spinner.jsx';
import { useToast } from '../../components/Toast/ToastProvider.jsx';
import './Warranty.css';

const daysLeft = (expiry) => {
  const diff = new Date(expiry) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const STATUS_META = {
  active:  { label: 'Active',   bg: '#d1fae5', color: '#065f46' },
  expired: { label: 'Expired',  bg: '#fee2e2', color: '#991b1b' },
  claimed: { label: 'Claimed',  bg: '#dbeafe', color: '#1e40af' },
};

export default function Warranty() {
  const toast = useToast();
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);
  const [claimForm, setClaimForm] = useState({ warrantyId: '', description: '' });

  useEffect(() => {
    getMyWarranties()
      .then(setWarranties)
      .catch(() => toast.error('Failed to load warranties'))
      .finally(() => setLoading(false));
  }, []);

  const handleClaim = async (e) => {
    e.preventDefault();
    setClaiming(true);
    try {
      await fileWarrantyClaim(claimForm.warrantyId, claimForm.description);
      toast.success('Warranty claim filed! A support ticket has been created.');
      setWarranties(prev => prev.map(w => w._id === claimForm.warrantyId ? { ...w, status: 'claimed' } : w));
      setClaimForm({ warrantyId: '', description: '' });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to file claim');
    } finally { setClaiming(false); }
  };

  if (loading) return <Spinner />;

  const active = warranties.filter(w => w.status === 'active');
  const others = warranties.filter(w => w.status !== 'active');

  return (
    <div className="warranty-page">
      <div className="warranty-header">
        <h1>🛡️ Warranty Wallet</h1>
        <p>All your product warranties in one place</p>
      </div>

      {warranties.length === 0 ? (
        <div className="warranty-empty">
          <span className="material-symbols-outlined">shield</span>
          <h2>No Warranties Yet</h2>
          <p>Products with warranty coverage will appear here after delivery</p>
          <Link to="/orders" className="warranty-orders-link">View My Orders</Link>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section className="warranty-section">
              <h2>Active Warranties ({active.length})</h2>
              <div className="warranty-grid">
                {active.map(w => {
                  const days = daysLeft(w.expiryDate);
                  const urgent = days <= 30;
                  return (
                    <div key={w._id} className={`warranty-card ${urgent ? 'urgent' : ''}`}>
                      <img src={w.productImage} alt={w.productName} className="warranty-product-img" />
                      <div className="warranty-card-body">
                        <div className="warranty-product-name">{w.productName}</div>
                        <div className="warranty-dates">
                          <span>Purchased: {new Date(w.purchaseDate).toLocaleDateString('en-IN')}</span>
                          <span>Expires: {new Date(w.expiryDate).toLocaleDateString('en-IN')}</span>
                        </div>
                        <div className={`warranty-days-left ${urgent ? 'urgent' : ''}`}>
                          {days > 0 ? `${days} days remaining` : 'Expired'}
                        </div>
                        <div className="warranty-progress-wrap">
                          <div className="warranty-progress-bar">
                            <div
                              className="warranty-progress-fill"
                              style={{
                                width: `${Math.max(0, Math.min(100, (days / (w.warrantyMonths * 30)) * 100))}%`,
                                background: urgent ? '#ef4444' : '#22c55e'
                              }}
                            />
                          </div>
                        </div>
                        <button
                          className="file-claim-btn"
                          onClick={() => setClaimForm({ warrantyId: w._id, description: '' })}
                        >
                          File Warranty Claim
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {others.length > 0 && (
            <section className="warranty-section">
              <h2>Past Warranties</h2>
              <div className="warranty-grid">
                {others.map(w => {
                  const meta = STATUS_META[w.status] || STATUS_META.expired;
                  return (
                    <div key={w._id} className="warranty-card past">
                      <img src={w.productImage} alt={w.productName} className="warranty-product-img" />
                      <div className="warranty-card-body">
                        <div className="warranty-product-name">{w.productName}</div>
                        <span className="warranty-status-badge" style={{ background: meta.bg, color: meta.color }}>
                          {meta.label}
                        </span>
                        <div className="warranty-dates">
                          <span>Expired: {new Date(w.expiryDate).toLocaleDateString('en-IN')}</span>
                        </div>
                        {w.claimDetails && (
                          <div className="warranty-claim-detail">Claim: {w.claimDetails}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}

      {/* Claim Modal */}
      {claimForm.warrantyId && (
        <div className="warranty-modal-overlay" onClick={() => setClaimForm({ warrantyId: '', description: '' })}>
          <div className="warranty-modal" onClick={e => e.stopPropagation()}>
            <h2>File Warranty Claim</h2>
            <p>Describe the issue with your product. A support ticket will be created for you.</p>
            <form onSubmit={handleClaim}>
              <textarea
                value={claimForm.description}
                onChange={e => setClaimForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the issue in detail..."
                rows={5}
                required
                className="claim-textarea"
              />
              <div className="warranty-modal-actions">
                <button type="button" onClick={() => setClaimForm({ warrantyId: '', description: '' })} className="cancel-btn">Cancel</button>
                <button type="submit" className="file-btn" disabled={!!claiming}>{claiming ? 'Filing…' : 'File Claim'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
