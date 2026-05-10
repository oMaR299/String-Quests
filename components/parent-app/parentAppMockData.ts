// parentAppMockData.ts
// ─────────────────────────────────────────────────────────────────────────────
// Seeded mock state for the Parent App home screen v1. No backend, no
// localStorage — refresh resets everything. The deterministic RNG mirrors the
// pattern in `data/mockAttendanceData.ts` so demo numbers are predictable
// across loads.
//
// 3 mock children: Sara (duo-blue), Omar (duo-green), Lina (duo-gold).
// 1-2 active celebrations.
// 1-3 upcoming deadlines.
// 1-2 unread announcements.
// 0-3 unread message threads.
// 1 daily AI convo-starter.
// daysSinceFirstLogin = 5 (gates the Supernova teaser to off — needs >= 30).

// ============================================================================
// Seeded PRNG
// ============================================================================

function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rng = createRng(7777);

// ============================================================================
// Types
// ============================================================================

export type ChildAvatarColor =
  | 'duo-blue'
  | 'duo-green'
  | 'duo-gold'
  | 'duo-purple'
  | 'duo-orange';

export type Gender = 'female' | 'male';

export interface MockChild {
  id: string;
  nameAr: string;
  nameEn: string;
  /** Drives the avatar tint + the per-child accent color. */
  avatarColor: ChildAvatarColor;
  /** Single-character to render inside the avatar circle. */
  avatarInitial: string;
  /** Used for AR copy that varies by gender ("أنجزت" vs "أنجز"). */
  gender: Gender;
  todayMins: number;
  todayLessons: number;
  /** 0-100. */
  todayAccuracy: number;
  weakAreaAr: string;
  weakAreaEn: string;
  streakDays: number;
  /** Lifetime lesson count for the Profile card. */
  totalLessons: number;
  /** 0-100 cumulative mastery for the Profile card. */
  masteryPct: number;
}

export type CelebrationKind = 'streak' | 'mastery' | 'teacher-praise';

export interface MockCelebration {
  id: string;
  childId: string;
  kind: CelebrationKind;
  /** AR copy already-resolved with name / day-count. */
  copyAr: string;
  copyEn: string;
}

export interface MockDeadline {
  id: string;
  titleAr: string;
  titleEn: string;
  /** ISO date the item is due. */
  dueIso: string;
  /** Null/undefined = school-wide deadline (no specific child). */
  childId?: string;
}

export interface MockAnnouncement {
  id: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  childId?: string;
  unread: boolean;
}

export interface MockMessageThread {
  id: string;
  fromAr: string;
  fromEn: string;
  lastAr: string;
  lastEn: string;
  unread: boolean;
}

export interface MockAiConvoStarter {
  id: string;
  childId: string;
  promptAr: string;
  promptEn: string;
}

/**
 * An action item the parent must resolve. Surfaced in the v1.1 Home stack.
 * Resolution state lives in component state (not here) — this is the seed.
 */
export type ActionItemKind =
  | 'sign-permission'
  | 'ack-note'
  | 'reply-message'
  | 'rsvp-event';

export interface ActionItem {
  id: string;
  kind: ActionItemKind;
  titleAr: string;
  titleEn: string;
  /** Optional, for personalization. */
  childId?: string;
  /** For 'ack-note': the actual note content. */
  noteAr?: string;
  noteEn?: string;
  /** For 'reply-message': sender name. */
  fromAr?: string;
  fromEn?: string;
  /** For 'rsvp-event': event date (ISO yyyy-mm-dd). */
  eventDateIso?: string;
}

export interface ParentAppState {
  children: MockChild[];
  celebrations: MockCelebration[];
  deadlines: MockDeadline[];
  announcements: MockAnnouncement[];
  messages: MockMessageThread[];
  aiConvoStarter: MockAiConvoStarter;
  /** v1.1 — pending parent action items (sign / ack / reply / rsvp). */
  actionItems: ActionItem[];
  /** v1.1 — ISO timestamp of the last data sync. Footer renders "X ago" from this. */
  lastUpdatedAt: string;
  /** Number of days since the parent first signed in. <30 hides Supernova. */
  daysSinceFirstLogin: number;
  /** Parent's display initial for the header avatar (if no photo). */
  parentInitial: string;
  /** Parent's masked phone, shown on the Profile placeholder. */
  parentPhoneMasked: string;
}

// ============================================================================
// Children — seeded
// ============================================================================

const CHILDREN: MockChild[] = [
  {
    id: 'child-sara',
    nameAr: 'سارة',
    nameEn: 'Sara',
    avatarColor: 'duo-blue',
    avatarInitial: 'س',
    gender: 'female',
    todayMins: Math.floor(15 + rng() * 25),       // 15-40
    todayLessons: Math.floor(2 + rng() * 4),       // 2-5
    todayAccuracy: Math.floor(78 + rng() * 18),    // 78-95
    weakAreaAr: 'الكسور',
    weakAreaEn: 'Fractions',
    streakDays: Math.floor(5 + rng() * 12),        // 5-16
    totalLessons: Math.floor(40 + rng() * 60),
    masteryPct: Math.floor(55 + rng() * 30),
  },
  {
    id: 'child-omar',
    nameAr: 'عمر',
    nameEn: 'Omar',
    avatarColor: 'duo-green',
    avatarInitial: 'ع',
    gender: 'male',
    todayMins: Math.floor(8 + rng() * 18),         // 8-25
    todayLessons: Math.floor(1 + rng() * 3),       // 1-3
    todayAccuracy: Math.floor(70 + rng() * 22),    // 70-91
    weakAreaAr: 'القراءة الجهرية',
    weakAreaEn: 'Reading aloud',
    streakDays: Math.floor(2 + rng() * 7),         // 2-8
    totalLessons: Math.floor(25 + rng() * 40),
    masteryPct: Math.floor(40 + rng() * 30),
  },
  {
    id: 'child-lina',
    nameAr: 'لينا',
    nameEn: 'Lina',
    avatarColor: 'duo-gold',
    avatarInitial: 'ل',
    gender: 'female',
    todayMins: Math.floor(12 + rng() * 20),        // 12-31
    todayLessons: Math.floor(2 + rng() * 3),       // 2-4
    todayAccuracy: Math.floor(82 + rng() * 14),    // 82-95
    weakAreaAr: 'الإملاء',
    weakAreaEn: 'Spelling',
    streakDays: Math.floor(8 + rng() * 14),        // 8-21
    totalLessons: Math.floor(50 + rng() * 70),
    masteryPct: Math.floor(60 + rng() * 30),
  },
];

// ============================================================================
// Celebrations
// ============================================================================

const CELEBRATIONS: MockCelebration[] = [
  {
    id: 'cel-1',
    childId: CHILDREN[2].id, // Lina
    kind: 'streak',
    copyAr: `سلسلة ${CHILDREN[2].streakDays} أيام متواصلة! 🔥`,
    copyEn: `${CHILDREN[2].streakDays}-day streak! 🔥`,
  },
  {
    id: 'cel-2',
    childId: CHILDREN[0].id, // Sara
    kind: 'mastery',
    copyAr: `أتقنت ${CHILDREN[0].nameAr} مهارة الجمع 🌟`,
    copyEn: `${CHILDREN[0].nameEn} mastered Addition 🌟`,
  },
];

// ============================================================================
// Deadlines (relative to today)
// ============================================================================

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const DEADLINES: MockDeadline[] = [
  {
    id: 'd-1',
    titleAr: 'نموذج الإذن للرحلة المدرسية',
    titleEn: 'School trip permission slip',
    dueIso: isoDaysFromNow(2),
    childId: CHILDREN[0].id,
  },
  {
    id: 'd-2',
    titleAr: 'دفع رسوم الزي المدرسي',
    titleEn: 'Uniform fees payment',
    dueIso: isoDaysFromNow(5),
  },
  {
    id: 'd-3',
    titleAr: 'استبيان أولياء الأمور',
    titleEn: 'Parent feedback survey',
    dueIso: isoDaysFromNow(9),
  },
];

// ============================================================================
// Announcements
// ============================================================================

const ANNOUNCEMENTS: MockAnnouncement[] = [
  {
    id: 'a-1',
    titleAr: 'يوم رياضي يوم الخميس',
    titleEn: 'Sports day on Thursday',
    bodyAr: 'جميع الطلاب يحضرون بزي رياضي ويحضرون زجاجة ماء.',
    bodyEn: 'All students wear sports uniform and bring a water bottle.',
    unread: true,
  },
  {
    id: 'a-2',
    titleAr: 'تأجيل اجتماع أولياء الأمور',
    titleEn: 'Parent-teacher meeting rescheduled',
    bodyAr: 'تم تأجيل الاجتماع إلى الأسبوع القادم.',
    bodyEn: 'Meeting postponed to next week.',
    unread: true,
    childId: CHILDREN[1].id,
  },
];

// ============================================================================
// Messages
// ============================================================================

const MESSAGES: MockMessageThread[] = [
  {
    id: 'm-1',
    fromAr: 'الأستاذة هدى',
    fromEn: 'Ms. Huda',
    lastAr: 'سارة كانت رائعة في درس اليوم!',
    lastEn: 'Sara was wonderful in class today!',
    unread: true,
  },
  {
    id: 'm-2',
    fromAr: 'إدارة المدرسة',
    fromEn: 'School admin',
    lastAr: 'يرجى تأكيد رقم الطوارئ.',
    lastEn: 'Please confirm your emergency contact.',
    unread: true,
  },
];

// ============================================================================
// AI convo starter (1 daily)
// ============================================================================

const AI_CONVO: MockAiConvoStarter = {
  id: 'ai-1',
  childId: CHILDREN[0].id,
  promptAr: 'اسألوا سارة عن درس الكسور اليوم — ما الجزء الذي وجدته صعباً؟',
  promptEn: 'Ask Sara about her fractions lesson today — what part did she find tricky?',
};

// ============================================================================
// Action items (v1.1) — pending parent chores surfaced on Home
// ============================================================================

const ACTION_ITEMS: ActionItem[] = [
  // Sign-permission FIRST — most time-sensitive.
  {
    id: 'act-sign-1',
    kind: 'sign-permission',
    titleAr: 'إذن الرحلة المدرسية لـ سارة',
    titleEn: "Sign Sara's school trip permission",
    childId: CHILDREN[0].id, // Sara
  },
  // Ack-note — teacher praise about Sara.
  {
    id: 'act-ack-1',
    kind: 'ack-note',
    titleAr: 'ملاحظة من الأستاذة هدى',
    titleEn: 'Note from Ms. Huda',
    childId: CHILDREN[0].id, // Sara
    noteAr: 'سارة كانت رائعة في درس اليوم — شاركت بالإجابات وساعدت زميلاتها. شكراً لدعمكم في البيت 🌷',
    noteEn:
      "Sara was wonderful in class today — she shared answers and helped her classmates. Thank you for the support at home 🌷",
    fromAr: 'الأستاذة هدى',
    fromEn: 'Ms. Huda',
  },
  // RSVP event — sports day.
  {
    id: 'act-rsvp-1',
    kind: 'rsvp-event',
    titleAr: 'هل ستحضرون اليوم الرياضي؟',
    titleEn: 'Will you attend Sports Day?',
    eventDateIso: isoDaysFromNow(4),
  },
];

// ============================================================================
// Top-level state
// ============================================================================

/** ISO timestamp set 5 minutes before module load — feeds the Home footer "X ago" copy. */
const LAST_UPDATED_AT: string = (() => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - 5);
  return d.toISOString();
})();

export const MOCK_PARENT_APP_STATE: ParentAppState = {
  children: CHILDREN,
  celebrations: CELEBRATIONS,
  deadlines: DEADLINES,
  announcements: ANNOUNCEMENTS,
  messages: MESSAGES,
  aiConvoStarter: AI_CONVO,
  actionItems: ACTION_ITEMS,
  lastUpdatedAt: LAST_UPDATED_AT,
  daysSinceFirstLogin: 5,
  parentInitial: 'م',
  parentPhoneMasked: '+962 7• ••• •891',
};

// ============================================================================
// Avatar color helper — static map (Tailwind v4 JIT-safe, no template
// literals constructed at runtime).
// ============================================================================

export interface AvatarStyle {
  bg: string;
  text: string;
  ring: string;
  shadow: string;
  pillBg: string;
  pillText: string;
  softBg: string;
}

export const AVATAR_STYLES: Record<ChildAvatarColor, AvatarStyle> = {
  'duo-blue': {
    bg: 'bg-duo-blue',
    text: 'text-white',
    ring: 'ring-duo-blue/30',
    shadow: 'shadow-[0_3px_0_0_#1899D6]',
    pillBg: 'bg-duo-blue',
    pillText: 'text-white',
    softBg: 'bg-duo-blue-light',
  },
  'duo-green': {
    bg: 'bg-duo-green',
    text: 'text-white',
    ring: 'ring-duo-green/30',
    shadow: 'shadow-[0_3px_0_0_#4CAD00]',
    pillBg: 'bg-duo-green',
    pillText: 'text-white',
    softBg: 'bg-duo-green-light',
  },
  'duo-gold': {
    bg: 'bg-duo-gold',
    text: 'text-white',
    ring: 'ring-duo-gold/30',
    shadow: 'shadow-[0_3px_0_0_#E5A500]',
    pillBg: 'bg-duo-gold',
    pillText: 'text-white',
    softBg: 'bg-duo-gold-light',
  },
  'duo-purple': {
    bg: 'bg-duo-purple',
    text: 'text-white',
    ring: 'ring-duo-purple/30',
    shadow: 'shadow-[0_3px_0_0_#A855F7]',
    pillBg: 'bg-duo-purple',
    pillText: 'text-white',
    softBg: 'bg-duo-purple-light',
  },
  'duo-orange': {
    bg: 'bg-duo-orange',
    text: 'text-white',
    ring: 'ring-duo-orange/30',
    shadow: 'shadow-[0_3px_0_0_#E08600]',
    pillBg: 'bg-duo-orange',
    pillText: 'text-white',
    softBg: 'bg-duo-orange-light',
  },
};

// ============================================================================
// Date helpers
// ============================================================================

/**
 * Days from today until the given ISO date. 0 = today, 1 = tomorrow,
 * negative = past.
 */
export function daysUntilIso(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  const ms = target.getTime() - today.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

/** Tone bucket for deadline urgency — drives the color band. */
export type UrgencyTone = 'safe' | 'warning' | 'urgent';

export function urgencyTone(daysToGo: number): UrgencyTone {
  if (daysToGo < 2) return 'urgent';
  if (daysToGo <= 7) return 'warning';
  return 'safe';
}

export const URGENCY_STYLES: Record<UrgencyTone, { band: string; pill: string; pillText: string }> = {
  safe: {
    band: 'bg-emerald-100',
    pill: 'bg-emerald-100',
    pillText: 'text-emerald-700',
  },
  warning: {
    band: 'bg-amber-100',
    pill: 'bg-amber-100',
    pillText: 'text-amber-700',
  },
  urgent: {
    band: 'bg-rose-100',
    pill: 'bg-rose-100',
    pillText: 'text-rose-700',
  },
};

// ============================================================================
// Supernova gate
// ============================================================================

/**
 * Returns true only when the parent has been around long enough to be shown
 * the Supernova upsell. v1 always returns false (daysSinceFirstLogin = 5).
 */
export function shouldShowSupernovaTeaser(state: ParentAppState): boolean {
  return state.daysSinceFirstLogin >= 30;
}
