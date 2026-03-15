import { useState } from "react";

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState("light");

  const handleSave = (e) => {
    e.preventDefault();
    alert("Settings saved!");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="bg-white shadow rounded-lg p-6 max-w-xl">

        <form className="flex flex-col gap-6" onSubmit={handleSave}>

          {/* Theme */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Theme</label>
            <select
              className="border p-3 rounded"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <label className="font-semibold">Email Notifications</label>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
          </div>

          <button
            type="submit"
            className="bg-primary text-white p-3 rounded"
          >
            Save Settings
          </button>

        </form>

      </div>
    </div>
  );
}