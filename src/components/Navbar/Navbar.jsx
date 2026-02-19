import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice.js';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const cartCount = useSelector((state) => state.cart.items.length);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-mark">⚡</span>
          <span className="logo-text">VoltCart</span>
        </Link>

        <nav className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Home
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Orders
          </NavLink>
          <NavLink to="/load-calculator" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Load Calculator
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="navbar-actions">
          <NavLink to="/cart" className="nav-cart">
            <span className="cart-icon">🛒</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </NavLink>

          {user ? (
            <div className="navbar-user">
              <NavLink to="/profile" className="user-name">
                {user.name?.split(' ')[0] || 'Profile'}
              </NavLink>
              <button type="button" className="accent-btn navbar-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar-auth">
              <button type="button" className="primary-btn" onClick={() => navigate('/login')}>
                Login
              </button>
              <button type="button" className="accent-btn" onClick={() => navigate('/register')}>
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
