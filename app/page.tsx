'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

/**
 * Root page — auto-redirects based on auth state.
 * If token exists → go to /dashboard
 * If no token → go to /login
 */
export default function RootPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return; // Wait for auth state to load from localStorage
    if (user) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  // Show minimal loading state while redirecting (themed to green & orange)
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#050914',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #00e87e 0%, #f97316 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.6rem',
          boxShadow: '0 0 32px rgba(0,232,126,0.25)',
        }}
      >
        🌿
      </div>
      <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'monospace', letterSpacing: '0.15em' }}>
        FOODRESCUE
      </p>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '3px solid rgba(249,115,22,0.15)',
          borderTopColor: '#00e87e',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
