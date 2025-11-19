import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
}

export default function Input({
  label,
  error,
  helperText,
  className,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-dark-text mb-2">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'text-dark-text placeholder:text-dark-muted',
          'transition-all duration-200',
          error && 'border-danger focus:ring-danger',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-danger">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-dark-muted">{helperText}</p>
      )}
    </div>
  );
}

