// components/Avatar.jsx
import { useAuth } from '../context/AuthContext';

export default function Avatar() {
  const { user } = useAuth();
  const email = user?.email || '';
  const name  = user?.name  || '';

  // Build initials: prefer name parts, fall back to email username
  const initials = name
    ? name.split(' ').filter(Boolean).map(p => p[0].toUpperCase()).slice(0, 2).join('')
    : email
        ? email.split('@')[0].split(/[._-]/).filter(Boolean)
            .map(p => p[0].toUpperCase()).slice(0, 2).join('')
        : '?';

  return (
    <div
      className="w-9 h-9 rounded-xl bg-[#C96E4A] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 cursor-pointer select-none"
      title={email}
    >
      {initials}
    </div>
  );
}