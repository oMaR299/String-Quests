import { QuestionType } from '../types';

// Bloom's Taxonomy levels (1-6)
export type BloomLevel = 1 | 2 | 3 | 4 | 5 | 6;

export const BLOOM_LABELS: Record<BloomLevel, { ar: string; en: string }> = {
  1: { ar: 'تذكر', en: 'Remember' },
  2: { ar: 'فهم', en: 'Understand' },
  3: { ar: 'تطبيق', en: 'Apply' },
  4: { ar: 'تحليل', en: 'Analyze' },
  5: { ar: 'تقييم', en: 'Evaluate' },
  6: { ar: 'إبداع', en: 'Create' },
};

// Map question types to their primary Bloom's level
export function getBloomLevel(type: QuestionType): BloomLevel {
  switch (type) {
    case 'multiple-choice': return 1;
    case 'matching': return 1;
    case 'reorder': return 2;
    case 'input': return 3;
    case 'reading-word': return 4;
    case 'reading-highlight': return 4;
    case 'reading-list-extraction': return 5;
    case 'reading-ai-opinion': return 6;
  }
}

// Subject categories for radar chart grouping (8 axes)
export interface SubjectCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  color: string;
  subjects: string[];
}

export const SUBJECT_CATEGORIES: SubjectCategory[] = [
  {
    id: 'math',
    nameAr: 'الرياضيات',
    nameEn: 'Mathematics',
    color: '#3B82F6',
    subjects: ['رياضيات'],
  },
  {
    id: 'languages',
    nameAr: 'اللغات',
    nameEn: 'Languages',
    color: '#8B5CF6',
    subjects: ['لغات', 'لغة عربية', 'لغة إنجليزية', 'لغة فرنسية'],
  },
  {
    id: 'sciences',
    nameAr: 'العلوم',
    nameEn: 'Sciences',
    color: '#EC4899',
    subjects: ['علوم', 'فيزياء', 'كيمياء', 'أحياء', 'علوم الأرض'],
  },
  {
    id: 'social',
    nameAr: 'الدراسات الاجتماعية',
    nameEn: 'Social Studies',
    color: '#14B8A6',
    subjects: ['جغرافيا', 'تاريخ'],
  },
  {
    id: 'islamic',
    nameAr: 'التربية الإسلامية',
    nameEn: 'Islamic Studies',
    color: '#22C55E',
    subjects: ['تربية إسلامية'],
  },
  {
    id: 'tech',
    nameAr: 'التقنية',
    nameEn: 'Technology',
    color: '#0EA5E9',
    subjects: ['حاسوب'],
  },
  {
    id: 'arts',
    nameAr: 'الفنون والثقافة',
    nameEn: 'Arts & Culture',
    color: '#D946EF',
    subjects: ['فنون', 'ثقافة عامة'],
  },
  {
    id: 'general',
    nameAr: 'المعارف العامة',
    nameEn: 'General Knowledge',
    color: '#F59E0B',
    subjects: ['معلومات', 'ترتيب', 'حيوانات', 'تربية مالية', 'تربية رياضية'],
  },
];

// Find which category a subject belongs to
export function getCategoryForSubject(subject: string): SubjectCategory | undefined {
  return SUBJECT_CATEGORIES.find(c => c.subjects.includes(subject));
}

// Skill taxonomy: each question maps to a specific skill
export interface SkillDef {
  questionId: number;
  subject: string;
  lesson: string;
  skillCode: string;     // Short code e.g. "MATH-ADD-01"
  skillNameAr: string;
  skillNameEn: string;
  domain: string;         // Grouping within subject (e.g. "Arithmetic")
  domainAr: string;
  domainEn: string;
  bloomLevel: BloomLevel;
  questionType: QuestionType;
  maxPoints: number;
}

// Full taxonomy for all 34 questions
export const SKILL_TAXONOMY: SkillDef[] = [
  // --- رياضيات (Mathematics) ---
  {
    questionId: 1, subject: 'رياضيات', lesson: 'الجمع',
    skillCode: 'MATH-ADD', skillNameAr: 'جمع الأعداد', skillNameEn: 'Addition',
    domain: 'arithmetic', domainAr: 'الحساب', domainEn: 'Arithmetic',
    bloomLevel: 3, questionType: 'input', maxPoints: 10,
  },
  {
    questionId: 5, subject: 'رياضيات', lesson: 'الطرح',
    skillCode: 'MATH-SUB', skillNameAr: 'طرح الأعداد', skillNameEn: 'Subtraction',
    domain: 'arithmetic', domainAr: 'الحساب', domainEn: 'Arithmetic',
    bloomLevel: 3, questionType: 'input', maxPoints: 15,
  },
  {
    questionId: 12, subject: 'رياضيات', lesson: 'الأعداد',
    skillCode: 'MATH-NUM', skillNameAr: 'كتابة الأعداد', skillNameEn: 'Number Writing',
    domain: 'numbers', domainAr: 'الأعداد', domainEn: 'Numbers',
    bloomLevel: 3, questionType: 'input', maxPoints: 10,
  },

  // --- لغات (Languages - General) ---
  {
    questionId: 2, subject: 'لغات', lesson: 'مفردات عامة',
    skillCode: 'LANG-VOCAB', skillNameAr: 'المفردات العامة', skillNameEn: 'General Vocabulary',
    domain: 'vocabulary', domainAr: 'المفردات', domainEn: 'Vocabulary',
    bloomLevel: 1, questionType: 'matching', maxPoints: 20,
  },
  {
    questionId: 7, subject: 'لغات', lesson: 'الألوان',
    skillCode: 'LANG-COLOR', skillNameAr: 'ألوان باللغتين', skillNameEn: 'Colors Bilingual',
    domain: 'vocabulary', domainAr: 'المفردات', domainEn: 'Vocabulary',
    bloomLevel: 1, questionType: 'matching', maxPoints: 20,
  },
  // Reading: Coffee
  {
    questionId: 26, subject: 'لغات', lesson: 'فهم المقروء: القهوة',
    skillCode: 'LANG-RC-C1', skillNameAr: 'تحديد معلومة من النص', skillNameEn: 'Locate Info in Text',
    domain: 'reading', domainAr: 'فهم المقروء', domainEn: 'Reading Comprehension',
    bloomLevel: 4, questionType: 'reading-word', maxPoints: 15,
  },
  {
    questionId: 27, subject: 'لغات', lesson: 'فهم المقروء: القهوة',
    skillCode: 'LANG-RC-C2', skillNameAr: 'تحديد جملة محورية', skillNameEn: 'Identify Key Sentence',
    domain: 'reading', domainAr: 'فهم المقروء', domainEn: 'Reading Comprehension',
    bloomLevel: 4, questionType: 'reading-highlight', maxPoints: 20,
  },
  {
    questionId: 28, subject: 'لغات', lesson: 'فهم المقروء: القهوة',
    skillCode: 'LANG-RC-C3', skillNameAr: 'إيجاد مصطلح في النص', skillNameEn: 'Find Term in Text',
    domain: 'reading', domainAr: 'فهم المقروء', domainEn: 'Reading Comprehension',
    bloomLevel: 4, questionType: 'reading-word', maxPoints: 15,
  },
  {
    questionId: 29, subject: 'لغات', lesson: 'فهم المقروء: القهوة',
    skillCode: 'LANG-RC-C4', skillNameAr: 'استخراج معلومات متعددة', skillNameEn: 'Extract Multiple Facts',
    domain: 'reading', domainAr: 'فهم المقروء', domainEn: 'Reading Comprehension',
    bloomLevel: 5, questionType: 'reading-list-extraction', maxPoints: 25,
  },
  {
    questionId: 30, subject: 'لغات', lesson: 'فهم المقروء: القهوة',
    skillCode: 'LANG-RC-C5', skillNameAr: 'إبداء رأي مبني على النص', skillNameEn: 'Text-Based Opinion',
    domain: 'reading', domainAr: 'فهم المقروء', domainEn: 'Reading Comprehension',
    bloomLevel: 6, questionType: 'reading-ai-opinion', maxPoints: 30,
  },
  // Reading: Languages
  {
    questionId: 31, subject: 'لغات', lesson: 'فهم المقروء: اللغات',
    skillCode: 'LANG-RC-L1', skillNameAr: 'تحديد كلمة مفتاحية', skillNameEn: 'Find Keyword',
    domain: 'reading', domainAr: 'فهم المقروء', domainEn: 'Reading Comprehension',
    bloomLevel: 4, questionType: 'reading-word', maxPoints: 15,
  },
  {
    questionId: 32, subject: 'لغات', lesson: 'فهم المقروء: اللغات',
    skillCode: 'LANG-RC-L2', skillNameAr: 'تحديد فكرة رئيسية', skillNameEn: 'Identify Main Idea',
    domain: 'reading', domainAr: 'فهم المقروء', domainEn: 'Reading Comprehension',
    bloomLevel: 4, questionType: 'reading-highlight', maxPoints: 20,
  },
  {
    questionId: 33, subject: 'لغات', lesson: 'فهم المقروء: اللغات',
    skillCode: 'LANG-RC-L3', skillNameAr: 'استخلاص صفات من النص', skillNameEn: 'Extract Attributes',
    domain: 'reading', domainAr: 'فهم المقروء', domainEn: 'Reading Comprehension',
    bloomLevel: 5, questionType: 'reading-list-extraction', maxPoints: 25,
  },
  {
    questionId: 34, subject: 'لغات', lesson: 'فهم المقروء: اللغات',
    skillCode: 'LANG-RC-L4', skillNameAr: 'تعبير إبداعي عن رأي', skillNameEn: 'Creative Expression',
    domain: 'reading', domainAr: 'فهم المقروء', domainEn: 'Reading Comprehension',
    bloomLevel: 6, questionType: 'reading-ai-opinion', maxPoints: 30,
  },

  // --- ثقافة عامة ---
  {
    questionId: 3, subject: 'ثقافة عامة', lesson: 'الطبيعة',
    skillCode: 'GEN-NAT', skillNameAr: 'معرفة الطبيعة', skillNameEn: 'Nature Knowledge',
    domain: 'nature', domainAr: 'الطبيعة', domainEn: 'Nature',
    bloomLevel: 1, questionType: 'multiple-choice', maxPoints: 10,
  },

  // --- ترتيب ---
  {
    questionId: 4, subject: 'ترتيب', lesson: 'الجمل المفيدة',
    skillCode: 'ORD-SENT', skillNameAr: 'ترتيب الجمل', skillNameEn: 'Sentence Ordering',
    domain: 'ordering', domainAr: 'الترتيب', domainEn: 'Ordering',
    bloomLevel: 2, questionType: 'reorder', maxPoints: 15,
  },
  {
    questionId: 9, subject: 'ترتيب', lesson: 'الأرقام',
    skillCode: 'ORD-NUM', skillNameAr: 'ترتيب الأعداد', skillNameEn: 'Number Ordering',
    domain: 'ordering', domainAr: 'الترتيب', domainEn: 'Ordering',
    bloomLevel: 2, questionType: 'reorder', maxPoints: 15,
  },

  // --- معلومات ---
  {
    questionId: 6, subject: 'معلومات', lesson: 'الوقت',
    skillCode: 'INFO-TIME', skillNameAr: 'مفاهيم الوقت', skillNameEn: 'Time Concepts',
    domain: 'general-info', domainAr: 'معلومات عامة', domainEn: 'General Info',
    bloomLevel: 1, questionType: 'multiple-choice', maxPoints: 10,
  },

  // --- حيوانات ---
  {
    questionId: 8, subject: 'حيوانات', lesson: 'حيوانات الغابة',
    skillCode: 'ANI-FOREST', skillNameAr: 'حيوانات الغابة', skillNameEn: 'Forest Animals',
    domain: 'animals', domainAr: 'الحيوانات', domainEn: 'Animals',
    bloomLevel: 1, questionType: 'multiple-choice', maxPoints: 10,
  },

  // --- جغرافيا ---
  {
    questionId: 10, subject: 'جغرافيا', lesson: 'العالم العربي',
    skillCode: 'GEO-ARAB', skillNameAr: 'معالم العالم العربي', skillNameEn: 'Arab World Landmarks',
    domain: 'geography', domainAr: 'جغرافيا', domainEn: 'Geography',
    bloomLevel: 1, questionType: 'multiple-choice', maxPoints: 10,
  },

  // --- علوم ---
  {
    questionId: 11, subject: 'علوم', lesson: 'البيئة',
    skillCode: 'SCI-ENV', skillNameAr: 'الكائنات وبيئتها', skillNameEn: 'Organisms & Environment',
    domain: 'environment', domainAr: 'البيئة', domainEn: 'Environment',
    bloomLevel: 1, questionType: 'matching', maxPoints: 20,
  },

  // --- تاريخ ---
  {
    questionId: 13, subject: 'تاريخ', lesson: 'العلماء المسلمون',
    skillCode: 'HIST-SCHOLARS', skillNameAr: 'العلماء المسلمون', skillNameEn: 'Muslim Scholars',
    domain: 'islamic-history', domainAr: 'التاريخ الإسلامي', domainEn: 'Islamic History',
    bloomLevel: 1, questionType: 'multiple-choice', maxPoints: 15,
  },

  // --- فيزياء ---
  {
    questionId: 14, subject: 'فيزياء', lesson: 'القوى',
    skillCode: 'PHY-FORCE', skillNameAr: 'وحدات القياس', skillNameEn: 'Units of Measurement',
    domain: 'mechanics', domainAr: 'الميكانيكا', domainEn: 'Mechanics',
    bloomLevel: 3, questionType: 'input', maxPoints: 20,
  },

  // --- كيمياء ---
  {
    questionId: 15, subject: 'كيمياء', lesson: 'العناصر',
    skillCode: 'CHEM-ELEM', skillNameAr: 'الرموز الكيميائية', skillNameEn: 'Chemical Symbols',
    domain: 'elements', domainAr: 'العناصر', domainEn: 'Elements',
    bloomLevel: 3, questionType: 'input', maxPoints: 15,
  },

  // --- تربية إسلامية ---
  {
    questionId: 16, subject: 'تربية إسلامية', lesson: 'أركان الإسلام',
    skillCode: 'ISL-PILLARS', skillNameAr: 'أركان الإسلام', skillNameEn: 'Pillars of Islam',
    domain: 'aqeedah', domainAr: 'العقيدة', domainEn: 'Creed',
    bloomLevel: 2, questionType: 'reorder', maxPoints: 25,
  },

  // --- لغة عربية ---
  {
    questionId: 17, subject: 'لغة عربية', lesson: 'الأضداد',
    skillCode: 'ARB-OPP', skillNameAr: 'الأضداد', skillNameEn: 'Antonyms',
    domain: 'vocabulary', domainAr: 'المفردات', domainEn: 'Vocabulary',
    bloomLevel: 1, questionType: 'matching', maxPoints: 20,
  },

  // --- حاسوب ---
  {
    questionId: 18, subject: 'حاسوب', lesson: 'الأساسيات',
    skillCode: 'CS-BASICS', skillNameAr: 'أساسيات الحاسوب', skillNameEn: 'Computer Basics',
    domain: 'basics', domainAr: 'الأساسيات', domainEn: 'Basics',
    bloomLevel: 1, questionType: 'multiple-choice', maxPoints: 10,
  },

  // --- فنون ---
  {
    questionId: 19, subject: 'فنون', lesson: 'الألوان',
    skillCode: 'ART-MIX', skillNameAr: 'خلط الألوان', skillNameEn: 'Color Mixing',
    domain: 'color-theory', domainAr: 'نظرية الألوان', domainEn: 'Color Theory',
    bloomLevel: 1, questionType: 'matching', maxPoints: 20,
  },

  // --- أحياء ---
  {
    questionId: 20, subject: 'أحياء', lesson: 'جسم الإنسان',
    skillCode: 'BIO-BODY', skillNameAr: 'أعضاء الجسم', skillNameEn: 'Body Organs',
    domain: 'human-body', domainAr: 'جسم الإنسان', domainEn: 'Human Body',
    bloomLevel: 1, questionType: 'multiple-choice', maxPoints: 15,
  },

  // --- علوم الأرض ---
  {
    questionId: 21, subject: 'علوم الأرض', lesson: 'القارات',
    skillCode: 'EARTH-CONT', skillNameAr: 'القارات', skillNameEn: 'Continents',
    domain: 'earth', domainAr: 'الأرض', domainEn: 'Earth',
    bloomLevel: 1, questionType: 'multiple-choice', maxPoints: 15,
  },

  // --- لغة إنجليزية ---
  {
    questionId: 22, subject: 'لغة إنجليزية', lesson: 'القواعد',
    skillCode: 'ENG-GRAM', skillNameAr: 'القواعد الإنجليزية', skillNameEn: 'English Grammar',
    domain: 'grammar', domainAr: 'القواعد', domainEn: 'Grammar',
    bloomLevel: 1, questionType: 'multiple-choice', maxPoints: 15,
  },

  // --- لغة فرنسية ---
  {
    questionId: 23, subject: 'لغة فرنسية', lesson: 'التحيات',
    skillCode: 'FRN-GREET', skillNameAr: 'التحيات الفرنسية', skillNameEn: 'French Greetings',
    domain: 'basics', domainAr: 'الأساسيات', domainEn: 'Basics',
    bloomLevel: 1, questionType: 'multiple-choice', maxPoints: 15,
  },

  // --- تربية مالية ---
  {
    questionId: 24, subject: 'تربية مالية', lesson: 'مفاهيم أساسية',
    skillCode: 'FIN-BASIC', skillNameAr: 'المصطلحات المالية', skillNameEn: 'Financial Terms',
    domain: 'finance', domainAr: 'المالية', domainEn: 'Finance',
    bloomLevel: 1, questionType: 'matching', maxPoints: 20,
  },

  // --- تربية رياضية ---
  {
    questionId: 25, subject: 'تربية رياضية', lesson: 'كرة القدم',
    skillCode: 'PE-FOOT', skillNameAr: 'كرة القدم', skillNameEn: 'Football',
    domain: 'sports', domainAr: 'الرياضة', domainEn: 'Sports',
    bloomLevel: 1, questionType: 'multiple-choice', maxPoints: 10,
  },
];

// Helper to get skill by question ID
export function getSkillForQuestion(questionId: number): SkillDef | undefined {
  return SKILL_TAXONOMY.find(s => s.questionId === questionId);
}

// Get all unique subjects from taxonomy
export function getAllSubjects(): string[] {
  return [...new Set(SKILL_TAXONOMY.map(s => s.subject))];
}

// Get skills grouped by subject
export function getSkillsBySubject(): Record<string, SkillDef[]> {
  const grouped: Record<string, SkillDef[]> = {};
  for (const skill of SKILL_TAXONOMY) {
    if (!grouped[skill.subject]) grouped[skill.subject] = [];
    grouped[skill.subject].push(skill);
  }
  return grouped;
}

// Get all unique domains
export function getAllDomains(): { domain: string; domainAr: string; domainEn: string; subject: string }[] {
  const seen = new Set<string>();
  const result: { domain: string; domainAr: string; domainEn: string; subject: string }[] = [];
  for (const skill of SKILL_TAXONOMY) {
    const key = `${skill.subject}::${skill.domain}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push({ domain: skill.domain, domainAr: skill.domainAr, domainEn: skill.domainEn, subject: skill.subject });
    }
  }
  return result;
}
