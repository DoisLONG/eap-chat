// src/services/monitor.service.js
import axios from 'axios';

// 建议：在 vite.config.js 加 /api 代理到你的 monitor-svc
// 这里统一走 /api 前缀
const api = axios.create({
  baseURL: '/monitor-api',
  timeout: 15000,
});

// ===== Targets =====
export const getTargets = (params) => api.get('/targets', { params });
export const getTargetDetail = (id) => api.get(`/targets/${id}`);
export const createTarget = (data) => api.post('/targets', data);
export const updateTarget = (id, data) => api.put(`/targets/${id}`, data);
export const deleteTarget = (id) => api.delete(`/targets/${id}`);
export const checkTargetOnce = (id) => api.post(`/targets/${id}/check`);

// ===== Contacts =====
export const getContacts = () => api.get('/contacts');
export const createContact = (data) => api.post('/contacts', data);
export const updateContact = (id, data) => api.put(`/contacts/${id}`, data);
export const deleteContact = (id) => api.delete(`/contacts/${id}`);

// ===== Subscriptions =====
export const getSubscriptions = (targetId) => api.get(`/subscriptions/${targetId}`);
export const addSubscription = (data) => api.post('/subscriptions', data); // {targetId, contactId}
export const removeSubscription = (id) => api.delete(`/subscriptions/${id}`);

// ===== Alerts（可选：告警列表）=====
export const getAlerts = (params) => api.get('/alerts', { params });
