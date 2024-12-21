import React from 'react';
import { colors } from '../../../core/theme/colors';
import { cn } from '../../../utils/cn';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  fullWidth = false,
  className,
  ...props 
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 ease-in-out';
  
  const variants = {
    primary: `bg-[${colors.primary.default}] text-white hover:bg-[${colors.primary.dark}]`,
    secondary: `bg-[${colors.neutral[200]}] text-[${colors.neutral[800]}] hover:bg-[${colors.neutral[300]}]`,
    danger: `bg-[${colors.danger.default}] text-white hover:bg-[${colors.danger.dark}]`,
    ghost: `bg-transparent text-[${colors.primary.default}] hover:bg-[${colors.neutral[100]}]`,
  };

  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
