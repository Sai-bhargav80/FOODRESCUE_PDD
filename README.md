# FoodRescue Web Application

A professional, premium-grade web application for FoodRescue - a platform where donors post surplus food and volunteers rescue and deliver it to those in need.

## 🚀 Project Overview

FoodRescue connects:
- **Donors** (Restaurants/Individuals) - Post surplus food with location & expiry details
- **Volunteers** (Rescuers) - Claim food and track real-time delivery
- **Recipients** - Receive meals saved from waste

### Key Features
- ✨ Glassmorphic, futuristic UI with dark mode
- 📍 Real-time GPS tracking & map integration
- 🎯 Impact points & gamification system
- 📱 Fully responsive (Mobile, Tablet, Desktop)
- 🔐 Secure authentication with OTP support
- 📊 Live community impact counter
- ⚡ Shimmer loaders for smooth UX

## 📁 Project Structure

```
foodrescue-web/
├── app/                          # Next.js app directory
│   ├── (auth)/                   # Auth routes group
│   │   ├── login/                # Login page
│   │   └── signup/               # Signup page
│   ├── dashboard/                # Main food feed
│   ├── post-food/                # Donor posting form
│   ├── rescue-tracking/          # Rescue status tracking
│   ├── profile/                  # User profile & stats
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── app.css                   # App-specific styles
├── components/                   # Reusable React components
│   ├── Navbar.tsx                # Global navigation bar
│   ├── HeroSection.tsx           # Landing hero
│   ├── HowItWorks.tsx            # Process explanation
│   ├── LiveImpactCounter.tsx     # Impact statistics
│   └── Layout.tsx                # Main layout wrapper
├── lib/                          # Utilities & helpers
│   ├── axios.ts                  # Axios API client
│   ├── api.ts                    # API endpoints
│   └── auth.ts                   # Auth hooks
├── styles/                       # Global styles
│   └── globals.css               # Tailwind & custom CSS
├── public/                       # Static assets
├── .env.local                    # Environment variables
├── tailwind.config.js            # Tailwind configuration
├── tsconfig.json                 # TypeScript config
├── next.config.js                # Next.js config
├── package.json                  # Dependencies
└── README.md                     # This file
```

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS 3 with custom glassmorphic utilities
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Forms**: React Hook Form
- **API**: Axios with interceptors
- **Maps**: Leaflet + React Leaflet (optional for advanced mapping)

### Backend Integration
- **API Base**: `http://localhost:8000` (FastAPI)
- **Auth**: Token-based (JWT)

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ & npm/yarn
- FastAPI backend running on `http://localhost:8000`

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
# .env.local is already configured, update if needed:
NEXT_PUBLIC_API_URL=http://localhost:8000

# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Build & Deploy

```bash
# Build production bundle
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📄 API Endpoints (Expected from FastAPI Backend)

### Authentication
- `POST /signup` - Register new user
- `POST /login` - User login
- `POST /forgot-password` - Password reset
- `POST /verify-otp` - OTP verification

### Food Listings
- `GET /food-listings` - Fetch available food (with filters)
- `GET /food-listings/{id}` - Get food details
- `POST /food-listings` - Post new food (donor)

### Claims & Rescues
- `POST /claim-food/{id}` - Claim food as rescuer
- `POST /update-rescue-status/{id}` - Update rescue status
- `GET /rescue-history/{userId}` - Rescue history

### User & Stats
- `GET /user/profile` - User profile
- `PUT /user/profile` - Update profile
- `GET /user/stats` - User stats (points, level, badges)
- `GET /user/{userId}/contribution-history` - Contribution history
- `GET /impact-stats` - Global impact counter

## 🎨 Design System

### Color Palette
- **Primary**: `#22C55E` to `#16A34A` (Green gradient)
- **Background**: `#030712` to `#111827` (Dark)
- **Glass Cards**: `backdrop-blur(10px) + white/10 bg + white/20 border`

### Typography
- **Font**: Inter (Google Fonts)
- **Sizes**: Responsive with Tailwind scale

### Components
- **Glassmorphic Cards**: `.glass-card`, `.glass-card-dark`
- **Gradients**: `.btn-gradient`, `.bg-gradient-primary`
- **Loaders**: `.shimmer` animation

## 📱 Pages Included

### Completed (v1.0)
1. **Landing Page** (`/`) - Hero, How It Works, Impact Counter
2. **Global Navbar** - Responsive with auth state handling
3. **Footer** - Company links and info

### Coming Soon
4. **Auth Pages** (`/login`, `/signup`) - Email/Password, OTP, Google Sign-In
5. **Dashboard** (`/dashboard`) - Food feed with claim functionality
6. **Post Food** (`/post-food`) - Donor form with map integration
7. **Rescue Tracking** (`/rescue-tracking`) - Status timeline
8. **User Profile** (`/profile`) - Stats, badges, history

## 🔧 Configuration

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Tailwind Customization
Edit `tailwind.config.js` to modify colors, spacing, animations.

### Axios Interceptors
- **Request**: Adds Authorization header (JWT token from localStorage)
- **Response**: Handles 401 errors, redirects to login

## 📦 Dependencies Overview

| Package | Purpose |
|---------|---------|
| `next` | React framework |
| `react`, `react-dom` | UI library |
| `tailwindcss` | Styling |
| `lucide-react` | Icons |
| `axios` | HTTP client |
| `react-hook-form` | Form management |
| `date-fns` | Date utilities |
| `leaflet`, `react-leaflet` | Maps (optional) |

## 🚨 Important Notes

1. **API Connection**: Ensure FastAPI backend is running on `http://localhost:8000`
2. **Auth Flow**: Login/signup responses should return a JWT token stored in `localStorage`
3. **CORS**: Backend must allow requests from `http://localhost:3000`
4. **Mobile First**: Design prioritizes mobile responsiveness

## 🤝 Contributing

Follow these conventions:
- Use TypeScript for type safety
- Follow Tailwind CSS utility-first approach
- Keep components modular and reusable
- Add comments for complex logic

## 📝 License

This project is proprietary. All rights reserved.

---

**Built with ❤️ for the FoodRescue Community**
