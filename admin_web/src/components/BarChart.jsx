// components/BarChart.jsx  — uses recharts (already in your project)
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { month: 'Jan', donations: 38 },
  { month: 'Feb', donations: 54 },
  { month: 'Mar', donations: 67 },
  { month: 'Apr', donations: 61 },
  { month: 'May', donations: 84 },
  { month: 'Jun', donations: 98 },
  { month: 'Jul', donations: 91 },
  { month: 'Aug', donations: 107 },
  { month: 'Sep', donations: 122 },
  { month: 'Oct', donations: 111 },
  { month: 'Nov', donations: 136 },
  { month: 'Dec', donations: 152 },
];

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

export default function BarChartComponent() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#e2ece8]"
      style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-[#1a2e2e]">Monthly Donations</h3>
          <p className="text-xs text-[#6b8a82] mt-0.5">2024 full year overview</p>
        </div>
        <span className="text-xs font-semibold bg-[#d6ebe5] text-[#0F5C5C] px-3 py-1 rounded-full">↑ 12% this month</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={18}>
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b8a82', fontSize: 11 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b8a82', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(143,176,161,0.1)' }} />
          <Bar dataKey="donations" radius={[6, 6, 3, 3]}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === data.length - 1 ? '#0F5C5C' : '#b8d0c4'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}