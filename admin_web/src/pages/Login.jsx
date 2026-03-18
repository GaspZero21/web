// pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';
import { auth } from '../api/api';
import { useAuth } from '../context/AuthContext';       // ← NEW

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();                      // ← NEW

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setError('');
    setLoading(true);
    try {
      await auth.login(email, password);  // sets tokens in localStorage via api.js
      await loginUser();                  // ← fetches /auth/me and stores user in context
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputBase = {
    background: '#FAF9F7',
    border: '1.5px solid #0F5C5C',
    boxShadow: 'none',
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #c8dfd8 0%, #dff0e8 40%, #e8f5ef 100%)' }}
    >
      <div className="absolute top-[-60px] left-[-60px] w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(15,92,92,0.25) 0%, transparent 65%)' }} />
      <div className="absolute bottom-[-40px] right-[-40px] w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(143,176,161,0.35) 0%, transparent 65%)' }} />
      <div className="absolute top-[30%] right-[4%] w-52 h-52 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,110,74,0.12) 0%, transparent 65%)' }} />
      <div className="absolute bottom-[20%] left-[5%] w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(15,92,92,0.15) 0%, transparent 65%)' }} />

      <div className="relative w-full max-w-sm mx-4">
        <div
          className="p-10 rounded-2xl"
          style={{ background: '#ffffff', border: '1.5px solid #0F5C5C', boxShadow: 'none' }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(15,92,92,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div className="mb-8 text-center">
            <img src={logo} alt="Madad" className="object-contain mx-auto mb-4"
              style={{ width: 96, height: 96 }} />
            <h1 className="text-[#1a2e2e] text-2xl"
              style={{ fontFamily: 'DM Serif Display, serif' }}>Madad</h1>
            <p className="text-[#6b8a82] text-[10px] tracking-[3px] mt-1">ADMIN PORTAL</p>
          </div>

          <div className="h-px bg-[#e2ece8] mb-7" />

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div>
              <label className="block text-[#6b8a82] text-xs mb-1.5 font-medium">Email Address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@madad.com" autoComplete="email"
                className="w-full rounded-xl px-4 py-3 text-sm text-[#1a2e2e] placeholder-[#b0c4bc] outline-none"
                style={{ ...inputBase }}
                onMouseEnter={e => { e.target.style.boxShadow = '0 0 0 4px rgba(15,92,92,0.08)'; }}
                onMouseLeave={e => { if (document.activeElement !== e.target) e.target.style.boxShadow = 'none'; }}
                onFocus={e  => { e.target.style.boxShadow = '0 0 0 4px rgba(15,92,92,0.1)'; e.target.style.background = '#fff'; }}
                onBlur={e   => { e.target.style.boxShadow = 'none'; e.target.style.background = '#FAF9F7'; }}
              />
            </div>

            <div>
              <label className="block text-[#6b8a82] text-xs mb-1.5 font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password"
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-[#1a2e2e] placeholder-[#b0c4bc] outline-none"
                  style={{ ...inputBase }}
                  onMouseEnter={e => { e.target.style.boxShadow = '0 0 0 4px rgba(15,92,92,0.08)'; }}
                  onMouseLeave={e => { if (document.activeElement !== e.target) e.target.style.boxShadow = 'none'; }}
                  onFocus={e  => { e.target.style.boxShadow = '0 0 0 4px rgba(15,92,92,0.1)'; e.target.style.background = '#fff'; }}
                  onBlur={e   => { e.target.style.boxShadow = 'none'; e.target.style.background = '#FAF9F7'; }}
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b8a82] text-sm bg-transparent border-none cursor-pointer p-0">
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl px-4 py-2.5 text-xs leading-relaxed"
                style={{ background: '#fde8dc', border: '1px solid #f5c6a8', color: '#8b3d1e' }}>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3 mt-1 text-sm font-semibold text-white border-none cursor-pointer rounded-xl"
              style={{ background: loading ? '#8FB0A1' : '#0F5C5C', boxShadow: 'none' }}
              onMouseEnter={e => { if (!loading) { e.target.style.background = '#1a7a7a'; e.target.style.boxShadow = '0 4px 16px rgba(15,92,92,0.3)'; }}}
              onMouseLeave={e => { if (!loading) { e.target.style.background = '#0F5C5C'; e.target.style.boxShadow = 'none'; }}}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <Link to="/reset-password"
            className="block text-center text-[#6b8a82] text-xs mt-5 no-underline">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}