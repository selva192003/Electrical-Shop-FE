import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/authService.js';
import { useToast } from '../../components/Toast/ToastProvider.jsx';
import './ResetPassword.css';

const getPasswordStrength = (pwd) => {
  if (pwd.length < 8) return null;
  let score = 0;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { label: 'Weak', cls: 'weak' };
  if (score === 2) return { label: 'Fair', cls: 'fair' };
  if (score === 3) return { label: 'Good', cls: 'good' };
  return { label: 'Strong', cls: 'strong' };
};

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Recover email/otp from nav state or sessionStorage
  const email = location.state?.email || sessionStorage.getItem('otp_email') || '';
  const otp = location.state?.otp || sessionStorage.getItem('otp_code') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Guard: must have email + otp to reach this page
  useEffect(() => {
    if (!email || !otp) navigate('/forgot-password', { replace: true });
  }, [email, otp, navigate]);

  const validate = () => {
    const errs = {};
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    } else {
      const strength = getPasswordStrength(password);
      if (strength?.cls === 'weak') errs.password = 'Password is too weak. Mix uppercase, numbers, and symbols.';
    }
    if (!confirm) {
      errs.confirm = 'Please confirm your password';
    } else if (confirm !== password) {
      errs.confirm = 'Passwords do not match';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email, otp, password);
      // Clean up session storage
      sessionStorage.removeItem('otp_email');
      sessionStorage.removeItem('otp_code');
      addToast('Password updated successfully. Please login.', 'success');
      navigate('/login', { replace: true });
    } catch (err) {
      const msg = err?.message || 'Password reset failed. Please try again.';
      // If OTP is invalid/expired at this point, redirect back to forgot-password
      if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid otp')) {
        setErrors({ password: msg + ' Please request a new code.' });
      } else {
        setErrors({ password: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  const pwdStrength = password ? getPasswordStrength(password) : null;

  return (
    <div className="page-container auth-page">
      <div className="auth-card card">
        <div className="auth-icon-circle reset-icon-circle">
          <span className="material-icons auth-icon">lock_open</span>
        </div>

        <h1 className="auth-title">Set new password</h1>
        <p className="auth-subtitle">
          Almost done! Choose a strong new password for <strong>{email}</strong>.
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* New Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="rp-password">New Password</label>
            <div className="password-field-wrapper">
              <input
                id="rp-password"
                type={showPassword ? 'text' : 'password'}
                className={`input-field${errors.password ? ' input-error' : ''}`}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: '' })); }}
                autoComplete="new-password"
                autoFocus
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <span className="material-icons">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            {password && pwdStrength && (
              <div className="strength-bar-wrapper">
                <div className={`strength-bar strength-bar--${pwdStrength.cls}`} />
                <span className={`strength-label strength-label--${pwdStrength.cls}`}>{pwdStrength.label}</span>
              </div>
            )}
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="rp-confirm">Confirm Password</label>
            <div className="password-field-wrapper">
              <input
                id="rp-confirm"
                type={showConfirm ? 'text' : 'password'}
                className={`input-field${errors.confirm ? ' input-error' : ''}`}
                placeholder="Re-enter new password"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setErrors((prev) => ({ ...prev, confirm: '' })); }}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                <span className="material-icons">{showConfirm ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            {errors.confirm && <p className="error-text">{errors.confirm}</p>}
          </div>

          {/* Password requirements hint */}
          <ul className="pw-requirements">
            <li className={password.length >= 8 ? 'req-met' : ''}>At least 8 characters</li>
            <li className={/[A-Z]/.test(password) ? 'req-met' : ''}>One uppercase letter</li>
            <li className={/[0-9]/.test(password) ? 'req-met' : ''}>One number</li>
          </ul>

          <button className="primary-btn auth-submit" type="submit" disabled={loading}>
            {loading ? (
              <span className="btn-spinner-row">
                <span className="btn-spinner" /> Updating…
              </span>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <p className="auth-footer">
          Back to <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
