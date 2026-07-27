'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 flex items-center justify-center px-4 py-12">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-primary-500/20 rounded-full filter blur-3xl opacity-50 animate-pulse-slow" />
        <div className="absolute -bottom-40 right-0 w-80 h-80 bg-cyan-500/20 rounded-full filter blur-3xl opacity-50 animate-pulse-slow" />
      </div>

      {children}
    </div>
  );
}
