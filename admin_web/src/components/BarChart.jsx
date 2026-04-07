// components/BarChart.jsx — monthly donations per month from real API data
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#e2ece8] rounded-xl px-3 py-2 text-sm shadow-lg">
        <p className="font-semibold text-[#0F5C5C]">{label}</p>
        <p className="text-[#6b8a82]">{payload[0].value} donations</p>
      </div>
    );
  }
  return null;
};

export default function BarChartComponent({ donations = null, donationsReady = false }) {
  const currentYear  = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-indexed

  // Build per-month counts from the real donations list
  const data = useMemo(() => {
    const counts = Array(12).fill(0);
    if (Array.isArray(donations)) {
      donations.forEach(d => {
        // support createdAt, date, donatedAt, or created_at field names
        const raw = d.createdAt ?? d.date ?? d.donatedAt ?? d.created_at;
        const dt  = raw ? new Date(raw) : null;
        if (dt && dt.getFullYear() === currentYear) {
          counts[dt.getMonth()]++;
        }
      });
    }
    return MONTHS.map((month, i) => ({ month, donations: counts[i] }));
  }, [donations, currentYear]);

  // Trend: this month vs last month
  const thisMonth = data[currentMonth]?.donations ?? 0;
  const prevIdx   = currentMonth > 0 ? currentMonth - 1 : 0;
  const lastMonth = data[prevIdx]?.donations ?? 0;
  const trendPct  = lastMonth > 0
    ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
    : thisMonth > 0 ? 100 : 0;
  const trendLabel   = trendPct >= 0 ? `↑ ${trendPct}% this month` : `↓ ${Math.abs(trendPct)}% this month`;
  const trendPositive = trendPct >= 0;

  const hasData = Array.isArray(donations) && donations.length > 0;

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#e2ece8]"
      style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-[#1a2e2e]">Monthly Donations</h3>
          <p className="text-xs text-[#6b8a82] mt-0.5">{currentYear} — donations per month</p>
        </div>
        {hasData && (
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            trendPositive ? 'bg-[#d6ebe5] text-[#0F5C5C]' : 'bg-[#fde8dc] text-[#8b3d1e]'
          }`}>
            {trendLabel}
          </span>
        )}
      </div>

      {/* Not ready yet — skeleton */}
      {!donationsReady && (
        <div className="flex items-center justify-center h-[220px]">
          <p className="text-sm text-[#6b8a82]">Loading donations…</p>
        </div>
      )}

      {/* API available but no donations yet */}
      {donationsReady && donations === null && (
        <div className="flex flex-col items-center justify-center h-[220px] gap-2">
          <span className="text-3xl">🍱</span>
          <p className="text-sm text-[#6b8a82] text-center">
            Donations endpoint not connected yet.<br />
            <span className="text-xs">Add <code className="bg-[#F5F0E8] px-1 rounded">/api/v1/donations</code> to the backend to see this chart.</span>
          </p>
        </div>
      )}

      {/* API available, has data (even if all zeros this year) */}
      {donationsReady && donations !== null && (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barSize={18}>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b8a82', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b8a82', fontSize: 11 }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(143,176,161,0.1)' }} />
            <Bar dataKey="donations" radius={[6, 6, 3, 3]}>
              {data.map((_, i) => (
                <Cell key={i} fill={i === currentMonth ? '#0F5C5C' : '#b8d0c4'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}