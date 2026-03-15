// pages/Dashboard.jsx
import StatCard from '../components/StatCard';
import BarChartComponent from '../components/BarChart';

const CATEGORIES = [
  { label: 'Vegetables & Fruits', pct: 45, color: '#0F5C5C' },
  { label: 'Bakery & Bread',      pct: 28, color: '#8FB0A1' },
  { label: 'Canned Goods',        pct: 15, color: '#C96E4A' },
  { label: 'Dairy Products',      pct: 12, color: '#d4a56a' },
];

const ACTIVITY = [
  { icon: '🤲', text: 'Sara Ahmed donated 3 meals',             time: '2 min ago'  },
  { icon: '🏢', text: 'Green Future Org joined the platform',   time: '10 min ago' },
  { icon: '🍽',  text: 'New beneficiary registered: Yassine',   time: '18 min ago' },
  { icon: '✅', text: 'Food listing approved: Bakery goods',    time: '45 min ago' },
  { icon: '🌱', text: '87 meals redistributed this week',       time: '3 hrs ago'  },
];

const ASSOCIATIONS = [
  { name: 'Green Future Org',  members: 12, donations: 48, status: 'active',  avatar: 'GF', pct: 78 },
  { name: 'Food Hope Algeria', members: 8,  donations: 31, status: 'active',  avatar: 'FH', pct: 62 },
  { name: 'Solidarity DZ',     members: 5,  donations: 14, status: 'pending', avatar: 'SD', pct: 35 },
];

const STATUS_STYLES = {
  active:  { bg: '#d6ebe5', color: '#0F5C5C' },
  pending: { bg: '#fef3cd', color: '#7c5c10' },
};

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">

      {/* Stat Cards — now 5 including Associations */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Users"    value="1,200" icon="👥" sub="All registered"   trend="+8%"  trendUp />
        <StatCard title="Donors"         value="430"   icon="🤲" sub="Active donors"    trend="+12%" trendUp />
        <StatCard title="Beneficiaries"  value="770"   icon="🍽" sub="Families helped"  trend="+5%"  trendUp />
        <StatCard title="Associations"   value="24"    icon="🏢" sub="Partner orgs"     trend="+3"   trendUp />
        <StatCard title="Meals Saved"    value="3,840" icon="🌱" sub="Total impact"     trend="+18%" trendUp />
      </div>

      {/* Chart + Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <BarChartComponent />
        </div>

        {/* Food Categories */}
        <div className="bg-white rounded-2xl p-6 border border-[#e2ece8]"
          style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>
          <h3 className="font-semibold text-[#1a2e2e] mb-1">Food Categories</h3>
          <p className="text-xs text-[#6b8a82] mb-5">Top donated types</p>
          <div className="flex flex-col gap-4">
            {CATEGORIES.map(c => (
              <div key={c.label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-medium text-[#1a2e2e]">{c.label}</span>
                  <span className="text-xs text-[#6b8a82]">{c.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#e2ece8] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Associations Statistics */}
      <div className="bg-white rounded-2xl border border-[#e2ece8]"
        style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e2ece8]">
          <div>
            <h3 className="font-semibold text-[#1a2e2e]">Associations Overview</h3>
            <p className="text-xs text-[#6b8a82] mt-0.5">Partner organisations & their contribution</p>
          </div>
          <div className="flex gap-3">
            {[
              { label: 'Total',   val: 24, bg: '#e8e8f0', color: '#3b3b8b' },
              { label: 'Active',  val: 19, bg: '#d6ebe5', color: '#0F5C5C' },
              { label: 'Pending', val: 5,  bg: '#fef3cd', color: '#7c5c10' },
            ].map(s => (
              <div key={s.label} className="text-center px-4 py-2 rounded-xl"
                style={{ background: s.bg }}>
                <p className="text-lg font-bold leading-none" style={{ color: s.color,
                  fontFamily: 'DM Serif Display, serif' }}>{s.val}</p>
                <p className="text-[10px] mt-0.5" style={{ color: s.color }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Association rows */}
        <div className="divide-y divide-[#e2ece8]">
          {ASSOCIATIONS.map(a => {
            const sc = STATUS_STYLES[a.status];
            return (
              <div key={a.name} className="flex items-center gap-4 px-6 py-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-[#e8e8f0] flex items-center justify-center
                  text-[#3b3b8b] text-sm font-bold flex-shrink-0">
                  {a.avatar}
                </div>

                {/* Name + status */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-[#1a2e2e] truncate">{a.name}</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: sc.bg, color: sc.color }}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                  </div>
                  {/* Activity bar */}
                  <div className="h-1.5 rounded-full bg-[#e2ece8] overflow-hidden">
                    <div className="h-full rounded-full bg-[#0F5C5C]"
                      style={{ width: `${a.pct}%` }} />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-5 flex-shrink-0 text-right">
                  <div>
                    <p className="text-sm font-semibold text-[#1a2e2e]">{a.members}</p>
                    <p className="text-[10px] text-[#6b8a82]">Members</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0F5C5C]">{a.donations}</p>
                    <p className="text-[10px] text-[#6b8a82]">Donations</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1a2e2e]">{a.pct}%</p>
                    <p className="text-[10px] text-[#6b8a82]">Activity</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer link */}
        <div className="px-6 py-4 border-t border-[#e2ece8]">
          <a href="/associations"
            className="text-xs font-semibold text-[#0F5C5C] no-underline">
            View all associations →
          </a>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-2xl p-6 border border-[#e2ece8]"
        style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>
        <h3 className="font-semibold text-[#1a2e2e] mb-5">Recent Activity</h3>
        <div className="flex flex-col">
          {ACTIVITY.map((a, i) => (
            <div key={i} className={`flex items-start gap-3 py-3 ${i < ACTIVITY.length - 1 ? 'border-b border-[#e2ece8]' : ''}`}>
              <div className="w-8 h-8 rounded-xl bg-[#F5F0E8] flex items-center justify-center text-base flex-shrink-0">
                {a.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#1a2e2e]">{a.text}</p>
                <p className="text-xs text-[#6b8a82] mt-0.5">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}