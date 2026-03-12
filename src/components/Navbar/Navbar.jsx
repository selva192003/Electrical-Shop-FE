import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { logout, fetchAddresses } from '../../redux/slices/authSlice.js';
import { fetchUnreadCount } from '../../redux/slices/notificationSlice.js';
import logo from '../../assets/sri-murugan-logo.png';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Hide on scroll-down, reveal on scroll-up
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setHidden(currentY > lastY.current && currentY > 60);
      lastY.current = currentY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const cartCount = useSelector((state) =>
    state.cart.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
  );
  const unreadCount = useSelector((state) => state.notifications.unreadCount);
  const addresses = useSelector((state) => state.auth.addresses);
  const hasNoAddress = user && addresses.length === 0;

  // Fetch unread notification count and addresses periodically when logged in
  useEffect(() => {
    if (user) {
      dispatch(fetchUnreadCount());
      dispatch(fetchAddresses());
      const interval = setInterval(() => dispatch(fetchUnreadCount()), 60000); // every minute
      return () => clearInterval(interval);
    }
  }, [user, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className={`navbar${hidden ? ' navbar--hidden' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-image-wrapper" aria-hidden="true">
            <img
              src={logo}
              alt="Sri Murugan Electricals and Hardwares logo"
              className="logo-image"
            />
          </span>
          <span className="logo-text-block">
            <span className="logo-text-main">Sri Murugan</span>
            <span className="logo-text-sub">Electricals &amp; Hardwares</span>
          </span>
        </Link>

        <nav className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Home
          </NavLink>
           <NavLink to="/products" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Products
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Orders
          </NavLink>         
          <NavLink to="/calculator" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Calculator
          </NavLink>
          {user && (
            <NavLink to="/wishlist" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Wishlist
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="navbar-actions">
          {user && (
            <NavLink to="/notifications" className="nav-bell" title="Notifications">
              <span className="material-icons bell-icon">notifications</span>
              {unreadCount > 0 && (
                <span className="bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </NavLink>
          )}

          <NavLink to="/cart" className="nav-cart">
            <span className="material-icons cart-icon">shopping_cart</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </NavLink>

          {user ? (
            <div className="navbar-user">
              <NavLink to="/profile" className="user-name-wrap" title={hasNoAddress ? 'Please add a delivery address to your profile' : undefined}>
                {user.name?.split(' ')[0] || 'Profile'}
                {hasNoAddress && <span className="user-alert-badge">!</span>}
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
