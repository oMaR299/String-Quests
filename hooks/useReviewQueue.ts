/**
 * Hook: useReviewQueue
 *
 * Returns KCs that are due for review today, sorted by urgency.
 */

import { useMemo } from 'react';
import { useSkillModel } from '../contexts/SkillModelContext';
import { getDailyReviewQueue } from '../models/fsrs';
import { classifyMastery } from '../models/masteryClassifier';
import { KC_MAP } from '../data/sampleTextbook';
import type { MasteryLevel } from '../models/types';

export interface ReviewQueueItem {
  kcId: string;
  nameEn: string;
  nameAr: string;
  masteryLevel: MasteryLevel;
  pLearned: number;
  daysSinceReview: number;
}

export function useReviewQueue(): ReviewQueueItem[] {
  const { model } = useSkillModel();

  return useMemo(() => {
    const now = new Date();
    const dueKCIds = getDailyReviewQueue(model.reviewQueue, now);

    return dueKCIds
      .map(kcId => {
        const kc = KC_MAP[kcId];
        const state = model.kcs[kcId];
        if (!state) return null;

        const lastPractice = new Date(state.lastPractice);
        const daysSince = Math.max(0, (now.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24));

        return {
          kcId,
          nameEn: kc?.nameEn ?? kcId,
          nameAr: kc?.nameAr ?? kcId,
          masteryLevel: classifyMastery(state, now),
          pLearned: state.pLearned,
          daysSinceReview: Math.round(daysSince),
        };
      })
      .filter((item): item is ReviewQueueItem => item !== null);
  }, [model.reviewQueue, model.kcs]);
}
