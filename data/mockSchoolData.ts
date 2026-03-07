// Mock school data for teacher/parent/principal views
// 25 students across 5 classes (3A, 3B, 3C, 4A, 4B)

import { SKILL_TAXONOMY } from './skillTaxonomy';

export interface MockStudent {
  id: string;
  nameAr: string;
  nameEn: string;
  classId: string;
  grade: number;
  masteries: Record<string, number>; // skillCode -> masteryScore 0-100
  weeklySkills: string[]; // skillCodes learned this week
}

export interface MockClass {
  id: string;
  nameAr: string;
  nameEn: string;
  grade: number;
  teacherNameAr: string;
  teacherNameEn: string;
  studentIds: string[];
}

// Skill codes used for KC mastery tracking (subset of SKILL_TAXONOMY)
export const TRACKED_KCS = [
  'MATH-ADD', 'MATH-SUB', 'MATH-NUM',
  'LANG-VOCAB', 'LANG-COLOR', 'LANG-RC-C1', 'LANG-RC-C4',
  'GEN-NAT', 'ORD-SENT',
  'SCI-ENV', 'HIST-SCHOLARS', 'ISL-PILLARS',
  'ARB-OPP', 'CS-BASICS', 'BIO-BODY',
];

// Generate realistic mastery score with a given center bias
function genMastery(bias: 'strong' | 'mid' | 'weak' | 'random'): number {
  const r = () => Math.random();
  switch (bias) {
    case 'strong': return Math.min(100, Math.round(75 + r() * 25));
    case 'mid':    return Math.round(45 + r() * 40);
    case 'weak':   return Math.round(r() * 45);
    case 'random': {
      const roll = r();
      if (roll < 0.05) return 0;                         // unstarted
      if (roll < 0.15) return Math.round(r() * 39);      // attempted
      if (roll < 0.45) return Math.round(40 + r() * 29); // developing
      if (roll < 0.75) return Math.round(70 + r() * 19); // proficient
      return Math.round(90 + r() * 10);                  // mastered
    }
  }
}

function genMasteries(profile: 'strong' | 'mid' | 'weak'): Record<string, number> {
  const result: Record<string, number> = {};
  for (const kc of TRACKED_KCS) {
    // Inject some KC-specific weaknesses for alert demo
    if (kc === 'LANG-RC-C4' && profile !== 'strong') {
      result[kc] = Math.round(Math.random() * 30); // Most students weak here
    } else if (kc === 'ISL-PILLARS' && profile === 'weak') {
      result[kc] = Math.round(Math.random() * 25);
    } else {
      result[kc] = genMastery(profile === 'strong' ? 'strong' : profile === 'weak' ? 'weak' : 'random');
    }
  }
  return result;
}

export const MOCK_STUDENTS: MockStudent[] = [
  // Class 3A — mixed ability
  {
    id: 's01', nameAr: 'أحمد السالم', nameEn: 'Ahmed Al-Salem',
    classId: '3A', grade: 3,
    masteries: genMasteries('strong'),
    weeklySkills: ['MATH-ADD', 'LANG-VOCAB', 'SCI-ENV'],
  },
  {
    id: 's02', nameAr: 'فاطمة العمر', nameEn: 'Fatima Al-Omar',
    classId: '3A', grade: 3,
    masteries: genMasteries('mid'),
    weeklySkills: ['MATH-SUB', 'ARB-OPP'],
  },
  {
    id: 's03', nameAr: 'ليلى الرشيد', nameEn: 'Layla Al-Rashid',
    classId: '3A', grade: 3,
    masteries: genMasteries('mid'),
    weeklySkills: ['LANG-COLOR', 'HIST-SCHOLARS'],
  },
  {
    id: 's04', nameAr: 'عمر الزهراني', nameEn: 'Omar Al-Zahrani',
    classId: '3A', grade: 3,
    masteries: genMasteries('weak'),
    weeklySkills: ['MATH-ADD'],
  },
  {
    id: 's05', nameAr: 'نورة القحطاني', nameEn: 'Nora Al-Qahtani',
    classId: '3A', grade: 3,
    masteries: genMasteries('strong'),
    weeklySkills: ['ISL-PILLARS', 'CS-BASICS', 'BIO-BODY'],
  },

  // Class 3B — slightly stronger
  {
    id: 's06', nameAr: 'يوسف الحربي', nameEn: 'Yousef Al-Harbi',
    classId: '3B', grade: 3,
    masteries: genMasteries('strong'),
    weeklySkills: ['MATH-ADD', 'MATH-SUB', 'SCI-ENV'],
  },
  {
    id: 's07', nameAr: 'سارة المطيري', nameEn: 'Sara Al-Mutairi',
    classId: '3B', grade: 3,
    masteries: genMasteries('mid'),
    weeklySkills: ['ARB-OPP', 'LANG-RC-C1'],
  },
  {
    id: 's08', nameAr: 'محمد الدوسري', nameEn: 'Mohammed Al-Dosari',
    classId: '3B', grade: 3,
    masteries: genMasteries('strong'),
    weeklySkills: ['CS-BASICS', 'HIST-SCHOLARS'],
  },
  {
    id: 's09', nameAr: 'ريم الشمري', nameEn: 'Reem Al-Shammari',
    classId: '3B', grade: 3,
    masteries: genMasteries('mid'),
    weeklySkills: ['BIO-BODY', 'GEN-NAT'],
  },
  {
    id: 's10', nameAr: 'خالد العجمي', nameEn: 'Khalid Al-Ajmi',
    classId: '3B', grade: 3,
    masteries: genMasteries('weak'),
    weeklySkills: ['MATH-ADD'],
  },

  // Class 3C — struggling class
  {
    id: 's11', nameAr: 'دانة الغامدي', nameEn: 'Dana Al-Ghamdi',
    classId: '3C', grade: 3,
    masteries: genMasteries('weak'),
    weeklySkills: ['LANG-VOCAB'],
  },
  {
    id: 's12', nameAr: 'عبدالله الفهد', nameEn: 'Abdullah Al-Fahd',
    classId: '3C', grade: 3,
    masteries: genMasteries('weak'),
    weeklySkills: ['MATH-NUM'],
  },
  {
    id: 's13', nameAr: 'منى السبيعي', nameEn: 'Mona Al-Subai',
    classId: '3C', grade: 3,
    masteries: genMasteries('mid'),
    weeklySkills: ['ORD-SENT', 'GEN-NAT'],
  },
  {
    id: 's14', nameAr: 'طارق الزيد', nameEn: 'Tariq Al-Zaid',
    classId: '3C', grade: 3,
    masteries: genMasteries('weak'),
    weeklySkills: ['SCI-ENV'],
  },
  {
    id: 's15', nameAr: 'هند المالكي', nameEn: 'Hind Al-Maliki',
    classId: '3C', grade: 3,
    masteries: genMasteries('mid'),
    weeklySkills: ['ARB-OPP', 'BIO-BODY'],
  },

  // Class 4A — high performing
  {
    id: 's16', nameAr: 'لمى الصالح', nameEn: 'Lama Al-Saleh',
    classId: '4A', grade: 4,
    masteries: genMasteries('strong'),
    weeklySkills: ['LANG-RC-C1', 'LANG-RC-C4', 'HIST-SCHOLARS'],
  },
  {
    id: 's17', nameAr: 'بندر العتيبي', nameEn: 'Bandar Al-Otaibi',
    classId: '4A', grade: 4,
    masteries: genMasteries('strong'),
    weeklySkills: ['MATH-ADD', 'MATH-SUB', 'MATH-NUM'],
  },
  {
    id: 's18', nameAr: 'شيماء الحسن', nameEn: 'Shaima Al-Hassan',
    classId: '4A', grade: 4,
    masteries: genMasteries('strong'),
    weeklySkills: ['ISL-PILLARS', 'ARB-OPP'],
  },
  {
    id: 's19', nameAr: 'وليد الجبر', nameEn: 'Walid Al-Jabr',
    classId: '4A', grade: 4,
    masteries: genMasteries('mid'),
    weeklySkills: ['CS-BASICS', 'SCI-ENV'],
  },
  {
    id: 's20', nameAr: 'أميرة النجار', nameEn: 'Amira Al-Najjar',
    classId: '4A', grade: 4,
    masteries: genMasteries('strong'),
    weeklySkills: ['BIO-BODY', 'GEN-NAT', 'LANG-COLOR'],
  },

  // Class 4B — mixed
  {
    id: 's21', nameAr: 'صالح البلوي', nameEn: 'Saleh Al-Balawi',
    classId: '4B', grade: 4,
    masteries: genMasteries('mid'),
    weeklySkills: ['MATH-ADD', 'ORD-SENT'],
  },
  {
    id: 's22', nameAr: 'غدير الثبيتي', nameEn: 'Ghadir Al-Thubaiti',
    classId: '4B', grade: 4,
    masteries: genMasteries('strong'),
    weeklySkills: ['LANG-RC-C1', 'HIST-SCHOLARS'],
  },
  {
    id: 's23', nameAr: 'عبدالعزيز الجهني', nameEn: 'Abdulaziz Al-Juhani',
    classId: '4B', grade: 4,
    masteries: genMasteries('weak'),
    weeklySkills: ['GEN-NAT'],
  },
  {
    id: 's24', nameAr: 'رنا الشهري', nameEn: 'Rana Al-Shahri',
    classId: '4B', grade: 4,
    masteries: genMasteries('mid'),
    weeklySkills: ['CS-BASICS', 'BIO-BODY', 'SCI-ENV'],
  },
  {
    id: 's25', nameAr: 'فيصل المنصور', nameEn: 'Faisal Al-Mansour',
    classId: '4B', grade: 4,
    masteries: genMasteries('mid'),
    weeklySkills: ['ARB-OPP', 'ISL-PILLARS'],
  },
];

export const MOCK_CLASSES: MockClass[] = [
  {
    id: '3A', nameAr: 'الصف الثالث (أ)', nameEn: 'Grade 3A',
    grade: 3, teacherNameAr: 'أ. سلمى الخالد', teacherNameEn: 'Ms. Salma Al-Khalid',
    studentIds: ['s01', 's02', 's03', 's04', 's05'],
  },
  {
    id: '3B', nameAr: 'الصف الثالث (ب)', nameEn: 'Grade 3B',
    grade: 3, teacherNameAr: 'أ. رانيا العسيري', teacherNameEn: 'Ms. Rania Al-Asiri',
    studentIds: ['s06', 's07', 's08', 's09', 's10'],
  },
  {
    id: '3C', nameAr: 'الصف الثالث (ج)', nameEn: 'Grade 3C',
    grade: 3, teacherNameAr: 'أ. هالة المهدي', teacherNameEn: 'Ms. Hala Al-Mahdi',
    studentIds: ['s11', 's12', 's13', 's14', 's15'],
  },
  {
    id: '4A', nameAr: 'الصف الرابع (أ)', nameEn: 'Grade 4A',
    grade: 4, teacherNameAr: 'أ. محمد الشافعي', teacherNameEn: 'Mr. Mohammed Al-Shafi',
    studentIds: ['s16', 's17', 's18', 's19', 's20'],
  },
  {
    id: '4B', nameAr: 'الصف الرابع (ب)', nameEn: 'Grade 4B',
    grade: 4, teacherNameAr: 'أ. أسماء الوهيبي', teacherNameEn: 'Ms. Asmaa Al-Wahaibi',
    studentIds: ['s21', 's22', 's23', 's24', 's25'],
  },
];

// Helpers

export function getStudentsInClass(classId: string): MockStudent[] {
  const cls = MOCK_CLASSES.find(c => c.id === classId);
  if (!cls) return [];
  return MOCK_STUDENTS.filter(s => cls.studentIds.includes(s.id));
}

export function getClassAvgMastery(classId: string, kcCode?: string): number {
  const students = getStudentsInClass(classId);
  if (students.length === 0) return 0;
  if (kcCode) {
    const scores = students.map(s => s.masteries[kcCode] ?? 0);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }
  // Overall average across all KCs
  const allScores = students.flatMap(s => Object.values(s.masteries));
  return Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
}

export function getSchoolAvgMastery(kcCode?: string): number {
  return Math.round(
    MOCK_CLASSES.reduce((sum, cls) => sum + getClassAvgMastery(cls.id, kcCode), 0) / MOCK_CLASSES.length
  );
}

// KCs where >60% of a class scored below 40 (alert threshold)
export function getClassAlerts(classId: string): { kcCode: string; pct: number }[] {
  const students = getStudentsInClass(classId);
  if (students.length === 0) return [];
  const alerts: { kcCode: string; pct: number }[] = [];
  for (const kc of TRACKED_KCS) {
    const weakCount = students.filter(s => (s.masteries[kc] ?? 0) < 40).length;
    const pct = Math.round((weakCount / students.length) * 100);
    if (pct >= 60) alerts.push({ kcCode: kc, pct });
  }
  return alerts;
}

// KC display name helper
export function getKCName(kcCode: string, locale: 'ar' | 'en'): string {
  const skill = SKILL_TAXONOMY.find(s => s.skillCode === kcCode);
  if (!skill) return kcCode;
  return locale === 'ar' ? skill.skillNameAr : skill.skillNameEn;
}

// Subject for a KC
export function getKCSubject(kcCode: string): string {
  return SKILL_TAXONOMY.find(s => s.skillCode === kcCode)?.subject ?? '';
}

// Unique subjects covered by TRACKED_KCS
export const TRACKED_SUBJECTS = [...new Set(
  TRACKED_KCS.map(kc => SKILL_TAXONOMY.find(s => s.skillCode === kc)?.subject ?? '').filter(Boolean)
)];
