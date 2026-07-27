'use client';

import Link from 'next/link';
import { ArrowRight, Leaf, Users, Zap, Globe } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center pt-20 px-4 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-primary-500/20 rounded-full filter blur-3xl opacity-50 animate-pulse-slow" />
        <div className="absolute -bottom-40 right-0 w-80 h-80 bg-cyan-500/20 rounded-full filter blur-3xl opacity-50 animate-pulse-slow" />
      </div>

      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 glass-card-dark">
          <Zap className="w-4 h-4 text-primary-400" />
          <span className="text-sm text-primary-300">The future of food rescue is here</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
          <span className="bg-gradient-to-r from-primary-300 via-primary-400 to-primary-500 bg-clip-text text-transparent">
            Rescue Food
          </span>
          <br />
          <span className="text-dark-100">Save Lives</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-dark-300 mb-12 max-w-2xl mx-auto leading-relaxed">
          Connect donors with surplus food to volunteers who deliver meals to those in need. Real-time tracking, community impact, and rewards await.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/signup"
            className="px-8 py-4 bg-gradient-primary text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-primary-600/50 transition-all duration-300 group"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="#how-it-works"
            className="px-8 py-4 glass-card-dark text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300"
          >
            Learn More
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { icon: Leaf, label: 'Eco-Friendly' },
            { icon: Users, label: '10K+ Users' },
            { icon: Globe, label: 'Real-time' },
            { icon: Zap, label: 'Instant' },
          ].map((feature, index) => {
            const { icon: Icon } = feature;
            return (
              <div
                key={index}
                className="glass-card-dark px-4 py-3 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-300"
              >
                <Icon className="w-4 h-4 text-primary-400" />
                <span className="text-sm text-dark-200">{feature.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center gap-2">
          <span className="text-dark-400 text-sm">Scroll to explore</span>
          <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
};
