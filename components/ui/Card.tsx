import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated';
}

export default function Card({
  children,
  variant = 'default',
  className,
  ...props
}: CardProps) {
  const variants = {
    default: 'bg-dark-card border border-dark-border',
    glass: 'glass-effect',
    elevated: 'bg-dark-card border border-dark-border shadow-lg',
  };

  return (
    <div
      className={cn(
        'rounded-xl p-6',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}


