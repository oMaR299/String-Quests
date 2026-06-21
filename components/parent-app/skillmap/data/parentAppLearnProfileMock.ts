// parentAppLearnProfileMock.ts
// ─────────────────────────────────────────────────────────────────────────────
// "How they learn" data (Skill Map → View 2). Seeded + deterministic with the
// shared createRng + hashStringToSeed pattern, anchored to the child's mastery.
//   • DNA learning profile + alignment   (must-mock)
//   • skill-type breakdown (Bloom's)      (seeded, anchored)
//   • learning strategies that work       (must-mock)
// (General non-academic "life skills" reuse the existing daily-insight topics —
//  see getDailyInsightsForChild in data/parentAppDailyInsightsMock.ts.)

import { getChildSkillAreas } from './parentAppSkillMapMock';

import { createRng, hashStringToSeed, clamp } from '../../data/mockKit';

function avgMastery(childId: string): number {
  const areas = getChildSkillAreas(childId);
  if (!areas.length) return 60;
  return Math.round(areas.reduce((s, a) => s + a.masteryPct, 0) / areas.length);
}

// ── DNA learning profile ────────────────────────────────────────────────────────

export interface DnaTrait {
  labelAr: string;
  labelEn: string;
  value: number; // 0-100
}
export interface DnaProfile {
  typeAr: string;
  typeEn: string;
  taglineAr: string;
  taglineEn: string;
  traits: DnaTrait[];
  alignmentPct: number; // how well current behavior matches the profile
  alignmentNoteAr: string;
  alignmentNoteEn: string;
}

const ARCHETYPES: { ar: string; en: string; tagAr: string; tagEn: string }[] = [
  { ar: 'المستكشف الفضولي', en: 'The Curious Explorer', tagAr: 'يتعلّم بالأسئلة والتجربة', tagEn: 'Learns by asking and trying' },
  { ar: 'المنظّم المثابر', en: 'The Steady Organizer', tagAr: 'يتعلّم بالخطوات والروتين', tagEn: 'Learns through steps and routine' },
  { ar: 'المفكّر التحليلي', en: 'The Analytical Thinker', tagAr: 'يتعلّم بالفهم العميق', tagEn: 'Learns by understanding deeply' },
  { ar: 'المبدع الاجتماعي', en: 'The Creative Collaborator', tagAr: 'يتعلّم بالنقاش والإبداع', tagEn: 'Learns by discussing and creating' },
];

export function getDnaProfile(childId: string): DnaProfile {
  const rand = createRng(hashStringToSeed(`dna:${childId}`));
  const arch = ARCHETYPES[Math.floor(rand() * ARCHETYPES.length)];
  const base = avgMastery(childId);
  const traits: DnaTrait[] = [
    { labelAr: 'التركيز', labelEn: 'Focus', value: clamp(Math.round(base + (rand() - 0.4) * 40), 35, 98) },
    { labelAr: 'المثابرة', labelEn: 'Persistence', value: clamp(Math.round(base + (rand() - 0.4) * 40), 35, 98) },
    { labelAr: 'الفضول', labelEn: 'Curiosity', value: clamp(Math.round(base + (rand() - 0.3) * 45), 35, 99) },
    { labelAr: 'التعاون', labelEn: 'Collaboration', value: clamp(Math.round(base + (rand() - 0.4) * 40), 35, 98) },
  ];
  const alignmentPct = clamp(Math.round(62 + rand() * 32), 55, 96);
  return {
    typeAr: arch.ar,
    typeEn: arch.en,
    taglineAr: arch.tagAr,
    taglineEn: arch.tagEn,
    traits,
    alignmentPct,
    alignmentNoteAr:
      alignmentPct >= 80
        ? 'سلوكه هذا الأسبوع منسجم تماماً مع نمط تعلّمه.'
        : 'سلوكه هذا الأسبوع يبتعد قليلاً عن نمط تعلّمه المعتاد — قد يحتاج لبيئة أقرب لطبيعته.',
    alignmentNoteEn:
      alignmentPct >= 80
        ? "This week's behavior fits their learning style well."
        : "This week drifts a little from their usual style — they may do better in a setting closer to their nature.",
  };
}

// ── Skill-type breakdown (Bloom's) ──────────────────────────────────────────────

export interface SkillTypeScore {
  key: string;
  labelAr: string;
  labelEn: string;
  value: number; // 0-100
}

const SKILL_TYPES = [
  { key: 'remember', labelAr: 'التذكّر', labelEn: 'Memorization' },
  { key: 'understand', labelAr: 'الفهم', labelEn: 'Understanding' },
  { key: 'apply', labelAr: 'التطبيق', labelEn: 'Application' },
  { key: 'analyze', labelAr: 'التحليل', labelEn: 'Reasoning' },
];

/** Mastery by cognitive skill type. Lower types tend higher (easier), seeded. */
export function getSkillTypeBreakdown(childId: string): SkillTypeScore[] {
  const rand = createRng(hashStringToSeed(`skilltype:${childId}`));
  const base = avgMastery(childId);
  // Bias: remembering > understanding > applying > analyzing.
  const bias = [12, 4, -6, -14];
  return SKILL_TYPES.map((s, i) => ({
    ...s,
    value: clamp(Math.round(base + bias[i] + (rand() - 0.5) * 16), 25, 99),
  }));
}

/** Per-subject cognitive skill-type breakdown, anchored to that subject's mastery. */
export function getSubjectSkillTypes(childId: string, subjectKey: string): SkillTypeScore[] {
  const area = getChildSkillAreas(childId).find((a) => a.subjectKey === subjectKey);
  const base = area?.masteryPct ?? 55;
  const rand = createRng(hashStringToSeed(`skilltype:${childId}:${subjectKey}`));
  const bias = [12, 4, -6, -14];
  return SKILL_TYPES.map((s, i) => ({
    ...s,
    value: clamp(Math.round(base + bias[i] + (rand() - 0.5) * 16), 20, 99),
  }));
}

// ── Learning strategies ─────────────────────────────────────────────────────────

export interface Strategy {
  titleAr: string;
  titleEn: string;
  noteAr: string;
  noteEn: string;
}
export interface StrategySet {
  working: Strategy[];
  tryInstead: Strategy[];
}

const STRATEGY_POOL: Strategy[] = [
  { titleAr: 'المراجعة المتباعدة', titleEn: 'Spaced repetition', noteAr: 'مراجعة قصيرة كل يومين تثبّت المعلومة أكثر من جلسة طويلة واحدة.', noteEn: 'Short reviews every couple of days beat one long cram.' },
  { titleAr: 'اشرح لي', titleEn: 'Teach-back', noteAr: 'عندما يشرح لكم ما تعلّمه، يرسّخ الفهم بشكل واضح.', noteEn: 'Explaining it back to you cements understanding.' },
  { titleAr: 'المذاكرة صباحاً', titleEn: 'Morning study', noteAr: 'تركيزه أعلى في الصباح — أفضل وقت للمواد الصعبة.', noteEn: 'Focus is highest in the morning — best for hard subjects.' },
  { titleAr: 'ارسمها', titleEn: 'Draw it out', noteAr: 'الرسوم والمخططات تساعده على فهم الأفكار المجرّدة.', noteEn: 'Diagrams help with abstract ideas.' },
  { titleAr: 'جلسات قصيرة', titleEn: 'Short sessions', noteAr: 'جلسات 15-20 دقيقة أفعل له من الساعات الطويلة.', noteEn: '15-20 minute sessions work better than long stretches.' },
  { titleAr: 'المذاكرة الجماعية', titleEn: 'Study with a friend', noteAr: 'يتعلّم أكثر عند النقاش مع زميل.', noteEn: 'Learns more when discussing with a peer.' },
];

export function getStrategies(childId: string): StrategySet {
  const rand = createRng(hashStringToSeed(`strategy:${childId}`));
  const pool = [...STRATEGY_POOL];
  // shuffle deterministically
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return { working: pool.slice(0, 2), tryInstead: pool.slice(2, 3) };
}
