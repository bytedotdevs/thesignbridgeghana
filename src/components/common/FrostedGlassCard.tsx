import React from 'react';
import clsx from 'clsx';

interface FrostedGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  className?: string;
  glow?: 'none' | 'blue' | 'gold' | 'green';
}

export const FrostedGlassCard: React.FC<FrostedGlassCardProps> = ({
  children,
  interactive = false,
  className,
  glow = 'none',
  ...props
}) => {
  return (
    <div
      className={clsx(
        interactive ? 'glass-card-interactive' : 'frosted-glass-panel',
        'relative',
        className
      )}
      style={{
        padding: '24px',
        backgroundColor: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(220, 230, 245, 0.65)',
        borderRadius: '20px',
        boxShadow: '0 8px 30px rgba(15, 23, 42, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
      }}
      {...props}
    >
      {glow === 'gold' && <div className="studio-glow-gold -top-20 -right-20" />}
      {glow === 'blue' && <div className="studio-glow-blue -top-20 -left-20" />}
      {glow === 'green' && <div className="studio-glow-green -bottom-20 -right-20" />}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
