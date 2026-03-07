import { MATH_CURRICULUM } from './mathCurriculum';
import type { CurriculumFramework, GradeCurriculum, Domain, Standard, LearningOutcome, CurriculumKC } from './types';

export { MATH_CURRICULUM };
export type { CurriculumFramework, GradeCurriculum, Domain, Standard, LearningOutcome, CurriculumKC };

export function getGradeCurriculum(grade: number): GradeCurriculum | undefined {
  return MATH_CURRICULUM.grades.find(g => g.gradeLevel === grade);
}

export function getDomainsForGrade(grade: number): Domain[] {
  return getGradeCurriculum(grade)?.domains ?? [];
}

export function getKCsForGrade(grade: number): CurriculumKC[] {
  const kcs: CurriculumKC[] = [];
  for (const domain of getDomainsForGrade(grade)) {
    for (const std of domain.standards) {
      for (const outcome of std.learningOutcomes) {
        kcs.push(...outcome.knowledgeComponents);
      }
    }
  }
  return kcs;
}
