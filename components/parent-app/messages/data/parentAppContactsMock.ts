// parentAppContactsMock.ts
// ─────────────────────────────────────────────────────────────────────────────
// Seeded mock contact roster for the Messages module. 3 mock children
// (Sara / Omar / Lina) — each with:
//   • 1 dedicated Academic Mentor (3 total)
//   • 6 subject teachers (math/arabic/english/science/pe/art — 18 total)
// Plus 4 cross-child school staff: principal, counselor, admin, nurse.
// Total = 3 + 18 + 4 = 25 contacts.
//
// Deterministic via `createRng` mirroring `data/mockAttendanceData.ts`.
//
// Every contact carries:
//   • AR + EN names
//   • role + optional subject
//   • scope ('child' | 'school')
//   • optional childId (for child-scoped contacts)
//   • avatar tone + initial
//   • online status + typical reply time
//   • languages spoken
//
// Tailwind v4 JIT-safe: avatar tones are static keys from a literal map.

import type { ChildAvatarColor } from '../../parentAppMockData';

export type ContactRole =
  | 'mentor'
  | 'teacher'
  | 'principal'
  | 'counselor'
  | 'admin'
  | 'nurse';

export type SubjectKey =
  | 'math'
  | 'arabic'
  | 'english'
  | 'science'
  | 'pe'
  | 'art';

export type ContactScope = 'child' | 'school';

export type OnlineStatus = 'online' | 'offline' | 'busy';

export interface MockContact {
  id: string;
  nameAr: string;
  nameEn: string;
  role: ContactRole;
  subject?: SubjectKey;
  scope: ContactScope;
  childId?: string;
  avatarColor: ChildAvatarColor | 'slate';
  avatarInitial: string;
  onlineStatus: OnlineStatus;
  typicalReplyMinutes: number;
  languages: ('ar' | 'en')[];
}

// ============================================================================
// Seeded PRNG (mirrors data/mockAttendanceData.ts)
// ============================================================================

function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rng = createRng(4242);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function statusFor(): OnlineStatus {
  const n = rng();
  if (n < 0.3) return 'online';
  if (n < 0.55) return 'busy';
  return 'offline';
}

function replyMinsFor(role: ContactRole): number {
  // Mentors reply fastest, principal slowest.
  if (role === 'mentor') return Math.floor(60 + rng() * 90); // 60-150 mins
  if (role === 'teacher') return Math.floor(120 + rng() * 180); // 2-5h
  if (role === 'nurse') return Math.floor(30 + rng() * 60);
  if (role === 'counselor') return Math.floor(120 + rng() * 180);
  if (role === 'admin') return Math.floor(240 + rng() * 360); // 4-10h
  if (role === 'principal') return Math.floor(360 + rng() * 480); // 6-14h
  return 240;
}

// ============================================================================
// Per-child name pools (kept short — feels handcrafted, not procedural)
// ============================================================================

interface NameTpl {
  ar: string;
  en: string;
  initial: string;
}

// Mentor names — distinct per child so a kid switch genuinely changes faces.
const MENTORS_PER_CHILD: Record<string, NameTpl> = {
  'child-sara': { ar: 'د. نور الرشيد', en: 'Dr. Nour Al-Rashid', initial: 'ن' },
  'child-omar': { ar: 'أ. خالد المصري', en: 'Mr. Khaled Al-Masri', initial: 'خ' },
  'child-lina': { ar: 'د. ريما حداد', en: 'Dr. Rima Haddad', initial: 'ر' },
};

// Subject teacher name pools — picked per child via seeded RNG.
const TEACHER_NAMES: Record<SubjectKey, NameTpl[]> = {
  math: [
    { ar: 'الأستاذة هدى', en: 'Ms. Huda', initial: 'ه' },
    { ar: 'الأستاذ سامي', en: 'Mr. Sami', initial: 'س' },
    { ar: 'الأستاذة فاطمة', en: 'Ms. Fatima', initial: 'ف' },
  ],
  arabic: [
    { ar: 'الأستاذ جمال', en: 'Mr. Jamal', initial: 'ج' },
    { ar: 'الأستاذة سعاد', en: 'Ms. Suad', initial: 'س' },
    { ar: 'الأستاذة منى', en: 'Ms. Mona', initial: 'م' },
  ],
  english: [
    { ar: 'الأستاذ جيمس', en: 'Mr. James', initial: 'ج' },
    { ar: 'الأستاذة كلير', en: 'Ms. Claire', initial: 'ك' },
    { ar: 'الأستاذة سارة', en: 'Ms. Sarah', initial: 'س' },
  ],
  science: [
    { ar: 'الأستاذة ليلى', en: 'Ms. Layla', initial: 'ل' },
    { ar: 'الأستاذ يوسف', en: 'Mr. Yousef', initial: 'ي' },
    { ar: 'الأستاذة هند', en: 'Ms. Hind', initial: 'ه' },
  ],
  pe: [
    { ar: 'الأستاذ حسن', en: 'Mr. Hassan', initial: 'ح' },
    { ar: 'الأستاذ عمر', en: 'Mr. Omar', initial: 'ع' },
    { ar: 'الأستاذ طارق', en: 'Mr. Tareq', initial: 'ط' },
  ],
  art: [
    { ar: 'الأستاذة مايا', en: 'Ms. Maya', initial: 'م' },
    { ar: 'الأستاذة دانا', en: 'Ms. Dana', initial: 'د' },
    { ar: 'الأستاذة رنا', en: 'Ms. Rana', initial: 'ر' },
  ],
};

// Subject → avatar tone (matches SUBJECT_COLOR_MAP in the UI layer).
const SUBJECT_AVATAR_TONE: Record<SubjectKey, ChildAvatarColor> = {
  math: 'duo-blue',
  arabic: 'duo-gold',
  english: 'duo-purple',
  science: 'duo-green',
  pe: 'duo-orange',
  art: 'duo-purple',
};

const SUBJECTS: SubjectKey[] = ['math', 'arabic', 'english', 'science', 'pe', 'art'];

// ============================================================================
// Build contacts
// ============================================================================

function buildMentor(childId: string): MockContact {
  const tpl = MENTORS_PER_CHILD[childId];
  return {
    id: `mentor-${childId}`,
    nameAr: tpl.ar,
    nameEn: tpl.en,
    role: 'mentor',
    scope: 'child',
    childId,
    avatarColor: 'duo-purple',
    avatarInitial: tpl.initial,
    onlineStatus: statusFor(),
    typicalReplyMinutes: replyMinsFor('mentor'),
    languages: ['ar', 'en'],
  };
}

function buildTeacher(childId: string, subject: SubjectKey): MockContact {
  const tpl = pick(TEACHER_NAMES[subject]);
  return {
    id: `teacher-${childId}-${subject}`,
    nameAr: tpl.ar,
    nameEn: tpl.en,
    role: 'teacher',
    subject,
    scope: 'child',
    childId,
    avatarColor: SUBJECT_AVATAR_TONE[subject],
    avatarInitial: tpl.initial,
    onlineStatus: statusFor(),
    typicalReplyMinutes: replyMinsFor('teacher'),
    languages: subject === 'english' ? ['en', 'ar'] : ['ar', 'en'],
  };
}

const CHILD_IDS = ['child-sara', 'child-omar', 'child-lina'];

const MENTORS: MockContact[] = CHILD_IDS.map(buildMentor);

const TEACHERS: MockContact[] = CHILD_IDS.flatMap((cid) =>
  SUBJECTS.map((s) => buildTeacher(cid, s))
);

// Cross-child school staff. Slate avatars to distinguish from per-child folks.
const SCHOOL_STAFF: MockContact[] = [
  {
    id: 'staff-principal',
    nameAr: 'الأستاذ إبراهيم النعيمي',
    nameEn: 'Mr. Ibrahim Al-Nuaimi',
    role: 'principal',
    scope: 'school',
    avatarColor: 'slate',
    avatarInitial: 'إ',
    onlineStatus: statusFor(),
    typicalReplyMinutes: replyMinsFor('principal'),
    languages: ['ar', 'en'],
  },
  {
    id: 'staff-counselor',
    nameAr: 'د. ميساء الخطيب',
    nameEn: 'Dr. Maysa Al-Khateeb',
    role: 'counselor',
    scope: 'school',
    avatarColor: 'slate',
    avatarInitial: 'م',
    onlineStatus: statusFor(),
    typicalReplyMinutes: replyMinsFor('counselor'),
    languages: ['ar', 'en'],
  },
  {
    id: 'staff-admin',
    nameAr: 'السكرتارية المدرسية',
    nameEn: 'School Admin',
    role: 'admin',
    scope: 'school',
    avatarColor: 'slate',
    avatarInitial: 'إ',
    onlineStatus: statusFor(),
    typicalReplyMinutes: replyMinsFor('admin'),
    languages: ['ar', 'en'],
  },
  {
    id: 'staff-nurse',
    nameAr: 'الممرضة سلوى',
    nameEn: 'Nurse Salwa',
    role: 'nurse',
    scope: 'school',
    avatarColor: 'slate',
    avatarInitial: 'س',
    onlineStatus: statusFor(),
    typicalReplyMinutes: replyMinsFor('nurse'),
    languages: ['ar'],
  },
];

export const MOCK_CONTACTS: MockContact[] = [
  ...MENTORS,
  ...TEACHERS,
  ...SCHOOL_STAFF,
];

// ============================================================================
// Selector helpers
// ============================================================================

export function getMentorForChild(childId: string): MockContact | null {
  return MOCK_CONTACTS.find(
    (c) => c.role === 'mentor' && c.childId === childId
  ) ?? null;
}

export function getTeachersForChild(childId: string): MockContact[] {
  // Stable order by SUBJECTS array order (math, arabic, english, science, pe, art).
  return SUBJECTS.map((s) =>
    MOCK_CONTACTS.find(
      (c) => c.role === 'teacher' && c.childId === childId && c.subject === s
    )
  ).filter((c): c is MockContact => !!c);
}

export function getSchoolStaff(): MockContact[] {
  return MOCK_CONTACTS.filter((c) => c.scope === 'school');
}

export function getContactById(id: string): MockContact | null {
  return MOCK_CONTACTS.find((c) => c.id === id) ?? null;
}

// Subject color/icon registry used by tiles & elsewhere. Locked literal map
// for Tailwind v4 JIT safety.
export interface SubjectStyle {
  emoji: string;
  /** Background class for the tile icon circle. */
  bg: string;
  /** Soft tint for chips / accents. */
  softBg: string;
}

export const SUBJECT_STYLES: Record<SubjectKey, SubjectStyle> = {
  math: { emoji: '🔢', bg: 'bg-duo-blue', softBg: 'bg-duo-blue-light' },
  arabic: { emoji: '📚', bg: 'bg-duo-gold', softBg: 'bg-duo-gold-light' },
  english: { emoji: '🇬🇧', bg: 'bg-duo-purple', softBg: 'bg-duo-purple-light' },
  science: { emoji: '🧪', bg: 'bg-emerald-500', softBg: 'bg-emerald-100' },
  pe: { emoji: '🏃', bg: 'bg-duo-orange', softBg: 'bg-duo-orange-light' },
  art: { emoji: '🎨', bg: 'bg-rose-500', softBg: 'bg-rose-100' },
};

export const ALL_SUBJECTS: SubjectKey[] = SUBJECTS;
