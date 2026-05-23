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
// Tapping a plant in the hero smooth-scrolls to that subject's row in the deep
// map. Runtime state (areas, today's focus, sent/cooldown) lives in
// useParentSkillMap.

import React, { useCallback } from 'react';
import { useI18n } from '../../../contexts/I18nContext';
import { useParentAppContext } from '../useParentAppContext';
import { useParentSkillMap } from './useParentSkillMap';
import { GardenHero } from './GardenHero';
import { TodaysFocusSection } from './TodaysFocusSection';
import { FullPictureSection } from './FullPictureSection';
import { DeepMapSection } from './DeepMapSection';

export const ParentSkillMapScreen: React.FC = () => {
  const { locale } = useI18n();
  const { activeChild } = useParentAppContext();

  // Hook is called unconditionally (rules of hooks); empty id falls back to a
  // safe generated set, but we render nothing without an active child anyway.
  const { areas, today, sentAreaIds, sendPractice } = useParentSkillMap(
    activeChild?.id ?? '',
  );

  const handlePlantTap = useCallback((subjectKey: string) => {
    const el = document.getElementById(`skillmap-subject-${subjectKey}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  if (!activeChild) return null;
  const childName = locale === 'ar' ? activeChild.nameAr : activeChild.nameEn;

  return (
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
  );
};

export default ParentSkillMapScreen;
