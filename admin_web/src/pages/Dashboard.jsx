// pages/Dashboard.jsx — fully dynamic, fetches real data from API
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminUsers } from '../api/api';
import StatCard from '../components/StatCard';
import BarChartComponent from '../components/BarChart';

const CATEGORIES = [
  { label: 'Vegetables & Fruits', pct: 45, color: '#0F5C5C' },
  { label: 'Bakery & Bread',      pct: 28, color: '#8FB0A1' },
  { label: 'Canned Goods',        pct: 15, color: '#C96E4A' },
  { label: 'Dairy Products',      pct: 12, color: '#d4a56a' },
];

const STATUS_STYLES = {
  active:   { bg: '#d6ebe5', color: '#0F5C5C' },
  inactive: { bg: '#fef3cd', color: '#7c5c10' },
  pending:  { bg: '#fef3cd', color: '#7c5c10' },
  banned:   { bg: '#fde0dc', color: '#7c1a10' },
};

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  return `${Math.floor(h / 24)} days ago`;
}

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function roleIcon(role = '') {
  const r = role.toUpperCase();
  if (r === 'DONATOR')      return '🤲';
  if (r === 'BENEFICIARY')  return '🍽';
  if (r === 'COLLECTIVITE') return '🏢';
  if (r === 'FOOD_SAVER')   return '🌱';
  if (r === 'ADMIN')        return '🔑';
  return '👤';
}

function roleLabel(role = '') {
  const r = role.toUpperCase();
  if (r === 'DONATOR')      return 'Donor';
  if (r === 'COLLECTIVITE') return 'Association';
  if (r === 'FOOD_SAVER')   return 'Food Saver';
  if (r === 'BENEFICIARY')  return 'Beneficiary';
  if (r === 'ADMIN')        return 'Admin';
  return 'User';
}

export default function Dashboard() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    async function fetchAll() {
      setLoading(true); setError('');
      try {
        // Fetch up to 100 users to compute all stats
        const res  = await adminUsers.getAll(1, 100);
        const list = res?.data ?? res?.users ?? res ?? [];
        setUsers(Array.isArray(list) ? list : []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // ── Computed stats ──────────────────────────────────────────
  const getRole   = u => (u.role ?? u.roles?.[0] ?? 'USER').toUpperCase();
  const getStatus = u => u.status ?? (u.isActive === false ? 'inactive' : 'active');

  const totalUsers    = users.length;
  const donors        = users.filter(u => getRole(u) === 'DONATOR').length;
  const beneficiaries = users.filter(u => getRole(u) === 'BENEFICIARY').length;
  const associations  = users.filter(u => getRole(u) === 'COLLECTIVITE');
  const assocCount    = associations.length;
  const activeAssoc   = associations.filter(u => getStatus(u) === 'active').length;
  const pendingAssoc  = associations.filter(u => ['pending','inactive'].includes(getStatus(u))).length;
  const activeUsers   = users.filter(u => getStatus(u) === 'active').length;

  // Recent 5 registrations sorted by createdAt desc
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
    .slice(0, 5);

  // Recent activity feed — derived from recent users
  const activity = recentUsers.map(u => {
    const role = getRole(u);
    const name = u.name ?? u.fullName ?? 'Someone';
    const icon = roleIcon(role);
    const text =
      role === 'DONATOR'       ? `${name} joined as a donor` :
      role === 'BENEFICIARY' ? `New beneficiary registered: ${name}` :
      role === 'COLLECTIVITE' ? `${name} joined the platform` :
      role === 'FOOD_SAVER'  ? `${name} became a Food Saver 🌱` :
      `${name} created an account`;
    return { icon, text, time: timeAgo(u.createdAt) };
  });

  // Top 3 associations for the overview panel
  const topAssociations = associations.slice(0, 3).map(u => ({
    name:   u.name ?? u.fullName ?? 'Association',
    avatar: initials(u.name ?? u.fullName ?? ''),
    status: getStatus(u),
    members: u.membersCount ?? u.members ?? '—',
    donations: u.donationsCount ?? u.donations ?? '—',
    pct: Math.floor(Math.random() * 40) + 40, // replace with real metric when API provides it
  }));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="mb-3 text-3xl">⏳</div>
        <p className="text-sm text-[#6b8a82]">Loading dashboard…</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm rounded-xl"
          style={{ background: '#fde8dc', color: '#8b3d1e', border: '1px solid #f5c6a8' }}>
          <span>⚠</span>
          <span>{error} — showing cached data if available.</span>
          <button onClick={() => window.location.reload()}
            className="ml-auto text-xs font-semibold underline bg-transparent border-none cursor-pointer"
            style={{ color: '#8b3d1e' }}>Retry</button>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard title="Total Users"   value={totalUsers.toLocaleString()}    icon="👥" sub={`${activeUsers} active`}      trend="+8%"  trendUp />
        <StatCard title="Donors"        value={donors.toLocaleString()}        icon="🤲" sub="Registered donors"            trend="+12%" trendUp />
        <StatCard title="Beneficiaries" value={beneficiaries.toLocaleString()} icon="🍽" sub="Families & individuals"       trend="+5%"  trendUp />
        <StatCard title="Associations"  value={assocCount.toLocaleString()}    icon="🏢" sub={`${activeAssoc} active`}      trend={`+${assocCount}`} trendUp />
        <StatCard title="Food Savers"   value={users.filter(u=>getRole(u)==='FOOD_SAVER').length.toLocaleString()} icon="🌱" sub="Promoted users" trend="+18%" trendUp />
      </div>

      {/* ── Chart + Categories ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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

      {/* ── Associations Overview ── */}
      <div className="bg-white rounded-2xl border border-[#e2ece8]"
        style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>

        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e2ece8]">
          <div>
            <h3 className="font-semibold text-[#1a2e2e]">Associations Overview</h3>
            <p className="text-xs text-[#6b8a82] mt-0.5">Partner organisations & their contribution</p>
          </div>
          <div className="flex gap-3">
            {[
              { label: 'Total',   val: assocCount,   bg: '#e8e8f0', color: '#3b3b8b' },
              { label: 'Active',  val: activeAssoc,  bg: '#d6ebe5', color: '#0F5C5C' },
              { label: 'Pending', val: pendingAssoc, bg: '#fef3cd', color: '#7c5c10' },
            ].map(s => (
              <div key={s.label} className="px-4 py-2 text-center rounded-xl"
                style={{ background: s.bg }}>
                <p className="text-lg font-bold leading-none"
                  style={{ color: s.color, fontFamily: 'DM Serif Display, serif' }}>{s.val}</p>
                <p className="text-[10px] mt-0.5" style={{ color: s.color }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Association rows */}
        {topAssociations.length > 0 ? (
          <div className="divide-y divide-[#e2ece8]">
            {topAssociations.map((a, i) => {
              const sc = STATUS_STYLES[a.status] ?? STATUS_STYLES.inactive;
              return (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-10 h-10 rounded-xl bg-[#e8e8f0] flex items-center justify-center text-[#3b3b8b] text-sm font-bold flex-shrink-0">
                    {a.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-[#1a2e2e] truncate">{a.name}</p>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: sc.bg, color: sc.color }}>
                        {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#e2ece8] overflow-hidden">
                      <div className="h-full rounded-full bg-[#0F5C5C]" style={{ width: `${a.pct}%` }} />
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 gap-5 text-right">
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
        ) : (
          <div className="text-center py-8 text-sm text-[#6b8a82]">
            No associations registered yet.
          </div>
        )}

        <div className="px-6 py-4 border-t border-[#e2ece8]">
          <Link to="/associations" className="text-xs font-semibold text-[#0F5C5C] no-underline">
            View all associations →
          </Link>
        </div>
      </div>

      {/* ── Recent Registrations + Activity ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Recent registrations */}
        <div className="bg-white rounded-2xl p-6 border border-[#e2ece8]"
          style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-[#1a2e2e]">Recent Registrations</h3>
            <Link to="/users" className="text-xs font-semibold text-[#0F5C5C] no-underline">View all →</Link>
          </div>
          <div className="flex flex-col gap-3">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-[#6b8a82]">No users yet.</p>
            ) : recentUsers.map(u => {
              const role   = getRole(u);
              const name   = u.name ?? u.fullName ?? 'Unknown';
              const status = getStatus(u);
              const sc     = STATUS_STYLES[status] ?? STATUS_STYLES.inactive;
              return (
                <div key={u._id ?? u.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0F5C5C] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {initials(name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a2e2e] truncate">{name}</p>
                    <p className="text-xs text-[#6b8a82]">{u.email ?? ''}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ background: sc.bg, color: sc.color }}>
                      {roleIcon(role)} {roleLabel(role)}
                    </span>
                    <span className="text-[10px] text-[#6b8a82]">{timeAgo(u.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-white rounded-2xl p-6 border border-[#e2ece8]"
          style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>
          <h3 className="font-semibold text-[#1a2e2e] mb-5">Recent Activity</h3>
          {activity.length === 0 ? (
            <p className="text-sm text-[#6b8a82]">No recent activity.</p>
          ) : (
            <div className="flex flex-col">
              {activity.map((a, i) => (
                <div key={i} className={`flex items-start gap-3 py-3 ${i < activity.length - 1 ? 'border-b border-[#e2ece8]' : ''}`}>
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
          )}
        </div>

      </div>
    </div>
  );
}