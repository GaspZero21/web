// components/StatCard.jsx
export default function StatCard({ title, value, icon, sub, trend }) {
  const isUp = trend && trend.startsWith('+');
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#e2ece8] flex flex-col gap-3"
      style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-widest text-[#6b8a82] uppercase">{title}</span>
        <div className="w-9 h-9 rounded-xl bg-[#F5F0E8] flex items-center justify-center text-lg">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-[#0F5C5C]" style={{ fontFamily: 'DM Serif Display, serif' }}>
        {value}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#6b8a82]">{sub}</span>
        {trend && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${isUp ? 'bg-[#d6ebe5] text-[#0F5C5C]' : 'bg-[#fde8dc] text-[#8b3d1e]'}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}