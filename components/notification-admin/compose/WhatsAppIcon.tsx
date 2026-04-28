/**
 * WhatsAppIcon — recognizable phone-bubble silhouette as inline SVG.
 *
 * Lucide doesn't ship an official WhatsApp glyph, and the project
 * forbids new dependencies (no react-icons). This is a hand-rolled
 * mark using the iconic chat-bubble + telephone handset shape so
 * the brand reads instantly without a logo trademark issue.
 *
 * Mirrors lucide's API surface — ({ className }) — so it slots
 * into the same channel-icon contract used by Mail/Bell/etc.
 */
import React from 'react';

interface WhatsAppIconProps {
  className?: string;
}

export const WhatsAppIcon: React.FC<WhatsAppIconProps> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Chat-bubble silhouette with notch */}
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      {/* Phone handset glyph */}
      <path d="M9 9c0 2.5 2 4.5 4.5 4.5l1-1.5c.3-.4.8-.5 1.2-.3l2 .8c.5.2.8.7.7 1.2-.3 1.5-1.6 2.6-3.2 2.6A6.5 6.5 0 0 1 8.7 9.8c0-1.6 1.1-2.9 2.6-3.2.5-.1 1 .2 1.2.7l.8 2c.2.4.1.9-.3 1.2L11.5 11" />
    </svg>
  );
};

export default WhatsAppIcon;
