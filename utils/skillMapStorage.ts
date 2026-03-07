import { QuestionType } from '../types';
import { PAGE_MAP, LESSON_MAP, UNIT_MAP } from '../data/sampleTextbook';

export interface AttemptRecord {
  questionId: number;
  subject: string;
  lesson: string;
  questionType: QuestionType;
  isCorrect: boolean;
  pointsAwarded: number;
  maxPoints: number;
  confidence: 'sure' | 'unsure';
  hintUsed: boolean;
  isReviewMode: boolean;
  timestamp: number;
  kcIds?: string[];
}

const STORAGE_KEY = 'string-quests-attempts';

export function loadAttempts(): AttemptRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAttempt(record: AttemptRecord): void {
  const attempts = loadAttempts();
  attempts.push(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
}

export function getAttemptsForQuestion(questionId: number): AttemptRecord[] {
  return loadAttempts().filter(a => a.questionId === questionId);
}

export function getAttemptsForSubject(subject: string): AttemptRecord[] {
  return loadAttempts().filter(a => a.subject === subject);
}

export function getAttemptsInRange(startMs: number, endMs: number): AttemptRecord[] {
  return loadAttempts().filter(a => a.timestamp >= startMs && a.timestamp <= endMs);
}

export function clearAttempts(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ─── KC / Page / Lesson / Unit attempt aggregation ──────────────────────────

/** Get all attempts that include the given KC (via the optional kcIds field). */
export function getAttemptsForKC(kcId: string): AttemptRecord[] {
  return loadAttempts().filter(a => a.kcIds?.includes(kcId));
}

/** Get all attempts for every KC on a given page. */
export function getAttemptsForPage(pageId: string): AttemptRecord[] {
  const page = PAGE_MAP[pageId];
  if (!page) return [];
  const kcSet = new Set(page.kcIds);
  return loadAttempts().filter(a => a.kcIds?.some(id => kcSet.has(id)));
}

/** Get all attempts for every page in a given lesson. */
export function getAttemptsForLesson(lessonId: string): AttemptRecord[] {
  const lesson = LESSON_MAP[lessonId];
  if (!lesson) return [];
  const kcSet = new Set<string>();
  for (const pid of lesson.pageIds) {
    const page = PAGE_MAP[pid];
    if (page) page.kcIds.forEach(id => kcSet.add(id));
  }
  return loadAttempts().filter(a => a.kcIds?.some(id => kcSet.has(id)));
}

/** Get all attempts for every lesson in a given unit. */
export function getAttemptsForUnit(unitId: string): AttemptRecord[] {
  const unit = UNIT_MAP[unitId];
  if (!unit) return [];
  const kcSet = new Set<string>();
  for (const lid of unit.lessonIds) {
    const lesson = LESSON_MAP[lid];
    if (!lesson) continue;
    for (const pid of lesson.pageIds) {
      const page = PAGE_MAP[pid];
      if (page) page.kcIds.forEach(id => kcSet.add(id));
    }
  }
  return loadAttempts().filter(a => a.kcIds?.some(id => kcSet.has(id)));
}
