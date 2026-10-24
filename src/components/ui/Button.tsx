import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'indigo' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const sizeStyles = {
      sm: 'h-9 px-3 text-xs min-h-[36px]',
      md: 'h-11 px-4 text-[15px] min-h-[44px]',
      lg: 'h-12 px-5 text-base min-h-[48px]',
    }[size];

    const variantStyles = {
      primary:
        'bg-[#0F1B2D] text-white hover:bg-[#1a2b45] active:bg-[#09121f]',
      secondary:
        'bg-[#F5F7FA] text-[#0F1B2D] border border-[#D6DCE5] hover:bg-[#EBEFF5]',
      outline:
        'bg-transparent text-white border border-[#1F2F49] hover:bg-white/5 hover:border-slate-500',
      ghost:
        'bg-transparent text-slate-400 hover:text-white hover:bg-white/5',
      indigo:
        'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-950/50 active:bg-indigo-700',
      gradient:
        'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-950/50 border border-indigo-400/25 active:brightness-95',
    }[variant];

    const widthStyles = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${widthStyles} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="w-4 h-4 animate-spin motion-reduce:animate-none text-current"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Signing in…</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
