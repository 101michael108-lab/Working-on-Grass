'use client';

import type { User } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

function getInitials(user: User): string {
  const name = user.displayName?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  const email = user.email?.trim();
  if (email) return email[0].toUpperCase();
  return '?';
}

type UserAvatarProps = {
  user: User;
  className?: string;
  fallbackClassName?: string;
};

/** Avatar with instant initials fallback (no Radix loading delay). */
export function UserAvatar({ user, className, fallbackClassName }: UserAvatarProps) {
  const initials = getInitials(user);
  const alt = user.displayName || user.email || 'Account';

  return (
    <Avatar className={className}>
      {user.photoURL ? (
        <AvatarImage src={user.photoURL} alt={alt} referrerPolicy="no-referrer" />
      ) : null}
      <AvatarFallback
        delayMs={0}
        className={cn(
          'bg-primary text-primary-foreground text-xs font-semibold',
          fallbackClassName
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
