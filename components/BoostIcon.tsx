import React from 'react';

export const BoostIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        <linearGradient id="boostGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A855F7" /> {/* Purple 500 */}
          <stop offset="100%" stopColor="#6366F1" /> {/* Indigo 500 */}
        </linearGradient>
        <linearGradient id="boostStripes" x1="0%" y1="0%" x2="100%" y2="0%">
           <stop offset="0%" stopColor="#C084FC" />
           <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
      </defs>
      
      {/* Main Body Shape - Stylized 'D' or Wing */}
      <path 
        d="M30 20 H70 C85 20, 95 35, 90 60 C85 85, 65 90, 50 90 H35 L25 20 Z" 
        fill="url(#boostGradient)" 
        stroke="white" 
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Speed Stripes on the Left */}
      <path d="M20 30 H40 L35 40 H15 Z" fill="url(#boostStripes)" opacity="0.9" />
      <path d="M15 45 H35 L30 55 H10 Z" fill="url(#boostStripes)" opacity="0.9" />
      <path d="M20 60 H40 L35 70 H15 Z" fill="url(#boostStripes)" opacity="0.9" />

      {/* Central Circle/Eye */}
      <circle cx="60" cy="55" r="12" fill="#312E81" /> {/* Dark Indigo */}
      <circle cx="60" cy="55" r="7" fill="url(#boostStripes)" />
    </svg>
  );
};