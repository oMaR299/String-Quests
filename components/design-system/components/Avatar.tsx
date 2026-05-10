/**
 * sq-Avatar — character / emoji / photo / initials variants.
 *
 * Variants:
 *   - emoji   : a single emoji on a colored gradient tile
 *   - initials: 1-2 characters on a gradient tile
 *   - photo   : <img>
 *   - icon    : a lucide icon on a gradient tile
 */

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { SQ_TONES, type SqTone } from '../tokens/colors';

export type SqAvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface SqAvatarBaseProps {
  size?: SqAvatarSize;
  tone?: SqTone;
  className?: string;
  /** Adds a thin white ring (useful in stacks). */
  ringed?: boolean;
}

interface SqAvatarEmoji extends SqAvatarBaseProps {
  variant: 'emoji';
  emoji: string;
}
interface SqAvatarInitials extends SqAvatarBaseProps {
  variant: 'initials';
  initials: string;
}
interface SqAvatarPhoto extends SqAvatarBaseProps {
  variant: 'photo';
  src: string;
  alt: string;
}
interface SqAvatarIcon extends SqAvatarBaseProps {
  variant: 'icon';
  icon: LucideIcon;
}

export type SqAvatarProps = SqAvatarEmoji | SqAvatarInitials | SqAvatarPhoto | SqAvatarIcon;

const SIZE_PX: Record<SqAvatarSize, string> = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-2xl',
};

export const SqAvatar: React.FC<SqAvatarProps> = (props) => {
  const size = props.size ?? 'md';
  const tone = props.tone ?? 'brand';
  const className = props.className ?? '';
  const t = SQ_TONES[tone];
  const ring = props.ringed ? 'ring-2 ring-white' : '';
  const baseTile = `${SIZE_PX[size]} rounded-2xl flex items-center justify-center font-cairo font-black text-white shrink-0 ${t.gradient} ${ring} ${className}`;

  if (props.variant === 'photo') {
    return (
      <img
        src={props.src}
        alt={props.alt}
        className={`${SIZE_PX[size]} rounded-2xl object-cover shrink-0 ${ring} ${className}`}
      />
    );
  }
  if (props.variant === 'emoji') {
    return <div className={baseTile}>{props.emoji}</div>;
  }
  if (props.variant === 'initials') {
    return <div className={baseTile}>{props.initials.slice(0, 2).toUpperCase()}</div>;
  }
  // icon
  const Icon = props.icon;
  const iconSize =
    size === 'xl' ? 'w-7 h-7' : size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className={baseTile}>
      <Icon className={iconSize} />
    </div>
  );
};

export default SqAvatar;
