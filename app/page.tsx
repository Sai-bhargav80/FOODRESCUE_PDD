'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Leaf, MapPin, Sparkles, Heart } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleOpenMap = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#050914] text-white font-sans overflow-x-hidden selection:bg-orange-500/30">
      {/* Custom Landing Page Header */}
      <header className="w-full border-b border-white/5 bg-[#050914]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <MapPin className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              FoodRescue<span className="text-orange-500 font-medium">Map</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-400">
            <Link href="/" className="text-white hover:text-white transition-colors">Home</Link>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#feedback" className="hover:text-white transition-colors">Feedback</a>
            <a href="#donate" className="hover:text-white transition-colors flex items-center gap-1.5 text-rose-400 hover:text-rose-300">
              Donate <Heart className="w-3.5 h-3.5 fill-rose-400" />
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-gray-300 hover:text-white transition"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-sm font-semibold text-gray-300 hover:text-white bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl hover:bg-white/10 transition"
              >
                Login
              </Link>
            )}

            <button
              onClick={handleOpenMap}
              className="bg-gradient-to-r from-orange-500 to-rose-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition duration-200 cursor-pointer"
            >
              Open Map →
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-60 h-60 bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-semibold uppercase tracking-wider text-orange-400 mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          Free • Live • Mobile-First
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.15] text-white">
          From Waste to <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">Plates</span>
        </h1>
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-400 mt-4">
          — Just 1 Tap Away
        </h2>

        {/* Description */}
        <p className="mt-8 text-lg text-gray-400 max-w-2xl leading-relaxed">
          Connect restaurants, weddings & offices with hungry people nearby.
          <br />
          <span className="text-orange-400 font-medium">Zero food waste.</span>{' '}
          <span className="text-teal-400 font-medium">Zero hunger.</span>{' '}
          <span className="text-purple-400 font-medium">Zero cost.</span>
        </p>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <button
            onClick={handleOpenMap}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl shadow-orange-500/20 hover:shadow-orange-500/35 hover:-translate-y-0.5 transition duration-200 cursor-pointer"
          >
            <MapPin className="w-5 h-5" />
            Open Live Map →
          </button>

          <a
            href="#features"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-bold text-base transition duration-200"
          >
            <Sparkles className="w-5 h-5 text-gray-400" />
            See Features
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-center text-sm text-gray-500">
        <p>© 2026 FoodRescueMap · Built with ❤️ for a sustainable planet</p>
      </footer>
    </div>
  );
}
