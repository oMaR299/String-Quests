// ParentSkillMapScreen.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Orchestrator for the Parent Skill Map tab (/parent/skill-map). Reads the
// ACTIVE child from app context (no in-screen child selector — the header pill
// owns that) and composes the 4 design layers top→bottom:
//
//   Layer 0  GardenHero          — glance, the signature visual
//   Layer 1  TodaysFocusSection  — 1-3 coaching cards (the action spine)
//   Layer 2  FullPictureSection  — Shining / Needs a hand
//   Layer 3  DeepMapSection      — subject mastery bars (calm reference)
//
// Tapping a plant in the hero opens that subject's full textbook TREE in a
// full-screen sheet (units=branches, lessons=twigs, pages=leaves). Runtime
// state (areas, today's focus, sent/cooldown) lives in useParentSkillMap.

import React, { useCallback, useState } from 'react';
import { useI18n } from '../../../contexts/I18nContext';
import { useParentAppContext } from '../useParentAppContext';
import { useParentSkillMap } from './useParentSkillMap';
import { GardenHero } from './GardenHero';
import { TodaysFocusSection } from './TodaysFocusSection';
import { FullPictureSection } from './FullPictureSection';
import { DeepMapSection } from './DeepMapSection';
import { SubjectTreeSheet } from './tree/SubjectTreeSheet';

export const ParentSkillMapScreen: React.FC = () => {
  const { locale } = useI18n();
  const { activeChild } = useParentAppContext();

  // Hook is called unconditionally (rules of hooks); empty id falls back to a
  // safe generated set, but we render nothing without an active child anyway.
  const { areas, today, sentAreaIds, sendPractice } = useParentSkillMap(
    activeChild?.id ?? '',
  );

  // Which subject's tree sheet is open (null = closed). Set by tapping a plant.
  const [openSubject, setOpenSubject] = useState<string | null>(null);
  const handlePlantTap = useCallback((subjectKey: string) => {
    setOpenSubject(subjectKey);
  }, []);

  if (!activeChild) return null;
  const childName = locale === 'ar' ? activeChild.nameAr : activeChild.nameEn;

  return (
    <>
      <div className="space-y-5 px-5 pt-5 pb-8">
        <GardenHero areas={areas} childName={childName} onPlantTap={handlePlantTap} />

        <TodaysFocusSection
          focus={today.focus}
          shining={today.shining}
          childName={childName}
          sentAreaIds={sentAreaIds}
          onSendPractice={sendPractice}
        />

        <FullPictureSection
          areas={areas}
          childName={childName}
          sentAreaIds={sentAreaIds}
          onSendPractice={sendPractice}
        />

        <DeepMapSection areas={areas} />
      </div>

      {/* Tap a garden plant → the subject's full textbook tree. */}
      <SubjectTreeSheet
        open={openSubject !== null}
        onClose={() => setOpenSubject(null)}
        childId={activeChild.id}
        childName={childName}
        subjectKey={openSubject}
      />
    </>
  );
};

export default ParentSkillMapScreen;
