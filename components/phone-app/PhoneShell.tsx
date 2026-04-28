// PhoneShell — centered "phone frame" container for the onboarding flow.
//
// Visual recipe:
//   - On desktop, the device floats inside a deep slate page so the phone
//     reads as a real device. On mobile it's full-bleed.
//   - The phone interior background is set per-screen via a CSS variable
//     `--phone-bg` (a Tailwind color literal applied as inline style on the
//     wrapper). The OnboardingFlow swaps this var as the user navigates.
//   - NO gradient blobs, NO drift, NO blur. Single solid pastel — the empty
//     space IS the design.

import React from 'react';

interface PhoneShellProps {
  /** Background color of the phone interior — pass a Tailwind utility class
   *  like `bg-phone-mint-50`. Defaults to mint. */
  bgClass?: string;
  children: React.ReactNode;
}

export const PhoneShell: React.FC<PhoneShellProps> = ({
  bgClass = 'bg-phone-mint-50',
  children,
}) => {
  return (
    <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center md:p-6">
      {/* Device frame — only visible on desktop, where the phone "floats" */}
      <div className="relative w-full md:max-w-[430px] md:rounded-[2.5rem] md:shadow-2xl md:shadow-black/50 md:overflow-hidden md:ring-1 md:ring-white/5">
        {/* Phone interior — solid pastel, no decoration */}
        <div className={`relative min-h-screen md:min-h-[844px] md:max-h-[900px] overflow-hidden transition-colors duration-300 ${bgClass}`}>
          <div className="relative z-10 min-h-screen md:min-h-[844px] flex flex-col">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneShell;
