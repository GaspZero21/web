// components/AddUserModal.jsx
import { useState, useEffect } from 'react';

// Only User and Admin roles
const ROLES = ['User', 'Admin'];

const ROLE_COLORS = {
  User:  { bg: '#F5F0E8', color: '#6b8a82' },
  Admin: { bg: '#fde0dc', color: '#7c1a10' },
};

const ROLE_TO_API = {
  User:  'USER',
  Admin: 'ADMIN',
};

const ROLE_ICONS = {
  User:  '👤',
  Admin: '🔑',
};

export default function AddUserModal({ open, onClose, onAdd, defaultRole = 'User', fixedRole = null }) {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [role,     setRole]     = useState(fixedRole || defaultRole);
  const [error,    setError]    = useState('');

  useEffect(() => {
    if (open) {
      setName(''); setEmail(''); setPassword(''); setShowPass(false);
      setRole(fixedRole || defaultRole);
      setError('');
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
      name:     name.trim(),
      email:    email.trim(),
      password: password.trim(),
      role:     ROLE_TO_API[role] ?? 'USER',
    });
    onClose();
  }

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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">

          {/* Role selector — User or Admin only */}
          {!fixedRole && (
            <div>
              <label className="block text-xs font-semibold text-[#6b8a82] mb-2 uppercase tracking-wide">
                Role
              </label>
              <div className="flex gap-3">
                {ROLES.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className="flex-1 py-2.5 text-sm font-semibold border-none cursor-pointer rounded-xl"
                    style={{
                      background: role === r ? ROLE_COLORS[r].bg : '#F5F0E8',
                      color:      role === r ? ROLE_COLORS[r].color : '#6b8a82',
                      outline:    role === r ? `2px solid ${ROLE_COLORS[r].color}` : '2px solid transparent',
                    }}
                  >
                    {ROLE_ICONS[r]} {r}
                  </button>
                ))}
              </div>
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