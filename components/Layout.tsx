'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plus, Navigation, User, Heart } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from './Navbar';

export const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';
  const isLandingPage = pathname === '/';
  const showBottomNav = !!user && !isAuthPage && !isLandingPage;

  if (isLandingPage) {
    return (
      <div className="min-h-screen bg-[#050914] text-white">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050914] text-dark-100 flex flex-col">
      <Navbar />
      <main className={`flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-20 ${showBottomNav ? 'pb-24 md:pb-12' : 'pb-12'} relative`}>
        {children}
      </main>
      {showBottomNav && <BottomNav pathname={pathname} />}
      {!showBottomNav && !isAuthPage && <Footer />}
    </div>
  );
};

const tabs = [
  { label: 'Home',      href: '/dashboard',      icon: Home       },
  { label: 'Donate',    href: '/my-donations',   icon: Heart      },
  { label: 'Post',      href: '/post-food',       icon: Plus       },
  { label: 'Rescue',    href: '/rescue-tracking', icon: Navigation },
  { label: 'Profile',   href: '/profile',         icon: User       },
];

const BottomNav = ({ pathname }: { pathname: string }) => (
  <nav className="bottom-nav md:hidden">
    <div className="flex items-center justify-around h-16">
      {tabs.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
        const isPost = href === '/post-food';

        if (isPost) {
          return (
            <Link key={href} href={href} className="flex flex-col items-center justify-center flex-1 h-full relative">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                active
                  ? 'bg-gradient-primary shadow-glow scale-110'
                  : 'bg-primary-500/20 border border-primary-500/30'
              }`}>
                <Icon className={`w-6 h-6 ${active ? 'text-dark-950' : 'text-primary-400'}`} strokeWidth={2.5} />
              </div>
            </Link>
          );
        }

        return (
          <Link key={href} href={href} className="flex flex-col items-center justify-center flex-1 h-full gap-1 relative">
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary-400 rounded-full" />
            )}
            <Icon className={`w-5 h-5 transition-all duration-200 ${active ? 'text-primary-400 scale-110' : 'text-dark-500'}`} strokeWidth={active ? 2.5 : 2} />
            <span className={`text-[10px] font-semibold tracking-wide transition-colors ${active ? 'text-primary-400' : 'text-dark-500'}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  </nav>
);

const Footer = () => (
  <footer className="border-t border-white/5 mt-16 py-8 text-center">
    <p className="text-dark-500 text-xs">© 2026 FoodRescue · Built with ❤️ for the community</p>
  </footer>
);
