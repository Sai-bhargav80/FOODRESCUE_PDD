'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Clock3, RefreshCw, AlertCircle, Trash2, Package, Plus } from 'lucide-react';
import { foodAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { MOCK_LISTINGS } from '@/lib/mock-data';

type TabType = 'All' | 'Active' | 'Completed' | 'Expired';

const TABS: TabType[] = ['All', 'Active', 'Completed', 'Expired'];

const CATEGORY_EMOJI: Record<string, string> = {
  produce: '🥦',
  dairy: '🧀',
  bakery: '🍞',
  meat: '🥩',
  prepared: '🍲',
  canned: '🥫',
  beverages: '🧃',
  snacks: '🍿',
  other: '🍽️',
};

function getCategoryEmoji(category: string): string {
  return CATEGORY_EMOJI[category?.toLowerCase()] ?? '🍽️';
}

function StatusBadge({ status }: { status: string }) {
  switch (status?.toLowerCase()) {
    case 'available':
      return <span className="badge badge-blue">Available</span>;
    case 'claimed':
      return <span className="badge badge-amber">Claimed</span>;
    case 'completed':
      return <span className="badge badge-green">Completed</span>;
    case 'expired':
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '2px 10px',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 600,
            background: 'rgba(255,255,255,0.08)',
            color: '#6b7280',
            letterSpacing: '0.02em',
          }}
        >
          Expired
        </span>
      );
    case 'reported':
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '2px 10px',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 600,
            background: 'rgba(255,255,255,0.08)',
            color: '#6b7280',
            letterSpacing: '0.02em',
          }}
        >
          Reported
        </span>
      );
    default:
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '2px 10px',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 600,
            background: 'rgba(255,255,255,0.08)',
            color: '#6b7280',
          }}
        >
          {status}
        </span>
      );
  }
}

function SkeletonCard() {
  return (
    <div className="app-card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.08)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              height: 14,
              width: '60%',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.08)',
              marginBottom: 8,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              height: 10,
              width: '35%',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.06)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {[45, 60].map((w, i) => (
          <div
            key={i}
            style={{
              height: 10,
              width: w,
              borderRadius: 6,
              background: 'rgba(255,255,255,0.06)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function FoodCard({
  item,
  onDelete,
  isDeleting,
}: {
  item: any;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}) {
  const status = item.status ?? 'available';
  const emoji = getCategoryEmoji(item.category);

  return (
    <div
      className="app-card animate-slide-up"
      style={{
        padding: '1rem',
        marginBottom: '0.75rem',
        opacity: isDeleting ? 0.5 : 1,
        transition: 'opacity 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        {/* Emoji icon */}
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} loading="lazy" style={{ width: 44, height: 44, borderRadius: '12px', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(255,255,255,0.05)' }} />
        ) : (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              flexShrink: 0,
            }}
          >
            {emoji}
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <h3
              style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#f9fafb',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.title ?? item.foodName ?? 'Untitled Item'}
            </h3>
            <StatusBadge status={status} />
          </div>

          {/* Meta row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
            {item.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: '#9ca3af' }}>
                <MapPin size={12} />
                {item.location}
              </span>
            )}
            {(item.expiresAt ?? item.expiryTime ?? item.expiry) && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: '#9ca3af' }}>
                <Clock3 size={12} />
                {item.expiresAt ?? item.expiryTime ?? item.expiry}
              </span>
            )}
            {item.quantity && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: '#9ca3af' }}>
                <Package size={12} />
                {item.quantity}
              </span>
            )}
          </div>

          {/* Claimed banner */}
          {status.toLowerCase() === 'claimed' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(251,191,36,0.12)',
                border: '1px solid rgba(251,191,36,0.2)',
                borderRadius: '8px',
                padding: '0.35rem 0.6rem',
                marginBottom: '0.35rem',
                fontSize: '0.78rem',
                color: '#fbbf24',
                fontWeight: 500,
              }}
            >
              🎉 Someone is rescuing this!
            </div>
          )}

          {/* Completed XP badge */}
          {status.toLowerCase() === 'completed' && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: 'rgba(34,197,94,0.15)',
                border: '1px solid rgba(34,197,94,0.25)',
                borderRadius: '8px',
                padding: '0.25rem 0.6rem',
                fontSize: '0.75rem',
                color: '#4ade80',
                fontWeight: 600,
              }}
            >
              ✨ +10 XP earned
            </div>
          )}
        </div>

        {/* Delete button */}
        <button
          onClick={() => onDelete(item.id ?? item._id)}
          disabled={isDeleting}
          aria-label="Delete listing"
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '8px',
            padding: '0.45rem',
            color: '#f87171',
            cursor: isDeleting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.22)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)';
          }}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

export default function MyDonationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('All');

  useEffect(() => {
    if (user === null) {
      router.replace('/login');
    }
  }, [user, router]);

  const {
    data: listings = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['foodListings'],
    queryFn: async () => {
      try {
        return (await foodAPI.getListings()).data;
      } catch {
        return MOCK_LISTINGS;
      }
    },
    retry: 0,
  });

  const myDonations: any[] = listings.filter((i: any) => i.postedBy === user?.id);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => foodAPI.reportListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodListings'] });
    },
  });

  const filteredDonations = myDonations.filter(item => {
    if (activeTab === 'All') return true;
    const status = (item.status ?? '').toLowerCase();
    if (activeTab === 'Active') return status === 'available';
    if (activeTab === 'Completed') return status === 'completed';
    if (activeTab === 'Expired') return status === 'expired' || status === 'reported';
    return true;
  });

  const totalDonations = myDonations.length;
  const activeListings = myDonations.filter(i => (i.status ?? '').toLowerCase() === 'available').length;
  const completedRescues = myDonations.filter(i => (i.status ?? '').toLowerCase() === 'completed').length;

  if (user === undefined) {
    return null; // still loading auth
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #0f1117)', paddingBottom: '2rem' }}>
      {/* Header card */}
      <div
        className="app-card-glow"
        style={{
          margin: '1rem',
          padding: '1.25rem',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f9fafb', margin: 0 }}>My Donations</h1>
            <p style={{ fontSize: '0.82rem', color: '#9ca3af', margin: '0.2rem 0 0' }}>
              Track everything you've shared with the community
            </p>
          </div>
          <button
            onClick={() => refetch()}
            aria-label="Refresh donations"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px',
              padding: '0.5rem',
              color: '#9ca3af',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease, color 0.15s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.13)';
              (e.currentTarget as HTMLButtonElement).style.color = '#f9fafb';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
              (e.currentTarget as HTMLButtonElement).style.color = '#9ca3af';
            }}
          >
            <RefreshCw size={17} />
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          {[
            { label: 'Total', value: totalDonations, color: '#818cf8' },
            { label: 'Active', value: activeListings, color: '#34d399' },
            { label: 'Completed', value: completedRescues, color: '#fbbf24' },
          ].map(stat => (
            <div
              key={stat.label}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '0.65rem 0.5rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color, lineHeight: 1 }}>
                {isLoading ? '—' : stat.value}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.2rem', fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ padding: '0 1rem 0.75rem' }}>
        <div
          style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '4px',
            gap: '2px',
          }}
        >
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '0.45rem 0.25rem',
                borderRadius: '9px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: activeTab === tab ? 600 : 500,
                background: activeTab === tab ? 'rgba(129,140,248,0.18)' : 'transparent',
                color: activeTab === tab ? '#818cf8' : '#6b7280',
                transition: 'all 0.15s ease',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div style={{ padding: '0 1rem' }}>
        {/* Loading state */}
        {isLoading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2.5rem 1rem',
              gap: '0.75rem',
              textAlign: 'center',
            }}
          >
            <AlertCircle size={36} color="#f87171" />
            <p style={{ color: '#f87171', fontWeight: 600, margin: 0 }}>Could not load your donations</p>
            <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: 0 }}>Please check your connection and try again.</p>
            <button
              onClick={() => refetch()}
              style={{
                marginTop: '0.5rem',
                padding: '0.6rem 1.4rem',
                background: 'rgba(129,140,248,0.15)',
                border: '1px solid rgba(129,140,248,0.3)',
                borderRadius: '10px',
                color: '#818cf8',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredDonations.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3rem 1rem',
              gap: '0.75rem',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '3.5rem' }}>🍽️</span>
            <p style={{ color: '#f9fafb', fontWeight: 600, fontSize: '1.05rem', margin: 0 }}>
              {activeTab === 'All' ? 'No donations yet' : `No ${activeTab.toLowerCase()} donations`}
            </p>
            <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: 0 }}>
              {activeTab === 'All' ? 'Be the first to donate!' : 'Nothing here yet.'}
            </p>
            {activeTab === 'All' && (
              <Link
                href="/post-food"
                style={{
                  marginTop: '0.5rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem 1.5rem',
                  background: 'linear-gradient(135deg, #818cf8, #6366f1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                <Plus size={16} />
                Donate Food
              </Link>
            )}
          </div>
        )}

        {/* Food card list */}
        {!isLoading && !error && filteredDonations.length > 0 && (
          <div>
            {filteredDonations.map((item: any) => {
              const id = item.id ?? item._id;
              return (
                <FoodCard
                  key={id}
                  item={item}
                  onDelete={id => deleteMutation.mutate(id)}
                  isDeleting={deleteMutation.isPending && deleteMutation.variables === id}
                />
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes slide-up {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease both;
        }
      `}</style>
    </div>
  );
}
