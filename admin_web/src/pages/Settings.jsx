// pages/Settings.jsx
import { useState } from 'react';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts,   setEmailAlerts]   = useState(false);
  const [theme,         setTheme]         = useState('light');
  const [language,      setLanguage]      = useState('en');
  const [saved,         setSaved]         = useState(false);

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const Toggle = ({ checked, onChange }) => (
    <button type="button" onClick={() => onChange(!checked)}
      className="relative w-11 h-6 rounded-full border-none cursor-pointer flex-shrink-0"
      style={{ background: checked ? '#0F5C5C' : '#e2ece8' }}>
      <div className="absolute top-1 w-4 h-4 rounded-full bg-white"
        style={{ left: checked ? '24px' : '4px' }} />
    </button>
  );

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-[#1a2e2e]" style={{ fontFamily: 'DM Serif Display, serif' }}>Settings</h1>
        <p className="text-sm text-[#6b8a82] mt-0.5">Configure your admin preferences</p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-4">

        {/* Appearance */}
        <div className="bg-white rounded-2xl border border-[#e2ece8] overflow-hidden"
          style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>
          <div className="px-6 py-4 border-b border-[#e2ece8]">
            <h2 className="font-semibold text-[#1a2e2e] text-sm">Appearance</h2>
          </div>
          <div className="p-6 flex flex-col gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#6b8a82] mb-2 uppercase tracking-wide">Theme</label>
              <select value={theme} onChange={e => setTheme(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm border border-[#e2ece8] bg-[#FAF9F7] text-[#1a2e2e] outline-none">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6b8a82] mb-2 uppercase tracking-wide">Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm border border-[#e2ece8] bg-[#FAF9F7] text-[#1a2e2e] outline-none">
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-[#e2ece8] overflow-hidden"
          style={{ boxShadow: '0 2px 12px rgba(15,92,92,0.06)' }}>
          <div className="px-6 py-4 border-b border-[#e2ece8]">
            <h2 className="font-semibold text-[#1a2e2e] text-sm">Notifications</h2>
          </div>
          <div className="p-6 flex flex-col gap-4">
            {[
              { label:'Push Notifications', sub:'Receive alerts in the browser', val:notifications, set:setNotifications },
              { label:'Email Alerts',       sub:'Get notified via email',         val:emailAlerts,   set:setEmailAlerts },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#1a2e2e]">{item.label}</p>
                  <p className="text-xs text-[#6b8a82] mt-0.5">{item.sub}</p>
                </div>
                <Toggle checked={item.val} onChange={item.set} />
              </div>
            ))}
          </div>
        </div>

        <button type="submit"
          className="self-start px-6 py-3 rounded-xl text-white text-sm font-semibold border-none cursor-pointer"
          style={{ background: '#0F5C5C' }}>
          {saved ? '✓ Saved!' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}