'use client';

import { useEffect, useState } from 'react';
import { impactAPI } from '@/lib/api';
import { Leaf, Truck, Heart, TrendingUp } from 'lucide-react';

interface ImpactStats {
  totalMealsSaved: number;
  totalCarbonSaved: number;
  activeUsers: number;
  totalRescues: number;
}

export const LiveImpactCounter = () => {
  const [stats, setStats] = useState<ImpactStats>({
    totalMealsSaved: 2847,
    totalCarbonSaved: 5692,
    activeUsers: 342,
    totalRescues: 142,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await impactAPI.getCommunityStats();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch impact stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const impactItems = [
    {
      label: 'Meals Saved',
      value: stats.totalMealsSaved,
      icon: Leaf,
      color: 'from-green-400 to-emerald-600',
      bgColor: 'bg-green-500/20',
    },
    {
      label: 'CO₂ Reduced (kg)',
      value: Math.round(stats.totalCarbonSaved),
      icon: Truck,
      color: 'from-blue-400 to-cyan-600',
      bgColor: 'bg-blue-500/20',
    },
    {
      label: 'Rescues Completed',
      value: stats.totalRescues,
      icon: Heart,
      color: 'from-pink-400 to-rose-600',
      bgColor: 'bg-pink-500/20',
    },
    {
      label: 'Active Users',
      value: stats.activeUsers,
      icon: TrendingUp,
      color: 'from-purple-400 to-indigo-600',
      bgColor: 'bg-purple-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {impactItems.map((item, index) => {
        const { icon: Icon } = item;
        return (
          <div
            key={index}
            className="glass-card-dark p-6 group hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${item.bgColor}`}>
                <Icon className="w-6 h-6 text-primary-400" />
              </div>
              {isLoading && <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />}
            </div>
            <h3 className="text-dark-300 text-sm font-medium mb-2">{item.label}</h3>
            <p className={`text-3xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
              {isLoading ? '...' : item.value.toLocaleString()}
            </p>
          </div>
        );
      })}
    </div>
  );
};
