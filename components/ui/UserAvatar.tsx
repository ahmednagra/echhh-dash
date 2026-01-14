// src/components/ui/UserAvatar.tsx

'use client';

interface UserAvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: 'sm' | 'md';
  className?: string;
}

export default function UserAvatar({ 
  name, 
  imageUrl, 
  size = 'sm',
  className = '' 
}: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <img
        src={imageUrl || '/default-avatar.png'}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover flex-shrink-0`}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=32`;
        }}
      />
      <span className={`font-medium text-gray-900 truncate ${textSizeClasses[size]}`}>
        {name}
      </span>
    </div>
  );
}