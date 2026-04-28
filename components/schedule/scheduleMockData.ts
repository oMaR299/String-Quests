// scheduleMockData.ts
// Deterministic mock teachers + classes for the Schedule module.
// Reuses the createRng pattern from data/mockAttendanceData.ts.

import type {
  ClassItem,
  SectionKey,
  SubjectKey,
  Teacher,
} from './scheduleTypes';
import { SUBJECT_COLOR_TOKEN } from './scheduleTypes';

// ─── Seeded PRNG (mirrors data/mockAttendanceData.ts) ───────────────────────

function createRng(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h || 1;
}

// ─── Teacher pool ───────────────────────────────────────────────────────────

const TEACHERS: Teacher[] = [
  { id: 't-1', nameAr: 'أ. محمد الحسن', nameEn: 'Mr. Mohammed Al-Hassan' },
  { id: 't-2', nameAr: 'أ. ليلى القحطاني', nameEn: 'Ms. Layla Al-Qahtani' },
  { id: 't-3', nameAr: 'أ. خالد العتيبي', nameEn: 'Mr. Khalid Al-Otaibi' },
  { id: 't-4', nameAr: 'أ. نورة الزهراني', nameEn: 'Ms. Noura Al-Zahrani' },
  { id: 't-5', nameAr: 'أ. سلمان الشمري', nameEn: 'Mr. Salman Al-Shammari' },
  { id: 't-6', nameAr: 'أ. هدى الدوسري', nameEn: 'Ms. Huda Al-Dossari' },
];

export function getTeachers(): Teacher[] {
  return TEACHERS.slice();
}

export function getTeacherById(id: string): Teacher | undefined {
  return TEACHERS.find(t => t.id === id);
}

// ─── Classes per teacher (deterministic by teacherId) ───────────────────────

const SUBJECT_POOL: SubjectKey[] = [
  'math',
  'physics',
  'chemistry',
  'biology',
  'arabic',
  'english',
  'history',
  'geography',
];

const SECTIONS: SectionKey[] = ['A', 'B', 'C', 'D', 'E', 'F'];

export function getClassesForTeacher(teacherId: string): ClassItem[] {
  const rng = createRng(hashString(teacherId));

  // Teacher gets 4-6 classes
  const count = 4 + Math.floor(rng() * 3); // 4..6

  // Each teacher has an "affinity" for 1–2 subjects (realistic)
  const primarySubjects: SubjectKey[] = [];
  {
    const first = SUBJECT_POOL[Math.floor(rng() * SUBJECT_POOL.length)];
    primarySubjects.push(first);
    if (rng() > 0.4) {
      // pick a second, distinct subject
      let second = SUBJECT_POOL[Math.floor(rng() * SUBJECT_POOL.length)];
      let safety = 0;
      while (second === first && safety < 10) {
        second = SUBJECT_POOL[Math.floor(rng() * SUBJECT_POOL.length)];
        safety++;
      }
      if (second !== first) primarySubjects.push(second);
    }
  }

  const seen = new Set<string>();
  const classes: ClassItem[] = [];
  let attempts = 0;

  while (classes.length < count && attempts < 60) {
    attempts++;
    const subject =
      primarySubjects[Math.floor(rng() * primarySubjects.length)];
    const grade = 3 + Math.floor(rng() * 4); // 3..6
    const section = SECTIONS[Math.floor(rng() * SECTIONS.length)];
    const key = `${subject}-${grade}-${section}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const weeklyTarget = 3 + Math.floor(rng() * 3); // 3..5
    classes.push({
      id: `${teacherId}-${subject}-${grade}-${section}`,
      subject,
      grade,
      section,
      weeklyTarget,
      colorToken: SUBJECT_COLOR_TOKEN[subject],
    });
  }

  return classes;
}
