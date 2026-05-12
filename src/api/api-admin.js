import axios from "./axios";

// ── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboardStats = () => axios.get("/admin/dashboard");
export const getAnalytics = (params) => axios.get("/admin/analytics", { params });

// ── Users ────────────────────────────────────────────────────────────────────
export const getAllUsers = (params) => axios.get("/admin/users", { params });
export const updateUserStatus = (userId, data) =>
  axios.patch(`/admin/users/${userId}/status`, data);
export const deleteUser = (userId) => axios.delete(`/admin/users/${userId}`);

// ── Reports / Content ────────────────────────────────────────────────────────
export const getAllReports = (params) =>
  axios.get("/admin/reports", { params });
export const reviewReport = (reportId, data) =>
  axios.patch(`/admin/reports/${reportId}/review`, data);
export const deletePost = (postId) => axios.delete(`/admin/posts/${postId}`);
export const deleteListing = (id) => axios.delete(`/admin/listings/${id}`);

// ── Marketplace Approval ──────────────────────────────────────────────────────
export const getPendingListings = (params) =>
  axios.get("/admin/listings/pending", { params });
export const reviewListing = (listingId, data) =>
  axios.patch(`/admin/listings/${listingId}/approve`, data);

/* ── Admin Management ── */
export const getAllAdmins = () => axios.get("/admin/users?roleFamily=admin");
export const createAdmin = (data) => axios.post("/admin/create-admin", data);
export const updateAdminRole = (id, role) =>
  axios.patch(`/admin/users/${id}/role`, { role });
export const toggleAdminStatus = (id, isActive) =>
  axios.patch(`/admin/users/${id}/status`, { isActive });
export const resetAdminPassword = (id, password) =>
  axios.post(`/admin/users/${id}/reset-password`, { password });

/* ── Settings ── */
export const getPlatformSettings = () => axios.get("/admin/settings");
export const updatePlatformSettings = (data) =>
  axios.patch("/admin/settings", data);
export const uploadPlatformLogo = (formData) =>
  axios.post("/admin/upload-logo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ── Verifications ────────────────────────────────────────────────────────────
export const getPendingVerifications = (params) =>
  axios.get("/admin/verifications", { params });
export const verifyServiceProvider = (profileType, profileId, data) =>
  axios.patch(`/admin/verifications/${profileType}/${profileId}`, data);

// ── Profile Edit Requests ───────────────────────────────────────────────────
export const getAllEditRequests = () => axios.get("/admin/edit-requests");
export const updateEditRequestStatus = (id, data) =>
  axios.patch(`/admin/edit-requests/${id}`, data);

// ── Professional Management ───────────────────────────────────────────────
export const getAllProfessionals = (type, params) =>
  axios.get(`/admin/professionals/${type}`, { params });
export const createProfessional = (type, data) =>
  axios.post(`/admin/professionals/${type}`, data);
