"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchUserInfo } from '@/services/gateway/user';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await fetchUserInfo();
      if (!user) {
        router.push('/login');
      } else {
        setIsAuthorized(true);
      }
    };
    checkAuth();
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-white text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  return children;
}