// components/Avatar.jsx
export default function Avatar({ name = 'Admin', email = 'admin@madad.com', src }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-semibold text-[#1a2e2e]">{name}</p>
        <p className="text-xs text-[#6b8a82]">{email}</p>
      </div>
      {src ? (
        <img src={src} alt={name} className="w-9 h-9 rounded-full object-cover ring-2 ring-[#8FB0A1]" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-[#C96E4A] flex items-center justify-center text-white text-sm font-semibold ring-2 ring-[#e8a07a]">
          {initials}
        </div>
      )}
    </div>
  );
}