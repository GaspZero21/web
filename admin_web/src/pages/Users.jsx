// pages/Users.jsx — all users, status actions hit real API + refreshes context
import { useState } from 'react';
import { adminUsers } from '../api/api';
import { useUsers } from '../context/UsersContext';
import AddUserModal from '../components/AddUserModal';

const STATUS_STYLES = {
  active:   'bg-[#d6ebe5] text-[#0F5C5C]',
  inactive: 'bg-[#fef3cd] text-[#7c5c10]',
  banned:   'bg-[#fde0dc] text-[#7c1a10]',
};

const ROLE_STYLES = {
  DONATOR:      'bg-[#d6ebe5] text-[#0F5C5C]',
  BENEFICIARY:  'bg-[#fde8dc] text-[#8b3d1e]',
  COLLECTIVITE: 'bg-[#e8e8f0] text-[#3b3b8b]',
  USER:         'bg-[#F5F0E8] text-[#6b8a82]',
  FOOD_SAVER:   'bg-[#fff3cd] text-[#7c5c10]',
  ADMIN:        'bg-[#fde0dc] text-[#7c1a10]',
};

const ROLE_ICONS = {
  DONATOR: '🤲', BENEFICIARY: '🍽', COLLECTIVITE: '🏢',
  USER: '👤', FOOD_SAVER: '🌱', ADMIN: '🔑',
};

const ROLE_LABELS = {
  DONATOR: 'Donor', BENEFICIARY: 'Beneficiary', COLLECTIVITE: 'Association',
  FOOD_SAVER: 'Food Saver', ADMIN: 'Admin', USER: 'User',
};

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function Users() {
  const { users, loading, error, refresh, getRole, getStatus, getId } = useUsers();

  const [modalOpen,    setModalOpen]    = useState(false);
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [actionLoad,   setActionLoad]   = useState(null); // { id, type }
  const [actionError,  setActionError]  = useState('');

  async function handleAdd(userData) {
    try {
      await adminUsers.create({
        name:     userData.name,
        email:    userData.email,
        password: userData.password,
        phone:    userData.phone,
        role:     userData.role?.toUpperCase() ?? 'USER',
      });
      await refresh();
    } catch (e) {
      alert('Failed to create user: ' + e.message);
    }
  }

  // Toggle active ↔ inactive (never touches isBanned)
  async function handleToggleActive(id, currentStatus) {
    setActionLoad({ id, type: 'active' });
    setActionError('');
    try {
      if (currentStatus === 'inactive') {
        await adminUsers.activate(id);   // { isActive: true,  isBanned: false }
      } else {
        await adminUsers.deactivate(id); // { isActive: false, isBanned: false }
      }
      await refresh();
    } catch (e) {
      setActionError('Failed to update status: ' + e.message);
    } finally {
      setActionLoad(null);
    }
  }

  // Toggle banned ↔ active
  async function handleToggleBan(id, currentStatus) {
    setActionLoad({ id, type: 'ban' });
    setActionError('');
    try {
      if (currentStatus === 'banned') {
        await adminUsers.unban(id); // { isActive: true,  isBanned: false }
      } else {
        await adminUsers.ban(id);   // { isActive: false, isBanned: true }
      }
      await refresh();
    } catch (e) {
      setActionError('Failed to update ban: ' + e.message);
    } finally {
      setActionLoad(null);
    }
  }

  const statuses = ['All', 'active', 'inactive', 'banned'];
  const STATUS_LABELS = { All: 'All', active: 'Active', inactive: 'Inactive', banned: 'Banned' };

  const filtered = users.filter(u => {
    const name   = u.name ?? u.fullName ?? '';
    const email  = u.email ?? '';
    const status = getStatus(u);
    const q      = search.toLowerCase();
    return (filterStatus === 'All' || status === filterStatus)
      && (name.toLowerCase().includes(q) || email.toLowerCase().includes(q));
  });

  const counts = { All: users.length };
  statuses.slice(1).forEach(s => {
    counts[s] = users.filter(u => getStatus(u) === s).length;
  });

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1a2e2e]"
            style={{ fontFamily: 'DM Serif Display, serif' }}>Users</h1>
          <p className="text-sm text-[#6b8a82] mt-0.5">
            {loading ? 'Loading…' : `${users.length} total users`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={refresh}
            className="px-3 py-2.5 rounded-xl text-sm border border-[#e2ece8] bg-white text-[#6b8a82] cursor-pointer">
            ↻ Refresh
          </button>
          <button onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-white text-sm font-semibold border-none cursor-pointer"
            style={{ background: '#0F5C5C' }}>
            + Add User
          </button>
        </div>
      </div>

      {/* API errors */}
      {error && (
        <div className="px-4 py-3 text-sm rounded-xl"
          style={{ background: '#fde8dc', color: '#8b3d1e', border: '1px solid #f5c6a8' }}>
          ⚠ {error}
        </div>
      )}
      {actionError && (
        <div className="px-4 py-3 text-sm rounded-xl"
          style={{ background: '#fde8dc', color: '#8b3d1e', border: '1px solid #f5c6a8' }}>
          ⚠ {actionError}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2ece8] flex flex-wrap gap-3 items-center"
        style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="flex-1 min-w-[180px] rounded-xl px-4 py-2 text-sm border border-[#e2ece8] bg-[#FAF9F7] text-[#1a2e2e] outline-none"
        />
        <div className="flex flex-wrap gap-2">
          {statuses.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="px-3 py-2 text-xs font-medium border-none cursor-pointer rounded-xl"
              style={{
                background: filterStatus === s ? '#0F5C5C' : '#F5F0E8',
                color:      filterStatus === s ? 'white'   : '#6b8a82',
              }}>
              {STATUS_LABELS[s]} ({counts[s] ?? 0})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e2ece8] overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>
        {loading ? (
          <div className="text-center py-16 text-sm text-[#6b8a82]">Loading users…</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#F5F0E8]">
                {['User', 'Role', 'Status', 'Phone', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold tracking-widest text-[#6b8a82] uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const id     = getId(u);
                const name   = u.name ?? u.fullName ?? 'Unknown';
                const email  = u.email ?? '';
                const phone  = u.phone ?? u.phoneNumber ?? '—';
                const role   = getRole(u);
                const status = getStatus(u);
                const joined = u.createdAt ? new Date(u.createdAt).toISOString().slice(0, 10) : '—';

                const isBusyActive = actionLoad?.id === id && actionLoad?.type === 'active';
                const isBusyBan    = actionLoad?.id === id && actionLoad?.type === 'ban';
                const isBusy       = isBusyActive || isBusyBan;

                // Active/Inactive button — not shown for banned users
                // (banning already sets isActive:false; unbanning restores active)
                const showActiveToggle = status !== 'banned';
                const activeLabel      = status === 'inactive' ? 'Activate' : 'Deactivate';
                const activeStyle      = status === 'inactive'
                  ? { background: '#d6ebe5', color: '#0F5C5C' }   // green  → Activate
                  : { background: '#fef3cd', color: '#7c5c10' };   // yellow → Deactivate

                // Ban/Unban button — always shown
                const banLabel = status === 'banned' ? 'Unban' : 'Ban';
                const banStyle = status === 'banned'
                  ? { background: '#d6ebe5', color: '#0F5C5C' }   // green  → Unban
                  : { background: '#fde0dc', color: '#7c1a10' };   // red    → Ban

                return (
                  <tr key={id} className="border-t border-[#e2ece8] hover:bg-[#FAF9F7]"
                    style={{ opacity: status === 'banned' ? 0.7 : 1 }}>

                    {/* User */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#0F5C5C] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {initials(name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1a2e2e]">{name}</p>
                          <p className="text-xs text-[#6b8a82]">{email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_STYLES[role] ?? ROLE_STYLES.USER}`}>
                        {ROLE_ICONS[role] ?? '👤'} {ROLE_LABELS[role] ?? role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[status] ?? STATUS_STYLES.inactive}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="px-5 py-3 text-xs text-[#6b8a82]">{phone}</td>

                    {/* Joined */}
                    <td className="px-5 py-3 text-xs text-[#6b8a82]">{joined}</td>

                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex gap-2">

                        {/* Active / Deactivate toggle — hidden when user is banned */}
                        {showActiveToggle && (
                          <button
                            onClick={() => handleToggleActive(id, status)}
                            disabled={isBusy}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg border-none cursor-pointer"
                            style={activeStyle}>
                            {isBusyActive ? '…' : activeLabel}
                          </button>
                        )}

                        {/* Ban / Unban toggle */}
                        <button
                          onClick={() => handleToggleBan(id, status)}
                          disabled={isBusy}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg border-none cursor-pointer"
                          style={banStyle}>
                          {isBusyBan ? '…' : banLabel}
                        </button>

                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-10 text-sm text-[#6b8a82]">No users found.</div>
        )}
      </div>

      <AddUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
        defaultRole="User"
      />
    </div>
  );
}