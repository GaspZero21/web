// pages/Profile.jsx
import { useState } from 'react';

export default function Profile() {
  const [name,     setName]     = useState('Admin');
  const [email,    setEmail]    = useState('admin@madad.com');
  const [password, setPassword] = useState('');
  const [saved,    setSaved]    = useState(false);

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-[#1a2e2e]" style={{ fontFamily: 'DM Serif Display, serif' }}>Profile</h1>
        <p className="text-sm text-[#6b8a82] mt-0.5">Manage your admin account</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e2ece8] overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>

        {/* Avatar header */}
        <div className="bg-[#0F5C5C] px-6 py-8 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#C96E4A] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            AD
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">{name}</h2>
            <p className="text-white/60 text-sm mt-0.5">{email}</p>
            <span className="mt-2 inline-block text-xs bg-white/15 text-white px-2.5 py-0.5 rounded-full">Super Admin</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 flex flex-col gap-5">
          {[
            { label:'Full Name', type:'text', value:name, setter:setName },
            { label:'Email Address', type:'email', value:email, setter:setEmail },
            { label:'New Password', type:'password', value:password, setter:setPassword, placeholder:'Leave blank to keep current' },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs font-semibold text-[#6b8a82] mb-2 uppercase tracking-wide">{f.label}</label>
              <input
                type={f.type} value={f.value}
                onChange={e => f.setter(e.target.value)}
                placeholder={f.placeholder || ''}
                className="w-full rounded-xl px-4 py-3 text-sm border border-[#e2ece8] bg-[#FAF9F7] text-[#1a2e2e] outline-none"
              />
            </div>
          ))}

          <button type="submit"
            className="self-start px-6 py-3 rounded-xl text-white text-sm font-semibold border-none cursor-pointer"
            style={{ background: '#0F5C5C' }}>
            {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}