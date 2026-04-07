// pages/Dashboard.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useUsers } from '../context/UsersContext';
import { donationsApi } from '../api/api';
import StatCard from '../components/StatCard';
import BarChartComponent from '../components/BarChart';

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
  if (role.toUpperCase() === 'FOOD_SAVER') return '🌱';
  if (role.toUpperCase() === 'ADMIN')      return '🔑';
  return '👤';
}

function roleLabel(role = '') {
  if (role.toUpperCase() === 'FOOD_SAVER') return 'Food Saver';
  if (role.toUpperCase() === 'ADMIN')      return 'Admin';
  return 'User';
}

function computeTrend(list, dateField = 'createdAt') {
  if (!Array.isArray(list) || list.length === 0) return null;
  const now = new Date();
  const tm = now.getMonth(), ty = now.getFullYear();
  const lm = tm === 0 ? 11 : tm - 1;
  const ly = tm === 0 ? ty - 1 : ty;
  let thisCount = 0, lastCount = 0;
  list.forEach(item => {
    const d = item[dateField] ? new Date(item[dateField]) : null;
    if (!d) return;
    if (d.getMonth() === tm && d.getFullYear() === ty) thisCount++;
    if (d.getMonth() === lm && d.getFullYear() === ly) lastCount++;
  });
  if (lastCount === 0) return thisCount > 0 ? `+${thisCount} new` : null;
  const pct = Math.round(((thisCount - lastCount) / lastCount) * 100);
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

// ── useDonations hook ────────────────────────────────────────────
// donationList is ALWAYS an array (never null) — getAll guarantees this.
// ready flips to true once the fetch resolves either way.
function useDonations() {
  const [list,  setList]  = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const result = await donationsApi.getAll();   // always returns []
        if (!cancelled) setList(result);
      } catch {
        if (!cancelled) setList([]);
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return { list, ready };
}

export default function Dashboard() {
  const { users, loading, error, refresh, getRole, getStatus } = useUsers();
  const { list: donationList, ready: donationsReady } = useDonations();

  // ── User stats ───────────────────────────────────────────────
  const totalUsers  = users.length;
  const activeUsers = users.filter(u => getStatus(u) === 'active').length;
  const bannedUsers = users.filter(u => getStatus(u) === 'banned').length;
  const foodSavers  = users.filter(u => getRole(u) === 'FOOD_SAVER').length;
  const usersTrend  = computeTrend(users);
  const fsTrend     = computeTrend(users.filter(u => getRole(u) === 'FOOD_SAVER'));

  // ── Donation stats ───────────────────────────────────────────
  const totalDonations  = donationList.length;
  const donationsTrend  = useMemo(() => computeTrend(donationList, 'createdAt'), [donationList]);

  const donationsValue = !donationsReady ? '…' : totalDonations.toLocaleString();
  const donationsSub   = !donationsReady
    ? 'Loading…'
    : totalDonations === 0
      ? 'No donations yet'
      : 'Total donations recorded';

  // ── Recent users ─────────────────────────────────────────────
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
    .slice(0, 5);

  const activity = recentUsers.map(u => {
    const role = getRole(u);
    const name = u.name ?? u.fullName ?? 'Someone';
    const text =
      role === 'FOOD_SAVER' ? `${name} became a Food Saver 🌱` :
      role === 'ADMIN'      ? `${name} admin account created` :
      `${name} created an account`;
    return { icon: roleIcon(role), text, time: timeAgo(u.createdAt) };
  });

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
          <button onClick={refresh}
            className="ml-auto text-xs font-semibold underline bg-transparent border-none cursor-pointer"
            style={{ color: '#8b3d1e' }}>Retry</button>
        </div>
      )}

      {/* ── 3 Stat Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <StatCard
          title="Total Users"
          value={totalUsers.toLocaleString()}
          icon="👥"
          sub={`${activeUsers} active · ${bannedUsers} banned`}
          trend={usersTrend}
          trendUp={usersTrend?.startsWith('+')}
        />

        <StatCard
          title="Donations"
          value={donationsValue}
          icon="🍱"
          sub={donationsSub}
          trend={donationsTrend}
          trendUp={donationsTrend?.startsWith('+')}
        />

        <StatCard
          title="Food Savers"
          value={foodSavers.toLocaleString()}
          icon="🌱"
          sub="Trusted community validators"
          trend={fsTrend}
          trendUp={fsTrend?.startsWith('+')}
        />
      </div>

      {/* ── Bar Chart + User breakdown ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BarChartComponent donations={donationList} donationsReady={donationsReady} />
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#e2ece8]"
          style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>
          <h3 className="font-semibold text-[#1a2e2e] mb-1">User Breakdown</h3>
          <p className="text-xs text-[#6b8a82] mb-5">Live status distribution</p>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Active',      count: activeUsers,                                            color: '#0F5C5C' },
              { label: 'Inactive',    count: users.filter(u => getStatus(u) === 'inactive').length,  color: '#8FB0A1' },
              { label: 'Banned',      count: bannedUsers,                                            color: '#C96E4A' },
              { label: 'Food Savers', count: foodSavers,                                             color: '#d4a56a' },
            ].map(row => {
              const pct = totalUsers > 0 ? Math.round((row.count / totalUsers) * 100) : 0;
              return (
                <div key={row.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-medium text-[#1a2e2e]">{row.label}</span>
                    <span className="text-xs text-[#6b8a82]">
                      {row.count}<span className="text-[#b0c4bc] ml-1">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#e2ece8] overflow-hidden">
                    <div className="h-full transition-all duration-700 rounded-full"
                      style={{ width: `${Math.max(pct, row.count > 0 ? 2 : 0)}%`, background: row.color }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-[#e2ece8] grid grid-cols-2 gap-3">
            {[
              { label: 'Total',       val: totalUsers,  bg: '#e8e8f0', color: '#3b3b8b' },
              { label: 'Active',      val: activeUsers, bg: '#d6ebe5', color: '#0F5C5C' },
              { label: 'Food Savers', val: foodSavers,  bg: '#fff3cd', color: '#7c5c10' },
              { label: 'Banned',      val: bannedUsers, bg: '#fde0dc', color: '#7c1a10' },
            ].map(s => (
              <div key={s.label} className="px-3 py-2 text-center rounded-xl" style={{ background: s.bg }}>
                <p className="text-lg font-bold leading-none"
                  style={{ color: s.color, fontFamily: 'DM Serif Display, serif' }}>{s.val}</p>
                <p className="text-[10px] mt-0.5" style={{ color: s.color }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Registrations + Activity ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="bg-white rounded-2xl p-6 border border-[#e2ece8]"
          style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-[#1a2e2e]">Recent Registrations</h3>
            <Link to="/users" className="text-xs font-semibold text-[#0F5C5C] no-underline">View all →</Link>
          </div>
          <div className="flex flex-col gap-3">
            {recentUsers.length === 0
              ? <p className="text-sm text-[#6b8a82]">No users yet.</p>
              : recentUsers.map(u => {
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
                })
            }
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#e2ece8]"
          style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>
          <h3 className="font-semibold text-[#1a2e2e] mb-5">Recent Activity</h3>
          {activity.length === 0
            ? <p className="text-sm text-[#6b8a82]">No recent activity.</p>
            : (
              <div className="flex flex-col">
                {activity.map((a, i) => (
                  <div key={i}
                    className={`flex items-start gap-3 py-3 ${i < activity.length - 1 ? 'border-b border-[#e2ece8]' : ''}`}>
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
            )
          }
        </div>
      </div>

    </div>
  );
}