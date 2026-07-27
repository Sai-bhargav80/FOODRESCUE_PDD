'use client';

import { CheckCircle2, MapPin, Award, Clock } from 'lucide-react';

const steps = [
  {
    number: 1,
    title: 'Donor Posts Food',
    description: 'Restaurants or individuals post surplus food with details and location.',
    icon: MapPin,
    color: 'from-emerald-400 to-teal-600',
  },
  {
    number: 2,
    title: 'Volunteer Claims',
    description: 'Rescuers claim available food and coordinate the pickup.',
    icon: CheckCircle2,
    color: 'from-blue-400 to-cyan-600',
  },
  {
    number: 3,
    title: 'Pickup & Delivery',
    description: 'Real-time GPS tracking ensures safe and timely delivery.',
    icon: Clock,
    color: 'from-orange-400 to-red-600',
  },
  {
    number: 4,
    title: 'Earn Impact Points',
    description: 'Get rewarded with points, badges, and recognition for impact.',
    icon: Award,
    color: 'from-purple-400 to-pink-600',
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">FoodRescue</span> Works
          </h2>
          <p className="text-dark-300 text-lg max-w-2xl mx-auto">
            A simple 4-step process to rescue food and make a real impact in your community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/4 left-0 right-0 h-1 bg-gradient-to-r from-primary-500/20 via-primary-500/50 to-primary-500/20" />

          {steps.map((step, index) => {
            const { icon: Icon } = step;
            return (
              <div key={step.number} className="relative">
                {/* Card */}
                <div className="glass-card-dark p-8 h-full hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300">
                  {/* Step Number */}
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center mb-6 text-white font-bold text-lg`}>
                    {step.number}
                  </div>

                  {/* Icon */}
                  <Icon className="w-8 h-8 text-primary-400 mb-4" />

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>

                  {/* Description */}
                  <p className="text-dark-300 text-sm leading-relaxed">{step.description}</p>
                </div>

                {/* Arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-4 top-1/4 translate-y-1/2">
                    <div className="w-8 h-8 rounded-full bg-dark-800 border border-primary-500/50 flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
