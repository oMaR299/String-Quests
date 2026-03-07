import { BloomLevel } from '../skillTaxonomy';

export interface CurriculumFramework {
  id: string;
  subject: string;
  subjectEn: string;
  grades: GradeCurriculum[];
}

export interface GradeCurriculum {
  gradeLevel: number;
  domains: Domain[];
}

export interface Domain {
  id: string;
  nameAr: string;
  nameEn: string;
  standards: Standard[];
}

export interface Standard {
  id: string;
  nameAr: string;
  nameEn: string;
  learningOutcomes: LearningOutcome[];
}

export interface LearningOutcome {
  id: string;
  outcomeAr: string;
  outcomeEn: string;
  bloomLevel: BloomLevel;
  indicators: string[];
  knowledgeComponents: CurriculumKC[];
}

export interface CurriculumKC {
  id: string;
  nameAr: string;
  nameEn: string;
  bloomLevel: BloomLevel;
  difficulty: 1 | 2 | 3 | 4 | 5;
  prerequisiteKcIds: string[];
  tags: string[];
  standardCode: string;
}
