// pages/Associations.jsx
import { useState } from 'react';
import { useUsers } from '../context/UsersContext';
import AddUserModal from '../components/AddUserModal';

const STATUS_STYLES = {
  active:   'bg-[#d6ebe5] text-[#0F5C5C]',
  inactive: 'bg-[#fef3cd] text-[#7c5c10]',
  banned:   'bg-[#fde0dc] text-[#7c1a10]',
};

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function Associations() {
  const { users, loading, error, refresh, getRole, getStatus, getId, createUser } = useUsers();
  const associations = users.filter(u => getRole(u) === 'COLLECTIVITE');

  const [modalOpen, setModalOpen] = useState(false);
  const [search,    setSearch]    = useState('');
  const [confirm,   setConfirm]   = useState(null);

  async function handleAdd(userData) {
    try {
      await createUser({ ...userData, role: 'COLLECTIVITE' });
    } catch (e) { alert('Failed to add association: ' + e.message); }
  }

  async function handleDelete(id) {
    try {
      const { adminUsers } = await import('../api/api');
      await adminUsers.delete(id);
      await refresh();
    } catch (e) { alert('Failed to delete: ' + e.message); }
    finally { setConfirm(null); }
  }

  const filtered = associations.filter(u => {
    const q = search.toLowerCase();
    return (u.name ?? u.fullName ?? '').toLowerCase().includes(q) || (u.email ?? '').includes(q);
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1a2e2e]" style={{ fontFamily: 'DM Serif Display, serif' }}>Associations</h1>
          <p className="text-sm text-[#6b8a82] mt-0.5">{loading ? 'Loading…' : `${associations.length} registered associations`}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={refresh} className="px-3 py-2.5 rounded-xl text-sm border border-[#e2ece8] bg-white text-[#6b8a82] cursor-pointer">↻</button>
          <button onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-white text-sm font-semibold border-none cursor-pointer"
            style={{ background: '#0F5C5C' }}>+ Add Association</button>
        </div>
      </div>

      {error && <div className="px-4 py-3 text-sm rounded-xl" style={{ background: '#fde8dc', color: '#8b3d1e' }}>⚠ {error}</div>}

      <div className="bg-white rounded-2xl p-4 border border-[#e2ece8]" style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search associations…"
          className="w-full rounded-xl px-4 py-2 text-sm border border-[#e2ece8] bg-[#FAF9F7] text-[#1a2e2e] outline-none" />
      </div>

      <div className="bg-white rounded-2xl border border-[#e2ece8] overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>
        {loading ? <div className="text-center py-16 text-sm text-[#6b8a82]">Loading…</div> : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#F5F0E8]">
                {['Association','Status','Phone','Joined','Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold tracking-widest text-[#6b8a82] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const id     = getId(u);
                const name   = u.name ?? u.fullName ?? 'Unknown';
                const status = getStatus(u);
                return (
                  <tr key={id} className="border-t border-[#e2ece8] hover:bg-[#FAF9F7]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#3b3b8b] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">{initials(name)}</div>
                        <div>
                          <p className="text-sm font-medium text-[#1a2e2e]">{name}</p>
                          <p className="text-xs text-[#6b8a82]">{u.email ?? ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[status] ?? STATUS_STYLES.inactive}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#6b8a82]">{u.phone ?? u.phoneNumber ?? '—'}</td>
                    <td className="px-5 py-3 text-xs text-[#6b8a82]">{u.createdAt ? new Date(u.createdAt).toISOString().slice(0,10) : '—'}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => setConfirm(id)} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#fde0dc] text-[#7c1a10] border-none cursor-pointer">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && <div className="text-center py-10 text-sm text-[#6b8a82]">No associations found.</div>}
      </div>

      <AddUserModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAdd} fixedRole="Association" />

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => setConfirm(null)}>
          <div className="text-center bg-white shadow-2xl rounded-2xl p-7 w-72" onClick={e => e.stopPropagation()}>
            <div className="mb-3 text-3xl">🗑</div>
            <h3 className="font-semibold text-[#1a2e2e] mb-2">Delete association?</h3>
            <p className="text-sm text-[#6b8a82] mb-5">This cannot be undone.</p>
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