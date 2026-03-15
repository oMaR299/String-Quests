import { QUESTIONS, TOPIC_META, type TopicMeta } from '../constants';
import { LEARNING_PATH, ALL_PATH_NODES, getStars, type PathNode } from '../data/learningPath';
import { subjectToSlug, lessonToSlug } from './slugify';
import { loadAttempts } from './skillMapStorage';
import type { SubjectUnit } from '../data/subjectUnits';

export interface LessonProgress {
  subjectAr: string;
  lessonAr: string;
  subjectSlug: string;
  lessonSlug: string;
  totalQuestions: number;
  answeredQuestions: number;
  progressPercent: number;
  scorePercent: number;
  stars: 0 | 1 | 2 | 3;
  isCompleted: boolean;
}

export interface SubjectProgress {
  subjectAr: string;
  subjectSlug: string;
  totalQuestions: number;
  answeredQuestions: number;
  progressPercent: number;
}

export function computeLessonProgress(
  subjectAr: string,
  lessonAr: string,
  globalHistory: Record<number, number>,
  completedLessons: string[]
): LessonProgress {
  const lessonQuestions = QUESTIONS.filter(
    q => q.subject === subjectAr && q.lesson === lessonAr
  );
  const totalQuestions = lessonQuestions.length;
  const answeredQuestions = lessonQuestions.filter(q => globalHistory[q.id] !== undefined).length;
  const earnedPoints = lessonQuestions.reduce((sum, q) => sum + (globalHistory[q.id] || 0), 0);
  const maxPoints = lessonQuestions.reduce((sum, q) => sum + q.points, 0);
  const scorePercent = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 0;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
  const lessonKey = `${subjectToSlug(subjectAr)}::${lessonToSlug(lessonAr)}`;

  return {
    subjectAr,
    lessonAr,
    subjectSlug: subjectToSlug(subjectAr),
    lessonSlug: lessonToSlug(lessonAr),
    totalQuestions,
    answeredQuestions,
    progressPercent,
    scorePercent,
    stars: getStars(scorePercent),
    isCompleted: completedLessons.includes(lessonKey),
  };
}

export interface UnitProgress {
  totalQuestions: number;
  answeredQuestions: number;
  progressPercent: number;
  earnedPoints: number;
  maxPoints: number;
  accuracyPercent: number;
  stars: 0 | 1 | 2 | 3;
}

export function computeUnitProgress(
  unit: SubjectUnit,
  subjectAr: string,
  globalHistory: Record<number, number>
): UnitProgress {
  const unitQuestions = QUESTIONS.filter(
    q => q.subject === subjectAr && unit.lessons.includes(q.lesson)
  );
  const totalQuestions = unitQuestions.length;
  const answeredQuestions = unitQuestions.filter(q => globalHistory[q.id] !== undefined).length;
  const earnedPoints = unitQuestions.reduce((sum, q) => sum + (globalHistory[q.id] || 0), 0);
  const maxPoints = unitQuestions.reduce((sum, q) => sum + q.points, 0);
  const progressPercent = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  // Accuracy: only consider attempted questions
  const attemptedQuestions = unitQuestions.filter(q => globalHistory[q.id] !== undefined);
  const attemptedMax = attemptedQuestions.reduce((sum, q) => sum + q.points, 0);
  const attemptedEarned = attemptedQuestions.reduce((sum, q) => sum + (globalHistory[q.id] || 0), 0);
  const accuracyPercent = attemptedMax > 0 ? Math.round((attemptedEarned / attemptedMax) * 100) : 0;

  return {
    totalQuestions,
    answeredQuestions,
    progressPercent,
    earnedPoints,
    maxPoints,
    accuracyPercent,
    stars: getStars(accuracyPercent),
  };
}

export function computeSubjectProgress(
  subjectAr: string,
  globalHistory: Record<number, number>
): SubjectProgress {
  const questions = QUESTIONS.filter(q => q.subject === subjectAr);
  const totalQuestions = questions.length;
  const answeredQuestions = questions.filter(q => globalHistory[q.id] !== undefined).length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  return {
    subjectAr,
    subjectSlug: subjectToSlug(subjectAr),
    totalQuestions,
    answeredQuestions,
    progressPercent,
  };
}

export interface LastPlayedInfo {
  subject: string;
  lesson: string;
  meta: TopicMeta;
  progress: LessonProgress;
  timeAgo: string;
  subjectSlug: string;
  lessonSlug: string;
}

function formatTimeAgo(timestampMs: number, locale: 'ar' | 'en'): string {
  const diffMs = Date.now() - timestampMs;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (locale === 'ar') {
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
  }
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function getLastPlayedInfo(
  globalHistory: Record<number, number>,
  completedLessons: string[],
  locale: 'ar' | 'en' = 'en'
): LastPlayedInfo | null {
  const attempts = loadAttempts();
  if (attempts.length === 0) return null;

  const sorted = [...attempts].sort((a, b) => b.timestamp - a.timestamp);
  const last = sorted[0];
  const meta = TOPIC_META[last.subject] || TOPIC_META['mix'];
  const progress = computeLessonProgress(last.subject, last.lesson, globalHistory, completedLessons);

  return {
    subject: last.subject,
    lesson: last.lesson,
    meta,
    progress,
    timeAgo: formatTimeAgo(last.timestamp, locale),
    subjectSlug: subjectToSlug(last.subject),
    lessonSlug: lessonToSlug(last.lesson),
  };
}

export function getNextRecommendedNode(
  globalHistory: Record<number, number>,
  completedLessons: string[]
): PathNode | null {
  for (const node of ALL_PATH_NODES) {
    const lessonKey = node.lesson
      ? `${subjectToSlug(node.subject)}::${lessonToSlug(node.lesson)}`
      : null;
    const isCompleted = lessonKey ? completedLessons.includes(lessonKey) : false;
    if (isCompleted) continue;

    // Check prerequisites
    const prereqsMet = node.prerequisiteIds.every(preId => {
      const preNode = ALL_PATH_NODES.find(n => n.id === preId);
      if (!preNode || !preNode.lesson) return true;
      const preKey = `${subjectToSlug(preNode.subject)}::${lessonToSlug(preNode.lesson)}`;
      return completedLessons.includes(preKey);
    });

    if (prereqsMet) return node;
  }
  return null;
}
