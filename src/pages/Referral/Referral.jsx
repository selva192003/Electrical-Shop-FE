import { useState, useEffect } from 'react';
import { getReferralInfo } from '../../services/loyaltyService.js';
import Spinner from '../../components/Spinner/Spinner.jsx';
import { useToast } from '../../components/Toast/ToastProvider.jsx';
import './Referral.css';

export default function Referral() {
  const toast = useToast();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getReferralInfo()
      .then(setInfo)
      .catch(() => toast.error('Failed to load referral info'))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = () => {
    if (!info?.referralCode) return;
    navigator.clipboard.writeText(info.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Referral code copied!');
  };

  const shareMessage = info
    ? `Join ElectricalShop and get 10% off your first order! Use my referral code: ${info.referralCode} — ${window.location.origin}/register?ref=${info.referralCode}`
    : '';

  const handleWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`);
  const handleEmail = () => window.open(`mailto:?subject=Get 10% off at ElectricalShop&body=${encodeURIComponent(shareMessage)}`);

  if (loading) return <Spinner />;
  if (!info) return null;

  return (
    <div className="referral-page">
      <div className="referral-header">
        <h1>🤝 Refer &amp; Earn</h1>
        <p>Invite friends, earn 100 loyalty points for every successful referral</p>
      </div>

      {/* How it works */}
      <div className="how-it-works">
        <div className="hiw-step">
          <div className="hiw-number">1</div>
          <div className="hiw-text">
            <strong>Share Your Code</strong>
            <span>Send your unique referral code to friends</span>
          </div>
        </div>
        <div className="hiw-arrow">→</div>
        <div className="hiw-step">
          <div className="hiw-number">2</div>
          <div className="hiw-text">
            <strong>Friend Signs Up</strong>
            <span>They register using your referral code</span>
          </div>
        </div>
        <div className="hiw-arrow">→</div>
        <div className="hiw-step">
          <div className="hiw-number">3</div>
          <div className="hiw-text">
            <strong>Both Win</strong>
            <span>You get 100 pts, they get WELCOME10 coupon</span>
          </div>
        </div>
      </div>

      {/* Code card */}
      <div className="referral-code-card">
        <div className="referral-code-label">Your Referral Code</div>
        <div className="referral-code-display">
          <span className="referral-code-text">{info.referralCode}</span>
          <button className="copy-code-btn" onClick={handleCopy}>
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>
        <div className="referral-share-btns">
          <button className="whatsapp-btn" onClick={handleWhatsApp}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.12 1.524 5.855L0 24l6.29-1.499A12 12 0 1 0 12 0zm0 22c-1.995 0-3.86-.526-5.47-1.444l-.39-.231-4.04.961.977-3.918-.254-.4A9.956 9.956 0 0 1 2 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
            WhatsApp
          </button>
          <button className="email-btn" onClick={handleEmail}>📧 Email</button>
        </div>
      </div>

      {/* Stats */}
      <div className="referral-stats-row">
        <div className="referral-stat-card">
          <div className="referral-stat-number">{info.referralCount || 0}</div>
          <div className="referral-stat-label">Successful Referrals</div>
        </div>
        <div className="referral-stat-card highlight">
          <div className="referral-stat-number">{(info.referralCount || 0) * 100}</div>
          <div className="referral-stat-label">Points Earned from Referrals</div>
        </div>
        <div className="referral-stat-card">
          <div className="referral-stat-number">₹{(info.referralCount || 0) * 10}</div>
          <div className="referral-stat-label">Redeemable Value Earned</div>
        </div>
      </div>

      {/* Register link */}
      <div className="referral-link-card">
        <div className="referral-link-label">Direct Sign-Up Link</div>
        <div className="referral-link-row">
          <span className="referral-link-text">{window.location.origin}/register?ref={info.referralCode}</span>
          <button className="copy-code-btn" onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/register?ref=${info.referralCode}`);
            toast.success('Link copied!');
          }}>Copy Link</button>
        </div>
      </div>
    </div>
  );
}
