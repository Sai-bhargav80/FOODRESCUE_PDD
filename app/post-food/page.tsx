'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Camera, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Loader2, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { foodAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

/* ── Types ────────────────────────────────── */
type Category = 'Veg' | 'Non-Veg' | 'Bakery' | 'Dairy' | 'Fruits' | 'Other';
type Unit = 'kg' | 'portions' | 'packets' | 'loaves';
type ExpiryHours = 2 | 4 | 8 | 24;
type ValidationState = 'idle' | 'loading-model' | 'analyzing' | 'food' | 'not-food' | 'error';

interface FormData {
  category: Category;
  title: string;
  quantity: string;
  unit: Unit;
  description: string;
  location: string;
  expiryHours: ExpiryHours;
  capturedImage: string | null;
}

/* ── Constants ────────────────────────────── */
const CATEGORIES: { value: Category; emoji: string; label: string }[] = [
  { value: 'Veg',     emoji: '🥗', label: 'Vegetarian' },
  { value: 'Non-Veg', emoji: '🍖', label: 'Non-Veg'    },
  { value: 'Bakery',  emoji: '🥖', label: 'Bakery'     },
  { value: 'Dairy',   emoji: '🥛', label: 'Dairy'      },
  { value: 'Fruits',  emoji: '🍎', label: 'Fruits'     },
  { value: 'Other',   emoji: '🥡', label: 'Other'      },
];
const UNITS: Unit[] = ['kg', 'portions', 'packets', 'loaves'];
const EXPIRY_OPTIONS: { hours: ExpiryHours; label: string; emoji: string; desc: string }[] = [
  { hours: 2,  label: '2 Hours',  emoji: '⚡', desc: 'Hot/Perishable' },
  { hours: 4,  label: '4 Hours',  emoji: '🕒', desc: 'Standard'       },
  { hours: 8,  label: '8 Hours',  emoji: '🌅', desc: 'End of Day'     },
  { hours: 24, label: '24 Hours', emoji: '📅', desc: 'Bakery/Fruits'  },
];
const STEPS = ['Details', 'Location', 'Photo', 'Confirm'];
const EMOJI_MAP: Record<Category, string> = {
  Veg: '🥗', 'Non-Veg': '🍖', Bakery: '🥖', Dairy: '🥛', Fruits: '🍎', Other: '🥡',
};

/* ── Step Indicator ───────────────────────── */
const StepIndicator = ({ current }: { current: number }) => (
  <div className="flex items-center w-full mb-6" style={{ boxSizing: 'border-box' }}>
    {STEPS.map((label, idx) => {
      const done   = idx < current;
      const active = idx === current;
      return (
        <div key={idx} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all duration-300 ${
              done   ? 'bg-primary-500 border-primary-400 text-dark-950' :
              active ? 'bg-dark-800 border-primary-400 text-primary-400 scale-110' :
                       'bg-dark-900 border-white/10 text-dark-600'
            }`}>
              {done ? '✓' : idx + 1}
            </div>
            <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${active ? 'text-primary-400' : 'text-dark-600'}`}>
              {label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all duration-300 ${idx < current ? 'bg-primary-500' : 'bg-white/10'}`} />
          )}
        </div>
      );
    })}
  </div>
);

/* ── Main Component ───────────────────────── */
export default function PostFoodPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // GPS state
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError]     = useState('');

  // Photo / AI state
  const [validationState, setValidationState] = useState<ValidationState>('idle');
  const [detectedLabel, setDetectedLabel]      = useState('');
  const [aiConfidence, setAiConfidence]        = useState(0);

  // Validation errors per step
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<FormData>({
    category: 'Veg', title: '', quantity: '', unit: 'portions',
    description: '', location: '', expiryHours: 4, capturedImage: null,
  });

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  /* ── Field helpers ── */
  const set = (key: keyof FormData, value: any) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  /* ── GPS ── */
  const fetchGPS = useCallback(() => {
    if (!navigator.geolocation) { setGpsError('GPS not supported on this device.'); return; }
    setGpsLoading(true); setGpsError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
          const data = await res.json();
          const addr = data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
          set('location', addr);
        } catch {
          setGpsError('Could not fetch address. Please enter manually.');
        } finally { setGpsLoading(false); }
      },
      (err) => {
        setGpsLoading(false);
        setGpsError(`GPS unavailable (${err.message}) — please enter manually.`);
      },
      { timeout: 10000 }
    );
  }, []);

  /* ── AI Food Detection ── */
  const runAICheck = useCallback(async (dataUrl: string) => {
    setValidationState('loading-model');
    try {
      const { loadModel, validateFoodImage, dataUrlToImage } = await import('@/lib/food-detector');
      setValidationState('analyzing');
      const imgEl = await dataUrlToImage(dataUrl);
      const result = await validateFoodImage(imgEl);
      if (result.isFood) {
        setValidationState('food');
        setDetectedLabel(result.detectedAs);
        setAiConfidence(result.confidence);
      } else {
        setValidationState('not-food');
        setDetectedLabel(result.detectedAs);
        setAiConfidence(result.confidence);
      }
    } catch { setValidationState('error'); }
  }, []);

  const handleFileChange = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      set('capturedImage', dataUrl);
      setValidationState('idle');
      setTimeout(() => runAICheck(dataUrl), 300);
    };
    reader.readAsDataURL(file);
  }, [runAICheck]);

  /* ── Step Validation ── */
  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};
    if (s === 0) {
      if (!form.title.trim() || form.title.trim().length < 5) errs.title = 'Title must be at least 5 characters';
      if (!form.quantity.trim()) errs.quantity = 'Quantity is required';
    }
    if (s === 1) {
      if (!form.location.trim() || form.location.trim().length < 5) errs.location = 'Please enter a valid location';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep(s => s + 1);
  };
  const prevStep = () => { setErrors({}); setStep(s => s - 1); };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true); setSubmitError('');
    const hours = form.expiryHours;
    const expiryTime = new Date(Date.now() + hours * 3600 * 1000).toISOString();
    const priorityScore = hours <= 2 ? 90 : hours <= 4 ? 75 : hours <= 8 ? 55 : 40;
    const priorityLevel = priorityScore >= 75 ? 'High' : priorityScore >= 55 ? 'Medium' : 'Low';

    try {
      await foodAPI.postFood({
        title: form.title, description: form.description, category: form.category,
        quantity: `${form.quantity} ${form.unit}`, location: form.location, expiryTime,
        imageUrl: form.capturedImage ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop',
        postedBy: user.id, status: 'Available', priorityScore, priorityLevel,
        carbonSaved: Number((Math.random() * 5 + 1).toFixed(1)),
        estimatedMeals: Math.round(Math.random() * 10 + 5),
      });
      setSubmitted(true);
      setTimeout(() => router.push('/dashboard'), 2500);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to post. Please try again.');
    } finally { setIsSubmitting(false); }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary-500/30 border-t-primary-400 rounded-full animate-spin" />
      </div>
    );
  }

  /* ── Success Screen ── */
  if (submitted) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 px-6 animate-fade-in">
        <div className="text-6xl animate-bounce">🎉</div>
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-white">Food Posted!</h2>
          <p className="text-dark-400 text-sm">Your donation is now live on the feed</p>
          <p className="text-primary-400 text-xs font-mono">+10 XP earned · Redirecting...</p>
        </div>
        <div className="flex gap-2 text-3xl">🥗🤝🌍🏆⭐</div>
      </div>
    );
  }

  const emoji = EMOJI_MAP[form.category];

  return (
    <div style={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden', boxSizing: 'border-box', padding: '24px 16px', minHeight: '100vh', background: '#050914' }} className="space-y-5 animate-fade-in">
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFileChange(f); }} />

      {/* Header */}
      <div className="app-card-glow p-5">
        <p className="text-dark-500 text-xs font-mono uppercase tracking-widest">Donate Food</p>
        <h1 className="text-xl font-black text-white mt-0.5">Post Surplus Food</h1>
        <p className="text-dark-400 text-[11px] mt-1">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
      </div>

      {/* Step Indicator */}
      <StepIndicator current={step} />

      {/* ── STEP 0: Food Details ── */}
      {step === 0 && (
        <div className="space-y-4 animate-slide-up">
          {/* Category grid */}
          <div className="app-card p-4 space-y-3">
            <label className="text-[11px] font-semibold text-dark-400 uppercase tracking-widest">Food Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(c => (
                <button key={c.value} type="button" onClick={() => set('category', c.value)}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                    form.category === c.value ? 'bg-primary-500/15 border-primary-500/40 shadow-glow-sm' : 'bg-white/3 border-white/8 hover:border-white/15'
                  }`}>
                  <p className="text-2xl">{c.emoji}</p>
                  <p className={`text-[11px] font-bold mt-1 ${form.category === c.value ? 'text-primary-400' : 'text-dark-400'}`}>{c.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="app-card p-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-dark-400 uppercase tracking-widest">Food Title <span className="text-rose-400">*</span></label>
              <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="e.g. Freshly Baked Sourdough Bread" className="app-input !pl-4" />
              {errors.title && <p className="text-rose-400 text-[11px] font-mono">{errors.title}</p>}
            </div>

            {/* Quantity + Unit */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-dark-400 uppercase tracking-widest">Quantity <span className="text-rose-400">*</span></label>
              <div className="flex gap-2">
                <input type="number" min="1" value={form.quantity} onChange={e => set('quantity', e.target.value)}
                  placeholder="10" className="app-input !pl-4 flex-1" />
                <div className="flex gap-1">
                  {UNITS.map(u => (
                    <button key={u} type="button" onClick={() => set('unit', u)}
                      className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                        form.unit === u ? 'bg-primary-500/20 border-primary-500/40 text-primary-400' : 'bg-white/5 border-white/10 text-dark-400 hover:border-white/20'
                      }`}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              {errors.quantity && <p className="text-rose-400 text-[11px] font-mono">{errors.quantity}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-dark-400 uppercase tracking-widest">Description</label>
              <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Allergens, packaging, storage conditions..." className="app-input !pl-4 resize-none" />
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 1: Location ── */}
      {step === 1 && (
        <div className="space-y-4 animate-slide-up">
          <div className="app-card p-5 space-y-4">
            <div>
              <h2 className="text-white font-bold text-sm">Pickup Location</h2>
              <p className="text-dark-500 text-[11px] mt-0.5">Let rescuers know where to pick up</p>
            </div>

            {/* GPS Button */}
            <button type="button" onClick={fetchGPS} disabled={gpsLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary-500/10 border border-primary-500/30 text-primary-400 font-bold text-sm hover:bg-primary-500/20 transition cursor-pointer disabled:opacity-50">
              {gpsLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Fetching location...</>
                : <><MapPin className="w-4 h-4" /> 📍 Use My GPS Location</>
              }
            </button>

            {gpsError && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <p className="text-amber-300 text-xs">{gpsError}</p>
              </div>
            )}

            <div className="relative flex items-center gap-2 text-dark-500 text-xs">
              <div className="flex-1 h-px bg-white/10" />
              <span className="font-mono">or enter manually</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Manual input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-dark-400 uppercase tracking-widest">Address / Landmark <span className="text-rose-400">*</span></label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                <input type="text" value={form.location} onChange={e => set('location', e.target.value)}
                  placeholder="Street, building, or landmark" className="app-input" />
              </div>
              {errors.location && <p className="text-rose-400 text-[11px] font-mono">{errors.location}</p>}
            </div>

            {form.location && (
              <div className="flex items-start gap-2 p-3 rounded-2xl bg-primary-500/8 border border-primary-500/15">
                <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                <p className="text-primary-300 text-xs leading-relaxed">{form.location}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 2: Photo & Expiry ── */}
      {step === 2 && (
        <div className="space-y-4 animate-slide-up">
          {/* Expiry picker */}
          <div className="app-card p-4 space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-dark-400 uppercase tracking-widest">Available For</label>
              <p className="text-dark-600 text-[10px] mt-0.5">How long will this food be available?</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {EXPIRY_OPTIONS.map(opt => (
                <button key={opt.hours} type="button" onClick={() => set('expiryHours', opt.hours)}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    form.expiryHours === opt.hours ? 'bg-primary-500/15 border-primary-500/40' : 'bg-white/3 border-white/8 hover:border-white/15'
                  }`}>
                  <p className="text-xl">{opt.emoji}</p>
                  <p className={`text-sm font-black mt-1 ${form.expiryHours === opt.hours ? 'text-primary-400' : 'text-white'}`}>{opt.label}</p>
                  <p className="text-[10px] text-dark-500">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Camera */}
          <div className="app-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-sm">Food Photo <span className="text-dark-500 font-normal">(optional)</span></h2>
                <p className="text-dark-500 text-[11px] mt-0.5">AI verifies it's real food</p>
              </div>
              <ShieldCheck className="w-5 h-5 text-primary-400" />
            </div>

            {!form.capturedImage ? (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="w-full h-40 rounded-2xl border-2 border-dashed border-white/15 flex flex-col items-center justify-center gap-2 hover:border-primary-500/40 hover:bg-primary-500/5 transition cursor-pointer">
                <Camera className="w-8 h-8 text-dark-500" />
                <p className="text-dark-400 text-sm font-medium">Tap to take a photo</p>
                <p className="text-dark-600 text-[11px]">Camera or gallery</p>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={form.capturedImage} alt="Food" className="w-full h-48 object-cover" />

                  {/* AI overlay */}
                  {(validationState === 'loading-model' || validationState === 'analyzing') && (
                    <div className="absolute inset-0 bg-dark-950/80 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                      <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                      <p className="text-white text-sm font-semibold">
                        {validationState === 'loading-model' ? '🧠 Loading AI...' : '🔍 Checking food...'}
                      </p>
                    </div>
                  )}
                  {validationState === 'food' && (
                    <div className="absolute bottom-0 inset-x-0 bg-primary-500/90 p-2.5 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dark-950" />
                      <div>
                        <p className="text-dark-950 font-bold text-xs">✓ Food Verified — {detectedLabel}</p>
                        <p className="text-dark-900 text-[10px]">{aiConfidence}% confidence</p>
                      </div>
                    </div>
                  )}
                  {validationState === 'not-food' && (
                    <div className="absolute bottom-0 inset-x-0 bg-amber-500/90 p-2.5 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-white" />
                      <p className="text-white font-bold text-xs">⚠️ Not detected as food — but you can still post</p>
                    </div>
                  )}
                  {validationState === 'error' && (
                    <div className="absolute bottom-0 inset-x-0 bg-rose-500/90 p-2.5">
                      <p className="text-white font-bold text-xs text-center">AI check failed — you can still post</p>
                    </div>
                  )}

                  <button type="button" onClick={() => { set('capturedImage', null); setValidationState('idle'); }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-dark-950/80 border border-white/20 flex items-center justify-center cursor-pointer">
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary py-2.5 text-sm">
                  <RefreshCw className="w-4 h-4" /> Retake Photo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 3: Confirm & Submit ── */}
      {step === 3 && (
        <div className="space-y-4 animate-slide-up">
          <div className="app-card-glow p-5 space-y-4">
            <div>
              <h2 className="text-white font-bold text-base">Review Your Donation</h2>
              <p className="text-dark-500 text-xs mt-0.5">Please confirm before posting</p>
            </div>

            {/* Photo or emoji preview */}
            {form.capturedImage ? (
              <img src={form.capturedImage} alt="Food" className="w-full h-40 object-cover rounded-2xl" />
            ) : (
              <div className="w-full h-32 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-5xl">
                {emoji}
              </div>
            )}

            {/* Summary rows */}
            <div className="space-y-3">
              {[
                { label: 'Food',     value: form.title,                              icon: emoji },
                { label: 'Category', value: form.category,                           icon: '📂'  },
                { label: 'Quantity', value: `${form.quantity} ${form.unit}`,         icon: '📦'  },
                { label: 'Location', value: form.location,                           icon: '📍'  },
                { label: 'Expires',  value: `In ${form.expiryHours} hours`,          icon: '⏱️'  },
              ].map(row => (
                <div key={row.label} className="flex items-start gap-3 p-3 bg-white/4 rounded-2xl border border-white/5">
                  <span className="text-base flex-shrink-0">{row.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] text-dark-500 font-mono uppercase tracking-widest">{row.label}</p>
                    <p className="text-white text-sm font-medium truncate">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Badges */}
            <div className="flex gap-2 flex-wrap">
              <span className="badge badge-green">+10 XP on post</span>
              {validationState === 'food' && <span className="badge badge-green">🛡️ AI Verified</span>}
            </div>
          </div>

          {/* Error */}
          {submitError && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-rose-300 text-xs">{submitError}</p>
              </div>
              <button onClick={handleSubmit} className="text-xs text-rose-400 font-bold cursor-pointer hover:text-rose-300">Retry</button>
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary py-4 text-base font-bold disabled:opacity-50">
            {isSubmitting
              ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />Posting...</span>
              : <span className="flex items-center gap-2">✅ Confirm & Post Donation <ArrowRight className="w-4 h-4" /></span>
            }
          </button>
        </div>
      )}

      {/* ── Navigation buttons ── */}
      {step < 3 && (
        <div style={{ width: '100%', boxSizing: 'border-box', paddingBottom: 16 }}>
          {/* Back arrow — shown above Continue on steps 2+ */}
          {step > 0 && (
            <div style={{ marginBottom: 10 }}>
              <button
                type="button"
                onClick={prevStep}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 12,
                  padding: '8px 16px',
                  color: '#9ca3af',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </div>
          )}
          {/* Full-width Continue button */}
          <button
            type="button"
            onClick={nextStep}
            className="btn-primary py-4"
            style={{ width: '100%', minWidth: 0, fontSize: 16, fontWeight: 700 }}
          >
            <span className="flex items-center justify-center gap-2">
              {step === 2 ? 'Review' : 'Continue'} <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      )}

      {step === 3 && step > 0 && (
        <div style={{ paddingBottom: 16 }}>
          <div style={{ marginBottom: 10 }}>
            <button
              type="button"
              onClick={prevStep}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12,
                padding: '8px 16px',
                color: '#9ca3af',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <ArrowLeft className="w-4 h-4" /> Edit Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
