// pages/Profile.jsx
import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getToken } from '../api/api';

const BASE_URL = 'https://gasp-test-production.up.railway.app';

async function apiPatch(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data.message || data.error || `${res.status}`);
  return data;
}

async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file);
  const res = await fetch(`${BASE_URL}/api/v1/users/me/avatar`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data.message || data.error || `${res.status}`);
  return data;
}

export default function Profile() {
  const { user, refreshUser } = useAuth();

  const [name,        setName]        = useState(user?.name        || '');
  const [email,       setEmail]       = useState(user?.email       || '');
  const [bio,         setBio]         = useState(user?.bio         || '');
  const [city,        setCity]        = useState(user?.city        || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [password,    setPassword]    = useState('');

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarFile,    setAvatarFile]    = useState(null);

  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');

  const fileRef = useRef();

  const initials = name
    ? name.split(' ').filter(Boolean).map(p => p[0].toUpperCase()).slice(0, 2).join('')
    : email
    ? email.split('@')[0].split(/[._-]/).filter(Boolean).map(p => p[0].toUpperCase()).slice(0, 2).join('')
    : 'AD';

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      // 1. Upload avatar if a new file was chosen
      if (avatarFile) {
        const avatarData = await uploadAvatar(avatarFile);
        // Avatar endpoint returns { data: { user: { avatar: url } } }
        const newAvatarUrl =
          avatarData?.data?.user?.avatar ??
          avatarData?.data?.avatar ??
          avatarData?.avatar ??
          avatarPreview;
        setAvatarPreview(newAvatarUrl);
        setAvatarFile(null);
      }

      // 2. Patch profile fields
      const body = { name, bio, city, phoneNumber };
      if (password) body.password = password;

      // ✅ The PATCH response returns { success, message, data: { user: {...} } }
      // Pass it directly to refreshUser so it unwraps and saves without a second request
      const patchResponse = await apiPatch('/api/v1/users/me', body);
      await refreshUser(patchResponse);

      setPassword('');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col max-w-2xl gap-5">
      <div>
        <h1
          className="text-xl font-semibold text-[#1a2e2e]"
          style={{ fontFamily: 'DM Serif Display, serif' }}
        >
          Profile
        </h1>
        <p className="text-sm text-[#6b8a82] mt-0.5">Manage your admin account</p>
      </div>

      <div
        className="bg-white rounded-2xl border border-[#e2ece8] overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}
      >
        <div className="bg-[#0F5C5C] px-6 py-8 flex items-center gap-5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            title="Click to change avatar"
            style={{
              width: 64, height: 64, borderRadius: 16,
              background: '#C96E4A',
              border: '3px solid rgba(255,255,255,0.25)',
              overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, position: 'relative',
            }}
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={() => setAvatarPreview(null)}
              />
            ) : (
              <span style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>{initials}</span>
            )}
            <span style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transition: 'opacity .2s',
              fontSize: 18,
            }}
              className="avatar-overlay"
            >📷</span>
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <div>
            <h2 className="text-lg font-semibold text-white">{name || email}</h2>
            <p className="text-white/60 text-sm mt-0.5">{email}</p>
            <span className="mt-2 inline-block text-xs bg-white/15 text-white px-2.5 py-0.5 rounded-full">
              {user?.role
                ? user.role.charAt(0) + user.role.slice(1).toLowerCase()
                : 'Admin'}
            </span>
            {avatarFile && (
              <p className="text-white/70 text-xs mt-1.5">
                📷 New avatar ready — save to upload
              </p>
            )}
          </div>
        </div>

        {error && (
          <div
            className="px-4 py-3 mx-6 mt-4 text-sm rounded-xl"
            style={{ background: '#fde8dc', color: '#8b3d1e', border: '1px solid #f5c6a8' }}
          >
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-5 p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[#6b8a82] mb-2 uppercase tracking-wide">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full rounded-xl px-4 py-3 text-sm border border-[#e2ece8] bg-[#FAF9F7] text-[#1a2e2e] outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[#6b8a82] mb-2 uppercase tracking-wide">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="+33612345678"
                className="w-full rounded-xl px-4 py-3 text-sm border border-[#e2ece8] bg-[#FAF9F7] text-[#1a2e2e] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6b8a82] mb-2 uppercase tracking-wide">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl px-4 py-3 text-sm border border-[#e2ece8] bg-[#FAF9F7] text-[#1a2e2e] outline-none"
            />
          </div>

          <div className="flex gap-4">
            <div style={{ width: 180 }}>
              <label className="block text-xs font-semibold text-[#6b8a82] mb-2 uppercase tracking-wide">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Paris"
                className="w-full rounded-xl px-4 py-3 text-sm border border-[#e2ece8] bg-[#FAF9F7] text-[#1a2e2e] outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[#6b8a82] mb-2 uppercase tracking-wide">
                Bio
              </label>
              <input
                type="text"
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Food lover and sustainability advocate"
                className="w-full rounded-xl px-4 py-3 text-sm border border-[#e2ece8] bg-[#FAF9F7] text-[#1a2e2e] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6b8a82] mb-2 uppercase tracking-wide">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Leave blank to keep current"
              className="w-full rounded-xl px-4 py-3 text-sm border border-[#e2ece8] bg-[#FAF9F7] text-[#1a2e2e] outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="self-start px-6 py-3 text-sm font-semibold text-white border-none cursor-pointer rounded-xl"
            style={{ background: saved ? '#2d7d6b' : '#0F5C5C', transition: 'background .3s' }}
          >
            {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </form>
      </div>

      <style>{`
        button:hover .avatar-overlay { opacity: 1 !important; }
      `}</style>
    </div>
  );
}