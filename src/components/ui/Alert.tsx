import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export interface AlertProps {
  variant?: 'error' | 'success' | 'info';
  isDark?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'error',
  isDark = true,
  children,
  className = '',
}) => {
  const styles = isDark
    ? {
        error: 'bg-rose-950/60 border-rose-800/60 text-rose-200 shadow-sm',
        success: 'bg-emerald-950/60 border-emerald-800/60 text-emerald-200 shadow-sm',
        info: 'bg-indigo-950/60 border-indigo-800/60 text-indigo-200 shadow-sm',
      }[variant]
    : {
        error: 'bg-[#FEF3F2] border-[#FECDCA] text-[#B42318]',
        success: 'bg-[#ECFDF3] border-[#ABEFC6] text-[#067647]',
        info: 'bg-[#F5F8FF] border-[#D1E0FF] text-[#3538CD]',
      }[variant];

  const Icon = {
    error: AlertCircle,
    success: CheckCircle2,
    info: Info,
  }[variant];

  return (
    <div
      role="alert"
      className={`p-3.5 border rounded-xl text-[13px] flex items-start gap-2.5 backdrop-blur-xs ${styles} ${className}`}
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 leading-relaxed">{children}</div>
    </div>
  );
};
