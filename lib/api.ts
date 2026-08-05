import apiClient from './axios';

/* ─────────────────────────────────────────────
   All endpoints exactly match FastAPI backend
   Base URL: http://10.228.208.109:8000
───────────────────────────────────────────── */

// ── Auth ──────────────────────────────────────
export const authAPI = {
  /** POST /login → { success, message, user, token } */
  login: (payload: { email: string; password: string }) =>
    apiClient.post('/login', payload),

  /** POST /send-signup-otp → { success, message } */
  sendSignupOTP: (email: string) =>
    apiClient.post('/send-signup-otp', { email }),

  /** POST /signup → { success, message, user } */
  signup: (payload: { email: string; password: string; fullName: string; phoneNumber?: string; mpin?: string; otp: string }) =>
    apiClient.post('/signup', payload),

  /** POST /login-mpin → { success, message, user, token } */
  loginMpin: (payload: { email: string; mpin: string }) =>
    apiClient.post('/login-mpin', payload),

  /** POST /reset-password-mpin → { success, message } */
  resetPasswordMpin: (payload: { email: string; mpin: string; newPassword: string }) =>
    apiClient.post('/reset-password-mpin', payload),

  /** POST /forgot-password → { success, message } */
  forgotPassword: (email: string) =>
    apiClient.post('/forgot-password', { email }),

  /** POST /verify-otp → { success, message } */
  verifyOTP: (email: string, otp: string) =>
    apiClient.post('/verify-otp', { email, otp }),

  /** POST /reset-password → { success, message } */
  resetPassword: (payload: { email: string; otp: string; new_password: string }) =>
    apiClient.post('/reset-password', payload),

  /** POST /auth/google → { success, message, user, token } */
  googleAuth: (payload: { email: string; fullName: string; idToken: string }) =>
    apiClient.post('/auth/google', payload),
};

// ── Food Listings ─────────────────────────────
export const foodAPI = {
  /** GET /food-listings → FoodListing[] */
  getListings: () =>
    apiClient.get('/food-listings'),

  /** POST /post-food → FoodListing */
  postFood: (data: Record<string, any>) =>
    apiClient.post('/post-food', data),

  /** POST /report-listing/{id} → { message } */
  reportListing: (id: number) =>
    apiClient.post(`/report-listing/${id}`),
};

// ── Claim & Rescue ─────────────────────────────
export const claimAPI = {
  /** POST /claim-food/{id} body: { user_id } → FoodListing */
  claimFood: (foodId: number, userId: number) =>
    apiClient.post(`/claim-food/${foodId}`, { user_id: userId }),

  /** POST /cancel-rescue/{id} → FoodListing */
  cancelRescue: (foodId: number) =>
    apiClient.post(`/cancel-rescue/${foodId}`),
};

// ── Rescue Status ──────────────────────────────
export const rescueAPI = {
  /** POST /update-rescue-status/{id} body: { status } → FoodListing */
  updateRescueStatus: (id: number, status: string) =>
    apiClient.post(`/update-rescue-status/${id}`, { status }),
};

// ── User ───────────────────────────────────────
export const userAPI = {
  /** GET /user/{id} → User */
  getUserProfile: (userId: number) =>
    apiClient.get(`/user/${userId}`),

  /** POST /user/{user_id}/update-mpin → { success, message, user } */
  updateMpin: (userId: number, payload: { mpin: string; securityAnswer?: string }) =>
    apiClient.post(`/user/${userId}/update-mpin`, payload),

  /** PUT /user/{id} → { success, message, user } */
  updateUserProfile: (userId: number, payload: { fullName?: string; phoneNumber?: string }) =>
    apiClient.put(`/user/${userId}`, payload),
};

// ── Notifications ──────────────────────────────
export const notificationAPI = {
  /** GET /notifications/{user_id} → Notification[] */
  getNotifications: (userId: number) =>
    apiClient.get(`/notifications/${userId}`),
};

// ── Community Stats ────────────────────────────
export const impactAPI = {
  /** GET /community-stats → { totalRescues, totalMealsSaved, totalCarbonSaved, activeUsers, totalDonations } */
  getCommunityStats: () =>
    apiClient.get('/community-stats'),
};
