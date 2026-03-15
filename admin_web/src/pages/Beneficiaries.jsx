// pages/Beneficiaries.jsx
import { useState } from 'react';
import AddUserModal from '../components/AddUserModal';

const STATUS_STYLES = {
  active:  'bg-[#d6ebe5] text-[#0F5C5C]',
  pending: 'bg-[#fef3cd] text-[#7c5c10]',
  blocked: 'bg-[#fde0dc] text-[#7c1a10]',
};

const INITIAL = [
  { id:1, name:'Sara Toumi',    email:'sara@gmail.com',    phone:'+213 661 222', status:'active',  joined:'2024-02-05', avatar:'ST' },
  { id:2, name:'Yassine Bouri', email:'yassine@gmail.com', phone:'+213 555 333', status:'active',  joined:'2024-04-01', avatar:'YB' },
  { id:3, name:'Fatima Zara',   email:'fatima@gmail.com',  phone:'+213 551 444', status:'pending', joined:'2024-05-30', avatar:'FZ' },
];

export default function Beneficiaries() {
  const [list,      setList]      = useState(INITIAL);
  const [modalOpen, setModalOpen] = useState(false);
  const [search,    setSearch]    = useState('');
  const [confirm,   setConfirm]   = useState(null);

  const filtered = list.filter(u => {
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.includes(q);
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1a2e2e]"
            style={{ fontFamily: 'DM Serif Display, serif' }}>Beneficiaries</h1>
          <p className="text-sm text-[#6b8a82] mt-0.5">{list.length} families & individuals</p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold border-none cursor-pointer"
          style={{ background: '#0F5C5C' }}>
          + Add Beneficiary
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-[#e2ece8] flex gap-3"
        style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search beneficiaries…"
          className="flex-1 rounded-xl px-4 py-2 text-sm border border-[#e2ece8] bg-[#FAF9F7] text-[#1a2e2e] outline-none" />
      </div>

      <div className="bg-white rounded-2xl border border-[#e2ece8] overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#F5F0E8]">
              {['Beneficiary','Status','Phone','Joined','Action'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold tracking-widest text-[#6b8a82] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-t border-[#e2ece8] hover:bg-[#FAF9F7]">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#C96E4A] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">{u.avatar}</div>
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
                <td className="px-5 py-3">
                  <button onClick={() => setConfirm(u.id)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#fde0dc] text-[#7c1a10] border-none cursor-pointer">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-10 text-sm text-[#6b8a82]">No beneficiaries found.</div>}
      </div>

      <AddUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={user => setList(p => [...p, user])}
        fixedRole="Beneficiary"
      />

      {confirm && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setConfirm(null)}>
          <div className="bg-white rounded-2xl p-7 w-72 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
            <div className="text-3xl mb-3">🗑</div>
            <h3 className="font-semibold text-[#1a2e2e] mb-2">Delete beneficiary?</h3>
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