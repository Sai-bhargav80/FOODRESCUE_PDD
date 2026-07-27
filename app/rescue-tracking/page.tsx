'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Clock3, CheckCircle2, Car, Package, HeartHandshake, ChevronRight, Trash2, AlertCircle, Navigation, Timer } from 'lucide-react';
import { foodAPI, claimAPI, rescueAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { MOCK_LISTINGS } from '@/lib/mock-data';

const STEPS = [
  { label: 'Claimed',   desc: 'Matched',   icon: HeartHandshake, emoji: '🤝' },
  { label: 'Transit',   desc: 'En Route',  icon: Car,            emoji: '🚗' },
  { label: 'Collected', desc: 'Picked Up', icon: Package,        emoji: '📦' },
  { label: 'Delivered', desc: 'Complete',  icon: CheckCircle2,   emoji: '✅' },
];

const STATUS_STEP: Record<string, number> = {
  'Claimed': 0, 'On The Way': 1, 'Collected': 2, 'Completed': 3,
};

/* ── ETA Calculator using straight-line distance + avg speed ── */
function useETA(location: string) {
  const [eta, setEta] = useState<string | null>(null);
  const [mapsUrl, setMapsUrl] = useState<string>('');

  useEffect(() => {
    if (!location) return;

    // Build Google Maps URL with the address
    const encoded = encodeURIComponent(location);
    setMapsUrl(`https://www.google.com/maps/dir/?api=1&destination=${encoded}&travelmode=driving`);

    // Use browser geolocation to estimate ETA
    if (!navigator.geolocation) {
      setEta(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat1, longitude: lon1 } = pos.coords;
          // Geocode destination address via Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`
          );
          const data = await res.json();
          if (!data.length) { setEta(null); return; }

          const lat2 = parseFloat(data[0].lat);
          const lon2 = parseFloat(data[0].lon);

          // Haversine distance (km)
          const R = 6371;
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
          const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

          // Assume 25 km/h average city speed
          const mins = Math.round((dist / 25) * 60);
          if (mins < 1) setEta('< 1 min away');
          else if (mins < 60) setEta(`~${mins} min away`);
          else setEta(`~${Math.round(mins / 60)}h ${mins % 60}m away`);
        } catch {
          setEta(null);
        }
      },
      () => setEta(null),
      { timeout: 5000 }
    );
  }, [location]);

  return { eta, mapsUrl };
}

/* ── Single rescue card ── */
function RescueCard({
  item,
  onUpdate,
  onCancel,
  updating,
  cancelling,
}: {
  item: any;
  onUpdate: (id: number, status: string) => void;
  onCancel: (id: number) => void;
  updating: boolean;
  cancelling: boolean;
}) {
  const step   = STATUS_STEP[item.status] ?? 0;
  const isDone = item.status === 'Completed';
  const { eta, mapsUrl } = useETA(item.location);

  const handleNavigate = useCallback(() => {
    // If already in transit, trigger status update then navigate
    if (item.status === 'Claimed') {
      onUpdate(item.id, 'On The Way');
    }
    // Open Google Maps
    window.open(mapsUrl, '_blank');
  }, [item.id, item.status, mapsUrl, onUpdate]);

  return (
    <div className="app-card p-5 space-y-4 animate-slide-up">
      {/* Food info */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge badge-green">{item.category}</span>
            <span className={`badge ${isDone ? 'badge-green' : 'badge-amber'}`}>{item.status}</span>
          </div>
          <h2 className="text-white font-bold text-base mt-1.5 truncate">{item.title}</h2>
          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-dark-500">
            <MapPin className="w-3 h-3 text-primary-400 flex-shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-dark-500">
            <span className="flex items-center gap-1">
              <Clock3 className="w-3 h-3 text-amber-400" />
              {new Date(item.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {/* ETA badge */}
            {eta && !isDone && (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Timer className="w-3 h-3" />
                {eta}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 🗺️ Navigate button — shown when not done */}
      {!isDone && mapsUrl && (
        <button
          onClick={handleNavigate}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.1))',
            border: '1.5px solid rgba(34,197,94,0.4)',
            borderRadius: 14,
            padding: '12px 16px',
            color: '#22C55E',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Navigation className="w-4 h-4" />
          Navigate to Pickup
          {eta && (
            <span style={{
              background: 'rgba(34,197,94,0.2)',
              borderRadius: 20,
              padding: '2px 10px',
              fontSize: 11,
              fontWeight: 600,
            }}>
              {eta}
            </span>
          )}
        </button>
      )}

      {/* Step tracker */}
      <div className="py-2">
        <div className="relative flex justify-between items-center">
          {/* Track background */}
          <div className="absolute left-6 right-6 top-5 h-0.5 bg-white/5" />
          {/* Track fill */}
          <div
            className="absolute left-6 top-5 h-0.5 bg-gradient-primary transition-all duration-500"
            style={{ width: `${(step / (STEPS.length - 1)) * (100 - 12) + 6}%` }}
          />
          {/* Nodes */}
          {STEPS.map((s, idx) => {
            const done   = idx < step;
            const active = idx === step;
            return (
              <div key={idx} className="z-10 flex flex-col items-center gap-1.5 flex-1">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg transition-all duration-300 border ${
                  done    ? 'bg-primary-500 border-primary-400 shadow-glow-sm' :
                  active  ? 'bg-dark-800 border-primary-400 scale-110 shadow-glow-sm' :
                            'bg-white/5 border-white/10'
                }`}>
                  {done ? '✓' : s.emoji}
                </div>
                <p className={`text-[9px] font-bold font-mono uppercase ${active ? 'text-primary-400' : 'text-dark-600'}`}>{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      {!isDone && (
        <div className="flex gap-2 pt-3 border-t border-white/5">
          {(item.status === 'Claimed' || item.status === 'On The Way') && (
            <button
              onClick={() => onCancel(item.id)}
              disabled={cancelling}
              className="px-4 py-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-rose-500/20 transition disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Cancel
            </button>
          )}
          {item.status === 'Claimed' && (
            <button
              onClick={() => onUpdate(item.id, 'On The Way')}
              disabled={updating}
              className="btn-primary flex-1 py-2.5 text-xs"
            >
              🚗 Start Transit <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          {item.status === 'On The Way' && (
            <button
              onClick={() => onUpdate(item.id, 'Collected')}
              disabled={updating}
              className="btn-primary flex-1 py-2.5 text-xs"
            >
              📦 Mark Collected <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          {item.status === 'Collected' && (
            <button
              onClick={() => onUpdate(item.id, 'Completed')}
              disabled={updating}
              className="btn-primary flex-1 py-2.5 text-xs"
            >
              ✅ Mark Delivered <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Page ── */
export default function RescueTrackingPage() {
  const router      = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
  const [tab, setTab] = useState<'active' | 'history'>('active');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  const { data: listings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['foodListings'],
    queryFn: async () => {
      try { return (await foodAPI.getListings()).data; }
      catch { return MOCK_LISTINGS; }
    },
    enabled: !!user,
    retry: 0,
    refetchInterval: 30000, // Auto-refresh every 30s
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      rescueAPI.updateRescueStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['foodListings'] }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => claimAPI.cancelRescue(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['foodListings'] }),
  });

  if (authLoading || !user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-primary-500/30 border-t-primary-400 rounded-full animate-spin" />
      </div>
    );
  }

  const myRescues = listings.filter((i: any) => i.claimedBy === user.id);
  const active    = myRescues.filter((i: any) => i.status !== 'Completed');
  const completed = myRescues.filter((i: any) => i.status === 'Completed');
  const displayed = tab === 'active' ? active : completed;

  return (
    <div style={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden', boxSizing: 'border-box', padding: '24px 16px' }} className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="app-card-glow p-5">
        <p className="text-dark-500 text-xs font-mono uppercase tracking-widest">Rescue Tracking</p>
        <h1 className="text-xl font-black text-white mt-0.5">My Rescue Runs</h1>
        <p className="text-dark-400 text-xs mt-1">Track and navigate your active food rescue missions</p>
        <div className="flex gap-3 mt-3">
          <div className="flex-1 bg-white/5 rounded-2xl p-3 text-center border border-white/5">
            <p className="text-primary-400 font-black text-xl">{active.length}</p>
            <p className="text-[10px] text-dark-500 font-mono uppercase mt-0.5">Active</p>
          </div>
          <div className="flex-1 bg-white/5 rounded-2xl p-3 text-center border border-white/5">
            <p className="text-emerald-400 font-black text-xl">{completed.length}</p>
            <p className="text-[10px] text-dark-500 font-mono uppercase mt-0.5">Completed</p>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-white/5 p-1 rounded-2xl gap-1">
        {(['active', 'history'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${tab === t ? 'bg-gradient-primary text-dark-950 shadow-glow-sm' : 'text-dark-400 hover:text-white'}`}
          >
            {t === 'active' ? `🚗 Active (${active.length})` : `✅ Done (${completed.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">{[1, 2].map(i => <div key={i} className="app-card h-48 shimmer" />)}</div>
      ) : error ? (
        <div className="app-card p-8 text-center space-y-3 flex flex-col items-center">
          <AlertCircle className="w-8 h-8 text-rose-400" />
          <p className="text-dark-300 text-sm">Backend offline</p>
          <button onClick={() => refetch()} className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-primary-400 font-semibold cursor-pointer hover:bg-white/10 transition">Retry</button>
        </div>
      ) : displayed.length === 0 ? (
        <div className="app-card p-12 text-center space-y-3 flex flex-col items-center">
          <span className="text-4xl">{tab === 'active' ? '🛸' : '🏅'}</span>
          <p className="text-white font-bold">{tab === 'active' ? 'No active rescues' : 'No completed rescues'}</p>
          <p className="text-dark-500 text-xs">{tab === 'active' ? 'Claim food from the Home feed to start' : 'Your completed runs appear here'}</p>
          {tab === 'active' && (
            <button onClick={() => router.push('/dashboard')} className="btn-primary mt-2 py-2.5 text-sm">Browse Feed</button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {displayed.map((item: any) => (
            <RescueCard
              key={item.id}
              item={item}
              onUpdate={(id, status) => updateMutation.mutate({ id, status })}
              onCancel={(id) => cancelMutation.mutate(id)}
              updating={updateMutation.isPending}
              cancelling={cancelMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
