import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendForgotPasswordOtp } from '../../services/authService.js';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await sendForgotPasswordOtp(trimmed);
      // Persist email so VerifyOTP page can read it on refresh
      sessionStorage.setItem('otp_email', trimmed);
      navigate('/verify-otp', { state: { email: trimmed } });
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container auth-page">
      <div className="auth-card card">
        {/* Back link */}
        <Link to="/login" className="back-link">
          <span className="material-icons">arrow_back</span> Back to Login
        </Link>

        <div className="auth-icon-circle">
          <span className="material-icons auth-icon">lock_reset</span>
        </div>

        <h1 className="auth-title">Forgot Password?</h1>
        <p className="auth-subtitle">
          Enter the email linked to your account and we&apos;ll send a verification code.
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="fp-email">Email Address</label>
            <input
              id="fp-email"
              type="email"
              className={`input-field${error ? ' input-error' : ''}`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              autoComplete="email"
              autoFocus
            />
            {error && <p className="error-text">{error}</p>}
          </div>

          <button className="primary-btn auth-submit" type="submit" disabled={loading}>
            {loading ? (
              <span className="btn-spinner-row">
                <span className="btn-spinner" /> Sending OTP…
              </span>
            ) : (
              'Send Verification Code'
            )}
          </button>
        </form>

        <p className="auth-footer">
          Remember your password? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
