import { useEffect } from 'react';
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
import Spinner from '../../components/Spinner/Spinner.jsx';
import { useToast } from '../../components/Toast/ToastProvider.jsx';
import './Profile.css';

const Profile = () => {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { user, addresses, loading } = useSelector((state) => state.auth);

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
          <form className="profile-form" onSubmit={handleSubmit(onProfileSubmit)}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Name
              </label>
              <input id="name" className="input-field" {...register('name')} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input id="email" type="email" className="input-field" {...register('email')} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                New Password (optional)
              </label>
              <input id="password" type="password" className="input-field" {...register('password')} />
            </div>
            <button className="primary-btn" type="submit">
              Save Changes
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
              <label className="form-label" htmlFor="fullName">
                Full Name
              </label>
              <input id="fullName" className="input-field" {...registerAddress('fullName', { required: true })} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                Phone
              </label>
              <input id="phone" className="input-field" {...registerAddress('phone', { required: true })} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="addressLine1">
                Address Line 1
              </label>
              <input id="addressLine1" className="input-field" {...registerAddress('addressLine1', { required: true })} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="city">
                City
              </label>
              <input id="city" className="input-field" {...registerAddress('city', { required: true })} />
            </div>
            <div className="profile-address-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="state">
                  State
                </label>
                <input id="state" className="input-field" {...registerAddress('state', { required: true })} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="postalCode">
                  Postal Code
                </label>
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
