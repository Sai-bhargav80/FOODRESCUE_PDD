'use client';

import { useRouter, usePathname } from 'next/navigation';
import { UtensilsCrossed, Plus, ClipboardList, User } from 'lucide-react';

type DashTab = 'listings' | 'post' | 'activity';

interface BottomNavProps {
  /** Only used on the dashboard page to track/change the active in-page tab */
  activeTab?: DashTab;
  onTabChange?: (tab: DashTab) => void;
}

const NAV_ITEMS = [
  { id: 'listings' as DashTab, label: 'Listings',    icon: UtensilsCrossed },
  { id: 'post'     as DashTab, label: 'Post Food',   icon: Plus            },
  { id: 'activity' as DashTab, label: 'My Activity', icon: ClipboardList   },
] as const;

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const isProfile = pathname === '/profile';

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(5,9,20,0.97)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        zIndex: 50,
        display: 'flex',
        height: 60,
      }}
    >
      {/* Dashboard tabs */}
      {NAV_ITEMS.map((tab) => {
        const active = !isProfile && activeTab === tab.id;
        const Icon   = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => {
              if (isProfile) {
                // navigate back to dashboard and select the right tab
                router.push('/dashboard');
              } else {
                onTabChange?.(tab.id);
              }
            }}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              padding: '6px 0',
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
          >
            {active && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 32,
                  height: 2,
                  background: '#22C55E',
                  borderRadius: '0 0 4px 4px',
                }}
              />
            )}
            <Icon
              size={20}
              color={active ? '#22C55E' : '#6b7280'}
              strokeWidth={active ? 2.5 : 1.8}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: active ? 700 : 500,
                color: active ? '#22C55E' : '#6b7280',
                letterSpacing: '0.02em',
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}

      {/* Profile tab */}
      <button
        onClick={() => router.push('/profile')}
        style={{
          flex: 1,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          padding: '6px 0',
          position: 'relative',
          transition: 'all 0.15s ease',
        }}
      >
        {isProfile && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 32,
              height: 2,
              background: '#22C55E',
              borderRadius: '0 0 4px 4px',
            }}
          />
        )}
        <User
          size={20}
          color={isProfile ? '#22C55E' : '#6b7280'}
          strokeWidth={isProfile ? 2.5 : 1.8}
        />
        <span
          style={{
            fontSize: 10,
            fontWeight: isProfile ? 700 : 500,
            color: isProfile ? '#22C55E' : '#6b7280',
            letterSpacing: '0.02em',
          }}
        >
          Profile
        </span>
      </button>
    </nav>
  );
}
