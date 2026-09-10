import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'blue' | 'gold' | 'emerald' | 'chrome' | 'ghana';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  icon,
  className,
}) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    gold: 'bg-amber-50 text-amber-800 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    chrome: 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-900 border-white shadow-sm',
    ghana: 'bg-slate-900 text-amber-300 border-amber-400/40 shadow-sm',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium rounded-full border transition-all select-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {icon && <span className="inline-flex">{icon}</span>}
      {children}
    </span>
  );
};
