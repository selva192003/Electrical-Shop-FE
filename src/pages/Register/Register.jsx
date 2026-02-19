import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../redux/slices/authSlice.js';
import { useToast } from '../../components/Toast/ToastProvider.jsx';
import './Register.css';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { loading, user } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (user) {
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, location.state]);

  const onSubmit = async (data) => {
    try {
      await dispatch(registerUser(data)).unwrap();
      addToast('Account created', 'success');
    } catch (err) {
      addToast(err || 'Registration failed', 'error');
    }
  };

  return (
    <div className="page-container auth-page">
      <div className="auth-card card">
        <h1 className="auth-title">Create an account</h1>
        <p className="auth-subtitle">Get started with VoltCart in a few seconds.</p>
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              className="input-field"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <p className="error-text">{errors.name.message}</p>}
          </div>
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
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input-field"
              {...register('password', { required: 'Password is required', minLength: 6 })}
            />
            {errors.password && <p className="error-text">Password must be at least 6 characters</p>}
          </div>
          <button className="primary-btn auth-submit" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
