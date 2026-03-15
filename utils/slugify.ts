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
  'الضرب': 'multiplication',
  'القسمة': 'division',
  'مفردات عامة': 'general-vocab',
  'الألوان': 'colors',
  'الأفعال': 'verbs',
  'الجمل': 'sentences',
  'فهم المقروء: اللغات': 'reading-languages',
  'فهم المقروء: القهوة': 'reading-coffee',
  'الطبيعة': 'nature',
  'الفضاء': 'space',
  'الجمل المفيدة': 'useful-sentences',
  'الأرقام': 'number-ordering',
  'الوقت': 'time',
  'حقائق علمية': 'science-facts',
  'حيوانات الغابة': 'jungle-animals',
  'حيوانات البحر': 'sea-animals',
  'العالم العربي': 'arab-world',
  'القارات': 'continents',
  'البيئة': 'environment',
  'الماء': 'water',
  'العلماء المسلمون': 'muslim-scholars',
  'الحضارات القديمة': 'ancient-civilizations',
  'القوى': 'forces',
  'الطاقة': 'energy',
  'العناصر': 'elements',
  'الحالات': 'states-of-matter',
  'أركان الإسلام': 'pillars-of-islam',
  'أركان الإيمان': 'pillars-of-faith',
  'الأضداد': 'antonyms',
  'المترادفات': 'synonyms',
  'الأساسيات': 'basics',
  'الإنترنت': 'internet',
  'جسم الإنسان': 'human-body',
  'النباتات': 'plants',
  'القواعد': 'grammar',
  'المفردات': 'vocabulary',
  'التحيات': 'greetings',
  'الأرقام الفرنسية': 'french-numbers',
  'مفاهيم أساسية': 'basic-concepts',
  'الادخار': 'saving',
  'كرة القدم': 'football',
  'الرياضات الأولمبية': 'olympics',
  'الرسم': 'drawing',
  'البراكين': 'volcanoes',
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
