import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../redux/slices/authSlice.js';
import logo from '../../../assets/sri-murugan-logo.png';
import './AdminLayout.css';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/admin/products', icon: '📦', label: 'Products' },
  { to: '/admin/users',    icon: '👥', label: 'Users' },
  { to: '/admin/orders',   icon: '📋', label: 'Orders' },
  { to: '/admin/feedback', icon: '💬', label: 'Feedback' },
];

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className={`admin-root${collapsed ? ' sidebar-collapsed' : ''}`}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="admin-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar${mobileOpen ? ' mobile-open' : ''}`}>
        <div className="admin-sidebar__header">
          <img src={logo} alt="logo" className="admin-sidebar__logo" />
          {!collapsed && (
            <div className="admin-sidebar__brand">
              <span className="admin-sidebar__brand-name">Sri Murugan</span>
              <span className="admin-sidebar__brand-sub">Admin Panel</span>
            </div>
          )}
          <button
            className="admin-sidebar__collapse-btn"
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        <nav className="admin-sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `admin-nav-link${isActive ? ' active' : ''}`
              }
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : ''}
            >
              <span className="admin-nav-link__icon">{item.icon}</span>
              {!collapsed && <span className="admin-nav-link__label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <div className="admin-sidebar__avatar">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            {!collapsed && (
              <div className="admin-sidebar__user-info">
                <span className="admin-sidebar__user-name">{user?.name}</span>
                <span className="admin-sidebar__user-role">Administrator</span>
              </div>
            )}
          </div>
          <button className="admin-sidebar__logout" onClick={handleLogout} title="Logout">
            <span>🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="admin-content-wrap">
        {/* Top bar (mobile) */}
        <header className="admin-topbar">
          <button
            className="admin-topbar__menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            ☰
          </button>
          <img src={logo} alt="logo" className="admin-topbar__logo" />
          <span className="admin-topbar__title">Admin Panel</span>
          <button className="admin-topbar__logout" onClick={handleLogout}>
            Logout
          </button>
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
