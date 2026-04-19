/**
 * Hook: useMasteryColors
 *
 * Provides the colorblind-safe blue sequential color scale
 * for mastery visualization.
 */

import { useMemo, useCallback } from 'react';
import type { MasteryLevel } from '../models/types';
import { MASTERY_COLORS } from '../models/types';

/** Ordered mastery levels from lowest to highest */
export const MASTERY_LEVEL_ORDER: MasteryLevel[] = [
  'not-started',
  'struggling',
  'developing',
  'proficient',
  'mastered',
  'decaying',
];

/** Numeric value for sorting (decaying treated as between developing and proficient) */
export const MASTERY_SORT_VALUE: Record<MasteryLevel, number> = {
  'not-started': 0,
  'struggling': 1,
  'developing': 2,
  'decaying': 2.5,
  'proficient': 3,
  'mastered': 4,
};

export function useMasteryColors() {
  /** Get color hex for a mastery level */
  const getColor = useCallback((level: MasteryLevel): string => {
    return MASTERY_COLORS[level] ?? MASTERY_COLORS['not-started'];
  }, []);

  /**
   * Get color for a continuous score (0-100).
   * Interpolates between the discrete mastery colors.
   */
  const getScoreColor = useCallback((score: number): string => {
    if (score <= 0) return MASTERY_COLORS['not-started'];
    if (score < 30) return MASTERY_COLORS['struggling'];
    if (score < 55) return MASTERY_COLORS['developing'];
    if (score < 80) return MASTERY_COLORS['proficient'];
    return MASTERY_COLORS['mastered'];
  }, []);

  /** Get label for a mastery level (bilingual) */
  const getLabel = useCallback((level: MasteryLevel): { en: string; ar: string } => {
    switch (level) {
      case 'not-started': return { en: 'Not Started', ar: 'لم يبدأ' };
      case 'struggling':  return { en: 'Struggling', ar: 'يحتاج دعم' };
      case 'developing':  return { en: 'Developing', ar: 'في تطور' };
      case 'proficient':  return { en: 'Proficient', ar: 'متقن' };
      case 'mastered':    return { en: 'Mastered', ar: 'أتقن' };
      case 'decaying':    return { en: 'Needs Review', ar: 'يحتاج مراجعة' };
    }
  }, []);

  /** Get icon name (Lucide) for a mastery level */
  const getIcon = useCallback((level: MasteryLevel): string => {
    switch (level) {
      case 'not-started': return 'circle';
      case 'struggling':  return 'circle-dot';
      case 'developing':  return 'loader';
      case 'proficient':  return 'check-circle';
      case 'mastered':    return 'star';
      case 'decaying':    return 'clock';
    }
  }, []);

  const allColors = useMemo(() => MASTERY_COLORS, []);

  return { getColor, getScoreColor, getLabel, getIcon, allColors };
}
