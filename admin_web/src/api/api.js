// src/api/api.js
const BASE_URL = 'https://gasp-test-production.up.railway.app';

export const getToken        = ()    => localStorage.getItem('madad_access_token');
export const getRefreshToken = ()    => localStorage.getItem('madad_refresh_token');
export const setTokens       = (a,r) => {
  localStorage.setItem('madad_access_token',  a);
  if (r) localStorage.setItem('madad_refresh_token', r);
};
export const removeTokens = () => {
  localStorage.removeItem('madad_access_token');
  localStorage.removeItem('madad_refresh_token');
};
export const isLoggedIn = () => !!getToken();

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body !== null) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);

  if (res.status === 401) {
    removeTokens();
    window.location.href = '/';
    return;
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    console.error(`[API] ${method} ${path} → ${res.status}`, data);
    // Include status code in message so callers can detect 409 etc.
    throw new Error(`${res.status}:${data.message || data.error || JSON.stringify(data)}`);
  }

  return data;
}

const get   = (path)       => request('GET',    path);
const post  = (path, body) => request('POST',   path, body);
const patch = (path, body) => request('PATCH',  path, body);
const del   = (path, body) => request('DELETE', path, body ?? null);

// ─── AUTH ───────────────────────────────────────────────────────
export const auth = {
  login: async (email, password) => {
    const data = await post('/api/v1/auth/login', { email, password });
    const access  = data?.accessToken  ?? data?.token ?? data?.data?.accessToken;
    const refresh = data?.refreshToken ?? data?.data?.refreshToken;
    if (access) setTokens(access, refresh);
    else throw new Error('Login succeeded but no token returned.');
    return data;
  },
  logout: async () => {
    try {
      const refresh = getRefreshToken();
      if (refresh) await post('/api/v1/auth/logout', { refreshToken: refresh });
    } catch (_) {}
    finally { removeTokens(); }
  },
  me: () => get('/api/v1/auth/me'),
  forgotPassword: (email) => post('/api/v1/auth/forgot-password', { email }),
  resetPassword:  (token, password) => post('/api/v1/auth/reset-password', { token, password }),
  refresh: async () => {
    const refresh = getRefreshToken();
    if (!refresh) throw new Error('No refresh token');
    const data = await post('/api/v1/auth/refresh', { refreshToken: refresh });
    if (data?.accessToken) setTokens(data.accessToken, data.refreshToken);
    return data;
  },
};

// ─── Role mapping ───────────────────────────────────────────────
// Maps any variation → the exact string the backend accepts
const ROLE_MAP = {
  DONOR:        'DONATOR',
  DONATOR:      'DONATOR',
  BENEFICIARY:  'BENEFICIARY',
  ASSOCIATION:  'COLLECTIVITE',
  COLLECTIVITE: 'COLLECTIVITE',
  FOOD_SAVER:   'FOOD_SAVER',
  ADMIN:        'ADMIN',
  USER:         'USER',
};

export function toApiRole(role) {
  return ROLE_MAP[(role ?? 'USER').toUpperCase()] ?? 'USER';
}
export function fromApiRole(role) {
  const r = (role ?? '').toUpperCase();
  if (r === 'DONATOR')      return 'Donor';
  if (r === 'COLLECTIVITE') return 'Association';
  if (r === 'FOOD_SAVER')   return 'Food Saver';
  if (r === 'BENEFICIARY')  return 'Beneficiary';
  return r.charAt(0) + r.slice(1).toLowerCase();
}

// ─── ADMIN — USERS ──────────────────────────────────────────────
export const adminUsers = {
  getAll: (page = 1, limit = 200) =>
    get(`/api/v1/admin/users?page=${page}&limit=${limit}`),

  getById: (id) =>
    get(`/api/v1/admin/users/${id}`),

  // Swagger: { name*, email*, password*, role }
  // role example from docs: "USER" — we send mapped value e.g. "DONATOR"
  create: (data) => {
    const body = {
      name:     data.name,
      email:    data.email,
      password: data.password,
      role:     toApiRole(data.role),
    };
    console.log('[API] POST /admin/users →', body);
    return post('/api/v1/admin/users', body);
  },

  delete: (id) => del(`/api/v1/admin/users/${id}`),

  // Swagger: { role } — sends role string directly, no double-mapping
  assignRole: (id, role) => {
    const body = { role: toApiRole(role) };
    console.log(`[API] POST /admin/users/${id}/roles →`, body);
    return post(`/api/v1/admin/users/${id}/roles`, body);
  },

  removeRole: (id, role) =>
    del(`/api/v1/admin/users/${id}/roles`, { role: toApiRole(role) }),

  promote: (id) =>
    post(`/api/v1/admin/users/${id}/promote`),

  ban:        (id) => patch(`/api/v1/admin/users/${id}/status`, { isActive: false, isBanned: true  }),
  unban:      (id) => patch(`/api/v1/admin/users/${id}/status`, { isActive: true,  isBanned: false }),
  deactivate: (id) => patch(`/api/v1/admin/users/${id}/status`, { isActive: false, isBanned: false }),
  activate:   (id) => patch(`/api/v1/admin/users/${id}/status`, { isActive: true,  isBanned: false }),

  setStatus: (id, status) => {
    if (status === 'banned')   return patch(`/api/v1/admin/users/${id}/status`, { isActive: false, isBanned: true  });
    if (status === 'inactive') return patch(`/api/v1/admin/users/${id}/status`, { isActive: false, isBanned: false });
    return patch(`/api/v1/admin/users/${id}/status`, { isActive: true, isBanned: false });
  },
};