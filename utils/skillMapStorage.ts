import { QuestionType } from '../types';

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
