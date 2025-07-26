"use client"

import { useState } from 'react';
import Link from 'next/link';
import { Search, LayoutDashboard, Server, Globe, Mail, MessageSquare, Settings, LifeBuoy, FolderGit2 } from 'lucide-react';
 
 const services = [
   { name: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/dashboard' },
   { name: 'File Manager', icon: <FolderGit2 size={20} />, href: '/users/editor' },
  { name: 'VPS Containers', icon: <Server size={20} />, href: '/vps' },
  { name: 'Web Hosting', icon: <Globe size={20} />, href: '/dashboard/hosting' },
  { name: 'API Services', icon: <Globe size={20} />, href: '/dashboard/api' },
  { name: 'Email Services', icon: <Mail size={20} />, href: '/dashboard/email' },
  { name: 'WhatsApp API', icon: <MessageSquare size={20} />, href: '/dashboard/whatsapp' },
];

const otherLinks = [
  { name: 'Settings', icon: <Settings size={20} />, href: '/dashboard/settings' },
  { name: 'Support', icon: <LifeBuoy size={20} />, href: '/dashboard/support' },
];

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServices = services.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="fixed top-0 left-0 w-64 h-full bg-black/30 backdrop-blur-lg border-r border-white/10 z-40 flex flex-col mt-16">
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>
      </div>

      <nav className="flex-grow p-4 space-y-2">
        {filteredServices.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setActiveItem(item.name)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
              activeItem === item.name
                ? 'bg-gradient-to-r from-blue-600/50 to-purple-600/50 text-white shadow-lg'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        {otherLinks.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setActiveItem(item.name)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
              activeItem === item.name
                ? 'bg-white/10 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
