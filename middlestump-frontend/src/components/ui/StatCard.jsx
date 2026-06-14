import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function StatCard({ title, value, subtitle, trend, color = 'green' }) {
  const isUp = trend === 'up';
  const isDown = trend === 'down';
  const isFlat = trend === 'flat';

  const colorClasses = {
    green: 'text-primary',
    amber: 'text-amber',
    red: 'text-danger',
    blue: 'text-info',
  };

  return (
    <div className="bg-surface border border-border/70 rounded-xl p-5 flex flex-col shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="text-muted text-xs uppercase font-semibold mb-2">{title}</div>
      <div className={cn("font-serif text-[28px] font-bold leading-none mb-2", colorClasses[color] || 'text-primary')}>
        {value}
      </div>
      <div className="flex items-center text-sm text-text-secondary mt-auto">
        {trend && (
          <span className={cn(
            "flex items-center mr-2 font-medium",
            isUp ? "text-primary" : isDown ? "text-danger" : "text-text-muted"
          )}>
            {isUp && <TrendingUp className="w-4 h-4 mr-1" />}
            {isDown && <TrendingDown className="w-4 h-4 mr-1" />}
            {isFlat && <Minus className="w-4 h-4 mr-1" />}
          </span>
        )}
        {subtitle && <span>{subtitle}</span>}
      </div>
    </div>
  );
}
