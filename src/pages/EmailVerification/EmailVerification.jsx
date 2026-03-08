import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyEmailToken } from '../../services/authService.js';
import { resendVerification } from '../../services/authService.js';
import { useToast } from '../../components/Toast/ToastProvider.jsx';
import './EmailVerification.css';

const STATES = { LOADING: 'loading', SUCCESS: 'success', EXPIRED: 'expired', ERROR: 'error' };

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  const token = searchParams.get('token');

  const [status, setStatus] = useState(STATES.LOADING);
  const [expiredEmail, setExpiredEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!token) {
      setStatus(STATES.ERROR);
      return;
    }
    verifyEmailToken(token)
      .then(() => setStatus(STATES.SUCCESS))
      .catch((err) => {
        if (err?.response?.data?.code === 'TOKEN_EXPIRED') {
          setExpiredEmail(err?.response?.data?.email || '');
          setStatus(STATES.EXPIRED);
        } else {
          setStatus(STATES.ERROR);
        }
      });
  }, [token]);

  // Resend countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (!expiredEmail || resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    try {
      await resendVerification(expiredEmail);
      addToast('New verification email sent! Please check your inbox.', 'success');
      setResendCooldown(60);
    } catch (err) {
      addToast(err?.message || 'Failed to resend. Please try again.', 'error');
    } finally {
      setResendLoading(false);
    }
  };

  /* ── Loading ── */
  if (status === STATES.LOADING) {
    return (
      <div className="page-container auth-page">
        <div className="auth-card card ev-card">
          <div className="ev-spinner" />
          <h2 className="ev-title">Verifying your email…</h2>
          <p className="ev-subtitle">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  /* ── Success ── */
  if (status === STATES.SUCCESS) {
    return (
      <div className="page-container auth-page">
        <div className="auth-card card ev-card">
          <div className="ev-icon ev-icon--success"><span className="material-icons" style={{color:'#16a34a',fontSize:'3rem'}}>check_circle</span></div>
          <h1 className="ev-title">Email Verified!</h1>
          <p className="ev-subtitle">
            Your email has been verified successfully. Your account is now active.
          </p>
          <Link to="/login" className="primary-btn ev-btn">
            Continue to Login
          </Link>
          <p className="ev-note">
            Use code <strong>WELCOME10</strong> for 10% off your first order!
          </p>
        </div>
      </div>
    );
  }

  /* ── Expired ── */
  if (status === STATES.EXPIRED) {
    return (
      <div className="page-container auth-page">
        <div className="auth-card card ev-card">
          <div className="ev-icon ev-icon--warn"><span className="material-icons" style={{color:'#d97706',fontSize:'3rem'}}>schedule</span></div>
          <h1 className="ev-title">Link Expired</h1>
          <p className="ev-subtitle">
            Your verification link has expired. Verification links are valid for <strong>24 hours</strong>.
          </p>
          {expiredEmail && (
            <div className="ev-resend-box">
              <p className="ev-resend-label">
                Request a new link for <strong>{expiredEmail}</strong>:
              </p>
              <div className="resend-row" style={{ justifyContent: 'center' }}>
                {resendCooldown > 0 ? (
                  <span className="resend-cooldown">New link sent. Resend in {resendCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    className="primary-btn ev-btn"
                    onClick={handleResend}
                    disabled={resendLoading}
                  >
                    {resendLoading ? (
                      <span className="btn-spinner-row">
                        <span className="btn-spinner ev-btn-spinner" /> Sending…
                      </span>
                    ) : (
                      'Resend Verification Email'
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
          <p className="auth-footer" style={{ marginTop: 'var(--space-2)' }}>
            <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  return (
    <div className="page-container auth-page">
      <div className="auth-card card ev-card">
        <div className="ev-icon ev-icon--error"><span className="material-icons" style={{color:'#dc2626',fontSize:'3rem'}}>cancel</span></div>
        <h1 className="ev-title">Invalid Link</h1>
        <p className="ev-subtitle">
          This verification link is invalid or has already been used. If you&apos;ve already verified your email, you can log in directly.
        </p>
        <Link to="/login" className="primary-btn ev-btn">
          Go to Login
        </Link>
        <p className="auth-footer" style={{ marginTop: 'var(--space-2)' }}>
          Need a new link? <Link to="/signup">Sign up again</Link>
        </p>
      </div>
    </div>
  );
};

export default EmailVerification;
