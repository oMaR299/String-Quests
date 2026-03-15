/**
 * Textbook data loader - loads digitized pages, questions, and flashcards
 * from the generated JSON files for Grade 1 Math.
 */

// Import metadata
import metadataJson from './math/grade1/metadata.json';
import mappingJson from './math/grade1/mapping.json';

// Types
export interface TextbookMetadata {
  subject: string;
  subjectEn: string;
  grade: number;
  gradeLabel: string;
  curriculum: string;
  books: {
    id: string;
    type: string;
    nameAr: string;
    nameEn: string;
    sourceFile: string;
    pageCount: number;
    imagePrefix: string;
  }[];
  totalPages: number;
  digitizedPages: number;
  status: string;
}

export interface KCMapping {
  pages: Record<string, {
    kcIds: string[];
    unit: number;
    lesson: number | null;
    book: string;
    pageType: string;
  }>;
  kcs: Record<string, {
    nameAr: string;
    domain: string;
    standard: string;
    pageIds: string[];
    totalPages: number;
  }>;
  coverage: {
    totalKCs: number;
    mappedKCs: number;
    unmappedKCs: string[];
    totalContentPages: number;
    mappedPages: number;
    unmappedPages: string[];
  };
}

export interface TextbookQuestion {
  id: number;
  subject: string;
  lesson: string;
  type: 'multiple-choice' | 'input' | 'reorder' | 'matching';
  questionText: string;
  options?: string[];
  correctAnswer: string;
  pairs?: { left: string; right: string }[];
  points: number;
  hint: string;
}

export interface KCQuestions {
  kcId: string;
  kcNameAr: string;
  domain: string;
  standard: string;
  questions: TextbookQuestion[];
}

export interface Flashcard {
  id: string;
  type: 'text' | 'concept' | 'visual' | 'reverse';
  front: string;
  back: string;
  difficulty: number;
}

export interface KCFlashcards {
  kcId: string;
  kcNameAr: string;
  cards: Flashcard[];
}

// Export loaded data
export const metadata: TextbookMetadata = metadataJson as TextbookMetadata;
export const mapping: KCMapping = mappingJson as KCMapping;

// Lazy loaders for question and flashcard files (loaded on demand)
const questionModules = import.meta.glob('./math/grade1/questions/*.json', { eager: true }) as Record<string, { default: KCQuestions }>;
const flashcardModules = import.meta.glob('./math/grade1/flashcards/*.json', { eager: true }) as Record<string, { default: KCFlashcards }>;

// Build question map
export const questionsByKC: Map<string, KCQuestions> = new Map();
for (const [path, mod] of Object.entries(questionModules)) {
  const data = (mod as any).default || mod;
  if (data?.kcId) {
    questionsByKC.set(data.kcId, data);
  }
}

// Build flashcard map
export const flashcardsByKC: Map<string, KCFlashcards> = new Map();
for (const [path, mod] of Object.entries(flashcardModules)) {
  const data = (mod as any).default || mod;
  if (data?.kcId) {
    flashcardsByKC.set(data.kcId, data);
  }
}

// Helper functions
export function getAllQuestions(): TextbookQuestion[] {
  const all: TextbookQuestion[] = [];
  for (const kc of questionsByKC.values()) {
    all.push(...kc.questions);
  }
  return all;
}

export function getQuestionsByDomain(domain: string): TextbookQuestion[] {
  const all: TextbookQuestion[] = [];
  for (const kc of questionsByKC.values()) {
    if (kc.domain === domain) {
      all.push(...kc.questions);
    }
  }
  return all;
}

export function getKCList(): { id: string; nameAr: string; domain: string; standard: string; questionCount: number; flashcardCount: number }[] {
  const kcIds = Object.keys(mapping.kcs);
  return kcIds.map(id => {
    const kc = mapping.kcs[id];
    const questions = questionsByKC.get(id);
    const flashcards = flashcardsByKC.get(id);
    return {
      id,
      nameAr: kc.nameAr,
      domain: kc.domain,
      standard: kc.standard,
      questionCount: questions?.questions.length || 0,
      flashcardCount: flashcards?.cards.length || 0,
    };
  });
}

export function getStats() {
  let totalQuestions = 0;
  let totalFlashcards = 0;
  const typeCounts: Record<string, number> = {};
  const difficultyCounts: Record<number, number> = {};

  for (const kc of questionsByKC.values()) {
    totalQuestions += kc.questions.length;
    for (const q of kc.questions) {
      typeCounts[q.type] = (typeCounts[q.type] || 0) + 1;
      difficultyCounts[q.points] = (difficultyCounts[q.points] || 0) + 1;
    }
  }

  for (const kc of flashcardsByKC.values()) {
    totalFlashcards += kc.cards.length;
  }

  return {
    totalPages: metadata.totalPages,
    digitizedPages: metadata.digitizedPages,
    totalKCs: mapping.coverage.totalKCs,
    totalQuestions,
    totalFlashcards,
    typeCounts,
    difficultyCounts,
    domains: [...new Set(Object.values(mapping.kcs).map(k => k.domain))],
  };
}
