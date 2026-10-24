import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  variant?: 'light' | 'dark';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      hasError = false,
      leftIcon,
      rightElement,
      variant = 'light',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const isDark = variant === 'dark';

    const colorStyles = isDark
      ? hasError
        ? 'bg-[#0A101D]/90 text-white border-rose-500/80 focus-visible:ring-rose-500/30 focus-visible:border-rose-400 placeholder:text-slate-500'
        : 'bg-[#0C1527]/80 text-white border-[#1F2F49] hover:border-[#2C4164] focus-visible:border-indigo-400 focus-visible:ring-indigo-500/30 placeholder:text-slate-400'
      : hasError
      ? 'bg-[#FFFFFF] text-[#0F1B2D] border-[#B42318] focus-visible:ring-[#B42318] placeholder:text-[#9CA3AF]'
      : 'bg-[#FFFFFF] text-[#0F1B2D] border-[#D6DCE5] focus-visible:ring-[#3B5BDB] placeholder:text-[#9CA3AF]';

    return (
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div
            className={`absolute left-3.5 flex items-center pointer-events-none ${
              isDark ? 'text-slate-400' : 'text-[#4B5563]'
            }`}
            aria-hidden="true"
          >
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          className={`w-full min-h-[44px] h-11 text-[15px] border rounded-xl transition-all duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 ${
            leftIcon ? 'pl-10' : 'pl-3.5'
          } ${rightElement ? 'pr-11' : 'pr-3.5'} ${colorStyles} ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-2 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
