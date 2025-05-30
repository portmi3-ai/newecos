import React from 'react';
import { twMerge } from 'tailwind-merge';

interface SkeletonProps {
  /**
   * The type of skeleton to render
   */
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  /**
   * Width of the skeleton
   */
  width?: string | number;
  /**
   * Height of the skeleton
   */
  height?: string | number;
  /**
   * Whether the skeleton is animated
   */
  animated?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Skeleton component for showing loading state
 */
const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  animated = true,
  className = '',
}) => {
  // Convert numeric dimensions to pixel values
  const widthStyle = typeof width === 'number' ? `${width}px` : width;
  const heightStyle = typeof height === 'number' ? `${height}px` : height;
  
  // Base skeleton classes
  const baseClasses = twMerge(
    'bg-gray-200',
    animated && 'animate-pulse',
    className
  );
  
  // Variant-specific styles
  let variantClasses = '';
  let defaultHeight = '';
  
  switch (variant) {
    case 'text':
      variantClasses = 'rounded';
      defaultHeight = height || '1rem';
      break;
    case 'circular':
      variantClasses = 'rounded-full';
      defaultHeight = height || widthStyle || '2.5rem';
      break;
    case 'rectangular':
      variantClasses = 'rounded-md';
      defaultHeight = height || '100px';
      break;
    case 'card':
      variantClasses = 'rounded-lg';
      defaultHeight = height || '150px';
      break;
    default:
      variantClasses = 'rounded';
      defaultHeight = height || '1rem';
  }
  
  return (
    <div
      className={twMerge(baseClasses, variantClasses)}
      style={{
        width: widthStyle || '100%',
        height: heightStyle || defaultHeight,
      }}
      aria-hidden="true"
    />
  );
};

/**
 * Text skeleton component for showing loading text content
 */
export const TextSkeleton: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={twMerge('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          variant="text" 
          width={i === lines - 1 && lines > 1 ? '75%' : '100%'} 
        />
      ))}
    </div>
  );
};

/**
 * Card skeleton component for showing loading card content
 */
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={twMerge('space-y-3', className)}>
      <Skeleton variant="rectangular" height={150} />
      <Skeleton variant="text" height={24} />
      <Skeleton variant="text" height={16} />
      <Skeleton variant="text" height={16} width="60%" />
    </div>
  );
};

export default Skeleton;