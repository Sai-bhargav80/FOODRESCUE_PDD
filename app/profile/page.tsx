'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { userAPI, foodAPI, impactAPI } from '@/lib/api';
import { MOCK_LISTINGS, MOCK_COMMUNITY_STATS } from '@/lib/mock-data';
import { Leaf, Trophy, RefreshCw, Mail, Phone, User as UserIcon, Award, Heart, ShieldCheck, LogOut, MapPin, KeyRound, Loader } from 'lucide-react';
import PinInput from '@/components/PinInput';
import BottomNav from '@/components/BottomNav';

export default function ProfilePage() {
  const router = useRouter();
  const { user: sessionUser, isLoading: authLoading, updateUser, logout } = useAuth();
  const [tab, setTab] = useState<'donations' | 'rescues'>('donations');

  // PIN settings state
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');
  const [pinLoading, setPinLoading] = useState(false);

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !sessionUser) router.push('/login');
  }, [sessionUser, authLoading, router]);

  const { data: dbUser } = useQuery({
    queryKey: ['userProfile', sessionUser?.id],
    queryFn: async () => {
      if (!sessionUser || !sessionUser.id) return null;
      try {
        const res = await userAPI.getUserProfile(sessionUser.id);
        if (res.data) updateUser(res.data);
        return res.data;
      } catch { return null; }
    },
    enabled: !!sessionUser && !!sessionUser.id,
    retry: 0,
  });

  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['foodListings'],
    queryFn: async () => {
      try { return (await foodAPI.getListings()).data; }
      catch { return MOCK_LISTINGS; }
    },
    enabled: !!sessionUser && !!sessionUser.id,
    retry: 0,
  });

  const { data: communityStats } = useQuery({
    queryKey: ['communityStats'],
    queryFn: async () => {
      try { return (await impactAPI.getCommunityStats()).data; }
      catch { return MOCK_COMMUNITY_STATS; }
    },
    enabled: !!sessionUser,
    retry: 0,
  });

  if (authLoading || !sessionUser) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-primary-500/30 border-t-primary-400 rounded-full animate-spin" />
      </div>
    );
  }

  const user         = dbUser ?? sessionUser;
  const points       = user.points ?? 0;
  const level        = user.level ?? 1;
  const rescues      = user.rescuesCount ?? 0;
  const donations    = user.donationsCount ?? 0;
  const carbon       = user.totalCarbonSaved ?? 0;
  const nextLevelXP  = level * 100;
  const progress     = Math.min((points / nextLevelXP) * 100, 100);

  const myDonations = listings.filter((i: any) => i.postedBy === sessionUser.id);
  const myRescues   = listings.filter((i: any) => i.claimedBy === sessionUser.id);
  const history     = tab === 'donations' ? myDonations : myRescues;

  const handleSavePin = async () => {
    if (!newPin || newPin.length !== 4) {
      setPinError('Please enter a 4-digit PIN');
      return;
    }
    if (!securityAnswer.trim()) {
      setPinError('Please enter a security answer for recovery');
      return;
    }

    setPinError('');
    setPinSuccess('');
    setPinLoading(true);
    try {
      const res = await userAPI.updateMpin(user.id, {
        mpin: newPin,
        securityAnswer: securityAnswer.trim(),
      });
      if (res.data.success) {
        setPinSuccess('✓ Security PIN updated successfully!');
        // Update both local storage and React context state
        if (res.data.user) updateUser(res.data.user);
        setTimeout(() => {
          setIsEditingPin(false);
          setPinSuccess('');
          setNewPin('');
          setSecurityAnswer('');
        }, 1500);
      } else {
        setPinError(res.data.message || 'Failed to update Security PIN');
      }
    } catch (err: any) {
      setPinError(err.response?.data?.message || err.response?.data?.detail || 'Error updating Security PIN');
    } finally {
      setPinLoading(false);
    }
  };

  const startEditingProfile = () => {
    setEditName(user.fullName || '');
    setEditPhone(user.phoneNumber || '');
    setProfileError('');
    setProfileSuccess('');
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      setProfileError('Name cannot be empty');
      return;
    }
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);
    try {
      const res = await userAPI.updateUserProfile(user.id, {
        fullName: editName.trim(),
        phoneNumber: editPhone.trim(),
      });
      if (res.data.success) {
        setProfileSuccess('✓ Profile updated successfully!');
        if (res.data.user) {
          updateUser(res.data.user);
        }
        setTimeout(() => {
          setIsEditingProfile(false);
          setProfileSuccess('');
        }, 1500);
      } else {
        setProfileError(res.data.message || 'Failed to update profile');
      }
    } catch (err: any) {
      setProfileError(err.response?.data?.message || err.response?.data?.detail || 'Error updating profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const initials = sessionUser.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'FR';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-5 animate-fade-in">

      {/* Profile hero card */}
      <div className="app-card-glow p-5 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #00e87e, transparent)' }} />
        <div className="flex items-center gap-4 relative">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <span className="text-dark-950 font-black text-xl">{initials}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-dark-900 border-2 border-dark-900 flex items-center justify-center">
              <span className="text-[8px] font-black text-amber-400">L{level}</span>
            </div>
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-black text-white truncate">{sessionUser.fullName || 'Eco Warrior'}</h1>
            <p className="text-dark-400 text-xs truncate">{sessionUser.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="badge badge-green">⚡ {points} XP</span>
              <span className="badge badge-amber">🏆 Level {level}</span>
            </div>
          </div>
          <button onClick={logout} className="flex-shrink-0 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition cursor-pointer">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* XP Progress bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-dark-400">Level {level} Progress</span>
            <span className="text-primary-400">{points} / {nextLevelXP} XP</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div className="h-full bg-gradient-primary rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[10px] text-dark-600">{nextLevelXP - points} XP to Level {level + 1}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Rescues', value: rescues, emoji: '🛡️', color: 'text-blue-400' },
          { label: 'Donations', value: donations, emoji: '🤝', color: 'text-primary-400' },
          { label: 'CO₂ Saved', value: `${carbon.toFixed(1)}kg`, emoji: '🌿', color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="app-card p-4 text-center">
            <span className="text-2xl">{s.emoji}</span>
            <p className={`text-lg font-black mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-dark-500 font-mono uppercase">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Community Stats — live from /community-stats endpoint */}
      {communityStats && (
        <div className="app-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-sm">🌍 Community Impact</h2>
            <span className="badge badge-green">Live Data</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Meals Saved',   value: communityStats.totalMealsSaved?.toLocaleString(), emoji: '🍱' },
              { label: 'Total Rescues', value: communityStats.totalRescues?.toLocaleString(),    emoji: '🛡️' },
              { label: 'CO₂ Saved',     value: `${Number(communityStats.totalCarbonSaved ?? 0).toFixed(1)}kg`, emoji: '🌿' },
              { label: 'Active Users',  value: communityStats.activeUsers?.toLocaleString(),     emoji: '👥' },
            ].map(s => (
              <div key={s.label} className="bg-white/4 rounded-2xl p-3 border border-white/5">
                <p className="text-base">{s.emoji}</p>
                <p className="text-primary-400 font-black text-base mt-0.5">{s.value}</p>
                <p className="text-[10px] text-dark-500 font-mono uppercase">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="app-card p-5 space-y-3">
        <h2 className="text-white font-bold text-base">Achievements</h2>
        <div className="space-y-2">
          {[
            { icon: '🏆', label: 'Top Rescuer', desc: '10+ rescues', unlocked: rescues >= 10 },
            { icon: '⭐', label: 'Elite Donor', desc: '5+ donations', unlocked: donations >= 5 },
            { icon: '🌍', label: 'Carbon Warrior', desc: '50kg+ CO₂ saved', unlocked: carbon >= 50 },
          ].map(a => (
            <div key={a.label} className={`flex items-center gap-3 p-3 rounded-2xl border transition ${a.unlocked ? 'bg-primary-500/8 border-primary-500/20' : 'bg-white/3 border-white/5 opacity-50'}`}>
              <span className={`text-xl ${!a.unlocked ? 'grayscale' : ''}`}>{a.icon}</span>
              <div>
                <p className={`text-sm font-bold ${a.unlocked ? 'text-white' : 'text-dark-400'}`}>{a.label}</p>
                <p className="text-[10px] text-dark-500">{a.desc}</p>
              </div>
              {a.unlocked && <span className="ml-auto text-primary-400 text-xs">✓</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Activity tabs */}
      <div className="app-card p-5 space-y-4">
        <div className="flex bg-white/5 p-1 rounded-2xl gap-1">
          {(['donations', 'rescues'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${tab === t ? 'bg-gradient-primary text-dark-950 shadow-glow-sm' : 'text-dark-400 hover:text-white'}`}>
              {t === 'donations' ? `🤝 Donations (${myDonations.length})` : `🛡️ Rescues (${myRescues.length})`}
            </button>
          ))}
        </div>

        {listingsLoading ? (
          <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-16 shimmer rounded-2xl" />)}</div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-3xl">🍽️</p>
            <p className="text-dark-400 text-sm mt-2 font-medium">No {tab} yet</p>
            <p className="text-dark-600 text-xs mt-1">Your activity will appear here</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {history.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between gap-3 p-3 bg-white/3 rounded-2xl border border-white/5">
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{item.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3 h-3 text-dark-500" />
                    <p className="text-dark-500 text-[11px] truncate">{item.location}</p>
                  </div>
                </div>
                <span className={`badge flex-shrink-0 ${
                  item.status === 'Completed' ? 'badge-green' :
                  item.status === 'Available' ? 'badge-blue' : 'badge-amber'
                }`}>{item.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account info */}
      <div className="app-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-base">Account Info</h2>
          {!isEditingProfile && (
            <button
              onClick={startEditingProfile}
              className="text-xs text-primary-400 hover:text-primary-300 font-bold transition cursor-pointer"
            >
              Edit Profile
            </button>
          )}
        </div>

        {!isEditingProfile ? (
          <div className="space-y-3">
            {[
              { icon: UserIcon, label: 'Name', value: user.fullName },
              { icon: Mail,     label: 'Email', value: user.email },
              { icon: Phone,    label: 'Phone', value: user.phoneNumber },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-3 p-3 bg-white/3 rounded-2xl border border-white/5">
                <f.icon className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-dark-500 font-mono uppercase">{f.label}</p>
                  <p className="text-white text-sm font-medium truncate">{f.value || 'Not set'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 border-t border-white/5 pt-3">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-dark-400 uppercase tracking-widest block">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3.5 w-4 h-4 text-primary-400" />
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full pl-10 pr-4 py-3 bg-dark-800/50 border border-white/10 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={profileLoading}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-dark-400 uppercase tracking-widest block">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 w-4 h-4 text-primary-400" />
                <input
                  type="text"
                  placeholder="Your Phone Number"
                  className="w-full pl-10 pr-4 py-3 bg-dark-800/50 border border-white/10 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  disabled={profileLoading}
                />
              </div>
            </div>

            {/* Feedback */}
            {profileError && !profileSuccess && (
              <p className="text-rose-400 text-xs font-mono text-center bg-rose-500/10 border border-rose-500/20 py-2 rounded-xl">
                {profileError}
              </p>
            )}
            {profileSuccess && (
              <p className="text-emerald-400 text-xs font-mono text-center bg-emerald-500/10 border border-emerald-500/20 py-2 rounded-xl">
                {profileSuccess}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditingProfile(false);
                  setProfileError('');
                  setProfileSuccess('');
                }}
                disabled={profileLoading}
                className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-semibold hover:bg-white/10 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={profileLoading || !editName.trim()}
                className="flex-1 py-2.5 bg-gradient-primary text-dark-950 font-bold rounded-xl hover:shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {profileLoading ? (
                  <>
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security PIN settings */}
      <div className="app-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-primary-400" />
          <h2 className="text-white font-bold text-base">Security PIN Settings</h2>
        </div>

        {!isEditingPin ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-dark-400 leading-relaxed">
              {user.mpin 
                ? "You have a Security PIN active for your account. You can use it to log in quickly or recover your password."
                : "Create a 4-digit Security PIN for biometric-like quick login and easy password recovery."}
            </p>
            <button
              onClick={() => setIsEditingPin(true)}
              className="w-full py-2.5 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-semibold hover:bg-white/10 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {user.mpin ? "Change Security PIN" : "Create Security PIN"}
            </button>
          </div>
        ) : (
          <div className="space-y-4 border-t border-white/5 pt-3">
            {/* PIN Inputs Container */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-dark-400 uppercase tracking-widest block text-center">
                New Security PIN
              </label>
              <PinInput
                length={4}
                title=""
                subtitle=""
                isLoading={pinLoading}
                error={pinError}
                success={pinSuccess}
                onComplete={(pin) => {
                  setNewPin(pin);
                  setPinError('');
                }}
              />
            </div>

            {/* Security Question Answer */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-dark-400 uppercase tracking-widest block">
                Security Question Answer
              </label>
              <p className="text-[10px] text-dark-500 leading-tight">
                What is your mother's maiden name or favorite subject? (Used for password recovery)
              </p>
              <input
                type="text"
                placeholder="Enter answer (minimum 3 chars)"
                className="app-input"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                disabled={pinLoading}
              />
            </div>

            {/* Error/Success displays */}
            {pinError && !pinSuccess && (
              <p className="text-rose-400 text-xs font-mono text-center bg-rose-500/10 border border-rose-500/20 py-2 rounded-xl">
                {pinError}
              </p>
            )}
            {pinSuccess && (
              <p className="text-emerald-400 text-xs font-mono text-center bg-emerald-500/10 border border-emerald-500/20 py-2 rounded-xl">
                {pinSuccess}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditingPin(false);
                  setNewPin('');
                  setSecurityAnswer('');
                  setPinError('');
                  setPinSuccess('');
                }}
                disabled={pinLoading}
                className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-semibold hover:bg-white/10 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePin}
                disabled={pinLoading || !newPin || newPin.length !== 4}
                className="flex-1 py-2.5 bg-gradient-primary text-dark-950 font-bold rounded-xl hover:shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pinLoading ? (
                  <>
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save PIN"
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
