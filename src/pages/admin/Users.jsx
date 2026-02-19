import { useEffect, useState } from 'react';
import { useToast } from '../../components/Toast/ToastProvider.jsx';
import { getUsersAdmin, blockUser, unblockUser } from '../../services/authService.js';
import Spinner from '../../components/Spinner/Spinner.jsx';
import './AdminCommon.css';

const AdminUsers = () => {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsersAdmin();
      setUsers(res.data);
    } catch (err) {
      addToast(err.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleBlock = async (user) => {
    try {
      if (user.isBlocked) {
        await unblockUser(user._id);
        addToast('User unblocked', 'success');
        setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, isBlocked: false } : u)));
      } else {
        await blockUser(user._id);
        addToast('User blocked', 'success');
        setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, isBlocked: true } : u)));
      }
    } catch (err) {
      addToast(err.message || 'Action failed', 'error');
    }
  };

  return (
    <div className="page-container admin-page">
      <h1 className="page-title">Manage Users</h1>
      {loading ? (
        <Spinner />
      ) : (
        <div className="card admin-table-card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.isBlocked ? 'Blocked' : 'Active'}</td>
                  <td>
                    <button type="button" className="primary-btn" onClick={() => toggleBlock(u)}>
                      {u.isBlocked ? 'Unblock' : 'Block'}
                    </button>
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
