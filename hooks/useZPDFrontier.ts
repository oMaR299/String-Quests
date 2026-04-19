/**
 * Hook: useZPDFrontier
 *
 * Computes the Zone of Proximal Development frontier -
 * the set of KCs the student is ready to learn next.
 */

import { useMemo } from 'react';
import { useSkillModel } from '../contexts/SkillModelContext';
import { getZPDFrontier } from '../data/prerequisiteGraph';
import { KC_MAP } from '../data/sampleTextbook';
import type { BloomLevel } from '../data/skillTaxonomy';

export interface ZPDItem {
  kcId: string;
  nameEn: string;
  nameAr: string;
  domain: string;
  bloomLevel: BloomLevel;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export function useZPDFrontier(masteryThreshold = 0.85): ZPDItem[] {
  const { model } = useSkillModel();

  return useMemo(() => {
    const now = new Date();
    const frontierIds = getZPDFrontier(model.kcs, now, masteryThreshold);

    return frontierIds
      .map(kcId => {
        const kc = KC_MAP[kcId];
        if (!kc) return null;
        return {
          kcId,
          nameEn: kc.nameEn,
          nameAr: kc.nameAr,
          domain: kc.tags[0] ?? 'general',
          bloomLevel: kc.bloomLevel,
          difficulty: kc.difficulty,
        };
      })
      .filter((item): item is ZPDItem => item !== null)
      .slice(0, 20); // Limit to 20 recommendations
  }, [model.kcs, masteryThreshold]);
}
