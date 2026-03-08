import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { verifyOtp, sendForgotPasswordOtp } from '../../services/authService.js';
import './VerifyOTP.css';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Email may come from navigation state or sessionStorage (refresh recovery)
  const email = location.state?.email || sessionStorage.getItem('otp_email') || '';

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef([]);

  // Redirect back if no email context
  useEffect(() => {
    if (!email) navigate('/forgot-password', { replace: true });
  }, [email, navigate]);

  // Cooldown tick
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  const focusNext = (idx) => inputRefs.current[idx + 1]?.focus();
  const focusPrev = (idx) => inputRefs.current[idx - 1]?.focus();

  const handleChange = (idx, value) => {
    const char = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = char;
    setDigits(next);
    setError('');
    if (char) focusNext(idx);
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace') {
      if (digits[idx]) {
        const next = [...digits];
        next[idx] = '';
        setDigits(next);
      } else {
        focusPrev(idx);
      }
    } else if (e.key === 'ArrowLeft') {
      focusPrev(idx);
    } else if (e.key === 'ArrowRight') {
      focusNext(idx);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    setError('');
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleVerify = useCallback(
    async (e) => {
      e?.preventDefault();
      const otp = digits.join('');
      if (otp.length < OTP_LENGTH) {
        setError('Please enter the complete 6-digit code.');
        return;
      }
      setLoading(true);
      setError('');
      try {
        await verifyOtp(email, otp);
        // Store verified OTP for ResetPassword page
        sessionStorage.setItem('otp_code', otp);
        navigate('/reset-password', { state: { email, otp } });
      } catch (err) {
        setError(err?.message || 'Verification failed. Please try again.');
        setDigits(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      } finally {
        setLoading(false);
      }
    },
    [digits, email, navigate]
  );

  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setError('');
    try {
      await sendForgotPasswordOtp(email);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      setResendCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(err?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="page-container auth-page">
      <div className="auth-card card">
        <Link to="/forgot-password" className="back-link">
          <span className="material-icons">arrow_back</span> Back
        </Link>

        <div className="auth-icon-circle otp-icon-circle">
          <span className="material-icons auth-icon">mark_email_read</span>
        </div>

        <h1 className="auth-title">Check your email</h1>
        <p className="auth-subtitle">
          We sent a 6-digit verification code to<br />
          <strong>{email}</strong>
        </p>

        <form className="auth-form" onSubmit={handleVerify} noValidate>
          <div className="otp-inputs-wrapper">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                className={`otp-input${error ? ' otp-input--error' : ''}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                autoFocus={idx === 0}
                aria-label={`OTP digit ${idx + 1}`}
              />
            ))}
          </div>

          {error && <p className="error-text otp-error-text">{error}</p>}

          <button
            className="primary-btn auth-submit"
            type="submit"
            disabled={loading || digits.join('').length < OTP_LENGTH}
          >
            {loading ? (
              <span className="btn-spinner-row">
                <span className="btn-spinner" /> Verifying…
              </span>
            ) : (
              'Verify Code'
            )}
          </button>
        </form>

        <div className="resend-row">
          <span className="resend-text">Didn&apos;t receive the code?</span>
          {resendCooldown > 0 ? (
            <span className="resend-cooldown">Resend in {resendCooldown}s</span>
          ) : (
            <button
              type="button"
              className="resend-btn"
              onClick={handleResend}
              disabled={resendLoading}
            >
              {resendLoading ? 'Sending…' : 'Resend OTP'}
            </button>
          )}
        </div>

        <p className="auth-footer otp-footer-note">
          Code expires in <strong>10 minutes</strong>. Check your spam folder if you don&apos;t see it.
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;
