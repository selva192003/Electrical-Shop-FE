import { useEffect, useRef, useState } from 'react';
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
import { uploadProfileImage, changePassword } from '../../services/authService.js';
import Spinner from '../../components/Spinner/Spinner.jsx';
import { useToast } from '../../components/Toast/ToastProvider.jsx';
import './Profile.css';

const Profile = () => {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { user, addresses, loading } = useSelector((state) => state.auth);
  const fileInputRef = useRef(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
  } = useForm();

  const {
    register: registerAddress,
    handleSubmit: handleAddressSubmit,
    reset: resetAddress,
  } = useForm();

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
    if (user) {
      reset({ name: user.name, email: user.email });
    }
  }, [user, reset]);

  const onProfileSubmit = async (data) => {
    try {
      await dispatch(updateProfile(data)).unwrap();
      addToast('Profile updated', 'success');
    } catch (err) {
      addToast(err || 'Could not update profile', 'error');
    }
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploadingImg(true);
    try {
      await uploadProfileImage(formData);
      await dispatch(loadProfile());
      addToast('Profile picture updated!', 'success');
    } catch (err) {
      addToast('Failed to upload image', 'error');
    } finally {
      setUploadingImg(false);
    }
  };

  const onPasswordChange = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    setChangingPw(true);
    try {
      await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      addToast('Password changed successfully', 'success');
      resetPw();
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setChangingPw(false);
    }
  };

  const onAddressSubmit = async (data) => {
    try {
      await dispatch(addUserAddress(data)).unwrap();
      addToast('Address added', 'success');
      resetAddress();
    } catch (err) {
      addToast(err || 'Could not add address', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await dispatch(deleteUserAddress(id)).unwrap();
      addToast('Address deleted', 'info');
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

  if (loading && !user) {
    return (
      <div className="page-container">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="page-container profile-page">
      <h1 className="page-title">Profile</h1>
      <div className="profile-layout">
        <section className="card profile-section">
          <h2>Account</h2>

          {/* Profile Image */}
          <div className="profile-avatar-wrap">
            <div className="profile-avatar" onClick={() => fileInputRef.current?.click()}>
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="profile-avatar-img" />
              ) : (
                <span className="profile-avatar-initials">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="profile-avatar-overlay">
                {uploadingImg ? '...' : '📷'}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleProfileImageChange}
            />
            <p className="profile-avatar-hint">Click avatar to change photo</p>
          </div>

          <form className="profile-form" onSubmit={handleSubmit(onProfileSubmit)}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Name</label>
              <input id="name" className="input-field" {...register('name')} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input id="email" type="email" className="input-field" {...register('email')} />
            </div>
            <button className="primary-btn" type="submit">
              Save Changes
            </button>
          </form>
        </section>

        {/* Change Password */}
        <section className="card profile-section">
          <h2>Change Password</h2>
          <form className="profile-form" onSubmit={handlePwSubmit(onPasswordChange)}>
            <div className="form-group">
              <label className="form-label" htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                className="input-field"
                {...registerPw('currentPassword', { required: true })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                className="input-field"
                {...registerPw('newPassword', { required: true, minLength: 6 })}
              />
              {pwErrors.newPassword?.type === 'minLength' && (
                <span style={{ color: '#ef4444', fontSize: '0.82rem' }}>Min 6 characters</span>
              )}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                className="input-field"
                {...registerPw('confirmPassword', { required: true })}
              />
            </div>
            <button className="primary-btn" type="submit" disabled={changingPw}>
              {changingPw ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </section>

        <section className="card profile-section">
          <h2>Addresses</h2>
          <div className="address-list">
            {addresses.map((addr) => (
              <div key={addr._id} className="address-row">
                <div>
                  <div className="address-line">
                    {addr.fullName}{' '}
                    {addr.isDefault && <span className="address-default">Default</span>}
                  </div>
                  <div className="address-line">{addr.addressLine1}</div>
                  <div className="address-line">
                    {addr.city}, {addr.state} - {addr.postalCode}
                  </div>
                </div>
                <div className="address-actions">
                  {!addr.isDefault && (
                    <button type="button" className="primary-btn" onClick={() => handleSetDefault(addr._id)}>
                      Set Default
                    </button>
                  )}
                  <button type="button" className="cart-item-remove" onClick={() => handleDeleteAddress(addr._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h3 className="address-add-heading">Add New Address</h3>
          <form className="address-form" onSubmit={handleAddressSubmit(onAddressSubmit)}>
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Name</label>
              <input id="fullName" className="input-field" {...registerAddress('fullName', { required: true })} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone</label>
              <input id="phone" className="input-field" {...registerAddress('phone', { required: true })} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="addressLine1">Address Line 1</label>
              <input id="addressLine1" className="input-field" {...registerAddress('addressLine1', { required: true })} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="city">City</label>
              <input id="city" className="input-field" {...registerAddress('city', { required: true })} />
            </div>
            <div className="profile-address-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="state">State</label>
                <input id="state" className="input-field" {...registerAddress('state', { required: true })} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="postalCode">Postal Code</label>
                <input id="postalCode" className="input-field" {...registerAddress('postalCode', { required: true })} />
              </div>
            </div>
            <button className="accent-btn" type="submit">
              Save Address
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Profile;
