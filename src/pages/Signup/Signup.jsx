import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { loginWithGoogle } from '../../redux/slices/authSlice.js';
import { register as registerApi } from '../../services/authService.js';
import { resendVerification } from '../../services/authService.js';
import { useToast } from '../../components/Toast/ToastProvider.jsx';
import './Signup.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { user } = useSelector((state) => state.auth);

  const [fields, setFields] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  // After successful registration show email-sent screen
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (user) {
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, location.state]);

  // Resend countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  const validate = () => {
    const errs = {};
    if (!fields.name.trim()) errs.name = 'Full name is required';
    if (!fields.email.trim()) {
      errs.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(fields.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!fields.password) {
      errs.password = 'Password is required';
    } else if (fields.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    } else {
      const strength = getPasswordStrength(fields.password);
      if (strength?.cls === 'weak') errs.password = 'Password is too weak. Mix uppercase, numbers, and symbols.';
    }
    if (!fields.confirm) {
      errs.confirm = 'Please confirm your password';
    } else if (fields.confirm !== fields.password) {
      errs.confirm = 'Passwords do not match';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const res = await registerApi({ name: fields.name, email: fields.email, password: fields.password });
      // Backend returns { requiresVerification: true, email }
      if (res.data?.requiresVerification) {
        setRegisteredEmail(res.data.email || fields.email);
        setRegistered(true);
        setResendCooldown(60);
      }
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message || 'Registration failed';
      if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('already registered')) {
        setErrors((prev) => ({
          ...prev,
          email: 'This email already has an account. Please log in instead.',
        }));
      } else {
        addToast(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSuccess = async (credentialResponse) => {
    try {
      await dispatch(loginWithGoogle(credentialResponse.credential)).unwrap();
      addToast('Signed up with Google successfully!', 'success');
    } catch (err) {
      addToast(typeof err === 'string' ? err : 'Google sign-up failed', 'error');
    }
  };

  const onGoogleError = () => {
    addToast('Google sign-up was cancelled or failed', 'error');
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    try {
      await resendVerification(registeredEmail);
      addToast('Verification email resent! Please check your inbox.', 'success');
      setResendCooldown(60);
    } catch (err) {
      addToast(err?.message || 'Failed to resend email. Please try again.', 'error');
    } finally {
      setResendLoading(false);
    }
  };

  const pwdStrength = fields.password ? getPasswordStrength(fields.password) : null;

  // ── Email-sent confirmation screen ──
  if (registered) {
    return (
      <div className="page-container auth-page">
        <div className="auth-card card">
          <div className="email-sent-icon">📬</div>
          <h1 className="auth-title">Check your email!</h1>
          <p className="auth-subtitle">
            We sent a verification link to<br />
            <strong>{registeredEmail}</strong>
          </p>
          <p className="email-sent-info">
            Click the link in the email to activate your account. The link expires in <strong>24 hours</strong>.
          </p>
          <div className="email-sent-actions">
            <div className="resend-row" style={{ justifyContent: 'center', marginTop: 0 }}>
              <span className="resend-text">Didn&apos;t receive it?</span>
              {resendCooldown > 0 ? (
                <span className="resend-cooldown">Resend in {resendCooldown}s</span>
              ) : (
                <button type="button" className="resend-btn" onClick={handleResend} disabled={resendLoading}>
                  {resendLoading ? 'Sending…' : 'Resend email'}
                </button>
              )}
            </div>
            <p className="auth-footer" style={{ marginTop: 'var(--space-2)' }}>
              Already verified? <Link to="/login">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container auth-page">
      <div className="auth-card card">
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join Sri Murugan Electricals &amp; get 10% off your first order.</p>

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              className={`input-field${errors.name ? ' input-error' : ''}`}
              placeholder="e.g. Ravi Kumar"
              value={fields.name}
              onChange={handleChange}
              autoComplete="name"
            />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className={`input-field${errors.email ? ' input-error' : ''}`}
              placeholder="you@example.com"
              value={fields.email}
              onChange={handleChange}
              autoComplete="email"
            />
            {errors.email && (
              <p className="error-text">
                {errors.email}{' '}
                {errors.email.includes('already has an account') && (
                  <Link to="/login" className="error-login-link">Log in</Link>
                )}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="password-field-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className={`input-field${errors.password ? ' input-error' : ''}`}
                placeholder="Min. 8 characters"
                value={fields.password}
                onChange={handleChange}
                autoComplete="new-password"
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
            {fields.password && pwdStrength && (
              <div className="strength-bar-wrapper">
                <div className={`strength-bar strength-bar--${pwdStrength.cls}`} />
                <span className={`strength-label strength-label--${pwdStrength.cls}`}>{pwdStrength.label}</span>
              </div>
            )}
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="confirm">Confirm Password</label>
            <div className="password-field-wrapper">
              <input
                id="confirm"
                name="confirm"
                type={showConfirm ? 'text' : 'password'}
                className={`input-field${errors.confirm ? ' input-error' : ''}`}
                placeholder="Re-enter password"
                value={fields.confirm}
                onChange={handleChange}
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

          <button className="primary-btn auth-submit" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <div className="google-btn-wrapper">
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={onGoogleError}
            useOneTap={false}
            width="100%"
            text="signup_with"
            shape="rectangular"
          />
        </div>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
