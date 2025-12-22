import React from 'react';
import { getAvatarUrl, getInitials, getGradientColors } from '../src/utils/avatarGenerator';

interface AvatarProps {
  firstName?: string;
  lastName?: string;
  photoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  useRandomAvatar?: boolean;
  onClick?: (e?: React.MouseEvent) => void;
}

const Avatar: React.FC<AvatarProps> = ({
  firstName = '',
  lastName = '',
  photoUrl,
  size = 'md',
  className = '',
  useRandomAvatar = true,
  onClick,
}) => {
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = getInitials(firstName, lastName);
  const avatarUrl = useRandomAvatar ? getAvatarUrl(fullName, photoUrl) : null;
  const gradient = getGradientColors(fullName);

  const sizeClasses = {
    sm: 'h-10 w-10 text-sm',
    md: 'h-12 w-12 text-base',
    lg: 'h-16 w-16 text-xl',
    xl: 'h-32 w-32 text-4xl',
  };

  const sizeClass = sizeClasses[size];

  // If we have a photo or should use random avatar
  if (avatarUrl && (photoUrl || useRandomAvatar)) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden flex-shrink-0 ${className}`} onClick={onClick}>
        <img
          src={avatarUrl}
          alt={fullName || 'User avatar'}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to gradient with initials if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            if (target.nextSibling) {
              (target.nextSibling as HTMLElement).style.display = 'flex';
            }
          }}
          onClick={onClick}
        />
        <div
          className={`w-full h-full bg-gradient-to-br from-${gradient.from} to-${gradient.to} flex items-center justify-center text-white font-bold hidden`}
        >
          {initials}
        </div>
      </div>
    );
  }

  // Fallback to gradient with initials
  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-${gradient.from} to-${gradient.to} flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}
      onClick={onClick}
    >
      {initials}
    </div>
  );
};

export default Avatar;
