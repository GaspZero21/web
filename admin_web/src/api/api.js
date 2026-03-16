// src/api/api.js
// GaspZero API — https://gasp-test-production.up.railway.app
// All endpoints confirmed from Swagger docs

const BASE_URL = 'https://gasp-test-production.up.railway.app';

// ─── Token helpers ─────────────────────────────────────────────
export const getToken        = ()    => localStorage.getItem('madad_access_token');
export const getRefreshToken = ()    => localStorage.getItem('madad_refresh_token');
export const setTokens       = (a,r) => {
  localStorage.setItem('madad_access_token',  a);
  if (r) localStorage.setItem('madad_refresh_token', r);
};
export const removeTokens    = ()    => {
  localStorage.removeItem('madad_access_token');
  localStorage.removeItem('madad_refresh_token');
};
export const isLoggedIn      = ()    => !!getToken();

// ─── Core request ──────────────────────────────────────────────
async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body !== null) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);

  // Token expired → try to redirect
  if (res.status === 401) {
    removeTokens();
    window.location.href = '/';
    return;
  }

  // Parse JSON — handle empty responses (204 etc.)
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw new Error(data.message || data.error || `Error ${res.status}`);
  }

  return data;
}

const get   = (path)        => request('GET',    path);
const post  = (path, body)  => request('POST',   path, body);
const patch = (path, body)  => request('PATCH',  path, body);
const del   = (path, body)  => request('DELETE', path, body ?? null);

// ─── AUTH ──────────────────────────────────────────────────────
// POST /api/v1/auth/login          { email, password } → { accessToken, refreshToken }
// POST /api/v1/auth/logout         revoke refresh token
// GET  /api/v1/auth/me             get current user
// POST /api/v1/auth/forgot-password { email }
// POST /api/v1/auth/reset-password  { token, password }
// POST /api/v1/auth/refresh         get new accessToken

export const auth = {
  login: async (email, password) => {
    const data = await post('/api/v1/auth/login', { email, password });
    // Response: { accessToken, refreshToken }
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
    } catch (_) {
      // silent fail — still remove tokens locally
    } finally {
      removeTokens();
    }
  },

  me: () => get('/api/v1/auth/me'),

  forgotPassword: (email) =>
    post('/api/v1/auth/forgot-password', { email }),

  resetPassword: (token, password) =>
    post('/api/v1/auth/reset-password', { token, password }),

  refresh: async () => {
    const refresh = getRefreshToken();
    if (!refresh) throw new Error('No refresh token');
    const data = await post('/api/v1/auth/refresh', { refreshToken: refresh });
    if (data?.accessToken) setTokens(data.accessToken, data.refreshToken);
    return data;
  },
};

// ─── Role name mapping ─────────────────────────────────────────
// UI label  →  API value
const ROLE_MAP = {
  DONOR:       'DONATOR',
  DONATOR:     'DONATOR',
  BENEFICIARY: 'BENEFICIARY',
  ASSOCIATION: 'COLLECTIVITE',
  COLLECTIVITE:'COLLECTIVITE',
  FOOD_SAVER:  'FOOD_SAVER',
  ADMIN:       'ADMIN',
  USER:        'USER',
};
export function toApiRole(role) {
  return ROLE_MAP[(role ?? 'USER').toUpperCase()] ?? 'USER';
}
// API value  →  UI display label
export function fromApiRole(role) {
  const r = (role ?? '').toUpperCase();
  if (r === 'DONATOR')      return 'Donor';
  if (r === 'COLLECTIVITE') return 'Association';
  if (r === 'FOOD_SAVER')   return 'Food Saver';
  if (r === 'BENEFICIARY')  return 'Beneficiary';
  return r.charAt(0) + r.slice(1).toLowerCase();
}

// ─── ADMIN — USERS ─────────────────────────────────────────────
// GET    /api/v1/admin/users?page=1&limit=20   → paginated list
// POST   /api/v1/admin/users                   → { name, email, password, role }
// GET    /api/v1/admin/users/{id}              → full user details
// DELETE /api/v1/admin/users/{id}
// POST   /api/v1/admin/users/{id}/roles        → { role: "FOOD_SAVER" }
// DELETE /api/v1/admin/users/{id}/roles        → { role: "FOOD_SAVER" }
// POST   /api/v1/admin/users/{id}/promote      → promote to Food Saver
// PATCH  /api/v1/admin/users/{id}/status       → { isActive: bool, isBanned: bool }

export const adminUsers = {
  getAll: (page = 1, limit = 20) =>
    get(`/api/v1/admin/users?page=${page}&limit=${limit}`),

  getById: (id) =>
    get(`/api/v1/admin/users/${id}`),

  // body: { name, email, password, role }
  // Valid roles: USER | DONATOR | BENEFICIARY | FOOD_SAVER | ADMIN | COLLECTIVITE
  create: (data) =>
    post('/api/v1/admin/users', {
      name:     data.name,
      email:    data.email,
      password: data.password,
      role:     toApiRole(data.role),
    }),

  delete: (id) =>
    del(`/api/v1/admin/users/${id}`),

  // Assign a role: { role: "FOOD_SAVER" }
  assignRole: (id, role) =>
    post(`/api/v1/admin/users/${id}/roles`, { role: role.toUpperCase() }),

  // Remove a role (cannot remove USER): { role: "FOOD_SAVER" }
  removeRole: (id, role) =>
    del(`/api/v1/admin/users/${id}/roles`, { role: role.toUpperCase() }),

  // Promote to Food Saver (requires reputationScore >= 50)
  promote: (id) =>
    post(`/api/v1/admin/users/${id}/promote`),

  // Ban: { isActive: false, isBanned: true }
  // Unban: { isActive: true, isBanned: false }
  // Deactivate: { isActive: false, isBanned: false }
  ban:        (id) => patch(`/api/v1/admin/users/${id}/status`, { isActive: false, isBanned: true  }),
  unban:      (id) => patch(`/api/v1/admin/users/${id}/status`, { isActive: true,  isBanned: false }),
  deactivate: (id) => patch(`/api/v1/admin/users/${id}/status`, { isActive: false, isBanned: false }),
  activate:   (id) => patch(`/api/v1/admin/users/${id}/status`, { isActive: true,  isBanned: false }),
};