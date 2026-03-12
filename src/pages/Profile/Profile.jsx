import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  loadProfile,
  updateProfile,
  fetchAddresses,
  addUserAddress,
  deleteUserAddress,
  setDefaultUserAddress,
} from '../../redux/slices/authSlice.js';
import { changePassword, sendChangePasswordOtp } from '../../services/authService.js';
import Spinner from '../../components/Spinner/Spinner.jsx';
import { useToast } from '../../components/Toast/ToastProvider.jsx';
import './Profile.css';

const TABS = [
  { id: 'account',   label: 'Account',   icon: 'manage_accounts' },
  { id: 'security',  label: 'Security',  icon: 'lock' },
  { id: 'addresses', label: 'Addresses', icon: 'location_on' },
];

const Profile = () => {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { user, addresses, loading } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('account');
  // Scroll to top whenever the active tab changes
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }, [activeTab]);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const { register: registerAddress, handleSubmit: handleAddressSubmit, reset: resetAddress } = useForm();

  const {
    register: registerPw,
    handleSubmit: handlePwSubmit,
    reset: resetPw,
    formState: { errors: pwErrors },
  } = useForm();

  useEffect(() => {
    dispatch(loadProfile());
    dispatch(fetchAddresses());
  }, [dispatch]);

  useEffect(() => {
    if (user) reset({ name: user.name, email: user.email });
  }, [user, reset]);

  const onProfileSubmit = async (data) => {
    try {
      await dispatch(updateProfile(data)).unwrap();
      addToast('Profile updated successfully', 'success');
    } catch (err) {
      addToast(err || 'Could not update profile', 'error');
    }
  };

  const handleSendOtp = async () => {
    setSendingOtp(true);
    try {
      await sendChangePasswordOtp();
      setOtpSent(true);
      addToast('OTP sent to your registered email', 'success');
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to send OTP', 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  const onPasswordChange = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    setChangingPw(true);
    try {
      await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword, otp: data.otp });
      addToast('Password changed successfully', 'success');
      resetPw();
      setOtpSent(false);
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setChangingPw(false);
    }
  };

  const onAddressSubmit = async (data) => {
    try {
      await dispatch(addUserAddress(data)).unwrap();
      addToast('Address saved', 'success');
      resetAddress();
    } catch (err) {
      addToast(err || 'Could not add address', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await dispatch(deleteUserAddress(id)).unwrap();
      addToast('Address removed', 'info');
    } catch (err) {
      addToast(err || 'Could not delete address', 'error');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await dispatch(setDefaultUserAddress(id)).unwrap();
      addToast('Default address updated', 'success');
    } catch (err) {
      addToast(err || 'Could not update default address', 'error');
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  if (loading && !user) {
    return <div className="page-container"><Spinner /></div>;
  }

  return (
    <div className="page-container profile-page">
      <div className="profile-shell">

        {/* ── Sidebar ── */}
        <aside className="profile-sidebar card">
          <div className="ps-avatar">{initials}</div>
          <div className="ps-name">{user?.name}</div>
          <div className="ps-email">{user?.email}</div>
          <div className="ps-badges">
            {user?.provider === 'google' && (
              <span className="ps-badge google-badge">
                <span className="material-icons" style={{ fontSize: 13 }}>login</span>
                Google
              </span>
            )}
            {user?.role === 'admin' && (
              <span className="ps-badge admin-badge">
                <span className="material-icons" style={{ fontSize: 13 }}>shield</span>
                Admin
              </span>
            )}
          </div>

          <nav className="ps-nav">
            <Link to="/orders" className="ps-nav-link">
              <span className="material-icons">receipt_long</span>
              My Orders
            </Link>
            <Link to="/wishlist" className="ps-nav-link">
              <span className="material-icons">favorite</span>
              Wishlist
            </Link>
            <Link to="/support" className="ps-nav-link">
              <span className="material-icons">headset_mic</span>
              Support
            </Link>
            <Link to="/calculator" className="ps-nav-link">
              <span className="material-icons">calculate</span>
              Calculator
            </Link>
          </nav>
        </aside>

        {/* ── Main panel ── */}
        <div className="profile-main">

          {/* Tabs */}
          <div className="profile-tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`profile-tab${activeTab === t.id ? ' active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                <span className="material-icons">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Account Tab ── */}
          {activeTab === 'account' && (
            <div className="ptc card">
              <div className="ptc-header">
                <span className="material-icons ptc-icon">manage_accounts</span>
                <div>
                  <div className="ptc-title">Account Information</div>
                  <div className="ptc-sub">Update your name and email address</div>
                </div>
              </div>
              <form className="profile-form" onSubmit={handleSubmit(onProfileSubmit)}>
                <div className="form-row-two">
                  <div className="form-group">
                    <label className="form-label" htmlFor="p-name">Full Name</label>
                    <input id="p-name" className="input-field" {...register('name')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="p-email">Email Address</label>
                    <input id="p-email" type="email" className="input-field" {...register('email')} />
                  </div>
                </div>
                <button className="primary-btn form-save-btn" type="submit">
                  <span className="material-icons">save</span> Save Changes
                </button>
              </form>
            </div>
          )}

          {/* ── Security Tab ── */}
          {activeTab === 'security' && (
            <div className="ptc card">
              <div className="ptc-header">
                <span className="material-icons ptc-icon">lock</span>
                <div>
                  <div className="ptc-title">Password &amp; Security</div>
                  <div className="ptc-sub">
                    {user?.provider === 'google'
                      ? 'Your account is secured via Google Sign-In'
                      : 'Change your account login password'}
                  </div>
                </div>
              </div>

              {user?.provider === 'google' ? (
                <div className="info-banner info-blue">
                  <span className="material-icons">info</span>
                  <div>
                    <strong>Google Sign-In Account</strong>
                    <p>Your account is linked to Google. Sign-in is managed securely by Google — there is no separate password to change.</p>
                  </div>
                </div>
              ) : !otpSent ? (
                /* Step 1 — Request OTP */
                <div className="otp-request-box">
                  <div className="otp-request-info">
                    <span className="material-icons otp-mail-icon">mark_email_unread</span>
                    <div>
                      <div className="otp-request-title">Verify your identity first</div>
                      <div className="otp-request-sub">
                        A one-time password will be sent to <strong>{user?.email}</strong>
                      </div>
                    </div>
                  </div>
                  <button
                    className="primary-btn form-save-btn"
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                  >
                    <span className="material-icons">{sendingOtp ? 'hourglass_empty' : 'send'}</span>
                    {sendingOtp ? 'Sending OTP…' : 'Send OTP to Email'}
                  </button>
                </div>
              ) : (
                /* Step 2 — Enter OTP + passwords */
                <form className="profile-form" onSubmit={handlePwSubmit(onPasswordChange)}>
                  <div className="otp-sent-notice">
                    <span className="material-icons">check_circle</span>
                    OTP sent to <strong>{user?.email}</strong>. Valid for 10 minutes.
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="pw-otp">Enter OTP</label>
                    <input
                      id="pw-otp"
                      className="input-field otp-input"
                      placeholder="6-digit code"
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      {...registerPw('otp', { required: true, pattern: /^\d{6}$/ })}
                    />
                    {pwErrors.otp && <span className="field-error">Enter the 6-digit OTP from your email</span>}
                  </div>

                  <div className="form-row-two">
                    <div className="form-group">
                      <label className="form-label" htmlFor="pw-current">Current Password</label>
                      <input
                        id="pw-current"
                        type="password"
                        className="input-field"
                        autoComplete="current-password"
                        {...registerPw('currentPassword', { required: true })}
                      />
                      {pwErrors.currentPassword && <span className="field-error">Required</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="pw-new">New Password</label>
                      <input
                        id="pw-new"
                        type="password"
                        className="input-field"
                        autoComplete="new-password"
                        {...registerPw('newPassword', { required: true, minLength: 6 })}
                      />
                      {pwErrors.newPassword?.type === 'minLength' && <span className="field-error">Minimum 6 characters</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="pw-confirm">Confirm New Password</label>
                    <input
                      id="pw-confirm"
                      type="password"
                      className="input-field"
                      autoComplete="new-password"
                      {...registerPw('confirmPassword', { required: true })}
                    />
                    {pwErrors.confirmPassword && <span className="field-error">Required</span>}
                  </div>

                  <div className="pw-actions">
                    <button className="primary-btn form-save-btn" type="submit" disabled={changingPw}>
                      <span className="material-icons">lock_reset</span>
                      {changingPw ? 'Updating…' : 'Change Password'}
                    </button>
                    <button
                      className="ghost-btn"
                      type="button"
                      onClick={() => { setOtpSent(false); resetPw(); }}
                    >
                      <span className="material-icons">refresh</span>
                      Resend OTP
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ── Addresses Tab ── */}
          {activeTab === 'addresses' && (
            <div className="ptc card">
              <div className="ptc-header">
                <span className="material-icons ptc-icon">location_on</span>
                <div>
                  <div className="ptc-title">Delivery Addresses</div>
                  <div className="ptc-sub">Manage your saved delivery addresses</div>
                </div>
              </div>

              {addresses.length === 0 ? (
                <div className="no-data-msg">
                  <span className="material-icons">add_location_alt</span>
                  No saved addresses yet. Add one below.
                </div>
              ) : (
                <div className="address-list">
                  {addresses.map((addr) => (
                    <div key={addr._id} className="address-card">
                      <div className="address-card-top">
                        <div className="address-name">
                          <span className="material-icons">person_pin</span>
                          {addr.fullName}
                          {addr.isDefault && <span className="address-default">Default</span>}
                        </div>
                        <div className="address-actions">
                          {!addr.isDefault && (
                            <button type="button" className="ghost-btn ghost-sm" onClick={() => handleSetDefault(addr._id)}>
                              Set Default
                            </button>
                          )}
                          <button type="button" className="icon-danger-btn" onClick={() => handleDeleteAddress(addr._id)}>
                            <span className="material-icons">delete_outline</span>
                          </button>
                        </div>
                      </div>
                      <div className="address-body">
                        <div>{addr.addressLine1}</div>
                        {addr.addressLine2 && <div>{addr.addressLine2}</div>}
                        <div>{addr.city}, {addr.state} — {addr.postalCode}</div>
                        <div>{addr.country} · {addr.phone}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="address-add-wrap">
                <div className="address-add-heading">
                  <span className="material-icons">add_location_alt</span>
                  Add New Address
                </div>
                <form className="profile-form" onSubmit={handleAddressSubmit(onAddressSubmit)}>
                  <div className="form-row-two">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input className="input-field" {...registerAddress('fullName', { required: true })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input className="input-field" {...registerAddress('phone', { required: true })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address Line 1</label>
                    <input className="input-field" {...registerAddress('addressLine1', { required: true })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Address Line 2 <span className="optional-label">(optional)</span>
                    </label>
                    <input className="input-field" {...registerAddress('addressLine2')} />
                  </div>
                  <div className="form-row-three">
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input className="input-field" {...registerAddress('city', { required: true })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input className="input-field" {...registerAddress('state', { required: true })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Postal Code</label>
                      <input className="input-field" {...registerAddress('postalCode', { required: true })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input className="input-field" defaultValue="India" {...registerAddress('country', { required: true })} />
                  </div>
                  <button className="accent-btn form-save-btn" type="submit">
                    <span className="material-icons">add_location_alt</span> Save Address
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;

