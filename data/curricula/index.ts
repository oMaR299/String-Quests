import { MATH_CURRICULUM } from './mathCurriculum';
import { ARTS_CURRICULUM } from './artsCurriculum';
import { COMPUTER_CURRICULUM } from './computerCurriculum';
import { ENGLISH_CURRICULUM } from './englishCurriculum';
import { KINDERGARTEN_CURRICULUM } from './kindergartenCurriculum';
import { PE_CURRICULUM } from './peCurriculum';
import { SCIENCE_CURRICULUM } from './scienceCurriculum';
import type { CurriculumFramework, GradeCurriculum, Domain, Standard, LearningOutcome, CurriculumKC } from './types';

export { MATH_CURRICULUM };
export { ARTS_CURRICULUM };
export { COMPUTER_CURRICULUM };
export { ENGLISH_CURRICULUM };
export { KINDERGARTEN_CURRICULUM };
export { PE_CURRICULUM };
export { SCIENCE_CURRICULUM };
export type { CurriculumFramework, GradeCurriculum, Domain, Standard, LearningOutcome, CurriculumKC };

export const ALL_CURRICULA: { key: string; data: CurriculumFramework }[] = [
  { key: 'math', data: MATH_CURRICULUM },
  { key: 'arts', data: ARTS_CURRICULUM },
  { key: 'computer', data: COMPUTER_CURRICULUM },
  { key: 'english', data: ENGLISH_CURRICULUM },
  { key: 'kindergarten', data: KINDERGARTEN_CURRICULUM },
  { key: 'pe', data: PE_CURRICULUM },
  { key: 'science', data: SCIENCE_CURRICULUM }
];

export function getGradeCurriculum(grade: number, framework: CurriculumFramework = MATH_CURRICULUM): GradeCurriculum | undefined {
  return framework.grades.find(g => g.gradeLevel === grade);
}

export function getDomainsForGrade(grade: number, framework: CurriculumFramework = MATH_CURRICULUM): Domain[] {
  return getGradeCurriculum(grade, framework)?.domains ?? [];
}

export function getKCsForGrade(grade: number, framework: CurriculumFramework = MATH_CURRICULUM): CurriculumKC[] {
  const kcs: CurriculumKC[] = [];
  for (const domain of getDomainsForGrade(grade, framework)) {
    for (const std of domain.standards) {
      for (const outcome of std.learningOutcomes) {
        kcs.push(...outcome.knowledgeComponents);
      }
    }
  }
  return kcs;
}

// ─── Adapter: CurriculumFramework → Textbook type system ──────────────────────
//
// Mapping:
//   GradeCurriculum  →  Textbook
//   Domain           →  Unit
//   Standard         →  Lesson
//   LearningOutcome  →  TextbookPage
//   CurriculumKC     →  KnowledgeComponent
//
// The adapter creates objects matching the Textbook type system and registers
// them into the shared lookup maps (KC_MAP, PAGE_MAP, LESSON_MAP, UNIT_MAP)
// that are passed in from sampleTextbook.ts. This avoids circular imports.

/** Lookup maps that the adapter writes into. */
export interface TextbookMaps {
  KC_MAP: Record<string, {
    id: string; nameEn: string; nameAr: string;
    bloomLevel: 1|2|3|4|5|6; difficulty: 1|2|3|4|5;
    prerequisiteKcIds: string[]; tags: string[]; standardCode?: string;
  }>;
  PAGE_MAP: Record<string, {
    id: string; pageNumber: number; nameEn: string; nameAr: string; kcIds: string[];
  }>;
  LESSON_MAP: Record<string, {
    id: string; lessonNumber: number; nameEn: string; nameAr: string; pageIds: string[];
  }>;
  UNIT_MAP: Record<string, {
    id: string; unitNumber: number; nameEn: string; nameAr: string; lessonIds: string[];
  }>;
}

/** The Textbook shape returned by the adapter. */
export interface AdapterTextbook {
  id: string;
  nameEn: string;
  nameAr: string;
  gradeLevel: number;
  subject: string;
  unitIds: string[];
}

/**
 * Convert a GradeCurriculum (by array index) into the Textbook type system
 * and register all entities in the supplied lookup maps.
 *
 * @param gradeIndex - zero-based index into MATH_CURRICULUM.grades[].
 *   Grades 1-12 are at indices 0-11, Grade 12B (Business Math) is at index 12.
 * @param maps - the shared lookup maps from sampleTextbook.ts to populate.
 */
export function getCurriculumAsTextbook(
  gradeIndex: number,
  maps: TextbookMaps,
): AdapterTextbook {
  const gradeCurriculum = MATH_CURRICULUM.grades[gradeIndex];
  if (!gradeCurriculum) {
    throw new Error(`No curriculum found at grade index ${gradeIndex}`);
  }

  const grade = gradeCurriculum.gradeLevel;

  // Detect 12B: second grade-12 entry (index 12) uses g12B IDs
  const is12B = gradeIndex === 12;
  const gradeTag = is12B ? 'g12B' : `g${grade}`;

  const unitIds: string[] = [];
  let pageCounter = 0;
  let lessonCounter = 0;

  for (let di = 0; di < gradeCurriculum.domains.length; di++) {
    const domain = gradeCurriculum.domains[di];
    const unitId = `unit-${gradeTag}-${String(di + 1).padStart(2, '0')}`;
    const lessonIds: string[] = [];

    for (let si = 0; si < domain.standards.length; si++) {
      const standard = domain.standards[si];
      lessonCounter++;
      const lessonId = `lesson-${gradeTag}-${String(lessonCounter).padStart(2, '0')}`;
      const pageIds: string[] = [];

      for (let oi = 0; oi < standard.learningOutcomes.length; oi++) {
        const outcome = standard.learningOutcomes[oi];
        pageCounter++;
        const pageId = `page-${gradeTag}-${String(pageCounter).padStart(3, '0')}`;
        const kcIds: string[] = [];

        // Convert CurriculumKC → KnowledgeComponent and register in KC_MAP
        for (const ckc of outcome.knowledgeComponents) {
          const kc = {
            id: ckc.id,
            nameEn: ckc.nameEn,
            nameAr: ckc.nameAr,
            bloomLevel: ckc.bloomLevel,
            difficulty: ckc.difficulty,
            prerequisiteKcIds: ckc.prerequisiteKcIds,
            tags: ckc.tags,
            standardCode: ckc.standardCode,
          };
          maps.KC_MAP[kc.id] = kc;
          kcIds.push(kc.id);
        }

        // Create TextbookPage and register
        const page = {
          id: pageId,
          pageNumber: pageCounter,
          nameEn: outcome.outcomeEn,
          nameAr: outcome.outcomeAr,
          kcIds,
        };
        maps.PAGE_MAP[page.id] = page;
        pageIds.push(pageId);
      }

      // Create Lesson and register
      const lesson = {
        id: lessonId,
        lessonNumber: lessonCounter,
        nameEn: standard.nameEn,
        nameAr: standard.nameAr,
        pageIds,
      };
      maps.LESSON_MAP[lesson.id] = lesson;
      lessonIds.push(lessonId);
    }

    // Create Unit and register
    const unit = {
      id: unitId,
      unitNumber: di + 1,
      nameEn: domain.nameEn,
      nameAr: domain.nameAr,
      lessonIds,
    };
    maps.UNIT_MAP[unit.id] = unit;
    unitIds.push(unitId);
  }

  // Build the Textbook
  const textbookId = `textbook-${gradeTag}-math`;
  const nameEn = is12B
    ? 'Grade 12B Business Mathematics'
    : `Grade ${grade} Mathematics`;
  const nameAr = is12B
    ? 'الرياضيات التجارية للصف الثاني عشر'
    : `الرياضيات للصف ${toArabicOrdinal(grade)}`;

  return {
    id: textbookId,
    nameEn,
    nameAr,
    gradeLevel: grade,
    subject: MATH_CURRICULUM.subject, // 'رياضيات'
    unitIds,
  };
}

/** Simple grade-number → Arabic ordinal name helper */
function toArabicOrdinal(grade: number): string {
  const names: Record<number, string> = {
    1: 'الأول',
    2: 'الثاني',
    3: 'الثالث',
    4: 'الرابع',
    5: 'الخامس',
    6: 'السادس',
    7: 'السابع',
    8: 'الثامن',
    9: 'التاسع',
    10: 'العاشر',
    11: 'الحادي عشر',
    12: 'الثاني عشر',
  };
  return names[grade] ?? String(grade);
}
