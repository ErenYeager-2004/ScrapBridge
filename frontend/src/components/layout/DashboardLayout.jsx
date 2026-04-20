import { Outlet } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Sidebar />
      <Navbar />
      {/* Main content — offset for fixed sidebar (w-64) and navbar (h-16) */}
      <main className="ml-64 pt-16 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
