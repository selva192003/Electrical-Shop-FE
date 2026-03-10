import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { loginUser, loginWithGoogle } from '../../redux/slices/authSlice.js';
import { resendVerification } from '../../services/authService.js';
import { useToast } from '../../components/Toast/ToastProvider.jsx';
import './Login.css';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { loading, user } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  // Email-not-verified banner state
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        const redirectTo = location.state?.from?.pathname || '/';
        navigate(redirectTo, { replace: true });
      }
    }
  }, [user, navigate, location.state]);

  const onSubmit = async (data) => {
    setUnverifiedEmail('');
    try {
      await dispatch(loginUser(data)).unwrap();
      addToast('Logged in successfully', 'success');
    } catch (err) {
      // err is the rejectWithValue payload — check for EMAIL_NOT_VERIFIED code
      const raw = typeof err === 'object' && err !== null ? err : {};
      if (raw.code === 'EMAIL_NOT_VERIFIED' || (typeof err === 'string' && err.toLowerCase().includes('verify your email'))) {
        const email = raw.email || data.email || '';
        setUnverifiedEmail(email);
        setResendCooldown(0);
      } else {
        addToast(raw.message || err || 'Login failed', 'error');
      }
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail || resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    try {
      await resendVerification(unverifiedEmail);
      addToast('Verification email sent! Please check your inbox.', 'success');
      setResendCooldown(60);
    } catch (err) {
      addToast(err?.message || 'Failed to resend. Please try again.', 'error');
    } finally {
      setResendLoading(false);
    }
  };

  const onGoogleSuccess = async (credentialResponse) => {
    try {
      await dispatch(loginWithGoogle(credentialResponse.credential)).unwrap();
      addToast('Logged in with Google', 'success');
    } catch (err) {
      addToast(err || 'Google login failed', 'error');
    }
  };

  const onGoogleError = () => {
    addToast('Google sign-in was cancelled or failed', 'error');
  };

  return (
    <div className="page-container auth-page">
      <div className="auth-card card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to manage your electrical purchases.</p>

        {/* Email-not-verified banner */}
        {unverifiedEmail && (
          <div className="unverified-banner">
            <span className="material-icons unverified-icon">mark_email_unread</span>
            <div>
              <p className="unverified-msg">
                Your email <strong>{unverifiedEmail}</strong> is not yet verified. Please check your inbox and click the verification link.
              </p>
              <div className="resend-row" style={{ marginTop: '8px', justifyContent: 'flex-start' }}>
                {resendCooldown > 0 ? (
                  <span className="resend-cooldown">Email sent. Resend in {resendCooldown}s</span>
                ) : (
                  <button type="button" className="resend-btn" onClick={handleResendVerification} disabled={resendLoading}>
                    {resendLoading ? 'Sending…' : 'Resend verification email'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input-field"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>
          <div className="form-group">
            <div className="label-row">
              <label className="form-label" htmlFor="password">Password</label>
              <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
            </div>
            <div className="password-field-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                {...register('password', { required: 'Password is required' })}
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
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>
          <button className="primary-btn auth-submit" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="google-btn-wrapper">
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={onGoogleError}
            useOneTap={false}
            width={400}
            text="continue_with"
            shape="rectangular"
          />
        </div>

        <p className="auth-footer">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
