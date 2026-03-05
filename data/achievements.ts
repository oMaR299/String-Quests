export interface AchievementDef {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  emoji: string;
  gemsReward: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-lesson',
    titleAr: 'الدرس الأول',
    titleEn: 'First Lesson',
    descAr: 'أكمل أول درس',
    descEn: 'Complete your first lesson',
    emoji: '🎓',
    gemsReward: 10,
  },
  {
    id: 'perfect-score',
    titleAr: 'درجة كاملة',
    titleEn: 'Perfect Score',
    descAr: 'احصل على 95% أو أكثر في درس',
    descEn: 'Score 95% or higher in a lesson',
    emoji: '💯',
    gemsReward: 20,
  },
  {
    id: 'streak-7',
    titleAr: 'أسبوع من الحماس',
    titleEn: '7-Day Streak',
    descAr: '7 أيام متتالية',
    descEn: '7 consecutive days',
    emoji: '🔥',
    gemsReward: 30,
  },
  {
    id: 'streak-30',
    titleAr: 'شهر من التميز',
    titleEn: '30-Day Streak',
    descAr: '30 يوماً متتالياً',
    descEn: '30 consecutive days',
    emoji: '⭐',
    gemsReward: 100,
  },
  {
    id: 'xp-100',
    titleAr: 'بداية قوية',
    titleEn: 'Strong Start',
    descAr: 'اجمع 100 نقطة خبرة',
    descEn: 'Earn 100 XP',
    emoji: '💪',
    gemsReward: 10,
  },
  {
    id: 'xp-1000',
    titleAr: 'خبير ناشئ',
    titleEn: 'Rising Expert',
    descAr: 'اجمع 1000 نقطة خبرة',
    descEn: 'Earn 1000 XP',
    emoji: '🏅',
    gemsReward: 50,
  },
  {
    id: 'five-correct',
    titleAr: 'سلسلة ذهبية',
    titleEn: 'Golden Chain',
    descAr: '5 إجابات صحيحة متتالية',
    descEn: '5 consecutive correct answers',
    emoji: '⛓️',
    gemsReward: 15,
  },
  {
    id: 'full-hearts',
    titleAr: 'بلا خدش',
    titleEn: 'Unscathed',
    descAr: 'أكمل درساً بدون خسارة أي قلب',
    descEn: 'Complete a lesson without losing any hearts',
    emoji: '❤️',
    gemsReward: 20,
  },
  {
    id: 'daily-goal',
    titleAr: 'هدف اليوم',
    titleEn: 'Daily Goal',
    descAr: 'حقق هدفك اليومي',
    descEn: 'Meet your daily XP goal',
    emoji: '🎯',
    gemsReward: 10,
  },
  {
    id: 'all-subjects',
    titleAr: 'متعدد المواهب',
    titleEn: 'Renaissance Student',
    descAr: 'جرّب 5 مواضيع مختلفة',
    descEn: 'Try 5 different subjects',
    emoji: '🌟',
    gemsReward: 25,
  },
];

export function getAchievement(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}
