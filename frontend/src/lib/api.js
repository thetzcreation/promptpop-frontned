import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const adminHeaders = (token) => ({
  headers: { "X-Admin-Token": token, "Content-Type": "application/json" },
});

export const fetchPrompts = (params = {}) =>
  axios.get(`${API}/prompts`, { params }).then((r) => r.data);

export const fetchMeta = () =>
  axios.get(`${API}/prompts/meta`).then((r) => r.data);

export const verifyAdmin = (token) =>
  axios.post(`${API}/admin/verify`, {}, adminHeaders(token)).then((r) => r.data);

export const createPrompt = (payload, token) =>
  axios.post(`${API}/prompts`, payload, adminHeaders(token)).then((r) => r.data);

export const updatePrompt = (id, payload, token) =>
  axios.put(`${API}/prompts/${id}`, payload, adminHeaders(token)).then((r) => r.data);

export const deletePrompt = (id, token) =>
  axios.delete(`${API}/prompts/${id}`, adminHeaders(token)).then((r) => r.data);
