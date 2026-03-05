import React, { createContext, useContext } from 'react';
import { useUser } from './UserContext';

// Translation dictionaries
const translations: Record<'ar' | 'en', Record<string, string>> = {
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.learn': 'تعلم',
    'nav.leaderboard': 'المتصدرين',
    'nav.profile': 'الملف',
    'nav.settings': 'إعدادات',
    'nav.skillmap': 'خريطة المهارات',

    // Platform navbar
    'platform.dashboard': 'لوحة المعلومات',
    'platform.quests': 'التحديات',
    'platform.grades': 'الدرجات',
    'platform.calendar': 'التقويم',
    'platform.messages': 'الرسائل',

    // TopBar
    'topbar.hearts': 'القلوب',
    'topbar.gems': 'الأحجار',
    'topbar.streak': 'الحماس',
    'topbar.level': 'المستوى',

    // Learning Path
    'path.locked': 'مقفل',
    'path.completed': 'مكتمل',
    'path.start': 'ابدأ',
    'path.continue': 'تابع',

    // Lesson
    'lesson.confirm': 'تأكيد الإجابة',
    'lesson.unsure': 'لست متأكداً تماماً',
    'lesson.hint': 'تلميح',
    'lesson.next': 'التالي',
    'lesson.exit': 'خروج',
    'lesson.exit_confirm': 'هل تريد الخروج؟ سيتم فقدان تقدمك.',

    // End Screen
    'end.score': 'النتيجة',
    'end.stars': 'النجوم',
    'end.xp_earned': 'نقاط الخبرة',
    'end.retry': 'إعادة المحاولة',
    'end.back': 'العودة',
    'end.review': 'مراجعة الأخطاء',
    'end.perfect': 'ممتاز! درجة كاملة!',

    // Home
    'home.welcome': 'مرحباً!',
    'home.continue_learning': 'واصل رحلة التعلم',
    'home.daily_challenge': 'تحدي اليوم',
    'home.weekly_challenge': 'تحدي الأسبوع',
    'home.total_xp': 'مجموع النقاط',
    'home.accuracy': 'الدقة',
    'home.daily_streak': 'حماس يومي',
    'home.boosts': 'التعزيزات',

    // Profile
    'profile.stats': 'الإحصائيات',
    'profile.achievements': 'الإنجازات',
    'profile.activity': 'النشاط',

    // Settings
    'settings.language': 'اللغة',
    'settings.sound': 'الصوت',
    'settings.daily_goal': 'الهدف اليومي',

    // Gamification
    'hearts.depleted': 'انتهت القلوب!',
    'hearts.wait': 'انتظر التعبئة أو استخدم الأحجار',
    'hearts.refill': 'تعبئة القلوب',
    'hearts.refill_cost': '350 حجر',
    'levelup.congrats': 'مبروك! ارتقيت!',
    'streak.freeze': 'تجميد السلسلة',
    'streak.milestone': 'إنجاز جديد!',

    // Skill Map
    'skillmap.title': 'خريطة المهارات',
    'skillmap.knowledge_score': 'نقاط المعرفة',
    'skillmap.strongest': 'الأقوى',
    'skillmap.weakest': 'الأضعف',
    'skillmap.mastered': 'مهارات متقنة',
    'skillmap.depth': 'العمق المعرفي',
    'skillmap.age': 'العمر المعرفي',
    'skillmap.galaxy': 'المجرة',
    'skillmap.radar': 'الرادار',
    'skillmap.tree': 'الشجرة',
    'skillmap.heatmap': 'الخريطة الحرارية',
    'skillmap.dna': 'الحمض النووي',
    'skillmap.gaps': 'الفجوات',
    'skillmap.strengths': 'نقاط القوة',
    'skillmap.practice': 'تمرّن',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.learn': 'Learn',
    'nav.leaderboard': 'Leaderboard',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.skillmap': 'Skill Map',

    // Platform navbar
    'platform.dashboard': 'Dashboard',
    'platform.quests': 'Quests',
    'platform.grades': 'Grades',
    'platform.calendar': 'Calendar',
    'platform.messages': 'Messages',

    // TopBar
    'topbar.hearts': 'Hearts',
    'topbar.gems': 'Gems',
    'topbar.streak': 'Streak',
    'topbar.level': 'Level',

    // Learning Path
    'path.locked': 'Locked',
    'path.completed': 'Completed',
    'path.start': 'START',
    'path.continue': 'Continue',

    // Lesson
    'lesson.confirm': 'Confirm Answer',
    'lesson.unsure': 'Not sure',
    'lesson.hint': 'Hint',
    'lesson.next': 'Next',
    'lesson.exit': 'Exit',
    'lesson.exit_confirm': 'Exit lesson? Your progress will be lost.',

    // End Screen
    'end.score': 'Score',
    'end.stars': 'Stars',
    'end.xp_earned': 'XP Earned',
    'end.retry': 'Retry',
    'end.back': 'Back',
    'end.review': 'Review Mistakes',
    'end.perfect': 'Perfect Score!',

    // Home
    'home.welcome': 'Welcome!',
    'home.continue_learning': 'Continue Learning',
    'home.daily_challenge': 'Daily Challenge',
    'home.weekly_challenge': 'Weekly Challenge',
    'home.total_xp': 'Total XP',
    'home.accuracy': 'Accuracy',
    'home.daily_streak': 'Daily Streak',
    'home.boosts': 'Boosts',

    // Profile
    'profile.stats': 'Statistics',
    'profile.achievements': 'Achievements',
    'profile.activity': 'Activity',

    // Settings
    'settings.language': 'Language',
    'settings.sound': 'Sound',
    'settings.daily_goal': 'Daily Goal',

    // Gamification
    'hearts.depleted': 'Out of Hearts!',
    'hearts.wait': 'Wait to refill or use gems',
    'hearts.refill': 'Refill Hearts',
    'hearts.refill_cost': '350 Gems',
    'levelup.congrats': 'Level Up!',
    'streak.freeze': 'Streak Freeze',
    'streak.milestone': 'New Milestone!',

    // Skill Map
    'skillmap.title': 'Skill Map',
    'skillmap.knowledge_score': 'Knowledge Score',
    'skillmap.strongest': 'Strongest',
    'skillmap.weakest': 'Weakest',
    'skillmap.mastered': 'Skills Mastered',
    'skillmap.depth': 'Cognitive Depth',
    'skillmap.age': 'Knowledge Age',
    'skillmap.galaxy': 'Galaxy',
    'skillmap.radar': 'Radar',
    'skillmap.tree': 'Tree',
    'skillmap.heatmap': 'Heat Map',
    'skillmap.dna': 'DNA',
    'skillmap.gaps': 'Gaps',
    'skillmap.strengths': 'Strengths',
    'skillmap.practice': 'Practice',
  },
};

// ---- Context ----

interface I18nContextValue {
  locale: 'ar' | 'en';
  dir: 'rtl' | 'ltr';
  t: (key: string) => string;
  toggleLocale: () => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useUser();
  const locale = state.language;
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const t = (key: string): string => {
    return translations[locale][key] || key;
  };

  const toggleLocale = () => {
    dispatch({ type: 'SET_LANGUAGE', payload: locale === 'ar' ? 'en' : 'ar' });
  };

  return (
    <I18nContext.Provider value={{ locale, dir, t, toggleLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
