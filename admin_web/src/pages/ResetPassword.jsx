// pages/ResetPassword.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.svg';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [sent,  setSent]  = useState(false);

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
      {/* Decorative blobs — same as Login */}
      <div className="absolute top-[-60px] left-[-60px] w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(15,92,92,0.25) 0%, transparent 65%)' }} />
      <div className="absolute bottom-[-40px] right-[-40px] w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(143,176,161,0.35) 0%, transparent 65%)' }} />
      <div className="absolute top-[30%] right-[4%] w-52 h-52 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,110,74,0.12) 0%, transparent 65%)' }} />
      <div className="absolute bottom-[20%] left-[5%] w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(15,92,92,0.15) 0%, transparent 65%)' }} />

      <div className="relative w-full max-w-sm mx-4">
        {/* Card — teal stroke always on, shadow only on hover */}
        <div
          className="p-10 rounded-2xl"
          style={{ background: '#ffffff', border: '1.5px solid #0F5C5C', boxShadow: 'none' }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(15,92,92,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
        >
          {/* Logo */}
          <div className="mb-8 text-center">
            <img
              src={logo}
              alt="Madad"
              className="object-contain mx-auto mb-4"
              style={{ width: 96, height: 96 }}
            />
            <h2
              className="text-[#1a2e2e] text-2xl"
              style={{ fontFamily: 'DM Serif Display, serif' }}
            >
              Reset Password
            </h2>
            <p className="text-[#6b8a82] text-[10px] tracking-[3px] mt-1">ADMIN PORTAL</p>
          </div>

          <div className="h-px bg-[#e2ece8] mb-7" />

          {sent ? (
            <div className="py-4 text-center">
              <div className="mb-4 text-5xl">📬</div>
              <p className="text-[#1a2e2e] text-sm font-medium">Reset link sent!</p>
              <p className="text-[#6b8a82] text-xs mt-1 mb-6">Check your inbox.</p>
              <Link to="/"
                className="text-xs font-semibold text-[#0F5C5C] no-underline">
                ← Back to login
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[#6b8a82] text-xs mb-1.5 font-medium">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@madad.com"
                  className="w-full rounded-xl px-4 py-3 text-sm text-[#1a2e2e] placeholder-[#b0c4bc] outline-none"
                  style={{ ...inputBase }}
                  onMouseEnter={e => { e.target.style.boxShadow = '0 0 0 4px rgba(15,92,92,0.08)'; }}
                  onMouseLeave={e => { if (document.activeElement !== e.target) e.target.style.boxShadow = 'none'; }}
                  onFocus={e =>  { e.target.style.boxShadow = '0 0 0 4px rgba(15,92,92,0.1)'; e.target.style.background = '#fff'; }}
                  onBlur={e =>   { e.target.style.boxShadow = 'none'; e.target.style.background = '#FAF9F7'; }}
                />
              </div>

              <button
                onClick={() => email && setSent(true)}
                className="w-full py-3 text-sm font-semibold text-white border-none cursor-pointer rounded-xl"
                style={{ background: '#0F5C5C', boxShadow: 'none' }}
                onMouseEnter={e => { e.target.style.background = '#1a7a7a'; e.target.style.boxShadow = '0 4px 16px rgba(15,92,92,0.3)'; }}
                onMouseLeave={e => { e.target.style.background = '#0F5C5C'; e.target.style.boxShadow = 'none'; }}
              >
                Send Reset Link
              </button>

              <Link to="/"
                className="block text-center text-[#6b8a82] text-xs no-underline">
                ← Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}