/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: {
          50:  '#edfff6',
          100: '#d5ffec',
          200: '#aeffda',
          300: '#70ffc0',
          400: '#2bfb9e',
          500: '#00e87e',
          600: '#00c366',
          700: '#00964f',
          800: '#00753f',
          900: '#006035',
          950: '#003820',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        rose: {
          400: '#fb7185',
          500: '#f43f5e',
        },
        dark: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          850: '#141c2e',
          900: '#0f172a',
          925: '#090e1a',
          950: '#050914',
        },
      },
      backgroundImage: {
        'gradient-primary':   'linear-gradient(135deg, #00e87e 0%, #00964f 100%)',
        'gradient-accent':    'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
        'gradient-danger':    'linear-gradient(135deg, #fb7185 0%, #f43f5e 100%)',
        'gradient-amber':     'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        'gradient-mesh':      'radial-gradient(at 20% 30%, #00e87e22 0, transparent 50%), radial-gradient(at 80% 70%, #0ea5e922 0, transparent 50%)',
        'card-glow':          'linear-gradient(135deg, rgba(0,232,126,0.08) 0%, rgba(14,165,233,0.04) 100%)',
        'tab-active':         'linear-gradient(to top, rgba(0,232,126,0.15), transparent)',
      },
      boxShadow: {
        'glow-sm':  '0 0 12px rgba(0,232,126,0.25)',
        'glow':     '0 0 24px rgba(0,232,126,0.3)',
        'glow-lg':  '0 0 48px rgba(0,232,126,0.35)',
        'card':     '0 4px 24px rgba(0,0,0,0.4)',
        'card-lg':  '0 8px 40px rgba(0,0,0,0.5)',
        'inset-glow': 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      animation: {
        'pulse-slow':  'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer':     'shimmer 2s infinite',
        'float':       'float 3s ease-in-out infinite',
        'glow-pulse':  'glow-pulse 2s ease-in-out infinite',
        'slide-up':    'slide-up 0.4s cubic-bezier(0.16,1,0.3,1)',
        'fade-in':     'fade-in 0.3s ease-out',
        'scale-in':    'scale-in 0.2s cubic-bezier(0.16,1,0.3,1)',
        'bounce-soft': 'bounce-soft 0.6s cubic-bezier(0.16,1,0.3,1)',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(0,232,126,0.2)' },
          '50%':      { boxShadow: '0 0 28px rgba(0,232,126,0.5)' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%':   { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        'bounce-soft': {
          '0%':   { transform: 'scale(0.95)' },
          '60%':  { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
