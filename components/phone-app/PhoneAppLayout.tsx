// PhoneAppLayout — route entry for /phone-app/*.
// Mounts the OnboardingFlow which now owns the PhoneShell + per-screen bg tone.

import React from 'react';
import { OnboardingFlow } from './OnboardingFlow';

interface PhoneAppLayoutProps {
  /** Optional exit handler for parity with other module layouts. */
  onExit?: () => void;
}

export const PhoneAppLayout: React.FC<PhoneAppLayoutProps> = () => {
  return (
    <div className="font-cairo">
      <OnboardingFlow />
    </div>
  );
};

export default PhoneAppLayout;
