import Sidebar from './components/sidebar';

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
