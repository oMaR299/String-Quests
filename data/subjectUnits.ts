// Dummy unit hierarchy: Subject → Units → Lessons
// Each unit groups related lessons within a subject

export interface SubjectUnit {
  id: string;
  nameAr: string;
  nameEn: string;
  emoji: string;
  lessons: string[]; // lesson names matching Question.lesson
}

export const SUBJECT_UNITS: Record<string, SubjectUnit[]> = {
  "رياضيات": [
    { id: "math-ops", nameAr: "العمليات الحسابية", nameEn: "Arithmetic", emoji: "🔢", lessons: ["الجمع", "الطرح", "الأعداد"] },
  ],
  "لغات": [
    { id: "lang-vocab", nameAr: "المفردات", nameEn: "Vocabulary", emoji: "🗣️", lessons: ["مفردات عامة", "الألوان"] },
    { id: "lang-reading", nameAr: "فهم المقروء", nameEn: "Reading Comprehension", emoji: "📖", lessons: ["فهم المقروء: اللغات", "فهم المقروء: القهوة"] },
  ],
  "ثقافة عامة": [
    { id: "culture-nature", nameAr: "الثقافة العامة", nameEn: "General Culture", emoji: "🌍", lessons: ["الطبيعة"] },
  ],
  "ترتيب": [
    { id: "order-basics", nameAr: "أساسيات الترتيب", nameEn: "Ordering Basics", emoji: "🔃", lessons: ["الجمل المفيدة", "الأرقام"] },
  ],
  "معلومات": [
    { id: "info-time", nameAr: "معلومات عامة", nameEn: "General Information", emoji: "🧠", lessons: ["الوقت"] },
  ],
  "حيوانات": [
    { id: "animals-forest", nameAr: "عالم الحيوان", nameEn: "Animal Kingdom", emoji: "🦁", lessons: ["حيوانات الغابة"] },
  ],
  "جغرافيا": [
    { id: "geo-arab", nameAr: "الجغرافيا", nameEn: "Geography", emoji: "🗺️", lessons: ["العالم العربي"] },
  ],
  "علوم": [
    { id: "sci-env", nameAr: "العلوم الطبيعية", nameEn: "Natural Sciences", emoji: "🧪", lessons: ["البيئة"] },
  ],
  "تاريخ": [
    { id: "hist-scholars", nameAr: "التاريخ الإسلامي", nameEn: "Islamic History", emoji: "🏺", lessons: ["العلماء المسلمون"] },
  ],
  "فيزياء": [
    { id: "phys-forces", nameAr: "القوى والحركة", nameEn: "Forces & Motion", emoji: "⚡", lessons: ["القوى"] },
  ],
  "كيمياء": [
    { id: "chem-elements", nameAr: "العناصر الكيميائية", nameEn: "Chemical Elements", emoji: "🧪", lessons: ["العناصر"] },
  ],
  "تربية إسلامية": [
    { id: "islam-pillars", nameAr: "أسس الإسلام", nameEn: "Islamic Foundations", emoji: "🕌", lessons: ["أركان الإسلام"] },
  ],
  "لغة عربية": [
    { id: "arabic-grammar", nameAr: "البلاغة والنحو", nameEn: "Grammar & Rhetoric", emoji: "📖", lessons: ["الأضداد"] },
  ],
  "حاسوب": [
    { id: "cs-basics", nameAr: "أساسيات الحاسوب", nameEn: "Computer Basics", emoji: "💻", lessons: ["الأساسيات"] },
  ],
  "فنون": [
    { id: "arts-colors", nameAr: "عالم الألوان", nameEn: "World of Colors", emoji: "🎨", lessons: ["الألوان"] },
  ],
  "أحياء": [
    { id: "bio-human", nameAr: "جسم الإنسان", nameEn: "Human Body", emoji: "🧬", lessons: ["جسم الإنسان"] },
  ],
  "علوم الأرض": [
    { id: "earth-continents", nameAr: "الجيولوجيا", nameEn: "Geology", emoji: "🌋", lessons: ["القارات"] },
  ],
  "لغة إنجليزية": [
    { id: "eng-grammar", nameAr: "القواعد الإنجليزية", nameEn: "English Grammar", emoji: "🇬🇧", lessons: ["القواعد"] },
  ],
  "لغة فرنسية": [
    { id: "fr-greetings", nameAr: "أساسيات الفرنسية", nameEn: "French Basics", emoji: "🇫🇷", lessons: ["التحيات"] },
  ],
  "تربية مالية": [
    { id: "fin-basics", nameAr: "المفاهيم المالية", nameEn: "Financial Concepts", emoji: "💰", lessons: ["مفاهيم أساسية"] },
  ],
  "تربية رياضية": [
    { id: "pe-football", nameAr: "الرياضة والصحة", nameEn: "Sports & Health", emoji: "⚽", lessons: ["كرة القدم"] },
  ],
};

// Helper: get units for a subject (fallback to auto-generated single unit)
export function getUnitsForSubject(subjectAr: string): SubjectUnit[] {
  return SUBJECT_UNITS[subjectAr] || [
    { id: `auto-${subjectAr}`, nameAr: subjectAr, nameEn: subjectAr, emoji: "✨", lessons: [] },
  ];
}
