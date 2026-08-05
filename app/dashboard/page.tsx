'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  UtensilsCrossed,
  Plus,
  ClipboardList,
  RefreshCw,
  AlertCircle,
  MapPin,
  Clock,
  LogOut,
  Navigation,
  CheckCircle,
  Leaf,
  Search,
  X,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { foodAPI, claimAPI } from '@/lib/api';
import { MOCK_LISTINGS } from '@/lib/mock-data';
import BottomNav from '@/components/BottomNav';

// ─── Types ──────────────────────────────────────────────────────────────────

interface FoodListing {
  id: number;
  title: string;
  category: string;
  quantity: string;
  location: string;
  expiryTime: string;
  status: 'Available' | 'Claimed' | 'Expired' | 'Completed';
  postedBy: number;
  claimedBy: number | null;
  priorityScore: number;
  priorityLevel: string;
  imageUrl: string;
  carbonSaved: number;
  estimatedMeals: number;
}

type TabId = 'listings' | 'post' | 'activity';
type FilterChip = 'All' | 'Veg' | 'Non-Veg' | 'Urgent';
type PostStep = 1 | 2;

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: 'Grains', emoji: '🌾' },
  { label: 'Produce', emoji: '🥦' },
  { label: 'Bakery', emoji: '🥖' },
  { label: 'Dairy', emoji: '🥛' },
  { label: 'Prepared', emoji: '🍲' },
  { label: 'Other', emoji: '🥡' },
];

const UNITS = ['kg', 'litres', 'portions', 'units'];
const EXPIRY_OPTIONS = [
  { label: '⚡ 2h', hours: 2 },
  { label: '🕒 4h', hours: 4 },
  { label: '🌅 8h', hours: 8 },
  { label: '📅 24h', hours: 24 },
];

// ─── Utility helpers ──────────────────────────────────────────────────────────

function formatExpiry(isoStr: string): string {
  const diff = new Date(isoStr).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
}

function isUrgent(item: FoodListing): boolean {
  return item.priorityScore >= 75;
}

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    Grains: '🌾',
    Produce: '🥦',
    Bakery: '🥖',
    Dairy: '🥛',
    Prepared: '🍲',
    Other: '🥡',
    Veg: '🥦',
    'Non-Veg': '🍗',
    Fruits: '🍎',
  };
  return map[category] || '🍽️';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors: Record<string, string> = {
    success: '#22C55E',
    error: '#f87171',
    info: '#FB923C',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        background: 'rgba(5,9,20,0.97)',
        border: `1px solid ${colors[type]}`,
        borderRadius: 14,
        padding: '14px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: `0 0 30px ${colors[type]}44`,
        maxWidth: 360,
        width: 'calc(100vw - 40px)',
        backdropFilter: 'blur(20px)',
        animation: 'slideDown 0.3s ease',
      }}
    >
      <span style={{ fontSize: 18, lineHeight: 1 }}>
        {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
      </span>
      <span style={{ color: '#f9fafb', fontSize: 14, fontWeight: 500, flex: 1 }}>
        {message}
      </span>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
      >
        <X size={14} color="#9ca3af" />
      </button>
    </div>
  );
}

function ShimmerCard() {
  return (
    <div
      className="app-card animate-pulse"
      style={{ height: 140, borderRadius: 16, marginBottom: 14 }}
    />
  );
}

function FoodCard({
  item,
  userId,
  onClaim,
  claiming,
}: {
  item: FoodListing;
  userId: number;
  onClaim: (id: number) => void;
  claiming: boolean;
}) {
  const isOwner = item.postedBy === userId;
  const isClaimed = item.status === 'Claimed';
  const isCompleted = item.status === 'Completed';
  const isExpired = item.status === 'Expired';
  const urgent = isUrgent(item);

  return (
    <div
      className="app-card"
      style={{
        borderRadius: 16,
        marginBottom: 14,
        overflow: 'hidden',
        border: urgent ? '1px solid rgba(251,146,60,0.3)' : '1px solid rgba(255,255,255,0.08)',
        transition: 'transform 0.15s ease',
      }}
    >
      {item.imageUrl && (
        <div style={{ position: 'relative', height: 150, overflow: 'hidden' }}>
          <img
            src={item.imageUrl}
            alt={item.title}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 60,
              background: 'linear-gradient(transparent, rgba(5,9,20,0.9))',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              display: 'flex',
              gap: 6,
              flexWrap: 'wrap',
            }}
          >
            <span
              className="badge badge-green"
              style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20 }}
            >
              {getCategoryEmoji(item.category)} {item.category}
            </span>
            {urgent && (
              <span
                className="badge badge-amber"
                style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20 }}
              >
                🔥 Urgent
              </span>
            )}
          </div>
        </div>
      )}

      <div style={{ padding: '14px 16px 16px' }}>
        <h3 style={{ color: '#f9fafb', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
          {item.title}
        </h3>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          <span
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20,
              padding: '3px 10px',
              color: '#9ca3af',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            📦 {item.quantity}
          </span>
          <span
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20,
              padding: '3px 10px',
              color: '#9ca3af',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <MapPin size={11} /> {item.location}
          </span>
          <span
            style={{
              background: urgent ? 'rgba(251,146,60,0.12)' : 'rgba(255,255,255,0.06)',
              border: urgent ? '1px solid rgba(251,146,60,0.3)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20,
              padding: '3px 10px',
              color: urgent ? '#FB923C' : '#9ca3af',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Clock size={11} /> {formatExpiry(item.expiryTime)}
          </span>
        </div>

        {isOwner ? (
          <div
            style={{
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: 10,
              padding: '8px 12px',
              color: '#22C55E',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <CheckCircle size={14} /> YOUR DONATION
          </div>
        ) : item.status === 'Available' ? (
          <button
            onClick={() => onClaim(item.id)}
            disabled={claiming}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              opacity: claiming ? 0.7 : 1,
              cursor: claiming ? 'not-allowed' : 'pointer',
            }}
          >
            {claiming ? (
              <>
                <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                Claiming...
              </>
            ) : (
              <>🤝 Claim &amp; Rescue</>
            )}
          </button>
        ) : (
          <div
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              padding: '8px 12px',
              color: '#6b7280',
              fontSize: 13,
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            {isClaimed ? '✓ Claimed' : isCompleted ? '✓ Rescued' : '⏰ Expired'}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // ── Tab state
  const [activeTab, setActiveTab] = useState<TabId>('listings');

  // ── Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      setToast({ message, type });
    },
    []
  );

  // ── Listings filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterChip>('All');

  // ── Post form state
  const [postStep, setPostStep] = useState<PostStep>(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [foodTitle, setFoodTitle] = useState('');
  const [foodQty, setFoodQty] = useState('');
  const [foodUnit, setFoodUnit] = useState('portions');
  const [foodDescription, setFoodDescription] = useState('');
  const [foodLocation, setFoodLocation] = useState('');
  const [selectedExpiry, setSelectedExpiry] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});
  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({});
  const [postSuccess, setPostSuccess] = useState(false);
  const [claimingIds, setClaimingIds] = useState<Set<number>>(new Set());

  // ── Track offline/mock mode
  const [isOffline, setIsOffline] = useState(false);

  // ─── Auth guard ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // ─── Fetch food listings ──────────────────────────────────────────────────
  const {
    data: listings,
    isLoading: listingsLoading,
    isError,
    refetch,
  } = useQuery<FoodListing[]>({
    queryKey: ['foodListings'],
    queryFn: async () => {
      try {
        const res = await foodAPI.getListings();
        const data = res.data;
        setIsOffline(false);
        return Array.isArray(data) ? data : [];
      } catch {
        setIsOffline(true);
        return []; // Return empty — never show fake/mock data to real users
      }
    },
    staleTime: 30000,
    retry: 1,
  });

  // ─── Claim mutation ───────────────────────────────────────────────────────
  const claimMutation = useMutation({
    mutationFn: async ({ foodId, userId }: { foodId: number; userId: number }) => {
      const res = await claimAPI.claimFood(foodId, userId);
      return res.data;
    },
    onMutate: async ({ foodId }) => {
      setClaimingIds((prev) => new Set(prev).add(foodId));
      await queryClient.cancelQueries({ queryKey: ['foodListings'] });
      const previous = queryClient.getQueryData<FoodListing[]>(['foodListings']);
      queryClient.setQueryData<FoodListing[]>(['foodListings'], (old) =>
        (old ?? []).map((item) =>
          item.id === foodId
            ? { ...item, status: 'Claimed', claimedBy: user?.id ?? null }
            : item
        )
      );
      return { previous };
    },
    onError: (_err, { foodId }, context) => {
      setClaimingIds((prev) => {
        const next = new Set(prev);
        next.delete(foodId);
        return next;
      });
      if (context?.previous) {
        queryClient.setQueryData(['foodListings'], context.previous);
      }
      showToast('Failed to claim — please try again', 'error');
    },
    onSuccess: (_data, { foodId }) => {
      setClaimingIds((prev) => {
        const next = new Set(prev);
        next.delete(foodId);
        return next;
      });
      showToast('✅ Claimed successfully! Go rescue that food 🚀', 'success');
      queryClient.invalidateQueries({ queryKey: ['foodListings'] });
    },
  });

  const handleClaim = useCallback(
    (foodId: number) => {
      if (!user) return;
      claimMutation.mutate({ foodId, userId: user.id });
    },
    [user, claimMutation]
  );

  // ─── Post food mutation ───────────────────────────────────────────────────
  const postMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await foodAPI.postFood(payload);
      return res.data;
    },
    onSuccess: () => {
      setPostSuccess(true);
      showToast('🎉 Food posted! Thank you for your donation!', 'success');
      // Reset form
      setSelectedCategory('');
      setFoodTitle('');
      setFoodQty('');
      setFoodUnit('portions');
      setFoodDescription('');
      setFoodLocation('');
      setSelectedExpiry(null);
      setPostStep(1);
      queryClient.invalidateQueries({ queryKey: ['foodListings'] });
      setTimeout(() => {
        setPostSuccess(false);
        setActiveTab('listings');
      }, 1800);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Failed to post food. Please try again.';
      showToast(msg, 'error');
    },
  });

  // ─── GPS handler (Capacitor Geolocation — requests Android permission properly) ──
  const handleGPS = useCallback(async () => {
    setGpsError('');
    setGpsLoading(true);
    try {
      // Dynamically import Capacitor Geolocation to handle Android runtime permission
      const { Geolocation } = await import('@capacitor/geolocation');

      // Request permission first — this shows the Android system dialog
      const perm = await Geolocation.requestPermissions();
      if (perm.location !== 'granted') {
        setGpsError('Location permission denied — please type your address manually');
        setGpsLoading(false);
        return;
      }

      // Get current position
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode via Nominatim (no API key needed)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`
      );
      const data = await res.json();
      const address =
        data.display_name ||
        `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      setFoodLocation(address);
      setGpsError('');
    } catch (err: any) {
      console.error('GPS error:', err);
      // Fallback to browser geolocation API if Capacitor fails (web browser testing)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const { latitude, longitude } = pos.coords;
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
              );
              const data = await res.json();
              setFoodLocation(data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
              setGpsError('');
            } catch {
              setGpsError('Could not fetch address — please type manually');
            } finally {
              setGpsLoading(false);
            }
          },
          () => {
            setGpsLoading(false);
            setGpsError('GPS denied — please type your address manually');
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
        return;
      }
      setGpsError('GPS unavailable — please type your address manually');
    } finally {
      setGpsLoading(false);
    }
  }, []);

  // ─── Form validation ──────────────────────────────────────────────────────
  const validateStep1 = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (!selectedCategory) errors.category = 'Please select a category';
    if (!foodTitle.trim()) errors.title = 'Food name is required';
    if (!foodQty.trim()) errors.qty = 'Quantity is required';
    setStep1Errors(errors);
    return Object.keys(errors).length === 0;
  }, [selectedCategory, foodTitle, foodQty]);

  const validateStep2 = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (!foodLocation.trim()) errors.location = 'Location is required';
    if (selectedExpiry === null) errors.expiry = 'Please select an expiry window';
    setStep2Errors(errors);
    return Object.keys(errors).length === 0;
  }, [foodLocation, selectedExpiry]);

  const handleNextStep = useCallback(() => {
    if (validateStep1()) setPostStep(2);
  }, [validateStep1]);

  const handleSubmitPost = useCallback(() => {
    if (!validateStep2() || !user) return;
    const expiryTime = new Date(
      Date.now() + (selectedExpiry ?? 4) * 3600 * 1000
    ).toISOString();
    const priorityScore = (selectedExpiry ?? 4) <= 2 ? 90 : (selectedExpiry ?? 4) <= 4 ? 75 : 40;
    const priorityLevel = priorityScore >= 75 ? 'High' : 'Low';
    postMutation.mutate({
      title: foodTitle.trim(),
      category: selectedCategory,
      quantity: `${foodQty} ${foodUnit}`,
      location: foodLocation.trim(),
      expiryTime,
      imageUrl:
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop',
      postedBy: user.id,
      status: 'Available',
      priorityScore,
      priorityLevel,
      carbonSaved: 0,
      estimatedMeals: 0,
    });
  }, [
    validateStep2,
    user,
    selectedExpiry,
    foodTitle,
    selectedCategory,
    foodQty,
    foodUnit,
    foodLocation,
    postMutation,
  ]);

  // ─── Filtered listings ────────────────────────────────────────────────────
  // Main feed: only show Available food from OTHER users (not own posts)
  // New users see empty feed until others post food
  const displayListings = (listings ?? []).filter((item) => {
    if (!item) return false;
    if (Number(item.postedBy) === Number(user?.id)) return false; // hide own posts
    if (item.status !== 'Available') return false;                // hide claimed/completed
    const q = searchQuery.toLowerCase();
    if (q && !item.title.toLowerCase().includes(q)) return false;
    if (activeFilter === 'Veg') return item.category === 'Veg';
    if (activeFilter === 'Non-Veg') return item.category === 'Non-Veg';
    if (activeFilter === 'Urgent') return isUrgent(item);
    return true;
  });

  const myListings = (listings ?? []).filter(
    (item) => user && Number(item.postedBy) === Number(user.id)
  );


  const statsTotal = myListings.length;
  const statsActive = myListings.filter((i) => i.status === 'Available').length;
  const statsRescued = myListings.filter((i) => i.status === 'Completed').length;

  // ─── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
    logout();
  }, [logout]);

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#050914',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 40 }}>🌿</span>
          <p style={{ color: '#9ca3af', marginTop: 12, fontSize: 14 }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#050914', fontFamily: 'inherit', overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}>
      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Scrollable content */}
      <div style={{ width: '100%', boxSizing: 'border-box' }}>
        {/* ═══════════════════════════════════ TAB 1: LISTINGS */}
        {activeTab === 'listings' && (
          <div style={{ padding: '10px 0 0' }}>
            {/* Greeting */}
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'between', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h1 style={{ color: '#f9fafb', fontWeight: 800, fontSize: 28, marginBottom: 4 }}>
                  Hey {user.fullName?.split(' ')[0] ?? 'there'} 👋
                </h1>
                <p style={{ color: '#9ca3af', fontSize: 15 }}>Browse &amp; claim surplus food</p>
              </div>
              {isOffline && (
                <span className="badge-rose flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10">
                  ⚠️ Backend Offline (Demo Mode)
                </span>
              )}
            </div>

            {/* Search + Refresh */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search
                  size={15}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6b7280',
                  }}
                />
                <input
                  className="app-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search food listings..."
                  style={{ paddingLeft: 36, width: '100%', borderRadius: 12 }}
                />
              </div>
              <button
                onClick={() => refetch()}
                style={{
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  borderRadius: 12,
                  padding: '0 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#22C55E',
                }}
              >
                <RefreshCw size={16} />
              </button>
            </div>

            {/* Filter chips */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
              {(['All', 'Veg', 'Non-Veg', 'Urgent'] as FilterChip[]).map((chip) => (
                <button
                  key={chip}
                  onClick={() => setActiveFilter(chip)}
                  style={{
                    flexShrink: 0,
                    background:
                      activeFilter === chip
                        ? chip === 'Urgent'
                          ? 'rgba(251,146,60,0.2)'
                          : 'rgba(34,197,94,0.2)'
                        : 'rgba(255,255,255,0.05)',
                    border:
                      activeFilter === chip
                        ? chip === 'Urgent'
                          ? '1px solid rgba(251,146,60,0.6)'
                          : '1px solid rgba(34,197,94,0.6)'
                        : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 20,
                    padding: '7px 16px',
                    color:
                      activeFilter === chip
                        ? chip === 'Urgent'
                          ? '#FB923C'
                          : '#22C55E'
                        : '#9ca3af',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {chip === 'Urgent' ? '🔥 ' : ''}{chip}
                </button>
              ))}
            </div>

            {/* Loading shimmer */}
            {listingsLoading && (
              <>
                <ShimmerCard />
                <ShimmerCard />
                <ShimmerCard />
              </>
            )}

            {/* Error state */}
            {isError && !isOffline && (
              <div className="app-card" style={{ padding: 32, textAlign: 'center', borderRadius: 16 }}>
                <AlertCircle size={32} color="#f87171" style={{ margin: '0 auto 8px' }} />
                <p style={{ color: '#f9fafb', fontWeight: 700, marginBottom: 12 }}>
                  Could not load listings
                </p>
                <button
                  onClick={() => refetch()}
                  className="btn-primary"
                  style={{ padding: '8px 20px', fontSize: 13, borderRadius: 10 }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty state — shown to new users or when no food is available */}
            {!listingsLoading && !isError && displayListings.length === 0 && (
              <div className="app-card" style={{ padding: 48, textAlign: 'center', borderRadius: 16 }}>
                <span style={{ fontSize: 48 }}>🌱</span>
                <p style={{ color: '#f9fafb', fontWeight: 800, fontSize: 18, marginTop: 16 }}>
                  No food available yet
                </p>
                <p style={{ color: '#6b7280', fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>
                  Be the first to donate surplus food<br />in your community!
                </p>
                <button
                  onClick={() => setActiveTab('post')}
                  className="btn-primary"
                  style={{ marginTop: 20, padding: '10px 28px', fontSize: 14, borderRadius: 12 }}
                >
                  🍱 Post Food Now
                </button>
              </div>
            )}

            {/* Food cards */}
            {!listingsLoading &&
              displayListings.map((item) => (
                <FoodCard
                  key={item.id}
                  item={item}
                  userId={user.id}
                  onClaim={handleClaim}
                  claiming={claimingIds.has(item.id)}
                />
              ))}
          </div>
        )}

        {/* ═══════════════════════════════════ TAB 2: POST FOOD */}
        {activeTab === 'post' && (
          <div style={{ padding: '20px 16px 0', boxSizing: 'border-box', width: '100%', overflowX: 'hidden' }}>
            <h1 style={{ color: '#f9fafb', fontWeight: 800, fontSize: 22, marginBottom: 4 }}>
              Post Surplus Food
            </h1>
            <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 24 }}>
              Share what you have, someone needs it 🌱
            </p>

            {/* Step indicator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                marginBottom: 8,
                boxSizing: 'border-box',
              }}
            >
              {[1, 2].map((step, idx) => (
                <React.Fragment key={step}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background:
                          postStep >= step
                            ? 'linear-gradient(135deg, #22C55E, #16a34a)'
                            : 'rgba(255,255,255,0.06)',
                        border:
                          postStep >= step
                            ? '2px solid #22C55E'
                            : '2px solid rgba(255,255,255,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: postStep >= step ? '#fff' : '#6b7280',
                        fontWeight: 700,
                        fontSize: 14,
                        boxShadow: postStep >= step ? '0 0 16px rgba(34,197,94,0.35)' : 'none',
                        transition: 'all 0.3s ease',
                        flexShrink: 0,
                      }}
                    >
                      {postStep > step ? '✓' : step}
                    </div>
                    <span style={{ fontSize: 10, color: postStep >= step ? '#22C55E' : '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {step === 1 ? 'Food Details' : 'Location & Expiry'}
                    </span>
                  </div>
                  {idx < 1 && (
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        background: postStep > 1 ? '#22C55E' : 'rgba(255,255,255,0.1)',
                        transition: 'background 0.3s ease',
                        margin: '0 8px',
                        marginBottom: 20,
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div style={{ marginBottom: 24 }} />

            {/* Success banner */}
            {postSuccess && (
              <div
                style={{
                  background: 'rgba(34,197,94,0.12)',
                  border: '1px solid rgba(34,197,94,0.4)',
                  borderRadius: 14,
                  padding: '16px 20px',
                  marginBottom: 20,
                  textAlign: 'center',
                  color: '#22C55E',
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                🎉 Food posted! Switching to listings...
              </div>
            )}

            {/* ── Step 1 ── */}
            {postStep === 1 && (
              <div>
                {/* Category selector */}
                <div className="app-card" style={{ borderRadius: 16, padding: 20, marginBottom: 16 }}>
                  <label style={{ color: '#f9fafb', fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 14 }}>
                    Category <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 10,
                    }}
                  >
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.label}
                        onClick={() => {
                          setSelectedCategory(cat.label);
                          setStep1Errors((e) => ({ ...e, category: '' }));
                        }}
                        style={{
                          background:
                            selectedCategory === cat.label
                              ? 'rgba(34,197,94,0.15)'
                              : 'rgba(255,255,255,0.04)',
                          border:
                            selectedCategory === cat.label
                              ? '1.5px solid #22C55E'
                              : '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 12,
                          padding: '12px 6px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 6,
                          transition: 'all 0.15s ease',
                          boxShadow:
                            selectedCategory === cat.label
                              ? '0 0 12px rgba(34,197,94,0.2)'
                              : 'none',
                        }}
                      >
                        <span style={{ fontSize: 24 }}>{cat.emoji}</span>
                        <span
                          style={{
                            color: selectedCategory === cat.label ? '#22C55E' : '#9ca3af',
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {cat.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  {step1Errors.category && (
                    <p style={{ color: '#f87171', fontSize: 12, marginTop: 8 }}>
                      {step1Errors.category}
                    </p>
                  )}
                </div>

                {/* Title */}
                <div className="app-card" style={{ borderRadius: 16, padding: 20, marginBottom: 16 }}>
                  <label
                    htmlFor="foodTitle"
                    style={{
                      color: '#f9fafb',
                      fontWeight: 600,
                      fontSize: 14,
                      display: 'block',
                      marginBottom: 10,
                    }}
                  >
                    Food Name <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  <input
                    id="foodTitle"
                    className="app-input"
                    value={foodTitle}
                    onChange={(e) => {
                      setFoodTitle(e.target.value);
                      setStep1Errors((err) => ({ ...err, title: '' }));
                    }}
                    placeholder="e.g. Wedding Buffet Surplus"
                    style={{ width: '100%', borderRadius: 10 }}
                  />
                  {step1Errors.title && (
                    <p style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>
                      {step1Errors.title}
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div className="app-card" style={{ borderRadius: 16, padding: 20, marginBottom: 16 }}>
                  <label
                    style={{
                      color: '#f9fafb',
                      fontWeight: 600,
                      fontSize: 14,
                      display: 'block',
                      marginBottom: 10,
                    }}
                  >
                    Quantity <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input
                      className="app-input"
                      type="number"
                      min="1"
                      value={foodQty}
                      onChange={(e) => {
                        setFoodQty(e.target.value);
                        setStep1Errors((err) => ({ ...err, qty: '' }));
                      }}
                      placeholder="50"
                      style={{ flex: 1, borderRadius: 10 }}
                    />
                    <select
                      value={foodUnit}
                      onChange={(e) => setFoodUnit(e.target.value)}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 10,
                        padding: '10px 12px',
                        color: '#f9fafb',
                        fontSize: 14,
                        cursor: 'pointer',
                        minWidth: 100,
                      }}
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u} style={{ background: '#0d1426' }}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                  {step1Errors.qty && (
                    <p style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>
                      {step1Errors.qty}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="app-card" style={{ borderRadius: 16, padding: 20, marginBottom: 24 }}>
                  <label
                    style={{
                      color: '#f9fafb',
                      fontWeight: 600,
                      fontSize: 14,
                      display: 'block',
                      marginBottom: 10,
                    }}
                  >
                    Description{' '}
                    <span style={{ color: '#6b7280', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <textarea
                    className="app-input"
                    value={foodDescription}
                    onChange={(e) => setFoodDescription(e.target.value)}
                    placeholder="Any extra details — packaging, pickup instructions, dietary info..."
                    rows={3}
                    style={{ width: '100%', borderRadius: 10, resize: 'vertical', lineHeight: 1.6 }}
                  />
                </div>

                <button
                  onClick={handleNextStep}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 14,
                    fontSize: 15,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  Next: Location &amp; Expiry
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* ── Step 2 ── */}
            {postStep === 2 && (
              <div>
                {/* Location */}
                <div className="app-card" style={{ borderRadius: 16, padding: 20, marginBottom: 16 }}>
                  <label
                    style={{
                      color: '#f9fafb',
                      fontWeight: 600,
                      fontSize: 14,
                      display: 'block',
                      marginBottom: 10,
                    }}
                  >
                    Pickup Location <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  <button
                    onClick={handleGPS}
                    disabled={gpsLoading}
                    style={{
                      width: '100%',
                      background: 'rgba(34,197,94,0.1)',
                      border: '1px dashed rgba(34,197,94,0.4)',
                      borderRadius: 12,
                      padding: '12px',
                      color: '#22C55E',
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: gpsLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      marginBottom: 12,
                      opacity: gpsLoading ? 0.7 : 1,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {gpsLoading ? (
                      <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <Navigation size={15} />
                    )}
                    {gpsLoading ? 'Getting location...' : '📍 Use My GPS Location'}
                  </button>
                  {gpsError && (
                    <p style={{ color: '#FB923C', fontSize: 12, marginBottom: 8 }}>{gpsError}</p>
                  )}
                  <input
                    className="app-input"
                    value={foodLocation}
                    onChange={(e) => {
                      setFoodLocation(e.target.value);
                      setStep2Errors((err) => ({ ...err, location: '' }));
                    }}
                    placeholder="Or type address manually..."
                    style={{ width: '100%', borderRadius: 10 }}
                  />
                  {step2Errors.location && (
                    <p style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>
                      {step2Errors.location}
                    </p>
                  )}
                </div>

                {/* Expiry */}
                <div className="app-card" style={{ borderRadius: 16, padding: 20, marginBottom: 24 }}>
                  <label
                    style={{
                      color: '#f9fafb',
                      fontWeight: 600,
                      fontSize: 14,
                      display: 'block',
                      marginBottom: 14,
                    }}
                  >
                    Available Until <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {EXPIRY_OPTIONS.map((opt) => (
                      <button
                        key={opt.hours}
                        onClick={() => {
                          setSelectedExpiry(opt.hours);
                          setStep2Errors((err) => ({ ...err, expiry: '' }));
                        }}
                        style={{
                          background:
                            selectedExpiry === opt.hours
                              ? opt.hours <= 2
                                ? 'rgba(251,146,60,0.2)'
                                : 'rgba(34,197,94,0.15)'
                              : 'rgba(255,255,255,0.04)',
                          border:
                            selectedExpiry === opt.hours
                              ? opt.hours <= 2
                                ? '1.5px solid #FB923C'
                                : '1.5px solid #22C55E'
                              : '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 12,
                          padding: '12px 4px',
                          cursor: 'pointer',
                          color:
                            selectedExpiry === opt.hours
                              ? opt.hours <= 2
                                ? '#FB923C'
                                : '#22C55E'
                              : '#9ca3af',
                          fontSize: 12,
                          fontWeight: 600,
                          textAlign: 'center',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {step2Errors.expiry && (
                    <p style={{ color: '#f87171', fontSize: 12, marginTop: 8 }}>
                      {step2Errors.expiry}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 10, width: '100%', boxSizing: 'border-box' }}>
                  <button
                    onClick={() => setPostStep(1)}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 14,
                      padding: '14px 8px',
                      color: '#9ca3af',
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button
                    onClick={handleSubmitPost}
                    disabled={postMutation.isPending}
                    className="btn-primary"
                    style={{
                      flex: 2,
                      minWidth: 0,
                      padding: '14px 8px',
                      borderRadius: 14,
                      fontSize: 15,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      opacity: postMutation.isPending ? 0.7 : 1,
                      cursor: postMutation.isPending ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {postMutation.isPending ? (
                      <>
                        <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                        Posting...
                      </>
                    ) : (
                      <>🌱 Post Food</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════ TAB 3: MY ACTIVITY */}
        {activeTab === 'activity' && (
          <div style={{ padding: '20px 16px 0' }}>
            <h1 style={{ color: '#f9fafb', fontWeight: 800, fontSize: 22, marginBottom: 4 }}>
              My Activity
            </h1>
            <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 20 }}>
              Your food donation history
            </p>

            {/* Stats row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 10,
                marginBottom: 24,
              }}
            >
              {[
                { label: 'Total Posts', value: statsTotal, color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.25)' },
                { label: 'Active', value: statsActive, color: '#22C55E', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)' },
                { label: 'Rescued', value: statsRescued, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: stat.bg,
                    border: `1px solid ${stat.border}`,
                    borderRadius: 14,
                    padding: '14px 10px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ color: stat.color, fontWeight: 800, fontSize: 26, lineHeight: 1 }}>
                    {stat.value}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: 11, fontWeight: 600, marginTop: 4 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Empty state */}
            {myListings.length === 0 && (
              <div
                className="app-card"
                style={{ padding: 48, textAlign: 'center', borderRadius: 16 }}
              >
                <span style={{ fontSize: 40 }}>🍽️</span>
                <p style={{ color: '#f9fafb', fontWeight: 700, marginTop: 12 }}>
                  You haven&apos;t posted any food yet
                </p>
                <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4, marginBottom: 20 }}>
                  Start sharing surplus food with your community!
                </p>
                <button
                  onClick={() => setActiveTab('post')}
                  className="btn-primary"
                  style={{
                    padding: '10px 24px',
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  ➕ Post Your First Donation
                </button>
              </div>
            )}

            {/* My listings */}
            {myListings.map((item) => {
              const statusConfig: Record<
                string,
                { label: string; color: string; bg: string; border: string }
              > = {
                Available: {
                  label: 'Available',
                  color: '#60a5fa',
                  bg: 'rgba(96,165,250,0.12)',
                  border: 'rgba(96,165,250,0.3)',
                },
                Claimed: {
                  label: 'Claimed',
                  color: '#FB923C',
                  bg: 'rgba(251,146,60,0.12)',
                  border: 'rgba(251,146,60,0.3)',
                },
                Completed: {
                  label: 'Rescued ✓',
                  color: '#22C55E',
                  bg: 'rgba(34,197,94,0.12)',
                  border: 'rgba(34,197,94,0.3)',
                },
                Expired: {
                  label: 'Expired',
                  color: '#6b7280',
                  bg: 'rgba(107,114,128,0.1)',
                  border: 'rgba(107,114,128,0.25)',
                },
              };
              const sc = statusConfig[item.status] ?? statusConfig.Expired;

              return (
                <div
                  key={item.id}
                  className="app-card"
                  style={{ borderRadius: 16, marginBottom: 14, padding: '16px' }}
                >
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}
                  >
                    <h3
                      style={{
                        color: '#f9fafb',
                        fontWeight: 700,
                        fontSize: 14,
                        flex: 1,
                        paddingRight: 10,
                        lineHeight: 1.4,
                      }}
                    >
                      {item.title}
                    </h3>
                    <span
                      style={{
                        background: sc.bg,
                        border: `1px solid ${sc.border}`,
                        color: sc.color,
                        borderRadius: 20,
                        padding: '3px 10px',
                        fontSize: 11,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {sc.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    <span style={{ color: '#6b7280', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      📦 {item.quantity}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={11} /> {item.location}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> {formatExpiry(item.expiryTime)}
                    </span>
                  </div>

                  {item.status === 'Claimed' && (
                    <div
                      style={{
                        background: 'rgba(251,146,60,0.1)',
                        border: '1px solid rgba(251,146,60,0.3)',
                        borderRadius: 10,
                        padding: '8px 12px',
                        color: '#FB923C',
                        fontSize: 12,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      🎉 Someone is rescuing this!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Global spin animation */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
