'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

/**
 * Root page — auto-redirects based on auth state.
 * If token exists → go to /dashboard (equivalent to DataStore token check in Android)
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

  // Show minimal loading state while redirecting
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#050914',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #22C55E, #16a34a)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          boxShadow: '0 0 32px rgba(34,197,94,0.3)',
        }}
      >
        🌿
      </div>
      <p style={{ color: '#6b7280', fontSize: '0.8rem', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
        FOODRESCUE
      </p>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '2px solid rgba(34,197,94,0.2)',
          borderTop: '2px solid #22C55E',
          animation: 'spin 1s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
