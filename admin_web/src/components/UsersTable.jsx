// components/UsersTable.jsx
import { useState } from 'react';

const STATUS_STYLES = {
  active:      'bg-[#d6ebe5] text-[#0F5C5C]',
  pending:     'bg-[#fef3cd] text-[#7c5c10]',
  blocked:     'bg-[#fde0dc] text-[#7c1a10]',
};

export default function UsersTable({ users: propUsers, showType = true }) {
  const [users, setUsers] = useState(propUsers || [
    { id:1, name:'Ahmed Benali',  email:'ahmed@gmail.com',  role:'Donor',       status:'active'  },
    { id:2, name:'Sara Toumi',    email:'sara@gmail.com',   role:'Beneficiary', status:'active'  },
    { id:3, name:'Ali Meziani',   email:'ali@gmail.com',    role:'Donor',       status:'pending' },
    { id:4, name:'Nadia Saad',    email:'nadia@gmail.com',  role:'Beneficiary', status:'blocked' },
    { id:5, name:'Karim Bouri',   email:'karim@gmail.com',  role:'Donor',       status:'active'  },
  ]);

  const [confirm, setConfirm] = useState(null);

  const initials = name => name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

  function deleteUser(id) {
    setUsers(u => u.filter(x => x.id !== id));
    setConfirm(null);
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e2ece8] overflow-hidden"
      style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#F5F0E8]">
            <th className="text-left px-5 py-3 text-[10px] font-semibold tracking-widest text-[#6b8a82] uppercase">User</th>
            {showType && <th className="text-left px-5 py-3 text-[10px] font-semibold tracking-widest text-[#6b8a82] uppercase">Role</th>}
            <th className="text-left px-5 py-3 text-[10px] font-semibold tracking-widest text-[#6b8a82] uppercase">Status</th>
            <th className="text-left px-5 py-3 text-[10px] font-semibold tracking-widest text-[#6b8a82] uppercase">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={u.id} className="border-t border-[#e2ece8] hover:bg-[#FAF9F7]">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0F5C5C] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {initials(u.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1a2e2e]">{u.name}</p>
                    <p className="text-xs text-[#6b8a82]">{u.email}</p>
                  </div>
                </div>
              </td>
              {showType && (
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${u.role==='Donor' ? 'bg-[#d6ebe5] text-[#0F5C5C]' : 'bg-[#fde8dc] text-[#8b3d1e]'}`}>
                    {u.role === 'Donor' ? '🤲' : '🍽'} {u.role}
                  </span>
                </td>
              )}
              <td className="px-5 py-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[u.status] || STATUS_STYLES.pending}`}>
                  {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                </span>
              </td>
              <td className="px-5 py-3">
                <button
                  onClick={() => setConfirm(u.id)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#fde0dc] text-[#7c1a10] cursor-pointer border-none"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="text-center py-10 text-sm text-[#6b8a82]">No users found.</div>
      )}

      {/* Confirm modal */}
      {confirm && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
          onClick={() => setConfirm(null)}>
          <div className="bg-white rounded-2xl p-7 w-72 shadow-2xl text-center"
            onClick={e => e.stopPropagation()}>
            <div className="text-3xl mb-3">🗑</div>
            <h3 className="font-semibold text-[#1a2e2e] mb-2">Delete user?</h3>
            <p className="text-sm text-[#6b8a82] mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)}
                className="flex-1 py-2 rounded-xl border border-[#e2ece8] text-sm text-[#6b8a82] cursor-pointer bg-white">
                Cancel
              </button>
              <button onClick={() => deleteUser(confirm)}
                className="flex-1 py-2 rounded-xl bg-[#C96E4A] text-white text-sm font-semibold cursor-pointer border-none">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}