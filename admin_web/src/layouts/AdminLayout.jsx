// src/layouts/AdminLayout.jsx
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar  from '../components/Navbar';

const PAGE_TITLES = {
  '/dashboard':     'Dashboard',
  '/users':         'All Users',
  '/donors':        'Donors',
  '/beneficiaries': 'Beneficiaries',
  '/associations':  'Associations',
  '/donations':     'Donations',
  '/map':           'Donations Map',
  '/profile':       'Profile',
  '/settings':      'Settings',
  '/chat':          'Food Saver Chat',
};

export default function AdminLayout() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || 'Admin';

  return (
    <div className="flex h-screen bg-[#F5F0E8]">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar title={title} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}