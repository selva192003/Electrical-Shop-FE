import { useState, useEffect } from 'react';
import { getLoyaltyInfo, redeemPoints } from '../../services/loyaltyService.js';
import Spinner from '../../components/Spinner/Spinner.jsx';
import { useToast } from '../../components/Toast/ToastProvider.jsx';
import './Loyalty.css';

const TIERS = {
  Bronze:   { color: '#cd7f32', icon: '🥉', minPoints: 0,    next: 500 },
  Silver:   { color: '#aaa',    icon: '🥈', minPoints: 500,  next: 2000 },
  Gold:     { color: '#f4c430', icon: '🥇', minPoints: 2000, next: 5000 },
  Platinum: { color: '#6cf',    icon: '💎', minPoints: 5000, next: null },
};

const TX_ICONS = { earned: '⬆️', redeemed: '⬇️', bonus: '🎁', expired: '⏳', referral: '🤝' };

export default function Loyalty() {
  const toast = useToast();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redeemAmount, setRedeemAmount] = useState(100);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    getLoyaltyInfo()
      .then(setInfo)
      .catch(() => toast.error('Failed to load loyalty info'))
      .finally(() => setLoading(false));
  }, []);

  const handleRedeem = async () => {
    if (redeemAmount < 100 || redeemAmount % 100 !== 0) {
      toast.error('Redeem in multiples of 100 points');
      return;
    }
    setRedeeming(true);
    try {
      const updated = await redeemPoints(redeemAmount);
      toast.success(`Redeemed ${redeemAmount} points for ₹${redeemAmount / 10} store discount!`);
      setInfo(prev => ({
        ...prev,
        loyaltyPoints: updated.newBalance,
        transactions: updated.transaction ? [updated.transaction, ...(prev.transactions || [])] : prev.transactions
      }));
    } catch (e) {
      toast.error(e.response?.data?.message || 'Redemption failed');
    } finally { setRedeeming(false); }
  };

  if (loading) return <Spinner />;
  if (!info) return null;

  const tier = info.loyaltyTier || 'Bronze';
  const tierMeta = TIERS[tier];
  const progress = tierMeta.next
    ? Math.min(100, ((info.loyaltyPoints - tierMeta.minPoints) / (tierMeta.next - tierMeta.minPoints)) * 100)
    : 100;
  const pointsToNext = tierMeta.next ? tierMeta.next - info.loyaltyPoints : 0;

  return (
    <div className="loyalty-page">
      <div className="loyalty-header">
        <h1>🏆 Loyalty Points</h1>
        <p>Earn points on every purchase, redeem for discounts</p>
      </div>

      <div className="loyalty-tier-card" style={{ borderColor: tierMeta.color }}>
        <div className="loyalty-tier-icon">{tierMeta.icon}</div>
        <div className="loyalty-tier-info">
          <div className="loyalty-tier-name" style={{ color: tierMeta.color }}>{tier} Member</div>
          <div className="loyalty-points-balance">{info.loyaltyPoints?.toLocaleString('en-IN')} points</div>
          <div className="loyalty-points-earned">Total earned: {info.totalPointsEarned?.toLocaleString('en-IN')} pts</div>
          {tierMeta.next && (
            <>
              <div className="loyalty-progress-bar">
                <div className="loyalty-progress-fill" style={{ width: `${progress}%`, background: tierMeta.color }} />
              </div>
              <div className="loyalty-progress-label">
                {pointsToNext > 0 ? `${pointsToNext} more points to next tier` : 'Upgrading soon!'}
              </div>
            </>
          )}
        </div>
        <div className="loyalty-worth-box">
          <div className="loyalty-worth-label">Redeemable Value</div>
          <div className="loyalty-worth-amount">₹{Math.floor((info.loyaltyPoints || 0) / 10)}</div>
          <div className="loyalty-worth-note">100 pts = ₹10</div>
        </div>
      </div>

      {/* Tier perks */}
      <div className="loyalty-perks-row">
        {Object.entries(TIERS).map(([name, meta]) => (
          <div key={name} className={`loyalty-perk-card ${tier === name ? 'current-tier' : ''}`} style={{ borderTopColor: meta.color }}>
            <div className="loyalty-perk-icon">{meta.icon}</div>
            <div className="loyalty-perk-name" style={{ color: meta.color }}>{name}</div>
            <div className="loyalty-perk-threshold">{meta.minPoints.toLocaleString()} pts</div>
            <ul className="loyalty-perk-list">
              {name === 'Bronze' && <><li>1 pt per ₹10 spent</li><li>Birthday bonus</li></>}
              {name === 'Silver' && <><li>1.25× point multiplier</li><li>Priority support</li></>}
              {name === 'Gold' && <><li>1.5× point multiplier</li><li>Free shipping</li><li>Early access sales</li></>}
              {name === 'Platinum' && <><li>2× point multiplier</li><li>Dedicated manager</li><li>Exclusive deals</li></>}
            </ul>
          </div>
        ))}
      </div>

      {/* Redeem section */}
      {info.loyaltyPoints >= 100 && (
        <div className="loyalty-redeem-card">
          <h2>Redeem Points</h2>
          <p>Each 100 points = ₹10 store discount. You can redeem <strong>{Math.floor(info.loyaltyPoints / 100) * 100} points</strong> max (₹{Math.floor(info.loyaltyPoints / 10)}).</p>
          <div className="redeem-controls">
            <input
              type="number"
              min={100}
              step={100}
              max={Math.floor(info.loyaltyPoints / 100) * 100}
              value={redeemAmount}
              onChange={e => setRedeemAmount(Number(e.target.value))}
              className="redeem-input"
            />
            <span className="redeem-equals">= ₹{redeemAmount / 10} discount</span>
            <button className="redeem-btn" onClick={handleRedeem} disabled={redeeming}>
              {redeeming ? 'Redeeming…' : 'Redeem Now'}
            </button>
          </div>
        </div>
      )}

      {/* Earn rules */}
      <div className="loyalty-earn-card">
        <h2>How to Earn Points</h2>
        <div className="earn-rules-grid">
          <div className="earn-rule"><span className="earn-rule-pts">+1 pt</span><span>per ₹10 spent on orders</span></div>
          <div className="earn-rule"><span className="earn-rule-pts">+100 pts</span><span>for each successful referral</span></div>
          <div className="earn-rule"><span className="earn-rule-pts">+50 pts</span><span>for writing a product review</span></div>
          <div className="earn-rule"><span className="earn-rule-pts">Bonus</span><span>on special occasions &amp; promotions</span></div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="loyalty-history-card">
        <h2>Points History</h2>
        {info.transactions?.length === 0 ? (
          <p className="no-tx">No transactions yet. Start shopping to earn points!</p>
        ) : (
          <div className="tx-list">
            {info.transactions?.map(tx => (
              <div key={tx._id} className="tx-item">
                <span className="tx-icon">{TX_ICONS[tx.type] || '📋'}</span>
                <div className="tx-info">
                  <div className="tx-desc">{tx.description}</div>
                  <div className="tx-date">{new Date(tx.createdAt).toLocaleDateString('en-IN')}</div>
                </div>
                <div className={`tx-pts ${tx.type === 'redeemed' || tx.type === 'expired' ? 'negative' : 'positive'}`}>
                  {tx.type === 'redeemed' || tx.type === 'expired' ? '-' : '+'}{tx.points} pts
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
