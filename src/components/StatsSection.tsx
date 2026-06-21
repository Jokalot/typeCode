'use client';

import { TrendingUp, Target, Zap, Award } from 'lucide-react';
import { useSession } from '@/hooks/useSession';

export function StatsSection() {
  const { stats } = useSession();

  const items = [
    {
      icon: TrendingUp,
      label: 'Mejor WPM',
      value: stats.bestWpm > 0 ? `${stats.bestWpm}` : '—',
      color: 'text-[var(--chart-1)]',
      bg: 'bg-[var(--chart-1)]/10',
    },
    {
      icon: Target,
      label: 'Precisión promedio',
      value: stats.avgAccuracy > 0 ? `${stats.avgAccuracy}%` : '—',
      color: 'text-[var(--chart-4)]',
      bg: 'bg-[var(--chart-4)]/10',
    },
    {
      icon: Zap,
      label: 'Racha actual',
      value: stats.currentStreak > 0 ? `${stats.currentStreak} día${stats.currentStreak > 1 ? 's' : ''}` : '—',
      color: 'text-[var(--chart-5)]',
      bg: 'bg-[var(--chart-5)]/10',
    },
    {
      icon: Award,
      label: 'Sesiones totales',
      value: stats.totalSessions > 0 ? `${stats.totalSessions}` : '—',
      color: 'text-[var(--chart-2)]',
      bg: 'bg-[var(--chart-2)]/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {items.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-medium text-foreground">{stat.value}</p>
            </div>
            <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}