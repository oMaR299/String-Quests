// HomeTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// v1.3 Home — further trimmed stack. Per the latest design ask the kid
// "today's win" hero card and the pending action items stack were also
// removed: parents found them either noisy (Win felt repetitive day-over-day)
// or duplicative (Action items overlap with what each logistics drawer
// already surfaces inline — pending forms badge, attendance dot, etc.).
//
// Final order:
//   1. GreetingStrip        — time-of-day weather hero with parent salutation
//   2. SchoolLogisticsStrip — 6-button grid (Assignments / Calendar / Bag /
//                             Exams / Forms / Attendance)
//
// HeroWinCard, ActionItemsStack, SupernovaTeaserCard, and the older
// celebration / convo / deadline / announcement / preview / footer cards
// all live as code on disk but are not mounted here.

import React from 'react';
import { GreetingStrip } from '../cards/GreetingStrip';
import { SchoolLogisticsStrip } from '../cards/SchoolLogisticsStrip';
import { TodaysPickupCard } from '../cards/TodaysPickupCard';
import { ReportCardSection } from '../cards/ReportCardSection';
import { DailyStorySection } from '../cards/DailyStorySection';

export const HomeTab: React.FC = () => {
  return (
    <div className="space-y-4 px-5 pt-5 pb-6">
      {/* TODO: parentName comes from a real parent profile later — hardcoded
          for v1.x home redesign mockup. */}
      <GreetingStrip parentName="أحمد" />

      {/* Live pickup status — hides automatically on weekends + when no
          pickup data is seeded for today. Tap opens the full Pickup drawer. */}
      <TodaysPickupCard />

      <SchoolLogisticsStrip />

      {/* Daily Story — the child's whole day told as six self-contained
          pastel cards (school / home / well-being / academic / attendance /
          proud moment). Each card carries its own summary, score rings, a
          highlight, and a CTA. A "previous days" button reveals a week-day
          strip to flip back through past days. */}
      <DailyStorySection />

      {/* Term-end consolidated grades view + per-cell breakdown popovers + AI
          summaries + "Generate full report" CTA. Lower priority than the
          live pickup card and daily logistics, so it sits below them. */}
      <ReportCardSection />
    </div>
  );
};

export default HomeTab;
