import React from 'react';
import { twMerge } from 'tailwind-merge';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type AvatarVariant = 'circular' | 'rounded' | 'square';

interface AvatarProps {
  /**
   * The name to use for the initials fallback
   */
  name?: string;
  /**
   * The image URL to display
   */
  src?: string;
  /**
   * Alt text for the avatar image
   */
  alt?: string;
  /**
   * Size of the avatar
   */
  size?: AvatarSize;
  /**
   * Shape variant of the avatar
   */
  variant?: AvatarVariant;
  /**
   * Optional badge to display
   */
  badge?: React.ReactNode;
  /**
   * Background color when using initials
   */
  bgColor?: string;
  /**
   * Text color when using initials
   */
  textColor?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Avatar component for user or entity representation
 */
const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  alt = 'Avatar',
  size = 'md',
  variant = 'circular',
  badge,
  bgColor = 'bg-primary-100',
  textColor = 'text-primary-600',
  className = '',
}) => {
  // Size mappings
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  // Variant mappings
  const variantClasses = {
    circular: 'rounded-full',
    rounded: 'rounded-lg',
    square: 'rounded-none',
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Badge position based on size
  const badgePositionClasses = {
    xs: '-top-1 -right-1',
    sm: '-top-1 -right-1',
    md: '-top-1 -right-1',
    lg: '-top-2 -right-0',
    xl: '-top-2 -right-0',
  };

  return (
    <div className="relative inline-block">
      {src ? (
        <img
          src={src}
          alt={alt}
          className={twMerge(
            sizeClasses[size],
            variantClasses[variant],
            'object-cover',
            className
          )}
        />
      ) : (
        <div
          className={twMerge(
            sizeClasses[size],
            variantClasses[variant],
            bgColor,
            textColor,
            'flex items-center justify-center font-medium',
            className
          )}
          role="img"
          aria-label={name || 'Avatar'}
        >
          {name ? getInitials(name) : 'U'}
        </div>
      )}
      
      {badge && (
        <div className={`absolute ${badgePositionClasses[size]} z-10`}>
          {badge}
        </div>
      )}
    </div>
  );
};

export default Avatar;