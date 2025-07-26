"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchUserInfo } from '@/services/gateway/user';
import { ArrowRight, Server, Globe, Mail, MessageSquare, Code, FolderGit2 } from 'lucide-react';
 
 const services = [
  {
    name: 'File Manager',
    description: 'Manage your files and folders with an integrated editor.',
    icon: <FolderGit2 size={32} className="text-purple-400" />,
    href: '/users/editor',
    gradient: 'from-purple-500/20 to-indigo-500/20',
    border: 'border-purple-500/30'
  },
   {
    name: 'VPS Containers',
    description: 'Scalable, high-performance container hosting.',
    icon: <Server size={32} className="text-blue-400" />,
    href: '/vps',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/30'
  },
  {
    name: 'Web Hosting',
    description: 'Fast, reliable hosting with free SSL certificates.',
    icon: <Globe size={32} className="text-green-400" />,
    href: '/dashboard/hosting',
    gradient: 'from-green-500/20 to-emerald-500/20',
    border: 'border-green-500/30'
  },
  {
    name: 'API Services',
    description: 'Host your APIs with our managed infrastructure.',
    icon: <Code size={32} className="text-yellow-400" />,
    href: '/dashboard/api',
    gradient: 'from-yellow-500/20 to-orange-500/20',
    border: 'border-yellow-500/30'
  },
  {
    name: 'Email Services',
    description: 'Reliable, secure email hosting for your domain.',
    icon: <Mail size={32} className="text-red-400" />,
    href: '/dashboard/email',
    gradient: 'from-red-500/20 to-pink-500/20',
    border: 'border-red-500/30'
  },
  {
    name: 'WhatsApp API',
    description: 'Integrate WhatsApp messaging into your apps.',
    icon: <MessageSquare size={32} className="text-teal-400" />,
    href: '/dashboard/whatsapp',
    gradient: 'from-teal-500/20 to-cyan-500/20',
    border: 'border-teal-500/30'
  },
];

export default function DashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await fetchUserInfo();
      setUser(userData);
    };
    loadUser();
  }, []);

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-4xl font-black mb-2">
          Welcome back, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{user?.username || '...'}</span>
        </h1>
        <p className="text-xl text-white/70">Here's an overview of your services.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <Link href={service.href} key={service.name}>
            <div className={`group relative p-8 bg-gradient-to-br ${service.gradient} backdrop-blur-md border ${service.border} rounded-3xl hover:scale-105 transition-all duration-500 hover:shadow-2xl h-full flex flex-col`}>
              <div className="flex-grow">
                <div className="mb-6 flex items-center justify-between">
                  {service.icon}
                  <ArrowRight className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-transform duration-300" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{service.name}</h3>
                <p className="text-white/70 leading-relaxed">{service.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}