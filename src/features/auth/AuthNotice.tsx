import React from 'react';
import { Info } from 'lucide-react';

export const AUTH_NOTICE_TEXT =
  'Demo only. Fictional data. Mock sign-in, not production security.';

export interface AuthNoticeProps {
  isDark?: boolean;
  className?: string;
}

export const AuthNotice: React.FC<AuthNoticeProps> = ({
  isDark = false,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center gap-2 p-2.5 rounded-lg text-xs leading-relaxed ${
        isDark
          ? 'bg-[#070E1A] border border-[#19273D] text-slate-300'
          : 'bg-[#F5F7FA] border border-[#D6DCE5] text-[#4B5563]'
      } ${className}`}
    >
      <Info
        className={`w-3.5 h-3.5 shrink-0 ${
          isDark ? 'text-indigo-400' : 'text-[#4B5563]'
        }`}
        aria-hidden="true"
      />
      <span>{AUTH_NOTICE_TEXT}</span>
    </div>
  );
};
