// parentAppStandingMock.ts
// ─────────────────────────────────────────────────────────────────────────────
// "Standing & people" data (Skill Map → View 3). Seeded + deterministic.
//   • String standing — the child vs ALL of String, as a NARRATIVE summary
//     (positive band + tags), never a raw rank/number.
//   • Teacher impact — which teachers bring out the child's best (must-mock
//     rapport; teacher names seeded per subject).

import { getChildSkillAreas } from './parentAppSkillMapMock';

import { createRng, hashStringToSeed, clamp } from '../../data/mockKit';

// ── String standing (narrative, not numbers) ────────────────────────────────────

export interface StandingTag {
  labelAr: string;
  labelEn: string;
}
export interface StringStanding {
  bandAr: string;
  bandEn: string;
  tags: StandingTag[];
  summaryAr: string;
  summaryEn: string;
}

const TAG_POOL: StandingTag[] = [
  { labelAr: 'فضولي', labelEn: 'curious' },
  { labelAr: 'منتظم', labelEn: 'consistent' },
  { labelAr: 'متعاون', labelEn: 'collaborative' },
  { labelAr: 'مثابر', labelEn: 'persistent' },
  { labelAr: 'سريع التعلّم', labelEn: 'a fast learner' },
  { labelAr: 'مبدع', labelEn: 'creative' },
];

export function getStringStanding(childId: string, childName: string, locale: 'ar' | 'en'): StringStanding {
  const rand = createRng(hashStringToSeed(`standing:${childId}`));
  const percentile = clamp(Math.round(45 + rand() * 50), 40, 96); // hidden; drives band only

  const band =
    percentile >= 80
      ? { ar: 'من أكثر المتعلّمين تميّزاً في String', en: 'among the standout learners in String' }
      : percentile >= 60
        ? { ar: 'ضمن المتعلّمين المتقدّمين في String', en: 'among the advanced learners in String' }
        : { ar: 'في طريقه ليتقدّم بين متعلّمي String', en: 'steadily climbing among String learners' };

  // pick 2 positive tags deterministically
  const pool = [...TAG_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const tags = pool.slice(0, 2);

  const summaryAr = `${childName} ${band.ar} — يبرز بكونه ${tags[0].labelAr} و${tags[1].labelAr} مقارنةً بأقرانه.`;
  const summaryEn = `${childName} is ${band.en} — standing out as ${tags[0].labelEn} and ${tags[1].labelEn} among peers.`;

  return { bandAr: band.ar, bandEn: band.en, tags, summaryAr, summaryEn };
}

// ── Teacher impact ──────────────────────────────────────────────────────────────

export interface TeacherImpact {
  nameAr: string;
  nameEn: string;
  subjectKey: string;
  subjectAr: string;
  subjectEn: string;
  rapport: number; // 0-100
  noteAr: string;
  noteEn: string;
}

const TEACHER_NAMES: { ar: string; en: string }[] = [
  { ar: 'أ. هدى', en: 'Ms. Huda' },
  { ar: 'أ. خالد', en: 'Mr. Khaled' },
  { ar: 'أ. ريم', en: 'Ms. Reem' },
  { ar: 'أ. سامي', en: 'Mr. Sami' },
  { ar: 'أ. ليلى', en: 'Ms. Layla' },
  { ar: 'أ. عمر', en: 'Mr. Omar' },
];

// ── Class ranking (position among classmates) ───────────────────────────────────
// Real rank vs other students (user-requested). Derived deterministically from
// the child's mastery vs a seeded class size — no backend, no named peers.

export interface ClassRank {
  /** 1 = top of class. */
  rank: number;
  classSize: number;
  /** 0-100, higher = stronger position (drives the distribution marker). */
  percentile: number;
}

/** One class size per child (same class across all subjects). */
function classSizeFor(childId: string): number {
  const r = createRng(hashStringToSeed(`classsize:${childId}`));
  return 22 + Math.floor(r() * 9); // 22-30 students
}

function rankFrom(mastery: number, seed: string, classSize: number): ClassRank {
  const rand = createRng(hashStringToSeed(seed));
  const percentile = clamp(Math.round(mastery * 0.85 + 12 + (rand() - 0.5) * 10), 5, 99);
  const rank = clamp(Math.round((1 - percentile / 100) * (classSize - 1)) + 1, 1, classSize);
  return { rank, classSize, percentile };
}

/** Overall class rank (across all subjects). */
export function getClassRank(childId: string): ClassRank {
  const areas = getChildSkillAreas(childId);
  const avg = areas.length ? areas.reduce((s, a) => s + a.masteryPct, 0) / areas.length : 60;
  return rankFrom(avg, `classrank:${childId}`, classSizeFor(childId));
}

/** Per-subject class rank (same class size as the overall rank). */
export function getSubjectRank(childId: string, subjectKey: string): ClassRank {
  const area = getChildSkillAreas(childId).find((a) => a.subjectKey === subjectKey);
  return rankFrom(area?.masteryPct ?? 55, `subjrank:${childId}:${subjectKey}`, classSizeFor(childId));
}

/** Teacher rapport per subject. Highest = "brings out the best." Top 3 returned. */
export function getTeacherImpact(childId: string): TeacherImpact[] {
  const areas = getChildSkillAreas(childId);
  const rand = createRng(hashStringToSeed(`teacher:${childId}`));
  const impacts: TeacherImpact[] = areas.map((a, i) => {
    const name = TEACHER_NAMES[(hashStringToSeed(`${childId}:${a.subjectKey}`) + i) % TEACHER_NAMES.length];
    const rapport = clamp(Math.round(55 + rand() * 43), 50, 98);
    const high = rapport >= 80;
    return {
      nameAr: name.ar,
      nameEn: name.en,
      subjectKey: a.subjectKey,
      subjectAr: a.subjectAr,
      subjectEn: a.subjectEn,
      rapport,
      noteAr: high
        ? `${name.ar} تُخرج أفضل ما لدى طفلك في ${a.subjectAr} — يتجاوب معها بحماس.`
        : `علاقة جيدة مع ${name.ar} في ${a.subjectAr}، وهناك مجال لتفاعل أعمق.`,
      noteEn: high
        ? `${name.en} brings out your child's best in ${a.subjectEn} — they respond with energy.`
        : `A good rapport with ${name.en} in ${a.subjectEn}, with room for deeper engagement.`,
    };
  });
  return impacts.sort((x, y) => y.rapport - x.rapport).slice(0, 3);
}
