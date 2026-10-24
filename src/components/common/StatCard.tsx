import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  icon?: LucideIcon;
  badgeText?: string;
  onClick?: () => void;
  accentColor?: 'slate' | 'indigo' | 'emerald' | 'amber' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  trend,
  icon: Icon,
  badgeText,
  onClick,
  accentColor = 'slate',
}) => {
  const getIconWrapperColor = () => {
    switch (accentColor) {
      case 'indigo':
        return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case 'emerald':
        return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'amber':
        return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'rose':
        return 'text-rose-600 bg-rose-50 border-rose-100';
      default:
        return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200/90 rounded-xl p-5 transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-xs' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className={`p-2 rounded-lg border ${getIconWrapperColor()}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{value}</span>
        {subValue && <span className="text-xs text-slate-500 tabular-nums">{subValue}</span>}
      </div>

      {(trend || badgeText) && (
        <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
          {trend && (
            <span
              className={`font-medium tabular-nums ${
                trend.isNeutral
                  ? 'text-slate-600'
                  : trend.isPositive
                  ? 'text-emerald-600'
                  : 'text-rose-600'
              }`}
            >
              {trend.value}
            </span>
          )}
          {badgeText && <span>· {badgeText}</span>}
        </div>
      )}
    </div>
  );
};
