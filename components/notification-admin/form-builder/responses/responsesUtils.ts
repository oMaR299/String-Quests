// responsesUtils.ts
// ─────────────────────────────────────────────────────────────────────────────
// Pure helpers shared across the responses dashboard tabs. No JSX, no React
// hooks — keeps the actual screen files focused on layout/rendering.

import type { FormField, FormResponse, FormFieldType, UserRole } from '../../../../types/notification';

// ─────────────────────────────────────────────
// Locale helpers
// ─────────────────────────────────────────────

export type Locale = 'ar' | 'en';
export const lt = (locale: Locale, ar: string, en: string) => (locale === 'ar' ? ar : en);

// ─────────────────────────────────────────────
// Formatters
// ─────────────────────────────────────────────

export function formatAnswer(answer: string | string[] | number | boolean | undefined, locale: Locale = 'ar'): string {
  if (answer === undefined || answer === null) return '—';
  if (typeof answer === 'boolean') return lt(locale, answer ? 'نعم' : 'لا', answer ? 'Yes' : 'No');
  if (typeof answer === 'number') return answer.toString();
  if (Array.isArray(answer)) return answer.join(lt(locale, '، ', ', '));
  const str = String(answer);
  return str || '—';
}

export function formatDuration(seconds: number | undefined, locale: Locale): string {
  if (seconds === undefined || seconds === null) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return lt(locale, `${secs} ث`, `${secs}s`);
  if (secs === 0) return lt(locale, `${mins} د`, `${mins}m`);
  return lt(locale, `${mins} د ${secs} ث`, `${mins}m ${secs}s`);
}

export function getRelativeTime(dateString: string, locale: Locale): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (locale === 'ar') {
    if (diffSec < 60) return 'الآن';
    if (diffMin < 60) return `قبل ${diffMin} دقيقة`;
    if (diffHr < 24) return `قبل ${diffHr} ساعة`;
    if (diffDay < 7) return `قبل ${diffDay} يوم`;
    if (diffDay < 30) return `قبل ${Math.floor(diffDay / 7)} أسبوع`;
    return `قبل ${Math.floor(diffDay / 30)} شهر`;
  }
  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
  return `${Math.floor(diffDay / 30)}mo ago`;
}

export function formatDateTime(dateString: string, locale: Locale): string {
  const d = new Date(dateString);
  if (locale === 'ar') {
    return d.toLocaleDateString('ar-SA', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
  return d.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─────────────────────────────────────────────
// Role display
// ─────────────────────────────────────────────

export const ROLE_LABEL_AR: Record<UserRole, string> = {
  student: 'طالب',
  teacher: 'معلم',
  parent: 'ولي أمر',
  admin: 'مسؤول',
};

export const ROLE_LABEL_EN: Record<UserRole, string> = {
  student: 'Student',
  teacher: 'Teacher',
  parent: 'Parent',
  admin: 'Admin',
};

// Static color maps so Tailwind v4 JIT picks them up
export const ROLE_COLORS: Record<UserRole, { bg: string; text: string; border: string }> = {
  student: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  teacher: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  parent: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  admin: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
};

// ─────────────────────────────────────────────
// Initials for avatar
// ─────────────────────────────────────────────

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '');
}

// Stable color per name — picks one of 8 gradients
export const AVATAR_GRADIENTS = [
  'from-sky-400 to-blue-500',
  'from-purple-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-cyan-400 to-sky-500',
  'from-violet-400 to-purple-500',
  'from-fuchsia-400 to-pink-500',
];

export function avatarGradient(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
}

// ─────────────────────────────────────────────
// Field type meta
// ─────────────────────────────────────────────

export const FIELD_TYPE_LABEL_AR: Record<FormFieldType, string> = {
  'short-text': 'نص قصير',
  'long-text': 'نص طويل',
  'single-choice': 'اختيار واحد',
  'multiple-choice': 'اختيار متعدد',
  'number': 'رقم',
  'date': 'تاريخ',
  'file-upload': 'ملف',
  'yes-no': 'نعم / لا',
};

export const FIELD_TYPE_LABEL_EN: Record<FormFieldType, string> = {
  'short-text': 'Short text',
  'long-text': 'Long text',
  'single-choice': 'Single choice',
  'multiple-choice': 'Multiple choice',
  'number': 'Number',
  'date': 'Date',
  'file-upload': 'File',
  'yes-no': 'Yes / No',
};

// ─────────────────────────────────────────────
// Aggregation helpers
// ─────────────────────────────────────────────

export interface SummaryStats {
  totalResponses: number;
  estimatedTotal: number;
  responseRate: number; // 0-100
  avgDurationSec: number;
  latestResponseAt: string | null;
  partialCount: number;
  completeCount: number;
}

interface MaybeWithDuration extends FormResponse {
  durationSeconds?: number;
  isPartial?: boolean;
}

export function buildSummaryStats(responses: FormResponse[], estimatedTotal: number): SummaryStats {
  if (responses.length === 0) {
    return {
      totalResponses: 0,
      estimatedTotal,
      responseRate: 0,
      avgDurationSec: 0,
      latestResponseAt: null,
      partialCount: 0,
      completeCount: 0,
    };
  }
  const ext = responses as MaybeWithDuration[];
  const durations = ext.map((r) => r.durationSeconds ?? 0).filter((d) => d > 0);
  const avgDuration = durations.length > 0
    ? durations.reduce((s, d) => s + d, 0) / durations.length
    : 0;
  const latest = [...responses].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  )[0];
  const partialCount = ext.filter((r) => r.isPartial).length;
  return {
    totalResponses: responses.length,
    estimatedTotal,
    responseRate: estimatedTotal > 0 ? Math.round((responses.length / estimatedTotal) * 100) : 0,
    avgDurationSec: Math.round(avgDuration),
    latestResponseAt: latest?.submittedAt ?? null,
    partialCount,
    completeCount: responses.length - partialCount,
  };
}

// ─────────────────────────────────────────────
// Per-question summaries
// ─────────────────────────────────────────────

export type QuestionSummary =
  | { kind: 'choice'; field: FormField; counts: Map<string, number>; total: number; topAnswer: string | null }
  | { kind: 'yesNo'; field: FormField; yes: number; no: number }
  | { kind: 'number'; field: FormField; min: number; max: number; avg: number; median: number; count: number; histogram: number[] }
  | { kind: 'text'; field: FormField; total: number; topWords: { word: string; count: number }[]; lengthBuckets: { label: string; count: number }[] }
  | { kind: 'date'; field: FormField; byDow: number[]; total: number }
  | { kind: 'file'; field: FormField; uploaded: number; total: number };

export function summarizeField(field: FormField, responses: FormResponse[]): QuestionSummary {
  const answers = responses.map((r) => r.answers[field.id]).filter((a) => a !== undefined && a !== null);

  if (field.type === 'yes-no') {
    return {
      kind: 'yesNo',
      field,
      yes: answers.filter((a) => a === true).length,
      no: answers.filter((a) => a === false).length,
    };
  }

  if (field.type === 'single-choice' || field.type === 'multiple-choice') {
    const counts = new Map<string, number>();
    for (const a of answers) {
      const vals = Array.isArray(a) ? a : [String(a)];
      for (const v of vals) counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    let topAnswer: string | null = null;
    let topCount = 0;
    for (const [k, v] of counts) if (v > topCount) { topCount = v; topAnswer = k; }
    return { kind: 'choice', field, counts, total: answers.length, topAnswer };
  }

  if (field.type === 'number') {
    const nums = answers
      .map((a) => (typeof a === 'number' ? a : parseFloat(String(a))))
      .filter((n) => !isNaN(n));
    if (nums.length === 0) {
      return { kind: 'number', field, min: 0, max: 0, avg: 0, median: 0, count: 0, histogram: [] };
    }
    const sorted = [...nums].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const avg = nums.reduce((s, n) => s + n, 0) / nums.length;
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[(sorted.length - 1) / 2];
    // Build a 10-bucket histogram
    const range = max - min || 1;
    const histogram = Array(10).fill(0);
    for (const n of nums) {
      const idx = Math.min(9, Math.floor(((n - min) / range) * 10));
      histogram[idx]++;
    }
    return {
      kind: 'number', field,
      min, max,
      avg: Math.round(avg * 10) / 10,
      median: Math.round(median * 10) / 10,
      count: nums.length,
      histogram,
    };
  }

  if (field.type === 'date') {
    const byDow = Array(7).fill(0); // Sunday..Saturday
    for (const a of answers) {
      const d = new Date(String(a));
      if (!isNaN(d.getTime())) byDow[d.getDay()]++;
    }
    return { kind: 'date', field, byDow, total: answers.length };
  }

  if (field.type === 'file-upload') {
    return { kind: 'file', field, uploaded: answers.length, total: responses.length };
  }

  // text (short-text, long-text)
  const textValues = answers.map((a) => String(a)).filter((s) => s.trim().length > 0);
  // Top words — simple split, drop stopwords
  const STOP_WORDS = new Set([
    'في', 'من', 'إلى', 'على', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'التي', 'الذي', 'هل',
    'an', 'a', 'the', 'is', 'of', 'and', 'or', 'to', 'in', 'on', 'for', 'with', 'at', 'by',
  ]);
  const wordCounts = new Map<string, number>();
  for (const t of textValues) {
    const words = t.split(/\s+|[،.,!?]/).filter((w) => w.length > 2 && !STOP_WORDS.has(w.toLowerCase()));
    for (const w of words) wordCounts.set(w, (wordCounts.get(w) ?? 0) + 1);
  }
  const topWords = [...wordCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([word, count]) => ({ word, count }));
  // Length buckets
  const buckets = [
    { label: '0-20', max: 20, count: 0 },
    { label: '21-50', max: 50, count: 0 },
    { label: '51-100', max: 100, count: 0 },
    { label: '101-200', max: 200, count: 0 },
    { label: '200+', max: Infinity, count: 0 },
  ];
  for (const t of textValues) {
    const len = t.length;
    for (const b of buckets) {
      if (len <= b.max) { b.count++; break; }
    }
  }
  return {
    kind: 'text', field,
    total: textValues.length,
    topWords,
    lengthBuckets: buckets.map((b) => ({ label: b.label, count: b.count })),
  };
}

// ─────────────────────────────────────────────
// Heatmap of response timing
// ─────────────────────────────────────────────

export interface HeatmapCell {
  dayOffset: number; // 0 = today, 1 = yesterday, ...
  hour: number;     // 0..23
  count: number;
}

export function buildResponseHeatmap(responses: FormResponse[], days = 14): HeatmapCell[] {
  const cells = new Map<string, number>();
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  for (const r of responses) {
    const d = new Date(r.submittedAt);
    if (d < cutoff) continue;
    const dayOffset = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    const hour = d.getHours();
    const key = `${dayOffset}-${hour}`;
    cells.set(key, (cells.get(key) ?? 0) + 1);
  }
  const out: HeatmapCell[] = [];
  for (let dayOffset = 0; dayOffset < days; dayOffset++) {
    for (let hour = 0; hour < 24; hour++) {
      out.push({ dayOffset, hour, count: cells.get(`${dayOffset}-${hour}`) ?? 0 });
    }
  }
  return out;
}

// ─────────────────────────────────────────────
// Search/filter helpers
// ─────────────────────────────────────────────

export function matchesSearch(response: FormResponse, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return response.respondentName.toLowerCase().includes(q);
}

export function matchesDateRange(response: FormResponse, from: string, to: string): boolean {
  const d = new Date(response.submittedAt).getTime();
  if (from) {
    const fromTime = new Date(from).getTime();
    if (d < fromTime) return false;
  }
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    if (d > toDate.getTime()) return false;
  }
  return true;
}

// ─────────────────────────────────────────────
// CSV export
// ─────────────────────────────────────────────

function csvEscape(value: unknown): string {
  if (value === undefined || value === null) return '';
  let s = String(value);
  if (Array.isArray(value)) s = value.join('; ');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    s = `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function exportResponsesAsCsv(
  fields: FormField[],
  responses: FormResponse[],
  formTitle: string,
  locale: Locale,
) {
  const headers = [
    lt(locale, 'الاسم', 'Name'),
    lt(locale, 'الدور', 'Role'),
    lt(locale, 'الصف', 'Grade'),
    lt(locale, 'الشعبة', 'Section'),
    lt(locale, 'تاريخ الإرسال', 'Submitted at'),
    ...fields.map((f) => f.label),
  ];
  const rows = responses.map((r) => [
    r.respondentName,
    locale === 'ar' ? ROLE_LABEL_AR[r.respondentRole] : ROLE_LABEL_EN[r.respondentRole],
    r.respondentGrade ?? '',
    r.respondentSection ?? '',
    r.submittedAt,
    ...fields.map((f) => formatAnswer(r.answers[f.id], locale)),
  ]);
  const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${formTitle || 'form-responses'}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
