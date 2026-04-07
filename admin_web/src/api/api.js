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
    throw new Error(`${res.status}:${data.message || data.error || JSON.stringify(data)}`);
  }

  return data;
}

const get   = (path)       => request('GET',    path);
const post  = (path, body) => request('POST',   path, body);
const put   = (path, body) => request('PUT',    path, body);
const patch = (path, body) => request('PATCH',  path, body);
const del   = (path, body) => request('DELETE', path, body ?? null);

// ─── AUTH ────────────────────────────────────────────────────────
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
  me:             () => get('/api/v1/auth/me'),
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

// ─── Role mapping ────────────────────────────────────────────────
const ROLE_MAP = {
  DONOR: 'DONATOR', DONATOR: 'DONATOR', BENEFICIARY: 'BENEFICIARY',
  ASSOCIATION: 'COLLECTIVITE', COLLECTIVITE: 'COLLECTIVITE',
  FOOD_SAVER: 'FOOD_SAVER', ADMIN: 'ADMIN', USER: 'USER',
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

// ─── ADMIN — USERS ───────────────────────────────────────────────
export const adminUsers = {
  getAll:   (page = 1, limit = 200) => get(`/api/v1/admin/users?page=${page}&limit=${limit}`),
  getById:  (id) => get(`/api/v1/admin/users/${id}`),
  create: (data) => {
    const body = { name: data.name, email: data.email, password: data.password, role: toApiRole(data.role) };
    return post('/api/v1/admin/users', body);
  },
  delete:     (id)       => del(`/api/v1/admin/users/${id}`),
  assignRole: (id, role) => post(`/api/v1/admin/users/${id}/roles`, { role: toApiRole(role) }),
  removeRole: (id, role) => del(`/api/v1/admin/users/${id}/roles`, { role: toApiRole(role) }),
  promote:    (id)       => post(`/api/v1/admin/users/${id}/promote`),
  ban:        (id)       => patch(`/api/v1/admin/users/${id}/status`, { isActive: false, isBanned: true  }),
  unban:      (id)       => patch(`/api/v1/admin/users/${id}/status`, { isActive: true,  isBanned: false }),
  deactivate: (id)       => patch(`/api/v1/admin/users/${id}/status`, { isActive: false, isBanned: false }),
  activate:   (id)       => patch(`/api/v1/admin/users/${id}/status`, { isActive: true,  isBanned: false }),
  setStatus: (id, status) => {
    if (status === 'banned')   return patch(`/api/v1/admin/users/${id}/status`, { isActive: false, isBanned: true  });
    if (status === 'inactive') return patch(`/api/v1/admin/users/${id}/status`, { isActive: false, isBanned: false });
    return patch(`/api/v1/admin/users/${id}/status`, { isActive: true, isBanned: false });
  },
};

// ─── DONATIONS ───────────────────────────────────────────────────
function extractDonations(res) {
  if (!res) return [];
  if (Array.isArray(res))                            return res;
  if (Array.isArray(res.data))                       return res.data;
  if (Array.isArray(res.donations))                  return res.donations;
  if (res.data && Array.isArray(res.data.donations)) return res.data.donations;
  if (res.data && Array.isArray(res.data.data))      return res.data.data;
  return [];
}
export const donationsApi = {
  // GET /api/v1/donations/all — admin endpoint, returns ALL donations regardless of status
  // Falls back to /api/v1/donations if the admin endpoint fails
  getAll: async () => {
    try {
      const res = await get('/api/v1/donations/all');
      const list = extractDonations(res);
      if (list.length > 0) return list;
    } catch (_) {}
    // fallback
    try {
      return extractDonations(await get('/api/v1/donations'));
    } catch (_) {
      return [];
    }
  },
  getById:  (id)   => get(`/api/v1/donations/${id}`),
  create:   (body) => post('/api/v1/donations', body),
  update:   (id, body) => put(`/api/v1/donations/${id}`, body),
  cancel:   (id)   => patch(`/api/v1/donations/${id}/cancel`),
  complete: (id)   => patch(`/api/v1/donations/${id}/complete`),
};


// ─── RESERVATIONS ───────────────────────────────────────────────
function extractReservations(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.reservations)) return res.reservations;
  if (res.data && Array.isArray(res.data.reservations)) return res.data.reservations;
  return [];
}

export const reservationsApi = {
  // GET /api/v1/reservations/admin/all
  getAll: async () => {
    try {
      const res = await get('/api/v1/reservations/admin/all');
      return extractReservations(res);
    } catch (e) {
      console.error('Failed to fetch reservations', e);
      return [];
    }
  },
};


// ─── CHAT ────────────────────────────────────────────────────────
// REST endpoints (Socket.io handles real-time delivery):
//   GET   /api/v1/chat/{reservationId}                           — get conversation + messages
//   POST  /api/v1/chat/{reservationId}/messages                  — send a message
//   POST  /api/v1/chat/{reservationId}/messages/{msgId}/report   — report a message
// Admin only:
//   GET   /api/v1/chat/admin/flagged                             — list flagged messages
//   PATCH /api/v1/chat/admin/messages/{msgId}/moderate           — hide or restore a message

function extractMessages(res) {
  if (!res) return [];
  if (Array.isArray(res))                return res;
  if (Array.isArray(res.messages))       return res.messages;
  if (Array.isArray(res.data))           return res.data;
  if (Array.isArray(res.data?.messages)) return res.data.messages;
  return [];
}

export const chatApi = {
  // Get all messages for a reservation/conversation
  getConversation: async (reservationId) => {
    const res = await get(`/api/v1/chat/${reservationId}`);
    return {
      messages:       extractMessages(res),
      conversationId: res?.conversationId ?? res?.data?.conversationId ?? reservationId,
      raw:            res,
    };
  },

  // Send a message into a conversation
  sendMessage: (reservationId, content) =>
    post(`/api/v1/chat/${reservationId}/messages`, { content }),

  // Report a message
  reportMessage: (reservationId, messageId, reason) =>
    post(`/api/v1/chat/${reservationId}/messages/${messageId}/report`, { reason }),

  // Admin: get all flagged messages
  getFlagged: () => get('/api/v1/chat/admin/flagged'),

  // Admin: hide or restore a flagged message
  moderate: (messageId, action) =>
    patch(`/api/v1/chat/admin/messages/${messageId}/moderate`, { action }),
};

// ─── SOCKET.IO helper ────────────────────────────────────────────
// Usage:
//   const socket = createSocket();
//   socket.emit('join_conversation', { reservationId });
//   socket.on('new_message', (msg) => { ... });
//   socket.on('joined', ({ room, conversationId }) => { ... });
//   socket.on('error', ({ message }) => { ... });
//   socket.disconnect();

export function createSocket() {
  // Socket.io is loaded dynamically in Chat.jsx via CDN
  const io = window.io;
  if (!io) throw new Error('Socket.io not loaded yet');
  return io(BASE_URL, {
    auth: { token: getToken() },
    transports: ['websocket', 'polling'],
  });
}