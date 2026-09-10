import React from 'react';
import clsx from 'clsx';

interface LiquidChromeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'subtle' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  asLink?: boolean;
  href?: string;
}

export const LiquidChromeButton: React.FC<LiquidChromeButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className,
  asLink = false,
  href,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  const variantClasses = {
    primary: 'chrome-btn-primary',
    secondary: 'chrome-btn-secondary',
    subtle: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700',
  };

  const combinedClasses = clsx(
    variantClasses[variant],
    sizeClasses[size],
    'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 cursor-pointer select-none',
    className
  );

  if (asLink && href) {
    return (
      <a href={href} className={combinedClasses} role="button">
        {icon && <span className="inline-flex mr-2">{icon}</span>}
        {children}
      </a>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {icon && <span className="inline-flex mr-2">{icon}</span>}
      {children}
    </button>
  );
};
