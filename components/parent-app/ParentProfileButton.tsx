// ParentProfileButton.tsx
// ─────────────────────────────────────────────────────────────────────────────
// 40px circular avatar on the START side of the new flat Parent Header. When
// the parent is on the premium ("Supernova") plan we wrap the avatar in
// Google One's signature multi-color conic-gradient ring (`Google One`-style
// premium affordance). Tap → routes to /parent/profile.
//
// v1 demo: `isPremium` is hardcoded to `true`. Flip the constant locally to
// preview the non-premium state (plain avatar with a subtle slate ring).
// TODO: wire to the real parent profile once it exists.

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../contexts/I18nContext';
import { getParentAppString } from './parentAppI18n';

interface ParentProfileButtonProps {
  /** Parent's display initial (e.g. "أ" / "A"). */
  initial: string;
  /** Optional real photo URL. When provided, replaces the letter avatar. */
  photoUrl?: string | null;
  /** Drives the conic-gradient Google One ring. Hardcoded true for the v1 demo. */
  isPremium?: boolean;
}

// Google One's conic-gradient sweep: blue → red → yellow → green → blue.
// Encoded inline since conic-gradient isn't a Tailwind utility.
const GOOGLE_ONE_RING_STYLE: React.CSSProperties = {
  background:
    'conic-gradient(from 0deg, #4285F4, #EA4335, #FBBC04, #34A853, #4285F4)',
};

export const ParentProfileButton: React.FC<ParentProfileButtonProps> = ({
  initial,
  photoUrl,
  isPremium = true,
}) => {
  const navigate = useNavigate();
  const { locale } = useI18n();

  const ariaLabel = getParentAppString(locale, 'parentApp.header.parentProfileAria');
  const titleLabel = getParentAppString(locale, 'parentApp.header.parentProfile');

  const handleClick = useCallback(() => {
    navigate('/parent/profile');
  }, [navigate]);

  // Inner avatar — either the letter-on-blue plate or a real photo. Always
  // 40px; sits inside the optional Google One ring with a 1.5px white inset.
  const innerAvatar = photoUrl ? (
    <img
      src={photoUrl}
      alt=""
      className="w-10 h-10 rounded-full object-cover"
      loading="eager"
      decoding="async"
    />
  ) : (
    <span className="w-10 h-10 rounded-full inline-flex items-center justify-center bg-duo-blue text-white text-base font-bold">
      {initial}
    </span>
  );

  if (isPremium) {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={ariaLabel}
        title={titleLabel}
        className="shrink-0 relative w-11 h-11 rounded-full p-[2px] motion-safe:active:scale-95 transition-transform duration-100 outline-none focus-visible:ring-2 focus-visible:ring-duo-blue/40"
        style={GOOGLE_ONE_RING_STYLE}
      >
        {/* Inner 1.5px white inset that produces the signature gap between
            the colored ring and the avatar itself. */}
        <span className="block bg-white rounded-full p-[1.5px]">
          {innerAvatar}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      title={titleLabel}
      className="shrink-0 w-10 h-10 rounded-full ring-1 ring-slate-200 motion-safe:active:scale-95 transition-transform duration-100 outline-none focus-visible:ring-2 focus-visible:ring-duo-blue/40"
    >
      {innerAvatar}
    </button>
  );
};

export default ParentProfileButton;
