// pages/Associations.jsx
import { useState } from 'react';
import AddUserModal from '../components/AddUserModal';

const STATUS_STYLES = {
  active:  'bg-[#d6ebe5] text-[#0F5C5C]',
  pending: 'bg-[#fef3cd] text-[#7c5c10]',
  blocked: 'bg-[#fde0dc] text-[#7c1a10]',
};

const INITIAL = [
  { id:1, name:'Green Future Org',  email:'green@org.dz',   phone:'+213 21 111 222', status:'active',  joined:'2024-01-05', members:12, avatar:'GF' },
  { id:2, name:'Food Hope Algeria', email:'hope@food.dz',   phone:'+213 21 333 444', status:'active',  joined:'2024-03-10', members:8,  avatar:'FH' },
  { id:3, name:'Solidarity DZ',     email:'sol@dz.org',     phone:'+213 21 555 666', status:'pending', joined:'2024-05-20', members:5,  avatar:'SD' },
];

export default function Associations() {
  const [list,      setList]      = useState(INITIAL);
  const [modalOpen, setModalOpen] = useState(false);
  const [search,    setSearch]    = useState('');
  const [confirm,   setConfirm]   = useState(null);
  const [selected,  setSelected]  = useState(null);

  const filtered = list.filter(u => {
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.includes(q);
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1a2e2e]"
            style={{ fontFamily: 'DM Serif Display, serif' }}>Associations</h1>
          <p className="text-sm text-[#6b8a82] mt-0.5">{list.length} registered organisations</p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold border-none cursor-pointer"
          style={{ background: '#0F5C5C' }}>
          + Add Association
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          ['🏢', 'Total',   list.length,                              '#e8e8f0', '#3b3b8b'],
          ['✅', 'Active',  list.filter(u=>u.status==='active').length,'#d6ebe5', '#0F5C5C'],
          ['⏳', 'Pending', list.filter(u=>u.status==='pending').length,'#fef3cd', '#7c5c10'],
        ].map(([icon, label, val, bg, col]) => (
          <div key={label} className="bg-white rounded-2xl px-5 py-4 border border-[#e2ece8] flex items-center gap-3"
            style={{ boxShadow: '0 2px 8px rgba(15,92,92,0.05)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: bg }}>
              {icon}
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: col, fontFamily: 'DM Serif Display, serif' }}>{val}</p>
              <p className="text-xs text-[#6b8a82]">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2ece8]"
        style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search associations…"
          className="w-full rounded-xl px-4 py-2 text-sm border border-[#e2ece8] bg-[#FAF9F7] text-[#1a2e2e] outline-none" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e2ece8] overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#F5F0E8]">
              {['Organisation','Status','Phone','Joined','Members','Action'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold tracking-widest text-[#6b8a82] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-t border-[#e2ece8] hover:bg-[#FAF9F7] cursor-pointer"
                onClick={() => setSelected(u)}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#e8e8f0] flex items-center justify-center text-[#3b3b8b] text-xs font-bold flex-shrink-0">
                      {u.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1a2e2e]">{u.name}</p>
                      <p className="text-xs text-[#6b8a82]">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[u.status]}`}>
                    {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-[#6b8a82]">{u.phone}</td>
                <td className="px-5 py-3 text-xs text-[#6b8a82]">{u.joined}</td>
                <td className="px-5 py-3 text-sm font-semibold text-[#3b3b8b]">{u.members}</td>
                <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setConfirm(u.id)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#fde0dc] text-[#7c1a10] border-none cursor-pointer">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-10 text-sm text-[#6b8a82]">No associations found.</div>}
      </div>

      {/* Add modal */}
      <AddUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={user => setList(p => [...p, { ...user, members: 1 }])}
        fixedRole="Association"
      />

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-80 overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="bg-[#0F5C5C] px-6 py-5">
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-white font-bold text-lg mb-3">
                {selected.avatar}
              </div>
              <h2 className="text-white font-semibold">{selected.name}</h2>
              <p className="text-white/55 text-xs mt-0.5">{selected.email}</p>
            </div>
            <div className="p-5 flex flex-col gap-0">
              {[['Phone',   selected.phone],
                ['Status',  selected.status],
                ['Joined',  selected.joined],
                ['Members', selected.members]].map(([k,v]) => (
                <div key={k} className="flex justify-between py-2.5 border-b border-[#e2ece8] last:border-0">
                  <span className="text-xs text-[#6b8a82]">{k}</span>
                  <span className="text-xs font-medium text-[#1a2e2e] capitalize">{v}</span>
                </div>
              ))}
            </div>
            <div className="px-5 pb-5">
              <button onClick={() => setSelected(null)}
                className="w-full py-2.5 rounded-xl text-white text-sm font-semibold border-none cursor-pointer"
                style={{ background: '#0F5C5C' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirm && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setConfirm(null)}>
          <div className="bg-white rounded-2xl p-7 w-72 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
            <div className="text-3xl mb-3">🏢</div>
            <h3 className="font-semibold text-[#1a2e2e] mb-2">Remove association?</h3>
            <p className="text-sm text-[#6b8a82] mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="flex-1 py-2 rounded-xl border border-[#e2ece8] text-sm text-[#6b8a82] cursor-pointer bg-white">Cancel</button>
              <button onClick={() => { setList(p => p.filter(u => u.id !== confirm)); setConfirm(null); }} className="flex-1 py-2 rounded-xl bg-[#C96E4A] text-white text-sm font-semibold cursor-pointer border-none">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}