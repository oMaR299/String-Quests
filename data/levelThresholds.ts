export interface LevelThreshold {
  level: number;
  xpRequired: number;
  titleAr: string;
  titleEn: string;
}

export const LEVEL_THRESHOLDS: LevelThreshold[] = [
  { level: 1,  xpRequired: 0,     titleAr: 'مبتدئ',           titleEn: 'Beginner' },
  { level: 2,  xpRequired: 100,   titleAr: 'متعلم',           titleEn: 'Learner' },
  { level: 3,  xpRequired: 300,   titleAr: 'مستكشف',          titleEn: 'Explorer' },
  { level: 4,  xpRequired: 600,   titleAr: 'طالب نشيط',       titleEn: 'Active Student' },
  { level: 5,  xpRequired: 1000,  titleAr: 'باحث',            titleEn: 'Researcher' },
  { level: 6,  xpRequired: 1500,  titleAr: 'متفوق',           titleEn: 'Excelling' },
  { level: 7,  xpRequired: 2100,  titleAr: 'خبير',            titleEn: 'Expert' },
  { level: 8,  xpRequired: 2800,  titleAr: 'عالم صغير',       titleEn: 'Young Scholar' },
  { level: 9,  xpRequired: 3600,  titleAr: 'عبقري',           titleEn: 'Genius' },
  { level: 10, xpRequired: 4500,  titleAr: 'أسطورة المعرفة',  titleEn: 'Legend' },
];

export function getLevelForXP(totalXP: number): {
  level: number;
  titleAr: string;
  titleEn: string;
  xpInLevel: number;
  xpForNextLevel: number;
} {
  let current = LEVEL_THRESHOLDS[0];
  for (const threshold of LEVEL_THRESHOLDS) {
    if (totalXP >= threshold.xpRequired) {
      current = threshold;
    } else {
      break;
    }
  }

  const next = LEVEL_THRESHOLDS.find(t => t.level === current.level + 1);
  const xpInLevel = totalXP - current.xpRequired;
  const xpForNextLevel = next
    ? next.xpRequired - current.xpRequired
    : 1000;

  return {
    level: current.level,
    titleAr: current.titleAr,
    titleEn: current.titleEn,
    xpInLevel,
    xpForNextLevel,
  };
}

export const DAILY_GOALS = {
  casual: 50,
  regular: 100,
  serious: 150,
  intense: 200,
} as const;

export type DailyGoalTier = keyof typeof DAILY_GOALS;
