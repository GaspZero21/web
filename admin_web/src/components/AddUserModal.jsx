// components/AddUserModal.jsx
// Reusable modal for adding a user with a role selector
// Props:
//   open        — boolean
//   onClose     — fn()
//   onAdd       — fn(user)
//   defaultRole — display label: 'Donor' | 'Beneficiary' | 'Association' | 'User'
//   fixedRole   — if set, hides the role selector and forces that role

import { useState, useEffect } from 'react';

// Display labels for the UI buttons
const ROLES = ['Donor', 'Beneficiary', 'Association', 'Food Saver'];

const ROLE_COLORS = {
  Donor:        { bg: '#d6ebe5', color: '#0F5C5C' },
  Beneficiary:  { bg: '#fde8dc', color: '#8b3d1e' },
  Association:  { bg: '#e8e8f0', color: '#3b3b8b' },
  'Food Saver': { bg: '#fff3cd', color: '#7c5c10' },
  User:         { bg: '#F5F0E8', color: '#6b8a82' },
};

// Map display label → API role value
const ROLE_TO_API = {
  Donor:        'DONATOR',
  Beneficiary:  'BENEFICIARY',
  Association:  'COLLECTIVITE',
  'Food Saver': 'FOOD_SAVER',
  User:         'USER',
};

// Map API role value → display label (for showing fixed role badge)
const API_TO_LABEL = {
  DONATOR:      'Donor',
  BENEFICIARY:  'Beneficiary',
  COLLECTIVITE: 'Association',
  FOOD_SAVER:   'Food Saver',
  ADMIN:        'Admin',
  USER:         'User',
};

const ROLE_ICONS = {
  Donor:        '🤲',
  Beneficiary:  '🍽',
  Association:  '🏢',
  'Food Saver': '🌱',
  User:         '👤',
};

export default function AddUserModal({ open, onClose, onAdd, defaultRole = 'Donor', fixedRole = null }) {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [role,     setRole]     = useState(fixedRole || defaultRole);
  const [status,   setStatus]   = useState('active');
  const [error,    setError]    = useState('');

  // Reset form when opened
  useEffect(() => {
    if (open) {
      setName(''); setEmail(''); setPassword(''); setShowPass(false);
      setRole(fixedRole || defaultRole);
      setStatus('active'); setError('');
    }
  }, [open, defaultRole, fixedRole]);

  if (!open) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim())     { setError('Name is required.');              return; }
    if (!email.trim())    { setError('Email is required.');             return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email.'); return; }
    if (!password.trim()) { setError('Password is required.');          return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    onAdd({
      id:       Date.now(),
      name:     name.trim(),
      email:    email.trim(),
      phone:    undefined,
      password: password.trim(),
      role:     ROLE_TO_API[role] ?? 'USER',
      status,
      joined:   new Date().toISOString().slice(0, 10),
      donations: 0,
      avatar:   name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    });
    onClose();
  }

  const roleColor = ROLE_COLORS[role] || ROLE_COLORS.User;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(15,92,92,0.2)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-4 overflow-hidden bg-white rounded-2xl"
        style={{ boxShadow: '0 24px 60px rgba(15,92,92,0.18)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0F5C5C] px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'DM Serif Display, serif' }}>
              Add New User
            </h2>
            <p className="text-white/50 text-xs mt-0.5">Fill in the details below</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 text-lg leading-none text-white border-none cursor-pointer rounded-xl bg-white/10"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">

          {/* Role selector — shown unless fixedRole is set */}
          {!fixedRole && (
            <div>
              <label className="block text-xs font-semibold text-[#6b8a82] mb-2 uppercase tracking-wide">
                Role
              </label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className="flex-1 py-2 text-xs font-semibold border-none cursor-pointer rounded-xl"
                    style={{
                      minWidth: '80px',
                      background: role === r ? ROLE_COLORS[r].bg : '#F5F0E8',
                      color:      role === r ? ROLE_COLORS[r].color : '#6b8a82',
                      outline:    role === r ? `2px solid ${ROLE_COLORS[r].color}` : '2px solid transparent',
                    }}
                  >
                    {ROLE_ICONS[r] || '👤'} {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fixed role badge */}
          {fixedRole && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#6b8a82] uppercase tracking-wide">Role:</span>
              <span
                className="px-3 py-1 text-xs font-semibold rounded-full"
                style={{ background: roleColor.bg, color: roleColor.color }}
              >
                {ROLE_ICONS[fixedRole] || '👤'}{' '}
                {API_TO_LABEL[ROLE_TO_API[fixedRole]] ?? fixedRole}
              </span>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-[#6b8a82] mb-1.5 uppercase tracking-wide">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Sara Ahmed"
              className="w-full rounded-xl px-4 py-2.5 text-sm border border-[#e2ece8] bg-[#FAF9F7] text-[#1a2e2e] outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-[#6b8a82] mb-1.5 uppercase tracking-wide">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. sara@gmail.com"
              className="w-full rounded-xl px-4 py-2.5 text-sm border border-[#e2ece8] bg-[#FAF9F7] text-[#1a2e2e] outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-[#6b8a82] mb-1.5 uppercase tracking-wide">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full rounded-xl px-4 py-2.5 pr-11 text-sm border border-[#e2ece8] bg-[#FAF9F7] text-[#1a2e2e] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b8a82] text-sm bg-transparent border-none cursor-pointer p-0"
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
            <p className="text-[10px] text-[#6b8a82] mt-1">
              This password will be assigned to the user's account.
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-[#6b8a82] mb-1.5 uppercase tracking-wide">
              Status
            </label>
            <div className="flex gap-2">
              {['active', 'pending', 'blocked'].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className="flex-1 py-2 text-xs font-medium capitalize border-none cursor-pointer rounded-xl"
                  style={{
                    background: status === s
                      ? s === 'active' ? '#d6ebe5' : s === 'pending' ? '#fef3cd' : '#fde0dc'
                      : '#F5F0E8',
                    color: status === s
                      ? s === 'active' ? '#0F5C5C' : s === 'pending' ? '#7c5c10' : '#7c1a10'
                      : '#6b8a82',
                    outline: status === s ? '2px solid currentColor' : '2px solid transparent',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="rounded-xl px-4 py-2.5 text-xs"
              style={{ background: '#fde8dc', color: '#8b3d1e', border: '1px solid #f5c6a8' }}
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-[#e2ece8] bg-white text-[#6b8a82] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white border-none cursor-pointer"
              style={{ background: '#0F5C5C' }}
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}