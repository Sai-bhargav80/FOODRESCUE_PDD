'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, User as UserIcon, Phone, ArrowRight, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '@/lib/api';
import PlateIntro from '@/components/PlateIntro';

const signupSchema = z.object({
  fullName:    z.string().min(2, 'At least 2 characters'),
  email:       z.string().min(1, 'Required').email('Invalid email'),
  countryCode: z.string().min(1),
  phoneNumber: z.string().length(10, 'Must be 10 digits').regex(/^\d+$/, 'Digits only'),
  password:    z.string().min(6, 'At least 6 characters'),
  mpin:        z.string().length(4, 'Security PIN must be exactly 4 digits').regex(/^\d+$/, 'Digits only'),
});
type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', countryCode: '+91', phoneNumber: '', password: '', mpin: '' },
  });

  const onSubmit = async (values: SignupFormValues) => {
    setError(''); setSuccess(''); setIsLoading(true);
    try {
      const fullPhone = `${values.countryCode} ${values.phoneNumber}`;
      const response  = await authAPI.signup({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        phoneNumber: fullPhone,
        mpin: values.mpin
      });
      const { success: ok, message } = response.data;
      if (ok) {
        setSuccess('Account created! Redirecting to login...');
        setTimeout(() => router.push('/login'), 1800);
      } else {
        setError(message || 'Registration failed.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden bg-[#050914]" style={{ background: 'linear-gradient(160deg, #050914 0%, #0a1628 50%, #050914 100%)' }}>
      
      {/* 🔧 Debug strip (hidden in production builds) */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="absolute top-2 left-2 z-50 bg-dark-900/90 border border-white/5 px-2 py-0.5 rounded-lg text-[9px] font-mono text-dark-500">
          API → {process.env.NEXT_PUBLIC_API_URL || 'http://172.25.34.84:8000'}
        </div>
      )}

      {/* LEFT PANEL: Branding & Visual Layout (58% width - Desktop only) */}
      <div className="hidden lg:flex lg:w-[58%] h-full relative flex-col justify-between p-12 overflow-hidden border-r border-white/5 bg-[#050914] select-none">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full opacity-20 blur-[120px] pointer-events-none" style={{ background: 'radial-gradient(circle, #00e87e, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-[100px] pointer-events-none" style={{ background: 'radial-gradient(circle, #f97316, transparent)' }} />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

        {/* Header Branding */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-primary shadow-glow flex items-center justify-center">
            <Leaf className="w-5 h-5 text-dark-950" strokeWidth={2.5} />
          </div>
          <span className="font-black text-xl tracking-tight text-white">FoodRescue<span className="text-[#f97316]">Map</span></span>
        </div>

        {/* Core Taglines */}
        <div className="my-auto space-y-8 relative z-10 max-w-lg text-left">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-[10px] font-bold uppercase tracking-wider text-primary-400">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
              Join the movement
            </div>
            <h1 className="text-[52px] font-black leading-[1.1] text-white tracking-tight">
              From Waste to <span className="bg-gradient-to-r from-primary-400 to-[#f97316] bg-clip-text text-transparent">Plates</span>
            </h1>
            <p className="text-xl text-dark-300 font-semibold">— Just 1 Tap Away</p>
          </div>
          
          <p className="text-dark-400 text-sm leading-relaxed">
            Connect weddings, corporate offices, and local restaurants directly to NGOs and volunteers nearby. Zero food waste, zero hunger, zero cost.
          </p>

          {/* Feature stat chips */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 bg-dark-900/60 border border-white/5 rounded-2xl flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="text-white font-bold text-sm">50,000+</p>
                <p className="text-[10px] text-dark-500 font-mono uppercase tracking-wider">Meals Rescued</p>
              </div>
            </div>
            <div className="p-4 bg-dark-900/60 border border-white/5 rounded-2xl flex items-center gap-3">
              <span className="text-2xl">🗺️</span>
              <div>
                <p className="text-white font-bold text-sm">Live Map</p>
                <p className="text-[10px] text-dark-500 font-mono uppercase tracking-wider">Realtime Pins</p>
              </div>
            </div>
            <div className="p-4 bg-dark-900/60 border border-white/5 rounded-2xl flex items-center gap-3">
              <span className="text-2xl">🌿</span>
              <div>
                <p className="text-white font-bold text-sm">CO2 Savings</p>
                <p className="text-[10px] text-dark-500 font-mono uppercase tracking-wider">Carbon Offset</p>
              </div>
            </div>
            <div className="p-4 bg-dark-900/60 border border-white/5 rounded-2xl flex items-center gap-3">
              <span className="text-2xl">❤️</span>
              <div>
                <p className="text-white font-bold text-sm">100% Free</p>
                <p className="text-[10px] text-dark-500 font-mono uppercase tracking-wider">For Everyone</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-dark-600 font-mono relative z-10">© 2026 FoodRescueMap · Sustainable Communities</p>
      </div>

      {/* RIGHT PANEL: Form Card Column (42% width on Desktop, full-bleed on Mobile) */}
      <div className="flex-1 lg:w-[42%] lg:h-full lg:overflow-y-auto flex flex-col justify-center px-5 py-12 md:py-16 relative">
        
        {/* Glow backdrop (Tablet layout only) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none md:block hidden lg:hidden" style={{ background: 'radial-gradient(circle, #00e87e, transparent)' }} />

        {/* Welcome block */}
        <div className="text-center mb-8 lg:mb-6">
          {/* Header logo (Hidden on desktop panel since it has the large left panel branding) */}
          <div className="lg:hidden">
            <div className="w-14 h-14 rounded-2xl bg-gradient-primary shadow-glow mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-dark-950" strokeWidth={2} />
            </div>
          </div>
          <h1 className="text-3xl lg:text-[36px] font-black text-white tracking-tight">Create Account</h1>
          <p className="text-dark-400 text-sm mt-1">Join the FoodRescue community</p>
        </div>

        {/* Form elements with PlateIntro wrapper */}
        <div className="w-full max-w-sm md:max-w-[420px] mx-auto relative z-10">
          <PlateIntro>
            <div className="app-card p-6 space-y-4">

              {error && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <p className="text-rose-300 text-xs font-medium">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary-500/10 border border-primary-500/20 animate-fade-in">
                  <span className="text-primary-400">✓</span>
                  <p className="text-primary-300 text-xs font-medium">{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-dark-400 uppercase tracking-widest">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                    <input type="text" placeholder="Vemani Sai" className="app-input" disabled={isLoading} {...register('fullName')} />
                  </div>
                  {errors.fullName && <p className="text-rose-400 text-[11px] font-mono">{errors.fullName.message}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-dark-400 uppercase tracking-widest">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                    <input type="email" placeholder="you@example.com" className="app-input" disabled={isLoading} {...register('email')} />
                  </div>
                  {errors.email && <p className="text-rose-400 text-[11px] font-mono">{errors.email.message}</p>}
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-dark-400 uppercase tracking-widest">Phone Number</label>
                  <div className="flex gap-2">
                    <select className="app-input !pl-3 !w-auto shrink-0 text-xs" disabled={isLoading} {...register('countryCode')}>
                      <option value="+91">+91 (IN)</option>
                      <option value="+1">+1 (US)</option>
                      <option value="+44">+44 (UK)</option>
                    </select>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                      <input type="tel" placeholder="9876543210" className="app-input" maxLength={10} disabled={isLoading} {...register('phoneNumber')} />
                    </div>
                  </div>
                  {errors.phoneNumber && <p className="text-rose-400 text-[11px] font-mono">{errors.phoneNumber.message}</p>}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-dark-400 uppercase tracking-widest">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="app-input pr-10"
                      disabled={isLoading}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-500 hover:text-white transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-rose-400 text-[11px] font-mono">{errors.password.message}</p>}
                </div>

                {/* Security PIN */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-dark-400 uppercase tracking-widest">Security PIN</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                    <input
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      placeholder="••••"
                      className="app-input"
                      disabled={isLoading}
                      {...register('mpin')}
                    />
                  </div>
                  {errors.mpin && <p className="text-rose-400 text-[11px] font-mono">{errors.mpin.message}</p>}
                </div>

                <button type="submit" disabled={isLoading} className="btn-primary mt-2">
                  {isLoading ? (
                    <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />Creating account...</span>
                  ) : (
                    <span className="flex items-center gap-2">Create Account <ArrowRight className="w-4 h-4" /></span>
                  )}
                </button>
              </form>

              <p className="text-center text-dark-500 text-sm pt-2 border-t border-white/5">
                Already have an account?{' '}
                <Link href="/login" className="text-primary-400 font-semibold hover:text-primary-300 transition">Sign in</Link>
              </p>
            </div>
          </PlateIntro>
        </div>
      </div>
    </div>
  );
}
