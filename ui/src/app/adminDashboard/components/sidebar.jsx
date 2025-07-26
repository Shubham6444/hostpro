'use client';

import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6 text-white flex flex-col ">
      <h2 className="text-2xl font-bold mb-6 mt-15">Admin Panel</h2>
      <nav className="flex flex-col gap-4">
        <Link href="/adminDashboard/vm" className="hover:bg-gray-700 p-2 rounded">All VMs</Link>
        <Link href="/admin/users" className="hover:bg-gray-700 p-2 rounded">Users</Link>
        <Link href="/admin/monitor" className="hover:bg-gray-700 p-2 rounded">Monitor</Link>
      </nav>
    </aside>
  );
}
