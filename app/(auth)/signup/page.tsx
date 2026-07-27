'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, User as UserIcon, Phone, ArrowRight, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '@/lib/api';

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
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #050914 0%, #0d1628 50%, #050914 100%)' }}>
      {/* Top section */}
      <div className="flex-none pt-16 pb-8 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-48 h-48 rounded-full opacity-15 blur-3xl" style={{ background: 'radial-gradient(circle, #38bdf8, transparent)' }} />
        <div className="absolute top-8 right-1/4 w-32 h-32 rounded-full opacity-15 blur-3xl" style={{ background: 'radial-gradient(circle, #00e87e, transparent)' }} />
        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-primary shadow-glow mx-auto mb-3 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-dark-950" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Create Account</h1>
          <p className="text-dark-400 text-sm mt-1">Join the FoodRescue community</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 pb-10">
        <div className="app-card p-6 space-y-4 max-w-sm mx-auto">

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

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-dark-400 uppercase tracking-widest">Mobile Number</label>
              <div className="flex gap-2">
                <select className="app-input !pl-3 !w-auto shrink-0 text-xs" disabled={isLoading} {...register('countryCode')}>
                  <option value="+91">+91</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
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
                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="app-input pr-12" disabled={isLoading} {...register('password')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition cursor-pointer">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
      </div>
    </div>
  );
}
