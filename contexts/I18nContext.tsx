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
    'nav.textbook': 'الكتاب',

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
    'home.continue_where_left_off': 'أكمل من حيث توقفت',
    'home.explore_topics': 'استكشف المواضيع',
    'home.start_first_quest': 'ابدأ أول تحدي لك!',
    'home.start_first_quest_desc': 'اختر موضوعاً وابدأ رحلة التعلم',
    'home.questions_answered': 'أسئلة مُجابة',
    'home.next_quest': 'التحدي التالي',
    'home.all_completed': 'أحسنت! أكملت جميع التحديات',
    'home.review_weakest': 'راجع نقاط الضعف',
    'home.new_badge': 'جديد',
    'home.continue_btn': 'تابع',
    'home.start_btn': 'ابدأ',
    'home.how_to_play': 'كيف ألعب؟',
    'home.streak_title': 'أيام متتالية من الحماس 🔥',
    'home.streak_badge': 'أداء مذهل!',
    'home.streak_days': 'يوماً متتالياً',
    'home.streak_daily_goal': 'هدف اليوم',
    'home.streak_accuracy': 'الدقة',
    'home.streak_total': 'إجمالي',
    'home.practice_mode_title': 'وضع التدريب المفتوح',
    'home.practice_mode_desc': 'تمرن بلا حدود على جميع الأسئلة المتاحة بدون وقت وبدون خسارة.',
    'home.practice_mode_badge': 'الأكثر تميزاً',
    'home.daily_challenge_title': 'التحدي اليومي',
    'home.daily_challenge_empty': 'لا تحديات لليوم.',
    'home.weekly_champion_title': 'بطل الأسبوع',
    'home.weekly_champion_desc': 'تحدي شامل للمحترفين فقط.',
    'home.coming_soon': 'قريباً',

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

    // Teacher Skill Map
    'teacher.skillmap.title': 'خريطة مهارات الفصل',
    'teacher.skillmap.class_avg': 'متوسط الفصل',
    'teacher.skillmap.struggling': 'طلاب يحتاجون مساعدة',
    'teacher.skillmap.mastered_kcs': 'مهارات مكتملة',
    'teacher.skillmap.filter_subject': 'المادة',
    'teacher.skillmap.alert_prefix': 'تنبيه',
    'teacher.skillmap.mastered': 'متقن',
    'teacher.skillmap.proficient': 'جيد',
    'teacher.skillmap.developing': 'نامٍ',
    'teacher.skillmap.weak': 'ضعيف',
    'teacher.skillmap.not_started': 'لم يبدأ',

    // Parent Report
    'parent.report.title': 'تقرير أداء الطالب',
    'parent.report.progress': 'التقدم في المواد الدراسية',
    'parent.report.strengths': 'نقاط القوة',
    'parent.report.needs_practice': 'يحتاج إلى تدريب',
    'parent.report.this_week': 'هذا الأسبوع تعلم ابنك/ابنتك',
    'parent.report.print': 'طباعة التقرير',
    'parent.report.select_student': 'اختر الطالب',
    'parent.report.overall': 'التقدير العام',
    'parent.report.school': 'مدارس الخضر الحديثة',

    // Principal Skill Map
    'principal.skillmap.title': 'خريطة المهارات المدرسية',
    'principal.skillmap.school_avg': 'متوسط الإتقان',
    'principal.skillmap.best_class': 'أفضل فصل',
    'principal.skillmap.attention': 'مواد تحتاج تدخلاً',
    'principal.skillmap.kcs_at_risk': 'مهارات بخطر',
    'principal.skillmap.class_comparison': 'مقارنة الفصول',
    'principal.skillmap.subject_performance': 'أداء المواد',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.learn': 'Learn',
    'nav.leaderboard': 'Leaderboard',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.skillmap': 'Skill Map',
    'nav.textbook': 'Textbook',

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
    'home.continue_where_left_off': 'Continue where you left off',
    'home.explore_topics': 'Explore Topics',
    'home.start_first_quest': 'Start Your First Quest!',
    'home.start_first_quest_desc': 'Pick a topic and begin your learning journey',
    'home.questions_answered': 'questions answered',
    'home.next_quest': 'Next Quest',
    'home.all_completed': 'All quests completed!',
    'home.review_weakest': 'Review your weakest area',
    'home.new_badge': 'New',
    'home.continue_btn': 'Continue',
    'home.start_btn': 'Start',
    'home.how_to_play': 'How to play?',
    'home.streak_title': 'Consecutive Days of Enthusiasm 🔥',
    'home.streak_badge': 'Amazing!',
    'home.streak_days': 'days in a row',
    'home.streak_daily_goal': 'Daily Goal',
    'home.streak_accuracy': 'Accuracy',
    'home.streak_total': 'Total',
    'home.practice_mode_title': 'Open Practice Mode',
    'home.practice_mode_desc': 'Practice unlimited on all available questions without time and without loss.',
    'home.practice_mode_badge': 'Most Distinctive',
    'home.daily_challenge_title': 'Daily Challenge',
    'home.daily_challenge_empty': 'No quests for today.',
    'home.weekly_champion_title': 'Weekly Champion',
    'home.weekly_champion_desc': 'Comprehensive challenge for experts only.',
    'home.coming_soon': 'Coming Soon',

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

    // Teacher Skill Map
    'teacher.skillmap.title': 'Class Skill Map',
    'teacher.skillmap.class_avg': 'Class Avg Mastery',
    'teacher.skillmap.struggling': 'Need Support',
    'teacher.skillmap.mastered_kcs': 'KCs Mastered',
    'teacher.skillmap.filter_subject': 'Subject',
    'teacher.skillmap.alert_prefix': 'Alert',
    'teacher.skillmap.mastered': 'Mastered',
    'teacher.skillmap.proficient': 'Proficient',
    'teacher.skillmap.developing': 'Developing',
    'teacher.skillmap.weak': 'Weak',
    'teacher.skillmap.not_started': 'Not started',

    // Parent Report
    'parent.report.title': 'Student Report Card',
    'parent.report.progress': 'Progress by Subject',
    'parent.report.strengths': 'Strengths (Top 5 Skills)',
    'parent.report.needs_practice': 'Needs Practice (5 Skills)',
    'parent.report.this_week': 'This week your child learned',
    'parent.report.print': 'Print Report',
    'parent.report.select_student': 'Select student',
    'parent.report.overall': 'Overall Grade',
    'parent.report.school': 'Al-Khadr Modern Schools',

    // Principal Skill Map
    'principal.skillmap.title': 'School-Wide Skill Map',
    'principal.skillmap.school_avg': 'School Avg Mastery',
    'principal.skillmap.best_class': 'Best Performing Class',
    'principal.skillmap.attention': 'Subjects Need Attention',
    'principal.skillmap.kcs_at_risk': 'KCs At Risk',
    'principal.skillmap.class_comparison': 'Class Comparison',
    'principal.skillmap.subject_performance': 'Subject Performance',
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
