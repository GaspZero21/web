// components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { FaComments, FaBell } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ title = 'Dashboard' }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.name
    || user?.email?.split('@')[0]?.replace(/[._-]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
    || 'Admin';

  const avatarUrl = user?.avatar || null;

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(p => p[0].toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <header
      className="bg-white border-b border-[#e2ece8] h-16 flex items-center justify-between px-6 flex-shrink-0"
      style={{ boxShadow: '0 1px 8px rgba(15,92,92,0.05)' }}
    >
      <h2
        className="text-lg font-semibold text-[#1a2e2e]"
        style={{ fontFamily: 'DM Serif Display, serif' }}
      >
        {title}
      </h2>

      <div className="flex items-center gap-3">
        {user && (
          <div className="flex-col items-end hidden mr-1 sm:flex">
            <span className="text-xs font-semibold text-[#1a2e2e] leading-tight">
              {displayName}
            </span>
            <span className="text-[10px] text-[#6b8a82] leading-tight">
              {user.email}
            </span>
          </div>
        )}

        <button className="relative w-9 h-9 rounded-xl bg-[#F5F0E8] flex items-center justify-center text-[#0F5C5C] border-none cursor-pointer">
          <FaBell size={15} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C96E4A] rounded-full" />
        </button>

        <Link
          to="/chat"
          className="flex items-center gap-2 bg-[#0F5C5C] text-white px-4 py-2 rounded-xl text-sm font-medium no-underline"
        >
          <FaComments size={14} />
          Chat
        </Link>

        <div className="w-px h-6 bg-[#e2ece8]" />

        {/* ✅ Avatar — click goes to /profile, shows uploaded image or initials */}
        <button
          onClick={() => navigate('/profile')}
          title="Go to profile"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: '#C96E4A',
            border: '2px solid #e2ece8',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            padding: 0,
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>
              {initials || 'AD'}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}