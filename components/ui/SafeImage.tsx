// src/components/ui/SafeImage.tsx
'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import { User } from 'react-feather';

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  showDefaultAvatar?: boolean;
  fallbackIcon?: React.ReactNode;
}

/**
 * Safe Image component that handles external image loading errors
 * Automatically falls back to a default image or avatar icon
 */
export default function SafeImage({ 
  src, 
  alt, 
  fallbackSrc = '/images/default-avatar.png',
  showDefaultAvatar = true,
  fallbackIcon,
  className = '',
  ...props 
}: SafeImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      if (fallbackSrc && fallbackSrc !== imageSrc) {
        setImageSrc(fallbackSrc);
      }
    }
  };

  // If all images failed and we should show default avatar
  if (hasError && showDefaultAvatar && (!fallbackSrc || imageSrc === fallbackSrc)) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 text-gray-500 ${className}`}
        style={{ 
          width: props.width || 40, 
          height: props.height || 40,
          borderRadius: className.includes('rounded-full') ? '50%' : 
                       className.includes('rounded') ? '8px' : '0'
        }}
      >
        {fallbackIcon || <User size={20} />}
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={imageSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}

// Specific avatar component for user profiles
interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
  fallbackInitials?: string;
}

export function UserAvatar({ 
  src, 
  alt = 'User avatar', 
  size = 40, 
  className = '',
  fallbackInitials 
}: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);

  // If no src or error occurred, show initials or default avatar
  if (!src || hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold rounded-full ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {fallbackInitials ? fallbackInitials.slice(0, 2).toUpperCase() : <User size={size * 0.6} />}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full object-cover border-0 ${className}`}  // Added border-0
      onError={() => setHasError(true)}
      style={{ 
        width: size, 
        height: size,
        minWidth: size,    // Prevent shrinking
        minHeight: size    // Prevent shrinking
      }}
    />
  );
}