// pages/Users.jsx — wired to GET/POST/DELETE /api/v1/admin/users
import { useState, useEffect } from 'react';
import { adminUsers } from '../api/api';
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
  DONATOR:      '🤲',
  BENEFICIARY:  '🍽',
  COLLECTIVITE: '🏢',
  USER:         '👤',
  FOOD_SAVER:   '🌱',
  ADMIN:        '🔑',
};
// Human-readable display labels
const ROLE_LABELS = {
  DONATOR:      'Donor',
  BENEFICIARY:  'Beneficiary',
  COLLECTIVITE: 'Association',
  FOOD_SAVER:   'Food Saver',
  ADMIN:        'Admin',
  USER:         'User',
};

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function Users() {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [modalOpen,  setModalOpen]  = useState(false);
  const [search,     setSearch]     = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [confirm,    setConfirm]    = useState(null);
  const [actionLoad, setActionLoad] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true); setError('');
    try {
      const res = await adminUsers.getAll();
      // handle { data: [...] } or { users: [...] } or plain array
      const list = res?.data ?? res?.users ?? res ?? [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(userData) {
    try {
      const newUser = await adminUsers.create({
        name:     userData.name,
        email:    userData.email,
        password: userData.password,
        phone:    userData.phone,
        role:     userData.role?.toUpperCase(),
      });
      await fetchUsers();
    } catch (e) {
      alert('Failed to create user: ' + e.message);
    }
  }

  async function handleDelete(id) {
    setActionLoad(id);
    try {
      await adminUsers.delete(id);
      setUsers(p => p.filter(u => (u._id ?? u.id) !== id));
    } catch (e) {
      alert('Failed to delete: ' + e.message);
    } finally {
      setActionLoad(null); setConfirm(null);
    }
  }

  async function handleStatus(id, status) {
    try {
      await adminUsers.setStatus(id, status);
      await fetchUsers();
    } catch (e) {
      alert('Failed to update status: ' + e.message);
    }
  }

  const roles = ['All', 'DONATOR', 'BENEFICIARY', 'COLLECTIVITE', 'FOOD_SAVER'];

  const filtered = users.filter(u => {
    const name  = u.name  ?? u.fullName ?? '';
    const email = u.email ?? '';
    const role  = (u.role ?? u.roles?.[0] ?? '').toUpperCase();
    const q     = search.toLowerCase();
    const matchRole   = filterRole === 'All' || role === filterRole;
    const matchSearch = name.toLowerCase().includes(q) || email.includes(q);
    return matchRole && matchSearch;
  });

  const counts = { All: users.length };
  roles.slice(1).forEach(r => {
    counts[r] = users.filter(u => (u.role ?? u.roles?.[0] ?? '').toUpperCase() === r).length;
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1a2e2e]"
            style={{ fontFamily: 'DM Serif Display, serif' }}>All Users</h1>
          <p className="text-sm text-[#6b8a82] mt-0.5">
            {loading ? 'Loading…' : `${users.length} total users`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchUsers}
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

      {/* Error */}
      {error && (
        <div className="px-4 py-3 text-sm rounded-xl"
          style={{ background: '#fde8dc', color: '#8b3d1e', border: '1px solid #f5c6a8' }}>
          ⚠ {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2ece8] flex flex-wrap gap-3 items-center"
        style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="flex-1 min-w-[180px] rounded-xl px-4 py-2 text-sm border border-[#e2ece8] bg-[#FAF9F7] text-[#1a2e2e] outline-none" />
        <div className="flex flex-wrap gap-2">
          {roles.map(r => (
            <button key={r} onClick={() => setFilterRole(r)}
              className="px-3 py-2 text-xs font-medium border-none cursor-pointer rounded-xl"
              style={{ background: filterRole === r ? '#0F5C5C' : '#F5F0E8', color: filterRole === r ? 'white' : '#6b8a82' }}>
              {ROLE_LABELS[r] ?? r} ({counts[r] ?? 0})
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
                {['User','Role','Status','Phone','Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold tracking-widest text-[#6b8a82] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const id      = u._id ?? u.id;
                const name    = u.name ?? u.fullName ?? 'Unknown';
                const email   = u.email ?? '';
                const phone   = u.phone ?? u.phoneNumber ?? '—';
                const role    = (u.role ?? u.roles?.[0] ?? 'USER').toUpperCase();
                const status  = u.status ?? (u.isActive === false ? 'inactive' : 'active');
                return (
                  <tr key={id} className="border-t border-[#e2ece8] hover:bg-[#FAF9F7]">
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
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_STYLES[role] ?? ROLE_STYLES.USER}`}>
                        {ROLE_ICONS[role] ?? '👤'} {ROLE_LABELS[role] ?? role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[status] ?? STATUS_STYLES.inactive}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#6b8a82]">{phone}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        {/* Ban / Unban */}
                        <button
                          onClick={() => handleStatus(id, status === 'banned' ? 'active' : 'banned')}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg border-none cursor-pointer"
                          style={{ background: status === 'banned' ? '#d6ebe5' : '#fef3cd', color: status === 'banned' ? '#0F5C5C' : '#7c5c10' }}>
                          {status === 'banned' ? 'Unban' : 'Ban'}
                        </button>
                        {/* Delete */}
                        <button onClick={() => setConfirm(id)}
                          disabled={actionLoad === id}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#fde0dc] text-[#7c1a10] border-none cursor-pointer">
                          {actionLoad === id ? '…' : 'Delete'}
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

      <AddUserModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAdd} defaultRole="Donor" />

      {/* Delete confirm */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => setConfirm(null)}>
          <div className="text-center bg-white shadow-2xl rounded-2xl p-7 w-72" onClick={e => e.stopPropagation()}>
            <div className="mb-3 text-3xl">🗑</div>
            <h3 className="font-semibold text-[#1a2e2e] mb-2">Delete user?</h3>
            <p className="text-sm text-[#6b8a82] mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="flex-1 py-2 rounded-xl border border-[#e2ece8] text-sm text-[#6b8a82] cursor-pointer bg-white">Cancel</button>
              <button onClick={() => handleDelete(confirm)} className="flex-1 py-2 rounded-xl bg-[#C96E4A] text-white text-sm font-semibold cursor-pointer border-none">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}