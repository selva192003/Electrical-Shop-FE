import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAdminUsers,
  blockAdminUser,
  unblockAdminUser,
} from '../../redux/slices/adminSlice.js';
import Spinner from '../../components/Spinner/Spinner.jsx';
import './AdminCommon.css';
import './AdminUsers.css';

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { users, usersLoading } = useSelector((s) => s.admin);
  const [search, setSearch] = useState('');

  useEffect(() => { dispatch(fetchAdminUsers()); }, [dispatch]);

  const filtered = (users || []).filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = async (u) => {
    if (!window.confirm(`${u.isBlocked ? 'Unblock' : 'Block'} ${u.name}?`)) return;
    if (u.isBlocked) await dispatch(unblockAdminUser(u._id));
    else await dispatch(blockAdminUser(u._id));
    dispatch(fetchAdminUsers());
  };

  const initials = (name = '') => name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="adu">
      <div className="adu-header">
        <div>
          <h1 className="adu-title">Users</h1>
          <p className="adu-subtitle">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <input
        className="adu-search"
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {usersLoading ? (
        <Spinner />
      ) : (
        <div className="adu-table-wrap">
          <table className="adu-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="adu-empty">No users found</td></tr>
              ) : filtered.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="adu-user">
                      <div className="adu-avatar" style={{ background: u.isBlocked ? '#e5e7eb' : '#0b1f3b' }}>
                        {initials(u.name)}
                      </div>
                      <span className="adu-name">{u.name}</span>
                    </div>
                  </td>
                  <td className="adu-muted">{u.email}</td>
                  <td>
                    <span className={`adu-badge adu-badge--${u.role === 'admin' ? 'admin' : 'user'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`adu-badge adu-badge--${u.isBlocked ? 'blocked' : 'active'}`}>
                      {u.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="adu-muted">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td>
                    {u.role !== 'admin' && (
                      <button
                        className={`adu-btn ${u.isBlocked ? 'adu-btn--unblock' : 'adu-btn--block'}`}
                        onClick={() => handleToggle(u)}
                      >
                        {u.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

