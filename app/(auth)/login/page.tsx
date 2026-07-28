'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Leaf, AlertCircle, KeyRound, Loader } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import PinInput from '@/components/PinInput';
import PlateIntro from '@/components/PlateIntro';

const loginSchema = z.object({
  email:    z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(6, 'At least 6 characters'),
});
type LoginFormValues = z.infer<typeof loginSchema>;

// ── Demo credentials (offline, no backend needed) ────────
const DEMO_ACCOUNTS: Record<string, any> = {
  'donor@test.com': {
    id: 1, email: 'donor@test.com', fullName: 'Donor Test',
    role: 'Donor', phoneNumber: '9876543210', points: 300,
    rescuesCount: 0, donationsCount: 15, totalCarbonSaved: 45.0, level: 4, provider: 'local',
  },
  'ngo@test.com': {
    id: 2, email: 'ngo@test.com', fullName: 'NGO Test',
    role: 'NGO', phoneNumber: '8765432109', points: 800,
    rescuesCount: 42, donationsCount: 0, totalCarbonSaved: 120.5, level: 7, provider: 'local',
  },
  'volunteer@test.com': {
    id: 3, email: 'volunteer@test.com', fullName: 'Volunteer Test',
    role: 'Volunteer', phoneNumber: '7654321098', points: 450,
    rescuesCount: 20, donationsCount: 0, totalCarbonSaved: 60.0, level: 5, provider: 'local',
  },
  'vemanisai@gmail.com': {
    id: 4, email: 'vemanisai@gmail.com', fullName: 'Vemani Sai',
    role: 'Donor', phoneNumber: '9876543210', points: 250,
    rescuesCount: 8, donationsCount: 5, totalCarbonSaved: 24.5, level: 3, provider: 'local',
  }
};
const DEMO_PASSWORD = 'Test@1234';

export default function LoginPage() {
  const router = useRouter();
  const { login: setAuthSession } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [loginMode, setLoginMode] = useState<'password' | 'pin'>('password');
  const [pinStep, setPinStep] = useState<1 | 2>(1); // 1: email, 2: pin input
  const [emailForPin, setEmailForPin] = useState('');
  const [pinEmailInput, setPinEmailInput] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleProceedToPin = (email: string) => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setEmailForPin(email);
    setPinStep(2);
  };

  const handleVerifyPinAndLogin = async (pinCode: string) => {
    setError(''); setSuccess(''); setIsLoading(true);
    
    // Offline / Demo verification fallback
    const isDemo = DEMO_ACCOUNTS[emailForPin.toLowerCase()];
    if (isDemo && (pinCode === '1234' || pinCode === '0000')) {
      setAuthSession(isDemo, 'demo-token');
      setSuccess('✓ Pin verified! Welcome back!');
      setTimeout(() => router.push('/dashboard'), 1000);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authAPI.loginMpin({ email: emailForPin, mpin: pinCode });
      const { success: ok, message, user, token } = response.data;
      if (ok && user && token) {
        setAuthSession(user, token);
        setSuccess('✓ Login successful!');
        setTimeout(() => router.push('/dashboard'), 1000);
      } else {
        setError(message || 'Incorrect Security PIN. Please try again.');
      }
    } catch (err: any) {
      if (isDemo) {
        setAuthSession(isDemo, 'demo-token');
        setSuccess('✓ Welcome back (Demo Mode)!');
        setTimeout(() => router.push('/dashboard'), 1000);
      } else {
        setError(err.response?.data?.message || err.response?.data?.detail || 'Incorrect PIN or server connection error.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: LoginFormValues) => {
    setError(''); setSuccess(''); setIsLoading(true);

    // Offline demo login
    const demoUser = DEMO_ACCOUNTS[values.email.toLowerCase()];
    if (demoUser && (values.password === DEMO_PASSWORD || values.password === 'password123')) {
      setAuthSession(demoUser, 'demo-token');
      setSuccess('✓ Welcome back!');
      setTimeout(() => router.push('/dashboard'), 1000);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authAPI.login({ email: values.email, password: values.password });
      const { success: ok, message, user, token } = response.data;
      if (ok && token && user) {
        setAuthSession(user, token);
        setSuccess('✓ Login successful!');
        setTimeout(() => router.push('/dashboard'), 1000);
      } else {
        setError(message || 'Invalid credentials');
      }
    } catch (err: any) {
      // Surface the real error clearly for debugging
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('⏱ Request timed out. Is the server running? Check: http://172.25.34.84:8000/docs');
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('📡 Cannot reach server. Check: (1) FastAPI running with --host 0.0.0.0 (2) Phone & laptop on same WiFi (3) Firewall allows port 8000');
      } else if (err.response?.status === 401 || err.response?.status === 400) {
        setError(err.response?.data?.detail || err.response?.data?.message || 'Wrong email or password');
      } else if (err.response?.status >= 500) {
        setError(`Server error ${err.response.status}. Check FastAPI console for details.`);
      } else {
        setError(err.response?.data?.message || err.response?.data?.detail || err.message || 'Connection error. Try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #050914 0%, #0a1628 50%, #050914 100%)' }}>

      {/* 🔧 Debug strip — shows which server the app is hitting */}
      <div style={{ background: '#0a1628', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '4px 12px', textAlign: 'center' }}>
        <p style={{ fontSize: '9px', fontFamily: 'monospace', color: '#4b5563', letterSpacing: '0.05em' }}>
          API → {process.env.NEXT_PUBLIC_API_URL || 'http://172.25.34.84:8000'}
        </p>
      </div>

      {/* Top hero section */}
      {(loginMode !== 'pin' || pinStep !== 2) && (
        <div className="flex-none pt-16 pb-10 px-6 text-center relative overflow-hidden">
          {/* Glow orbs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #00e87e, transparent)' }} />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary shadow-glow mx-auto mb-4 flex items-center justify-center">
              <Leaf className="w-8 h-8 text-dark-950" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Welcome back</h1>
            <p className="text-dark-400 text-sm mt-1">Sign in to continue rescuing food</p>
          </div>
        </div>
      )}

      {/* Form card */}
      <div className="flex-1 px-5 pb-10">
        <PlateIntro>
          <div className="app-card p-6 space-y-5 max-w-sm mx-auto">

          {/* Login mode toggle */}
          {(!isLoading && (loginMode !== 'pin' || pinStep !== 2)) && (
            <div className="flex bg-dark-900/60 p-1.5 rounded-2xl border border-white/5 mb-4">
              <button
                type="button"
                onClick={() => { setLoginMode('password'); setError(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                  loginMode === 'password'
                    ? 'bg-gradient-primary text-white shadow-glow'
                    : 'text-dark-400 hover:text-dark-200'
                }`}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => { setLoginMode('pin'); setError(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                  loginMode === 'pin'
                    ? 'bg-gradient-primary text-white shadow-glow'
                    : 'text-dark-400 hover:text-dark-200'
                }`}
              >
                Security PIN Login
              </button>
            </div>
          )}

          {/* Error */}
          {(loginMode !== 'pin' || pinStep !== 2) && error && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <p className="text-rose-300 text-xs font-medium">{error}</p>
            </div>
          )}

          {/* Success */}
          {(loginMode !== 'pin' || pinStep !== 2) && success && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary-500/10 border border-primary-500/20 animate-fade-in">
              <span className="text-primary-400 text-sm">✓</span>
              <p className="text-primary-300 text-xs font-medium">{success}</p>
            </div>
          )}

          {/* Password Login Form */}
          {loginMode === 'password' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-dark-400 uppercase tracking-widest">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="app-input"
                    disabled={isLoading}
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="text-rose-400 text-[11px] font-mono">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-semibold text-dark-400 uppercase tracking-widest">Password</label>
                  <Link href="/forgot-password" className="text-[11px] text-primary-400 font-semibold hover:text-primary-300 transition">Forgot?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="app-input pr-12"
                    disabled={isLoading}
                    {...register('password')}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition cursor-pointer">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-rose-400 text-[11px] font-mono">{errors.password.message}</p>}
              </div>

              {/* Submit */}
              <button type="submit" disabled={isLoading} className="btn-primary mt-2">
                {isLoading ? (
                  <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />Signing in...</span>
                ) : (
                  <span className="flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4" /></span>
                )}
              </button>
            </form>
          )}

          {/* PIN Login Form */}
          {loginMode === 'pin' && (
            <div className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-dark-400 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="app-input"
                    value={pinEmailInput}
                    onChange={(e) => {
                      setPinEmailInput(e.target.value);
                      setEmailForPin(e.target.value);
                    }}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Security PIN Split-boxes */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-dark-400 uppercase tracking-widest block text-center mb-1">Security PIN</label>
                <PinInput
                  length={4}
                  title=""
                  subtitle=""
                  isLoading={isLoading}
                  error={error}
                  success={success}
                  onComplete={handleVerifyPinAndLogin}
                />
              </div>
            </div>
          )}

          {/* Demo hint */}
          <div className="p-3 rounded-2xl bg-white/3 border border-white/5 text-center">
            <p className="text-[10px] text-dark-500 font-mono">DEMO CREDENTIALS</p>
            {loginMode === 'password' ? (
              <>
                <p className="text-[11px] text-dark-400 mt-0.5">donor@ | ngo@ | volunteer@ (test.com)</p>
                <p className="text-[11px] text-dark-500 font-mono mt-0.5">Password: {DEMO_PASSWORD}</p>
              </>
            ) : (
              <>
                <p className="text-[11px] text-dark-400 mt-0.5">donor@ | ngo@ | volunteer@ (test.com)</p>
                <p className="text-[11px] text-dark-500 font-mono mt-0.5">Security PIN: 1234</p>
              </>
            )}
          </div>

          {/* Sign up link */}
          <p className="text-center text-dark-500 text-sm pt-2 border-t border-white/5">
            New here?{' '}
            <Link href="/signup" className="text-primary-400 font-semibold hover:text-primary-300 transition">
              Create account
            </Link>
          </p>
        </div>
        </PlateIntro>
      </div>
    </div>
  );
}
