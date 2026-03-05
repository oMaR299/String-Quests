const SUBJECT_SLUG_MAP: Record<string, string> = {
  'رياضيات': 'math',
  'لغات': 'languages',
  'ثقافة عامة': 'general-knowledge',
  'ترتيب': 'ordering',
  'معلومات': 'info',
  'حيوانات': 'animals',
  'جغرافيا': 'geography',
  'علوم': 'science',
  'تاريخ': 'history',
  'فيزياء': 'physics',
  'كيمياء': 'chemistry',
  'تربية إسلامية': 'islamic-studies',
  'لغة عربية': 'arabic',
  'حاسوب': 'computer',
  'فنون': 'arts',
  'أحياء': 'biology',
  'علوم الأرض': 'earth-science',
  'لغة إنجليزية': 'english',
  'لغة فرنسية': 'french',
  'تربية مالية': 'financial-literacy',
  'تربية رياضية': 'physical-education',
};

const LESSON_SLUG_MAP: Record<string, string> = {
  'الجمع': 'addition',
  'الطرح': 'subtraction',
  'الأعداد': 'numbers',
  'مفردات عامة': 'general-vocab',
  'الألوان': 'colors',
  'فهم المقروء: اللغات': 'reading-languages',
  'فهم المقروء: القهوة': 'reading-coffee',
  'الطبيعة': 'nature',
  'الجمل المفيدة': 'useful-sentences',
  'الأرقام': 'number-ordering',
  'الوقت': 'time',
  'حيوانات الغابة': 'jungle-animals',
  'العالم العربي': 'arab-world',
  'البيئة': 'environment',
  'العلماء المسلمون': 'muslim-scholars',
  'القوى': 'forces',
  'العناصر': 'elements',
  'أركان الإسلام': 'pillars-of-islam',
  'الأضداد': 'antonyms',
  'الأساسيات': 'basics',
  'جسم الإنسان': 'human-body',
  'القارات': 'continents',
  'القواعد': 'grammar',
  'التحيات': 'greetings',
  'مفاهيم أساسية': 'basic-concepts',
  'كرة القدم': 'football',
};

// Reverse maps for URL -> Arabic lookup
const SLUG_TO_SUBJECT: Record<string, string> = {};
const SLUG_TO_LESSON: Record<string, string> = {};

for (const [ar, slug] of Object.entries(SUBJECT_SLUG_MAP)) {
  SLUG_TO_SUBJECT[slug] = ar;
}
for (const [ar, slug] of Object.entries(LESSON_SLUG_MAP)) {
  SLUG_TO_LESSON[slug] = ar;
}

export function subjectToSlug(subject: string): string {
  return SUBJECT_SLUG_MAP[subject] || subject.toLowerCase().replace(/\s+/g, '-');
}

export function lessonToSlug(lesson: string): string {
  return LESSON_SLUG_MAP[lesson] || lesson.toLowerCase().replace(/\s+/g, '-');
}

export function slugToSubject(slug: string): string {
  return SLUG_TO_SUBJECT[slug] || slug;
}

export function slugToLesson(slug: string): string {
  return SLUG_TO_LESSON[slug] || slug;
}
