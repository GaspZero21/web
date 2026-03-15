// components/Sidebar.jsx
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt, FaUsers, FaHandHoldingHeart,
  FaMapMarkedAlt, FaCogs, FaSignOutAlt, FaDonate,
  FaUser, FaBuilding
} from 'react-icons/fa';
import logo from '../assets/logo.svg';

const NAV = [
  { label: 'Dashboard',     icon: <FaTachometerAlt />, path: '/dashboard' },
  { label: 'Users',         icon: <FaUsers />,          path: '/users' },
  { label: 'Donors',        icon: <FaHandHoldingHeart />, path: '/donors' },
  { label: 'Beneficiaries', icon: <FaUsers />,          path: '/beneficiaries' },
  { label: 'Associations',  icon: <FaBuilding />,       path: '/associations' },
  { label: 'Donations',     icon: <FaDonate />,         path: '/donations' },
  { label: 'Map',           icon: <FaMapMarkedAlt />,   path: '/map' },
  { label: 'Profile',       icon: <FaUser />,           path: '/profile' },
  { label: 'Settings',      icon: <FaCogs />,           path: '/settings' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    // Clear any auth tokens here if needed
    navigate('/', { replace: true });
  }

  return (
    <aside
      style={{ width: collapsed ? 72 : 224, background: '#0F5C5C', flexShrink: 0 }}
      className="h-screen flex flex-col sticky top-0 overflow-y-auto"
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 mb-1">
        <img
          src={logo}
          alt="Madad"
          className="object-contain flex-shrink-0"
          style={{ width: 44, height: 44, filter: 'brightness(0) invert(1)' }}
        />
        {!collapsed && (
          <div>
            <div className="text-white font-semibold text-lg leading-none"
              style={{ fontFamily: 'DM Serif Display, serif' }}>
              Madad
            </div>
            <div className="text-white/40 text-[9px] tracking-[2.5px] mt-0.5">ADMIN</div>
          </div>
        )}
      </div>

      <div className="mx-4 h-px bg-white/10 mb-4" />

      {/* Nav */}
      <nav className="flex-1 px-2 flex flex-col gap-1">
        {NAV.map(item => {
          const active = pathname === item.path || pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl no-underline"
              style={{
                color: active ? 'white' : 'rgba(255,255,255,0.55)',
                background: active ? 'rgba(255,255,255,0.13)' : 'transparent',
                fontWeight: active ? 600 : 400,
                fontSize: 13.5,
              }}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C96E4A]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 h-px bg-white/10 my-3" />

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="mx-2 mb-2 flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer border-none"
        style={{ background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}
      >
        <span className="text-base flex-shrink-0">{collapsed ? '→' : '←'}</span>
        {!collapsed && <span>Collapse</span>}
      </button>

      {/* Logout — button that navigates to login */}
      <button
        onClick={handleLogout}
        className="mx-2 mb-4 flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer border-none"
        style={{ background: 'transparent', color: 'rgba(255,255,255,0.45)', fontSize: 13 }}
      >
        <FaSignOutAlt className="flex-shrink-0" />
        {!collapsed && <span>Sign Out</span>}
      </button>
    </aside>
  );
}