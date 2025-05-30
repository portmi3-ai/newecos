import React from 'react';
import { twMerge } from 'tailwind-merge';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  /**
   * Badge content
   */
  children: React.ReactNode;
  /**
   * Style variant
   */
  variant?: BadgeVariant;
  /**
   * Size of the badge
   */
  size?: BadgeSize;
  /**
   * Whether the badge is rounded pill style
   */
  pill?: boolean;
  /**
   * Whether to show dot indicator
   */
  withDot?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Badge component for showing status or counts
 */
const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  pill = false,
  withDot = false,
  className = '',
}) => {
  // Variant mappings
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-amber-100 text-amber-800',
    info: 'bg-blue-100 text-blue-800',
    neutral: 'bg-gray-100 text-gray-800',
  };

  // Size mappings
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  };

  // Dot color mappings
  const dotColorClasses = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    success: 'bg-green-500',
    danger: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
    neutral: 'bg-gray-500',
  };

  return (
    <span
      className={twMerge(
        'inline-flex items-center font-medium',
        variantClasses[variant],
        sizeClasses[size],
        pill ? 'rounded-full' : 'rounded',
        className
      )}
    >
      {withDot && (
        <span
          className={twMerge(
            'mr-1.5 inline-block h-2 w-2 rounded-full',
            dotColorClasses[variant]
          )}
        ></span>
      )}
      {children}
    </span>
  );
};

export default Badge;