import api from './axios';

// Auth
export const loginApi = (data) => api.post('/auth/login', data);
export const registerApi = (data) => api.post('/auth/register', data);
export const getMeApi = () => api.get('/auth/me');

// Users
export const getAllUsersApi = () => api.get('/users');
export const createUserApi = (data) => api.post('/users', data);
export const updateUserApi = (id, data) => api.put(`/users/${id}`, data);
export const deleteUserApi = (id) => api.delete(`/users/${id}`);

// Leaves
export const applyLeaveApi = (data) => api.post('/leaves', data);
export const getLeavesApi = (params) => api.get('/leaves', { params });
export const getLeaveStatsApi = () => api.get('/leaves/stats');
export const approveLeaveApi = (id, data) => api.put(`/leaves/${id}/approve`, data);
export const rejectLeaveApi = (id, data) => api.put(`/leaves/${id}/reject`, data);
export const deleteLeaveApi = (id) => api.delete(`/leaves/${id}`);
export const getBurnoutAlertsApi = () => api.get('/leaves/burnout-alerts');
export const getAnalyticsApi = () => api.get('/leaves/analytics');

// Notifications
export const getNotificationsApi = () => api.get('/notifications');
export const markReadApi = (id) => api.put(`/notifications/${id}/read`);
export const markAllReadApi = () => api.put('/notifications/mark-all-read');

// Leave Swaps
export const requestSwapApi = (data) => api.post('/swaps', data);
export const getSwapsApi = () => api.get('/swaps');
export const getAllSwapsApi = () => api.get('/swaps/all');
export const respondSwapApi = (id, response) => api.put(`/swaps/${id}/respond`, { response });
export const managerSwapResponseApi = (id, decision) => api.put(`/swaps/${id}/manager-response`, { decision });
// Reimbursements
export const applyReimbursementApi = (data) => api.post('/reimbursements', data);
export const getReimbursementsApi = (params) => api.get('/reimbursements', { params });
export const getReimbursementStatsApi = () => api.get('/reimbursements/stats');
export const approveReimbursementApi = (id, data) => api.put(`/reimbursements/${id}/approve`, data);
export const rejectReimbursementApi = (id, data) => api.put(`/reimbursements/${id}/reject`, data);
export const deleteReimbursementApi = (id) => api.delete(`/reimbursements/${id}`);
