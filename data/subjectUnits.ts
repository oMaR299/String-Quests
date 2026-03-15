// Subject → Units → Lessons hierarchy
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
    { id: "math-advanced", nameAr: "العمليات المتقدمة", nameEn: "Advanced Operations", emoji: "✖️", lessons: ["الضرب", "القسمة"] },
  ],
  "لغات": [
    { id: "lang-vocab", nameAr: "المفردات", nameEn: "Vocabulary", emoji: "🗣️", lessons: ["مفردات عامة", "الألوان", "الأفعال"] },
    { id: "lang-reading", nameAr: "فهم المقروء", nameEn: "Reading Comprehension", emoji: "📖", lessons: ["فهم المقروء: اللغات", "فهم المقروء: القهوة"] },
    { id: "lang-structures", nameAr: "التراكيب", nameEn: "Structures", emoji: "🧩", lessons: ["الجمل"] },
  ],
  "ثقافة عامة": [
    { id: "culture-nature", nameAr: "الثقافة العامة", nameEn: "General Culture", emoji: "🌍", lessons: ["الطبيعة"] },
    { id: "culture-space", nameAr: "الفضاء", nameEn: "Space", emoji: "🚀", lessons: ["الفضاء"] },
  ],
  "ترتيب": [
    { id: "order-basics", nameAr: "أساسيات الترتيب", nameEn: "Ordering Basics", emoji: "🔃", lessons: ["الجمل المفيدة", "الأرقام"] },
  ],
  "معلومات": [
    { id: "info-general", nameAr: "معلومات عامة", nameEn: "General Information", emoji: "🧠", lessons: ["الوقت", "حقائق علمية"] },
  ],
  "حيوانات": [
    { id: "animals-forest", nameAr: "حيوانات البر", nameEn: "Land Animals", emoji: "🦁", lessons: ["حيوانات الغابة"] },
    { id: "animals-sea", nameAr: "حيوانات البحر", nameEn: "Sea Animals", emoji: "🐬", lessons: ["حيوانات البحر"] },
  ],
  "جغرافيا": [
    { id: "geo-arab", nameAr: "الجغرافيا العربية", nameEn: "Arab Geography", emoji: "🗺️", lessons: ["العالم العربي"] },
    { id: "geo-continents", nameAr: "القارات", nameEn: "Continents", emoji: "🌏", lessons: ["القارات"] },
  ],
  "علوم": [
    { id: "sci-env", nameAr: "العلوم الطبيعية", nameEn: "Natural Sciences", emoji: "🧪", lessons: ["البيئة"] },
    { id: "sci-water", nameAr: "علوم الماء", nameEn: "Water Science", emoji: "💧", lessons: ["الماء"] },
  ],
  "تاريخ": [
    { id: "hist-scholars", nameAr: "التاريخ الإسلامي", nameEn: "Islamic History", emoji: "🏺", lessons: ["العلماء المسلمون"] },
    { id: "hist-ancient", nameAr: "الحضارات القديمة", nameEn: "Ancient Civilizations", emoji: "🏛️", lessons: ["الحضارات القديمة"] },
  ],
  "فيزياء": [
    { id: "phys-forces", nameAr: "القوى والحركة", nameEn: "Forces & Motion", emoji: "⚡", lessons: ["القوى"] },
    { id: "phys-energy", nameAr: "الطاقة", nameEn: "Energy", emoji: "☀️", lessons: ["الطاقة"] },
  ],
  "كيمياء": [
    { id: "chem-elements", nameAr: "العناصر الكيميائية", nameEn: "Chemical Elements", emoji: "🧪", lessons: ["العناصر"] },
    { id: "chem-states", nameAr: "حالات المادة", nameEn: "States of Matter", emoji: "🧊", lessons: ["الحالات"] },
  ],
  "تربية إسلامية": [
    { id: "islam-pillars", nameAr: "أسس الإسلام", nameEn: "Islamic Foundations", emoji: "🕌", lessons: ["أركان الإسلام"] },
    { id: "islam-faith", nameAr: "أركان الإيمان", nameEn: "Pillars of Faith", emoji: "✨", lessons: ["أركان الإيمان"] },
  ],
  "لغة عربية": [
    { id: "arabic-vocab", nameAr: "المعاني والألفاظ", nameEn: "Meanings & Words", emoji: "📖", lessons: ["الأضداد", "المترادفات"] },
    { id: "arabic-grammar", nameAr: "النحو والصرف", nameEn: "Grammar", emoji: "✏️", lessons: ["الأفعال"] },
  ],
  "حاسوب": [
    { id: "cs-basics", nameAr: "أساسيات الحاسوب", nameEn: "Computer Basics", emoji: "💻", lessons: ["الأساسيات"] },
    { id: "cs-internet", nameAr: "الإنترنت", nameEn: "Internet", emoji: "🌐", lessons: ["الإنترنت"] },
  ],
  "فنون": [
    { id: "arts-colors", nameAr: "عالم الألوان", nameEn: "World of Colors", emoji: "🎨", lessons: ["الألوان"] },
    { id: "arts-drawing", nameAr: "الرسم", nameEn: "Drawing", emoji: "✏️", lessons: ["الرسم"] },
  ],
  "أحياء": [
    { id: "bio-human", nameAr: "جسم الإنسان", nameEn: "Human Body", emoji: "🧬", lessons: ["جسم الإنسان"] },
    { id: "bio-plants", nameAr: "النباتات", nameEn: "Plants", emoji: "🌱", lessons: ["النباتات"] },
  ],
  "علوم الأرض": [
    { id: "earth-continents", nameAr: "الجيولوجيا", nameEn: "Geology", emoji: "🌋", lessons: ["القارات"] },
    { id: "earth-volcanoes", nameAr: "البراكين", nameEn: "Volcanoes", emoji: "🌋", lessons: ["البراكين"] },
  ],
  "لغة إنجليزية": [
    { id: "eng-grammar", nameAr: "القواعد الإنجليزية", nameEn: "English Grammar", emoji: "🇬🇧", lessons: ["القواعد"] },
    { id: "eng-vocab", nameAr: "المفردات الإنجليزية", nameEn: "English Vocabulary", emoji: "📚", lessons: ["المفردات"] },
  ],
  "لغة فرنسية": [
    { id: "fr-greetings", nameAr: "أساسيات الفرنسية", nameEn: "French Basics", emoji: "🇫🇷", lessons: ["التحيات"] },
    { id: "fr-numbers", nameAr: "الأرقام الفرنسية", nameEn: "French Numbers", emoji: "🔢", lessons: ["الأرقام الفرنسية"] },
  ],
  "تربية مالية": [
    { id: "fin-basics", nameAr: "المفاهيم المالية", nameEn: "Financial Concepts", emoji: "💰", lessons: ["مفاهيم أساسية"] },
    { id: "fin-saving", nameAr: "الادخار", nameEn: "Saving", emoji: "🏦", lessons: ["الادخار"] },
  ],
  "تربية رياضية": [
    { id: "pe-football", nameAr: "كرة القدم", nameEn: "Football", emoji: "⚽", lessons: ["كرة القدم"] },
    { id: "pe-olympics", nameAr: "الألعاب الأولمبية", nameEn: "Olympics", emoji: "🏅", lessons: ["الرياضات الأولمبية"] },
  ],
};

// Helper: get units for a subject (fallback to auto-generated single unit)
export function getUnitsForSubject(subjectAr: string): SubjectUnit[] {
  return SUBJECT_UNITS[subjectAr] || [
    { id: `auto-${subjectAr}`, nameAr: subjectAr, nameEn: subjectAr, emoji: "✨", lessons: [] },
  ];
}
