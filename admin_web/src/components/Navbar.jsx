// components/Navbar.jsx
import { Link } from 'react-router-dom';
import { FaComments, FaBell } from 'react-icons/fa';
import Avatar from './Avatar';

export default function Navbar({ title = 'Dashboard' }) {
  return (
    <header className="bg-white border-b border-[#e2ece8] h-16 flex items-center justify-between px-6 flex-shrink-0"
      style={{ boxShadow: '0 1px 8px rgba(15,92,92,0.05)' }}>

      {/* Left: page title */}
      <h2 className="text-lg font-semibold text-[#1a2e2e]" style={{ fontFamily: 'DM Serif Display, serif' }}>
        {title}
      </h2>

      {/* Right: actions */}
      <div className="flex items-center gap-3">

        {/* Notification bell */}
        <button className="relative w-9 h-9 rounded-xl bg-[#F5F0E8] flex items-center justify-center text-[#0F5C5C] border-none cursor-pointer">
          <FaBell size={15} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C96E4A] rounded-full" />
        </button>

        {/* Chat button */}
        <Link to="/chat"
          className="flex items-center gap-2 bg-[#0F5C5C] text-white px-4 py-2 rounded-xl text-sm font-medium no-underline">
          <FaComments size={14} />
          Chat
        </Link>

        <div className="w-px h-6 bg-[#e2ece8]" />

        <Avatar />
      </div>
    </header>
  );
}