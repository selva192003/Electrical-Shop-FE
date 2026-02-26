import { useState, useEffect, useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../redux/slices/authSlice.js';
import { fetchOpenTicketsCount, clearOpenTicketsCount } from '../../../redux/slices/adminSlice.js';
import logo from '../../../assets/sri-murugan-logo.png';
import './AdminLayout.css';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: 'dashboard',    label: 'Dashboard' },
  { to: '/admin/products',  icon: 'inventory_2',  label: 'Products' },
  { to: '/admin/users',     icon: 'group',        label: 'Users' },
  { to: '/admin/orders',    icon: 'receipt_long', label: 'Orders' },
  { to: '/admin/feedback',  icon: 'support_agent', label: 'Support Tickets' },
];

const SUPPORT_PATH = '/admin/feedback';

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const openTicketsCount = useSelector((s) => s.admin.openTicketsCount);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const refreshCount = useCallback(() => {
    dispatch(fetchOpenTicketsCount());
  }, [dispatch]);

  // Fetch on mount, then poll every 30 s
  useEffect(() => {
    refreshCount();
    const id = setInterval(refreshCount, 30_000);
    return () => clearInterval(id);
  }, [refreshCount]);

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
            <span className="material-icons">{collapsed ? 'chevron_right' : 'chevron_left'}</span>
          </button>
        </div>

        <nav className="admin-sidebar__nav">
          {NAV_ITEMS.map((item) => {
            const isSupport = item.to === SUPPORT_PATH;
            const badge = isSupport && openTicketsCount > 0 ? openTicketsCount : 0;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `admin-nav-link${isActive ? ' active' : ''}`
                }
                onClick={() => {
                  setMobileOpen(false);
                  if (isSupport) dispatch(clearOpenTicketsCount());
                }}
                title={collapsed ? item.label : ''}
              >
                <span className="material-icons admin-nav-link__icon">{item.icon}</span>
                {!collapsed && <span className="admin-nav-link__label">{item.label}</span>}
                {badge > 0 && (
                  <span className="admin-nav-badge" title={`${badge} open ticket${badge > 1 ? 's' : ''}`}>
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </NavLink>
            );
          })}
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
            <span className="material-icons">logout</span>
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
            <span className="material-icons">menu</span>
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
