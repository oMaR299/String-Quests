import { DirectoryUser } from '../types/notification';
import { SCHOOLS } from './adminData';
import { MOCK_STUDENTS } from './mockSchoolData';

// Build a unified user directory from existing mock data + new parent/admin records

const teacherUsers: DirectoryUser[] = [
  { id: 't-1', name: 'أحمد المحمد', nameEn: 'Ahmed Al-Mohammed', email: 'ahmed.m@school.edu.sa', role: 'teacher', gradeLevel: 3, section: 'A', campusId: 'sch-1' },
  { id: 't-2', name: 'سارة العلي', nameEn: 'Sara Al-Ali', email: 'sara.a@school.edu.sa', role: 'teacher', gradeLevel: 3, section: 'B', campusId: 'sch-2' },
  { id: 't-3', name: 'خالد يوسف', nameEn: 'Khalid Yousef', email: 'khalid.y@school.edu.sa', role: 'teacher', gradeLevel: 4, section: 'A', campusId: 'sch-3' },
  { id: 't-4', name: 'فاطمة حسن', nameEn: 'Fatima Hassan', email: 'fatima.h@school.edu.sa', role: 'teacher', gradeLevel: 4, section: 'B', campusId: 'sch-1' },
  { id: 't-5', name: 'عمر الفاروق', nameEn: 'Omar Al-Farouq', email: 'omar.f@school.edu.sa', role: 'teacher', gradeLevel: 5, section: 'A', campusId: 'sch-2' },
  { id: 't-6', name: 'ليلى سمير', nameEn: 'Layla Samir', email: 'layla.s@school.edu.sa', role: 'teacher', gradeLevel: 5, section: 'B', campusId: 'sch-3' },
  { id: 't-7', name: 'ياسر القحطاني', nameEn: 'Yasser Al-Qahtani', email: 'yasser.q@school.edu.sa', role: 'teacher', gradeLevel: 6, section: 'A', campusId: 'sch-1' },
  { id: 't-8', name: 'نورة السعد', nameEn: 'Noura Al-Saad', email: 'noura.s@school.edu.sa', role: 'teacher', gradeLevel: 7, section: 'A', campusId: 'sch-2' },
  { id: 't-9', name: 'محمود عباس', nameEn: 'Mahmoud Abbas', email: 'mahmoud.a@school.edu.sa', role: 'teacher', gradeLevel: 8, section: 'A', campusId: 'sch-3' },
  { id: 't-10', name: 'رنا البيطار', nameEn: 'Rana Al-Baytar', email: 'rana.b@school.edu.sa', role: 'teacher', gradeLevel: 9, section: 'A', campusId: 'sch-1' },
  { id: 't-11', name: 'سعيد الغامدي', nameEn: 'Saeed Al-Ghamdi', email: 'saeed.g@school.edu.sa', role: 'teacher', gradeLevel: 10, section: 'A', campusId: 'sch-2' },
  { id: 't-12', name: 'هدى العمري', nameEn: 'Huda Al-Omari', email: 'huda.o@school.edu.sa', role: 'teacher', gradeLevel: 10, section: 'B', campusId: 'sch-3' },
  { id: 't-13', name: 'فيصل الدوسري', nameEn: 'Faisal Al-Dosari', email: 'faisal.d@school.edu.sa', role: 'teacher', gradeLevel: 11, section: 'A', campusId: 'sch-1' },
  { id: 't-14', name: 'منى الشمري', nameEn: 'Mona Al-Shammari', email: 'mona.sh@school.edu.sa', role: 'teacher', gradeLevel: 11, section: 'B', campusId: 'sch-2' },
  { id: 't-15', name: 'طارق العتيبي', nameEn: 'Tariq Al-Otaibi', email: 'tariq.o@school.edu.sa', role: 'teacher', gradeLevel: 12, section: 'A', campusId: 'sch-3' },
];

const studentUsers: DirectoryUser[] = MOCK_STUDENTS.map(s => ({
  id: s.id,
  name: s.nameAr,
  nameEn: s.nameEn,
  email: `${s.id}@student.school.edu.sa`,
  role: 'student' as const,
  gradeLevel: s.grade,
  section: s.classId.replace(/\d+/, ''), // '3A' -> 'A'
  campusId: s.grade <= 3 ? 'sch-1' : 'sch-2',
}));

const parentUsers: DirectoryUser[] = [
  { id: 'p-1', name: 'سالم السالم', nameEn: 'Salem Al-Salem', email: 'salem.parent@gmail.com', role: 'parent', gradeLevel: 3, section: 'A', campusId: 'sch-1' },
  { id: 'p-2', name: 'مريم العمر', nameEn: 'Mariam Al-Omar', email: 'mariam.parent@gmail.com', role: 'parent', gradeLevel: 3, section: 'A', campusId: 'sch-1' },
  { id: 'p-3', name: 'عبدالرحمن الرشيد', nameEn: 'Abdulrahman Al-Rashid', email: 'abdulrahman.parent@gmail.com', role: 'parent', gradeLevel: 3, section: 'A', campusId: 'sch-1' },
  { id: 'p-4', name: 'هيا الزهراني', nameEn: 'Haya Al-Zahrani', email: 'haya.parent@gmail.com', role: 'parent', gradeLevel: 3, section: 'B', campusId: 'sch-1' },
  { id: 'p-5', name: 'ناصر القحطاني', nameEn: 'Nasser Al-Qahtani', email: 'nasser.parent@gmail.com', role: 'parent', gradeLevel: 3, section: 'B', campusId: 'sch-1' },
  { id: 'p-6', name: 'أمينة الحربي', nameEn: 'Amina Al-Harbi', email: 'amina.parent@gmail.com', role: 'parent', gradeLevel: 3, section: 'C', campusId: 'sch-1' },
  { id: 'p-7', name: 'فهد الغامدي', nameEn: 'Fahd Al-Ghamdi', email: 'fahd.parent@gmail.com', role: 'parent', gradeLevel: 3, section: 'C', campusId: 'sch-1' },
  { id: 'p-8', name: 'نجلاء الصالح', nameEn: 'Najla Al-Saleh', email: 'najla.parent@gmail.com', role: 'parent', gradeLevel: 4, section: 'A', campusId: 'sch-2' },
  { id: 'p-9', name: 'ماجد العتيبي', nameEn: 'Majed Al-Otaibi', email: 'majed.parent@gmail.com', role: 'parent', gradeLevel: 4, section: 'A', campusId: 'sch-2' },
  { id: 'p-10', name: 'سميرة الحسن', nameEn: 'Samira Al-Hassan', email: 'samira.parent@gmail.com', role: 'parent', gradeLevel: 4, section: 'B', campusId: 'sch-2' },
  { id: 'p-11', name: 'عادل الجبر', nameEn: 'Adel Al-Jabr', email: 'adel.parent@gmail.com', role: 'parent', gradeLevel: 4, section: 'B', campusId: 'sch-2' },
  { id: 'p-12', name: 'لولوة المنصور', nameEn: 'Lulwa Al-Mansour', email: 'lulwa.parent@gmail.com', role: 'parent', gradeLevel: 5, section: 'A', campusId: 'sch-2' },
  { id: 'p-13', name: 'بدر الشمري', nameEn: 'Badr Al-Shammari', email: 'badr.parent@gmail.com', role: 'parent', gradeLevel: 6, section: 'A', campusId: 'sch-1' },
  { id: 'p-14', name: 'عائشة الدوسري', nameEn: 'Aisha Al-Dosari', email: 'aisha.parent@gmail.com', role: 'parent', gradeLevel: 7, section: 'A', campusId: 'sch-2' },
  { id: 'p-15', name: 'خالد المالكي', nameEn: 'Khalid Al-Maliki', email: 'khalid.parent@gmail.com', role: 'parent', gradeLevel: 8, section: 'A', campusId: 'sch-3' },
  { id: 'p-16', name: 'نوال السبيعي', nameEn: 'Nawal Al-Subai', email: 'nawal.parent@gmail.com', role: 'parent', gradeLevel: 9, section: 'A', campusId: 'sch-1' },
  { id: 'p-17', name: 'تركي البلوي', nameEn: 'Turki Al-Balawi', email: 'turki.parent@gmail.com', role: 'parent', gradeLevel: 10, section: 'A', campusId: 'sch-2' },
  { id: 'p-18', name: 'رقية الثبيتي', nameEn: 'Ruqayya Al-Thubaiti', email: 'ruqayya.parent@gmail.com', role: 'parent', gradeLevel: 10, section: 'B', campusId: 'sch-3' },
  { id: 'p-19', name: 'سلمان الجهني', nameEn: 'Salman Al-Juhani', email: 'salman.parent@gmail.com', role: 'parent', gradeLevel: 11, section: 'A', campusId: 'sch-1' },
  { id: 'p-20', name: 'مها الشهري', nameEn: 'Maha Al-Shahri', email: 'maha.parent@gmail.com', role: 'parent', gradeLevel: 12, section: 'A', campusId: 'sch-3' },
];

const adminUsers: DirectoryUser[] = [
  { id: 'admin-1', name: 'د. عبدالله العمر', nameEn: 'Dr. Abdullah Al-Omar', email: 'admin@school.edu.sa', role: 'admin', campusId: 'all' },
  { id: 'admin-2', name: 'أ. نوره الخالد', nameEn: 'Ms. Noura Al-Khalid', email: 'noura.admin@school.edu.sa', role: 'admin', campusId: 'sch-1' },
  { id: 'admin-3', name: 'أ. سعود المحمدي', nameEn: 'Mr. Saud Al-Mohammadi', email: 'saud.admin@school.edu.sa', role: 'admin', campusId: 'sch-2' },
];

export const USER_DIRECTORY: DirectoryUser[] = [
  ...adminUsers,
  ...teacherUsers,
  ...studentUsers,
  ...parentUsers,
];

export function getUsersByFilter(filter: {
  roles?: string[];
  grades?: number[];
  sections?: string[];
  /**
   * Per-grade section filter. When provided alongside `grades`, narrows
   * each grade independently (e.g. {1: ['A','B'], 2: ['C']}).
   */
  gradeSections?: Record<number, string[]>;
  campusIds?: string[];
  individualIds?: string[];
}): DirectoryUser[] {
  let users = USER_DIRECTORY;

  if (filter.individualIds && filter.individualIds.length > 0) {
    return users.filter(u => filter.individualIds!.includes(u.id));
  }

  if (filter.roles && filter.roles.length > 0) {
    users = users.filter(u => filter.roles!.includes(u.role));
  }

  // Per-grade section filtering takes precedence over the legacy flat
  // sections array — when present, each grade's bucket narrows the match
  // for users *in that grade*. Users in grades not in the map are kept
  // only if `grades` includes them with no per-grade restriction.
  const hasPerGrade =
    filter.gradeSections && Object.keys(filter.gradeSections).length > 0;

  if (hasPerGrade) {
    users = users.filter((u) => {
      // Users without grades (admin) pass through unless `grades` is set.
      if (u.gradeLevel === undefined) {
        return !filter.grades || filter.grades.length === 0;
      }
      const allowedGrades = filter.grades && filter.grades.length > 0
        ? filter.grades
        : Object.keys(filter.gradeSections!).map(Number);
      if (!allowedGrades.includes(u.gradeLevel)) return false;
      const sectionsForGrade = filter.gradeSections![u.gradeLevel];
      // No bucket → grade selected with no sections → exclude (matches
      // validation rule that a grade w/ 0 sections is "incomplete").
      if (!sectionsForGrade || sectionsForGrade.length === 0) return false;
      if (u.section === undefined) return false;
      return sectionsForGrade.includes(u.section);
    });
  } else {
    if (filter.grades && filter.grades.length > 0) {
      users = users.filter(u => u.gradeLevel !== undefined && filter.grades!.includes(u.gradeLevel));
    }
    if (filter.sections && filter.sections.length > 0) {
      users = users.filter(u => u.section !== undefined && filter.sections!.includes(u.section));
    }
  }

  if (filter.campusIds && filter.campusIds.length > 0) {
    users = users.filter(u => u.campusId === 'all' || filter.campusIds!.includes(u.campusId));
  }

  // Deduplicate by id
  const seen = new Set<string>();
  return users.filter(u => {
    if (seen.has(u.id)) return false;
    seen.add(u.id);
    return true;
  });
}

export function estimateAudienceCount(filter: {
  roles?: string[];
  grades?: number[];
  sections?: string[];
  gradeSections?: Record<number, string[]>;
  campusIds?: string[];
  individualIds?: string[];
}): number {
  return getUsersByFilter(filter).length;
}

export { SCHOOLS };
