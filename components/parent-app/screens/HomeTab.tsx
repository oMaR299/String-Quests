// HomeTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// v1.2 Home — trimmed card stack. Per design ask the cards below the action
// items (celebration, AI convo, deadline, announcement, message preview, and
// the freshness/privacy footer) were removed: parents found them noisy and
// the action items already capture everything that needs a response. The
// equivalent content still lives in the dedicated tabs (Aware AI for the
// convo starter, Messages for announcements + threads, etc.).
//
// Final order:
//   1. GreetingStrip        — time-of-day weather hero with parent salutation
//   2. HeroWinCard          — kid's "today's win" white-glass card
//   3. SchoolLogisticsStrip — 6-button grid (Assignments / Calendar / Bag /
//                             Exams / Forms / Attendance)
//   4. ActionItemsStack     — pending parent chores (sign / ack / RSVP)
//
// SupernovaTeaserCard remains gated to Day 30+ and is not mounted here.

import React from 'react';
import { GreetingStrip } from '../cards/GreetingStrip';
import { HeroWinCard } from '../cards/HeroWinCard';
import { SchoolLogisticsStrip } from '../cards/SchoolLogisticsStrip';
import { ActionItemsStack } from '../cards/ActionItemsStack';

export const HomeTab: React.FC = () => {
  return (
    <div className="space-y-4 px-5 pt-5 pb-6">
      {/* TODO: parentName comes from a real parent profile later — hardcoded
          for v1.x home redesign mockup. */}
      <GreetingStrip parentName="أحمد" />

      <HeroWinCard />

      <SchoolLogisticsStrip />

      <ActionItemsStack />
    </div>
  );
};

export default HomeTab;
