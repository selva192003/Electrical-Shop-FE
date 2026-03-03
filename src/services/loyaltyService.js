import axiosInstance from './axiosInstance';

// Get loyalty info + transaction history
export const getLoyaltyInfo = () =>
  axiosInstance.get('/loyalty/my').then((r) => r.data);

// Redeem points
export const redeemPoints = (pointsToRedeem) =>
  axiosInstance.post('/loyalty/redeem', { pointsToRedeem }).then((r) => r.data);

// Get referral info
export const getReferralInfo = () =>
  axiosInstance.get('/loyalty/referral').then((r) => r.data);

// Admin: award bonus points
export const awardBonusPoints = (userId, points, reason) =>
  axiosInstance.post('/loyalty/admin/award', { userId, points, reason }).then((r) => r.data);
