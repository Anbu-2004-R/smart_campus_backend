import React from 'react';

export interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  isDark?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Field: React.FC<FieldProps> = ({
  label,
  htmlFor,
  error,
  hint,
  isDark = true,
  children,
  className = '',
}) => {
  const errorId = `${htmlFor}-error`;
  const hintId = `${htmlFor}-hint`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={htmlFor}
          className={`block text-[13px] font-medium tracking-wide ${
            isDark ? 'text-slate-200' : 'text-[#0F1B2D]'
          }`}
        >
          {label}
        </label>
        {hint && (
          <span
            id={hintId}
            className={`text-[12px] ${
              isDark ? 'text-slate-400' : 'text-[#4B5563]'
            }`}
          >
            {hint}
          </span>
        )}
      </div>

      <div>{children}</div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-[12px] text-rose-400 flex items-center gap-1 font-normal pt-0.5"
        >
          {error}
        </p>
      )}
    </div>
  );
};
