import type {
  Campus, ExtendedStudent, ExtendedTeacher,
  AttendanceRecord, AttendanceStatus, ClassAttendance,
  DailyAttendanceSummary, TeacherDailyActivity, TeacherAction, TeacherActionType,
  TeacherComplianceRecord,
} from '../types/admin';

// ============================================================================
// Seeded PRNG — deterministic across page loads
// ============================================================================

function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rng = createRng(42);

// ============================================================================
// Date Utilities
// ============================================================================

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 5 || day === 6; // Friday + Saturday (Saudi Arabia)
}

function getSchoolDays(count: number): string[] {
  const days: string[] = [];
  const today = new Date();
  // Walk backwards to find school days
  const d = new Date(today);
  while (isWeekend(d)) d.setDate(d.getDate() - 1);
  // Collect `count` school days ending at d
  const end = new Date(d);
  const candidate = new Date(end);
  candidate.setDate(candidate.getDate() - 60); // go far enough back
  while (candidate <= end) {
    if (!isWeekend(candidate)) days.push(formatDate(candidate));
    candidate.setDate(candidate.getDate() + 1);
  }
  return days.slice(-count);
}

const SCHOOL_DAYS_30 = getSchoolDays(30);
const SCHOOL_DAYS_14 = SCHOOL_DAYS_30.slice(-14);

// ============================================================================
// Campuses
// ============================================================================

export const CAMPUSES: Campus[] = [
  { id: 'camp-1', name: 'مبنى النور (بنين)', nameEn: 'Al-Noor Building (Boys)', type: 'boys', principalName: 'د. عبدالله العمر', studentCount: 900, teacherCount: 12 },
  { id: 'camp-2', name: 'مبنى النور (بنات)', nameEn: 'Al-Noor Building (Girls)', type: 'girls', principalName: 'أ. نوره الخالد', studentCount: 900, teacherCount: 12 },
  { id: 'camp-3', name: 'أكاديمية المستقبل', nameEn: 'Future Academy', type: 'international', principalName: 'أ. سعود المحمدي', studentCount: 528, teacherCount: 12 },
];

// ============================================================================
// Name Pools
// ============================================================================

const BOYS_FIRST_NAMES = [
  'أحمد', 'محمد', 'خالد', 'عمر', 'يوسف', 'بندر', 'فيصل', 'سعود', 'طارق', 'عبدالله',
  'سلطان', 'فهد', 'زياد', 'تركي', 'ماجد', 'وليد', 'صالح', 'عبدالعزيز', 'ناصر', 'بدر',
  'سعد', 'حمد', 'مشاري', 'راشد', 'عادل', 'نايف', 'مهند', 'ياسر', 'إبراهيم', 'حسن',
  'عبدالرحمن', 'مالك', 'حمزة', 'أيمن', 'ريان', 'هاني', 'نواف', 'لؤي', 'منصور', 'داود',
  'باسم', 'جابر', 'سامي', 'رائد', 'معاذ', 'أنس', 'كريم', 'شهاب', 'وائل', 'عماد',
  'سليمان', 'علي', 'حاتم', 'آدم', 'رامي', 'غسان', 'قاسم', 'مازن', 'هشام', 'فارس',
  'أسامة', 'ثامر', 'صهيب', 'عمار',
];

const BOYS_FAMILY_NAMES = [
  'السالم', 'الحربي', 'يوسف', 'الفاروق', 'الرشيد', 'العتيبي', 'الدوسري', 'المالكي',
  'الشمري', 'الجهني', 'المطيري', 'الغامدي', 'الطويل', 'الماجد', 'البلوي', 'الجبر',
  'النجار', 'القحطاني', 'السبيعي', 'الشهري', 'الزهراني', 'العنزي', 'الخالدي', 'المنصور',
  'الثبيتي', 'الحازمي', 'الشريف', 'البقمي', 'الأسمري', 'العمري', 'القرني', 'المالكي',
  'الوادعي', 'الخثعمي', 'الحارثي', 'الفيفي', 'الكلبي', 'الرويلي', 'السلمي', 'الزايدي',
  'التميمي', 'الهاجري', 'العجمي', 'الكندي',
];

const GIRLS_FIRST_NAMES = [
  'فاطمة', 'سارة', 'نورة', 'ليلى', 'ريم', 'دانة', 'منى', 'هند', 'لمى', 'شيماء',
  'أميرة', 'غدير', 'رنا', 'هيا', 'أمينة', 'نجلاء', 'لولوة', 'عائشة', 'مها', 'رقية',
  'سلمى', 'حنان', 'نوف', 'جميلة', 'أمل', 'خلود', 'سمر', 'وجدان', 'رغد', 'لين',
  'جوري', 'شذى', 'بيان', 'تالا', 'ديما', 'رهف', 'لجين', 'مشاعل', 'عبير', 'هاجر',
  'ميساء', 'وعد', 'يارا', 'زينب', 'مريم', 'آلاء', 'إسراء', 'بثينة', 'حصة', 'دلال',
  'رؤى', 'سديم', 'صفية', 'عفاف', 'غادة', 'فجر', 'كوثر', 'ملاك', 'ناديا', 'هنادي',
  'وفاء', 'ياسمين', 'أروى', 'بسمة',
];

const GIRLS_FAMILY_NAMES = [
  'العمر', 'العلي', 'السعد', 'الرشيد', 'الشمري', 'الغامدي', 'السبيعي', 'المالكي',
  'الصالح', 'الحسن', 'النجار', 'الثبيتي', 'الشهري', 'الزهراني', 'الحربي', 'القحطاني',
  'المنصور', 'الدوسري', 'العتيبي', 'الجهني', 'الخالد', 'المطيري', 'البقمي', 'العنزي',
  'الغامدي', 'الحازمي', 'الشريف', 'الأسمري', 'العمري', 'القرني', 'الوادعي', 'الخثعمي',
  'الحارثي', 'الفيفي', 'التميمي', 'الهاجري', 'العجمي', 'الرويلي', 'السلمي', 'الزايدي',
  'السالم', 'الكندي', 'البلوي', 'الماجد',
];

const INTL_FIRST_NAMES = [
  'Adam', 'Sara', 'Omar', 'Layla', 'Yousef', 'Nora', 'Khalid', 'Fatima', 'Bandar', 'Reem',
  'Tariq', 'Dana', 'Faisal', 'Haya', 'Walid', 'Amira', 'Saleh', 'Lulwa', 'Abdulaziz', 'Maha',
  'Zain', 'Lina', 'Hamza', 'Dania', 'Rayan', 'Joud', 'Sami', 'Nadia', 'Majed', 'Tala',
  'Ibrahim', 'Ghada', 'Hassan', 'Reema', 'Sultan', 'Jana', 'Nawaf', 'Mais', 'Turki', 'Aseel',
  'Fahd', 'Deema', 'Nasser', 'Lujain', 'Saad', 'Mashael', 'Badr', 'Rawan', 'Mishary', 'Alanoud',
  'Ali', 'Raneem', 'Hamad', 'Shahd', 'Dawood', 'Arwa', 'Basem', 'Bushra', 'Jaber', 'Hala',
  'Raed', 'Yara', 'Muath', 'Bayan',
];

const INTL_FAMILY_NAMES = [
  'Al-Salem', 'Hassan', 'Khalid', 'Ahmed', 'Ali', 'Mohammed', 'Ibrahim', 'Saleh', 'Nasser', 'Fahd',
  'Saud', 'Sultan', 'Majed', 'Turki', 'Adel', 'Badr', 'Hamad', 'Mishari', 'Rashid', 'Saad',
  'Al-Harbi', 'Al-Otaibi', 'Al-Dosari', 'Al-Shammari', 'Al-Johani', 'Al-Mutairi', 'Al-Ghamdi',
  'Al-Shahri', 'Al-Zahrani', 'Al-Anzi', 'Al-Khalidi', 'Al-Mansour', 'Al-Thobaiti', 'Al-Hazmi',
  'Al-Sharif', 'Al-Qahtani', 'Al-Subaie', 'Al-Maliki', 'Al-Balawi', 'Al-Jabr', 'Al-Najjar',
  'Al-Omari', 'Al-Tamimi', 'Al-Hajri',
];

// ============================================================================
// Subjects
// ============================================================================

const SUBJECTS: { ar: string; en: string }[] = [
  { ar: 'رياضيات', en: 'Math' },
  { ar: 'علوم', en: 'Science' },
  { ar: 'لغة عربية', en: 'Arabic' },
  { ar: 'لغة إنجليزية', en: 'English' },
  { ar: 'تاريخ', en: 'History' },
  { ar: 'تربية إسلامية', en: 'Islamic Studies' },
  { ar: 'حاسب آلي', en: 'Computer Science' },
  { ar: 'تربية بدنية', en: 'Physical Education' },
];

// ============================================================================
// Student Generation
// ============================================================================

function generateName(firstNames: string[], familyNames: string[], index: number): string {
  // Use offset to avoid identical combos when first/family lengths overlap
  const fi = index % firstNames.length;
  const fli = (Math.floor(index / firstNames.length) + index * 7) % familyNames.length;
  return `${firstNames[fi]} ${familyNames[fli]}`;
}

function generateStudents(): ExtendedStudent[] {
  const students: ExtendedStudent[] = [];
  let id = 1;

  const camp1Sections = ['A', 'B', 'C', 'D', 'E', 'F'];
  const camp2Sections = ['A', 'B', 'C', 'D', 'E', 'F'];
  const camp3Sections = ['A', 'B', 'C', 'D'];

  // Campus 1 (boys): grades 1-6, 6 sections, ~25 per class
  for (let g = 1; g <= 6; g++) {
    for (const sec of camp1Sections) {
      const count = 24 + Math.floor(rng() * 3); // 24-26
      for (let s = 0; s < count; s++) {
        const name = generateName(BOYS_FIRST_NAMES, BOYS_FAMILY_NAMES, id);
        students.push({
          id: `stu-${id}`,
          name,
          nameEn: `Student ${id}`,
          grade: g,
          section: sec,
          campusId: 'camp-1',
          parentName: `ولي أمر ${name}`,
          enrolledSpaces: SUBJECTS.map(sub => `space-c1-${g}${sec}-${sub.ar}`),
        });
        id++;
      }
    }
  }

  // Campus 2 (girls): grades 1-6, 6 sections, ~25 per class
  for (let g = 1; g <= 6; g++) {
    for (const sec of camp2Sections) {
      const count = 24 + Math.floor(rng() * 3); // 24-26
      for (let s = 0; s < count; s++) {
        const name = generateName(GIRLS_FIRST_NAMES, GIRLS_FAMILY_NAMES, id);
        students.push({
          id: `stu-${id}`,
          name,
          nameEn: `Student ${id}`,
          grade: g,
          section: sec,
          campusId: 'camp-2',
          parentName: `ولية أمر ${name}`,
          enrolledSpaces: SUBJECTS.map(sub => `space-c2-${g}${sec}-${sub.ar}`),
        });
        id++;
      }
    }
  }

  // Campus 3 (international): grades 7-12, 4 sections, ~22 per class
  for (let g = 7; g <= 12; g++) {
    for (const sec of camp3Sections) {
      const count = 21 + Math.floor(rng() * 3); // 21-23
      for (let s = 0; s < count; s++) {
        const name = generateName(INTL_FIRST_NAMES, INTL_FAMILY_NAMES, id);
        students.push({
          id: `stu-${id}`,
          name,
          nameEn: name,
          grade: g,
          section: sec,
          campusId: 'camp-3',
          parentName: `Parent of ${name}`,
          enrolledSpaces: SUBJECTS.map(sub => `space-c3-${g}${sec}-${sub.ar}`),
        });
        id++;
      }
    }
  }

  return students;
}

export const EXTENDED_STUDENTS = generateStudents();

// ============================================================================
// Student Lookup Maps (for fast queries)
// ============================================================================

const studentById = new Map<string, ExtendedStudent>();
const studentsByCampus = new Map<string, ExtendedStudent[]>();
const studentsByClassKey = new Map<string, ExtendedStudent[]>();

for (const s of EXTENDED_STUDENTS) {
  studentById.set(s.id, s);

  if (!studentsByCampus.has(s.campusId)) studentsByCampus.set(s.campusId, []);
  studentsByCampus.get(s.campusId)!.push(s);

  const classKey = `${s.campusId}-${s.grade}-${s.section}`;
  if (!studentsByClassKey.has(classKey)) studentsByClassKey.set(classKey, []);
  studentsByClassKey.get(classKey)!.push(s);
}

// ============================================================================
// Teachers (36 total: 12 per campus)
// ============================================================================

interface TeacherDef {
  name: string;
  nameEn: string;
  subject: string;
  subjectEn: string;
  campusId: string;
  grades: number[];
}

const TEACHER_DEFS: TeacherDef[] = [
  // Camp-1 (boys) — 12 teachers
  { name: 'أحمد المحمد', nameEn: 'Ahmed Al-Mohammed', subject: 'رياضيات', subjectEn: 'Math', campusId: 'camp-1', grades: [1, 2, 3] },
  { name: 'سعيد الحربي', nameEn: 'Saeed Al-Harbi', subject: 'علوم', subjectEn: 'Science', campusId: 'camp-1', grades: [1, 2, 3] },
  { name: 'خالد المنصور', nameEn: 'Khalid Al-Mansour', subject: 'لغة عربية', subjectEn: 'Arabic', campusId: 'camp-1', grades: [1, 2, 3] },
  { name: 'عمر الفاروق', nameEn: 'Omar Al-Farouq', subject: 'تربية إسلامية', subjectEn: 'Islamic Studies', campusId: 'camp-1', grades: [1, 2, 3] },
  { name: 'ياسر القحطاني', nameEn: 'Yasser Al-Qahtani', subject: 'لغة إنجليزية', subjectEn: 'English', campusId: 'camp-1', grades: [1, 2, 3] },
  { name: 'منصور الغامدي', nameEn: 'Mansour Al-Ghamdi', subject: 'حاسب آلي', subjectEn: 'Computer Science', campusId: 'camp-1', grades: [1, 2, 3] },
  { name: 'فهد الدوسري', nameEn: 'Fahd Al-Dosari', subject: 'رياضيات', subjectEn: 'Math', campusId: 'camp-1', grades: [4, 5, 6] },
  { name: 'عبدالله السالم', nameEn: 'Abdullah Al-Salem', subject: 'علوم', subjectEn: 'Science', campusId: 'camp-1', grades: [4, 5, 6] },
  { name: 'ناصر العتيبي', nameEn: 'Nasser Al-Otaibi', subject: 'لغة عربية', subjectEn: 'Arabic', campusId: 'camp-1', grades: [4, 5, 6] },
  { name: 'سلطان المطيري', nameEn: 'Sultan Al-Mutairi', subject: 'تاريخ', subjectEn: 'History', campusId: 'camp-1', grades: [4, 5, 6] },
  { name: 'بدر الشهري', nameEn: 'Badr Al-Shahri', subject: 'تربية إسلامية', subjectEn: 'Islamic Studies', campusId: 'camp-1', grades: [4, 5, 6] },
  { name: 'حمد الزهراني', nameEn: 'Hamad Al-Zahrani', subject: 'تربية بدنية', subjectEn: 'Physical Education', campusId: 'camp-1', grades: [1, 2, 3, 4, 5, 6] },

  // Camp-2 (girls) — 12 teachers
  { name: 'نورة السعد', nameEn: 'Noura Al-Saad', subject: 'رياضيات', subjectEn: 'Math', campusId: 'camp-2', grades: [1, 2, 3] },
  { name: 'رنا البيطار', nameEn: 'Rana Al-Baytar', subject: 'علوم', subjectEn: 'Science', campusId: 'camp-2', grades: [1, 2, 3] },
  { name: 'هدى العمري', nameEn: 'Huda Al-Omari', subject: 'لغة عربية', subjectEn: 'Arabic', campusId: 'camp-2', grades: [1, 2, 3] },
  { name: 'فاطمة حسن', nameEn: 'Fatima Hassan', subject: 'تربية إسلامية', subjectEn: 'Islamic Studies', campusId: 'camp-2', grades: [1, 2, 3] },
  { name: 'منى الشمري', nameEn: 'Mona Al-Shammari', subject: 'لغة إنجليزية', subjectEn: 'English', campusId: 'camp-2', grades: [1, 2, 3] },
  { name: 'ليلى سمير', nameEn: 'Layla Samir', subject: 'حاسب آلي', subjectEn: 'Computer Science', campusId: 'camp-2', grades: [1, 2, 3] },
  { name: 'سارة العلي', nameEn: 'Sara Al-Ali', subject: 'رياضيات', subjectEn: 'Math', campusId: 'camp-2', grades: [4, 5, 6] },
  { name: 'أمل الحربي', nameEn: 'Amal Al-Harbi', subject: 'علوم', subjectEn: 'Science', campusId: 'camp-2', grades: [4, 5, 6] },
  { name: 'جميلة الزهراني', nameEn: 'Jamila Al-Zahrani', subject: 'لغة عربية', subjectEn: 'Arabic', campusId: 'camp-2', grades: [4, 5, 6] },
  { name: 'خلود المالكي', nameEn: 'Kholoud Al-Maliki', subject: 'تاريخ', subjectEn: 'History', campusId: 'camp-2', grades: [4, 5, 6] },
  { name: 'وفاء القرني', nameEn: 'Wafa Al-Qarni', subject: 'تربية إسلامية', subjectEn: 'Islamic Studies', campusId: 'camp-2', grades: [4, 5, 6] },
  { name: 'غدير الثبيتي', nameEn: 'Ghadeer Al-Thobaiti', subject: 'تربية بدنية', subjectEn: 'Physical Education', campusId: 'camp-2', grades: [1, 2, 3, 4, 5, 6] },

  // Camp-3 (international) — 12 teachers
  { name: 'طارق العنزي', nameEn: 'Tariq Al-Anzi', subject: 'رياضيات', subjectEn: 'Math', campusId: 'camp-3', grades: [7, 8, 9] },
  { name: 'بندر الخالدي', nameEn: 'Bandar Al-Khalidi', subject: 'علوم', subjectEn: 'Science', campusId: 'camp-3', grades: [7, 8, 9] },
  { name: 'ريما الشهري', nameEn: 'Rima Al-Shahri', subject: 'لغة إنجليزية', subjectEn: 'English', campusId: 'camp-3', grades: [7, 8, 9] },
  { name: 'محمود عباس', nameEn: 'Mahmoud Abbas', subject: 'تاريخ', subjectEn: 'History', campusId: 'camp-3', grades: [7, 8, 9] },
  { name: 'سعود الأسمري', nameEn: 'Saud Al-Asmari', subject: 'تربية إسلامية', subjectEn: 'Islamic Studies', campusId: 'camp-3', grades: [7, 8, 9] },
  { name: 'عبدالرحمن الجبر', nameEn: 'Abdulrahman Al-Jabr', subject: 'حاسب آلي', subjectEn: 'Computer Science', campusId: 'camp-3', grades: [7, 8, 9, 10, 11, 12] },
  { name: 'فيصل الدوسري', nameEn: 'Faisal Al-Dosari', subject: 'رياضيات', subjectEn: 'Math', campusId: 'camp-3', grades: [10, 11, 12] },
  { name: 'هاني السلمي', nameEn: 'Hani Al-Sulami', subject: 'علوم', subjectEn: 'Science', campusId: 'camp-3', grades: [10, 11, 12] },
  { name: 'مازن التميمي', nameEn: 'Mazen Al-Tamimi', subject: 'لغة عربية', subjectEn: 'Arabic', campusId: 'camp-3', grades: [10, 11, 12] },
  { name: 'غسان الهاجري', nameEn: 'Ghassan Al-Hajri', subject: 'لغة إنجليزية', subjectEn: 'English', campusId: 'camp-3', grades: [10, 11, 12] },
  { name: 'رائد البلوي', nameEn: 'Raed Al-Balawi', subject: 'تاريخ', subjectEn: 'History', campusId: 'camp-3', grades: [10, 11, 12] },
  { name: 'أيمن الرويلي', nameEn: 'Ayman Al-Ruwaili', subject: 'تربية بدنية', subjectEn: 'Physical Education', campusId: 'camp-3', grades: [7, 8, 9, 10, 11, 12] },
];

function buildSections(campusId: string): string[] {
  return campusId === 'camp-3' ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C', 'D', 'E', 'F'];
}

export const EXTENDED_TEACHERS: ExtendedTeacher[] = TEACHER_DEFS.map((t, i) => ({
  id: `tch-${i + 1}`,
  name: t.name,
  nameEn: t.nameEn,
  campusId: t.campusId,
  subject: t.subject,
  subjectEn: t.subjectEn,
  spaces: t.grades.flatMap(g => buildSections(t.campusId).map(s => `space-${g}${s}-${t.subject}`)),
  grades: t.grades,
}));

// ============================================================================
// Chronic Absence Students (8-10 students with 25-35% absence)
// ============================================================================

const CHRONIC_ABSENT_IDS = new Set<string>();
// Pick students spread across all campuses
const chronicIndices = [2, 30, 75, 150, 400, 950, 1200, 1500, 1800, 2100];
for (const idx of chronicIndices) {
  if (EXTENDED_STUDENTS[idx]) CHRONIC_ABSENT_IDS.add(EXTENDED_STUDENTS[idx].id);
}

// Classes with naturally worse attendance (add ~3% extra absence)
const BAD_CLASS_KEYS = new Set<string>();
const badClassCandidates = ['camp-1-2-D', 'camp-1-5-F', 'camp-2-3-B', 'camp-2-6-E', 'camp-3-9-C', 'camp-3-11-A'];
for (const k of badClassCandidates) BAD_CLASS_KEYS.add(k);

// ============================================================================
// Attendance Record Generation (with indexed Maps for fast lookup)
// ============================================================================

const attendanceByDate = new Map<string, AttendanceRecord[]>();
const attendanceByStudent = new Map<string, AttendanceRecord[]>();
const allAttendanceRecords: AttendanceRecord[] = [];

function generateAllAttendance(): void {
  for (const dateStr of SCHOOL_DAYS_30) {
    const dateParts = dateStr.split('-').map(Number);
    const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const isSunday = dateObj.getDay() === 0;
    const dateRecords: AttendanceRecord[] = [];

    for (const student of EXTENDED_STUDENTS) {
      let status: AttendanceStatus = 'present';
      let lateTime: string | undefined;

      const r = rng();
      const isChronic = CHRONIC_ABSENT_IDS.has(student.id);
      const classKey = `${student.campusId}-${student.grade}-${student.section}`;
      const isBadClass = BAD_CLASS_KEYS.has(classKey);
      const badClassBonus = isBadClass ? 0.03 : 0;

      if (isChronic) {
        // 25-35% absence
        if (r < 0.30) status = 'absent';
        else if (r < 0.38) {
          status = 'late';
          lateTime = `07:${String(30 + Math.floor(rng() * 25)).padStart(2, '0')}`;
        }
      } else if (isSunday) {
        // Sundays: 3-5% more absence
        if (r < 0.06 + badClassBonus) status = 'absent';
        else if (r < 0.12 + badClassBonus) {
          status = 'late';
          lateTime = `07:${String(25 + Math.floor(rng() * 30)).padStart(2, '0')}`;
        }
      } else {
        // Normal: 2-4% absence, 3-5% late
        if (r < 0.03 + badClassBonus) status = 'absent';
        else if (r < 0.07 + badClassBonus) {
          status = 'late';
          lateTime = `07:${String(20 + Math.floor(rng() * 35)).padStart(2, '0')}`;
        }
      }

      // Pick a teacher as the marker
      const campusTeachers = EXTENDED_TEACHERS.filter(t => t.campusId === student.campusId);
      const marker = campusTeachers.length > 0
        ? campusTeachers[Math.floor(rng() * campusTeachers.length)].id
        : 'system';

      const record: AttendanceRecord = {
        studentId: student.id,
        date: dateStr,
        status,
        lateTime,
        markedBy: marker,
        markedAt: `${dateStr}T07:15:00`,
      };

      dateRecords.push(record);
      allAttendanceRecords.push(record);

      // Index by student
      if (!attendanceByStudent.has(student.id)) attendanceByStudent.set(student.id, []);
      attendanceByStudent.get(student.id)!.push(record);
    }

    attendanceByDate.set(dateStr, dateRecords);
  }
}

generateAllAttendance();

// Legacy export — consumers import this directly
export const ATTENDANCE_RECORDS = allAttendanceRecords;

// ============================================================================
// Teacher Compliance Records (30 days x 36 teachers x 5 periods)
// ============================================================================

// Teachers with consistently low compliance (<70%)
const LOW_COMPLIANCE_TEACHER_IDS = new Set<string>(['tch-3', 'tch-16', 'tch-27', 'tch-34']);

function generateTeacherCompliance(): TeacherComplianceRecord[] {
  const records: TeacherComplianceRecord[] = [];

  for (const dateStr of SCHOOL_DAYS_30) {
    for (const teacher of EXTENDED_TEACHERS) {
      const isLow = LOW_COMPLIANCE_TEACHER_IDS.has(teacher.id);
      const periods = [1, 2, 3, 4, 5];

      for (const period of periods) {
        const r = rng();
        // Low compliance teachers: 50-65% submit rate; others: 88-97%
        const submitted = isLow ? (r < 0.58) : (r < 0.93);
        const spaceIdx = Math.floor(rng() * teacher.spaces.length);
        const spaceId = teacher.spaces[spaceIdx] || `space-default-${teacher.id}`;

        const rec: TeacherComplianceRecord = {
          teacherId: teacher.id,
          date: dateStr,
          spaceId,
          period,
          submitted,
        };

        if (submitted) {
          // Submitted sometime during that period (period hours roughly 7+period)
          const hour = 7 + period;
          const min = Math.floor(rng() * 50);
          rec.submittedAt = `${dateStr}T${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`;
        }

        records.push(rec);
      }
    }
  }

  return records;
}

export const TEACHER_COMPLIANCE_RECORDS = generateTeacherCompliance();

// ============================================================================
// Teacher Activity Data (14 days)
// ============================================================================

const ACTION_TYPES: TeacherActionType[] = ['login', 'mark_attendance', 'open_space', 'review_quiz', 'view_student', 'post_content'];

export const ACTION_LABELS: Record<TeacherActionType, string> = {
  login: 'تسجيل دخول',
  mark_attendance: 'تسجيل الحضور',
  open_space: 'فتح مساحة تعليمية',
  review_quiz: 'مراجعة اختبارات',
  view_student: 'عرض ملف طالب',
  post_content: 'نشر محتوى',
};

function generateTeacherActivity(): TeacherDailyActivity[] {
  const activities: TeacherDailyActivity[] = [];

  for (const dateStr of SCHOOL_DAYS_14) {
    for (const teacher of EXTENDED_TEACHERS) {
      const isActive = rng() > 0.08; // 92% active rate
      if (!isActive) {
        activities.push({ teacherId: teacher.id, date: dateStr, totalMinutes: 0, actions: [], sessionsCount: 0 });
        continue;
      }

      const loginHour = 6 + Math.floor(rng() * 2); // 6-7 AM
      const loginMin = Math.floor(rng() * 60);
      const firstLogin = `${String(loginHour).padStart(2, '0')}:${String(loginMin).padStart(2, '0')}`;
      const totalMinutes = 60 + Math.floor(rng() * 240); // 1-5 hours
      const actionCount = 3 + Math.floor(rng() * 8);

      const actions: TeacherAction[] = [];
      actions.push({
        teacherId: teacher.id,
        type: 'login',
        timestamp: `${dateStr}T${firstLogin}:00`,
        details: '',
      });

      for (let a = 1; a < actionCount; a++) {
        const type = ACTION_TYPES[1 + Math.floor(rng() * (ACTION_TYPES.length - 1))];
        const hour = loginHour + 1 + Math.floor(rng() * 6);
        const min = Math.floor(rng() * 60);
        const detail =
          type === 'mark_attendance' ? `الصف ${teacher.grades[Math.floor(rng() * teacher.grades.length)]}` :
          type === 'open_space' ? teacher.subject :
          type === 'review_quiz' ? `${Math.floor(rng() * 10) + 1} اختبارات` : '';

        actions.push({
          teacherId: teacher.id,
          type,
          timestamp: `${dateStr}T${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`,
          details: detail,
        });
      }

      activities.push({
        teacherId: teacher.id,
        date: dateStr,
        firstLogin,
        totalMinutes,
        actions,
        sessionsCount: 1 + Math.floor(rng() * 3),
      });
    }
  }

  return activities;
}

export const TEACHER_ACTIVITIES = generateTeacherActivity();

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get attendance records for a specific date, optionally filtered by campus/grade/section.
 */
export function getAttendanceForDate(
  date: string,
  campusId?: string,
  grade?: number,
  section?: string,
): AttendanceRecord[] {
  let records = attendanceByDate.get(date) || [];

  if (campusId && campusId !== 'all') {
    const campusStudentIds = new Set((studentsByCampus.get(campusId) || []).map(s => s.id));
    records = records.filter(r => campusStudentIds.has(r.studentId));
  }
  if (grade != null) {
    const gradeStudentIds = new Set(
      EXTENDED_STUDENTS.filter(s =>
        s.grade === grade && (!campusId || campusId === 'all' || s.campusId === campusId)
      ).map(s => s.id)
    );
    records = records.filter(r => gradeStudentIds.has(r.studentId));
  }
  if (section) {
    const sectionStudentIds = new Set(
      EXTENDED_STUDENTS.filter(s =>
        s.section === section &&
        (grade == null || s.grade === grade) &&
        (!campusId || campusId === 'all' || s.campusId === campusId)
      ).map(s => s.id)
    );
    records = records.filter(r => sectionStudentIds.has(r.studentId));
  }

  return records;
}

/**
 * Get a daily attendance summary for a date, optionally filtered by campus.
 */
export function getDailySummary(date: string, campusId?: string): DailyAttendanceSummary {
  const records = getAttendanceForDate(date, campusId);
  const present = records.filter(r => r.status === 'present').length;
  const absent = records.filter(r => r.status === 'absent').length;
  const late = records.filter(r => r.status === 'late').length;
  const excused = records.filter(r => r.excuseReason).length;
  const total = records.length;

  return {
    date,
    totalStudents: total,
    present,
    absent,
    late,
    excused,
    rate: total > 0 ? Math.round(((present + late) / total) * 1000) / 10 : 0,
  };
}

/**
 * Get attendance details for a specific class on a specific date.
 */
export function getClassAttendance(
  date: string,
  grade: number,
  section: string,
  campusId?: string,
): ClassAttendance {
  const classStudents = EXTENDED_STUDENTS.filter(s =>
    s.grade === grade && s.section === section && (!campusId || campusId === 'all' || s.campusId === campusId)
  );
  const studentIds = new Set(classStudents.map(s => s.id));
  const dateRecords = attendanceByDate.get(date) || [];
  const records = dateRecords.filter(r => studentIds.has(r.studentId));

  const present = records.filter(r => r.status === 'present').length;
  const absent = records.filter(r => r.status === 'absent').length;
  const late = records.filter(r => r.status === 'late').length;
  const total = records.length;

  return {
    grade,
    section,
    campusId: campusId || 'all',
    date,
    totalStudents: total,
    present,
    absent,
    late,
    rate: total > 0 ? Math.round(((present + late) / total) * 1000) / 10 : 0,
    absentStudents: records.filter(r => r.status === 'absent').map(r => r.studentId),
    lateStudents: records.filter(r => r.status === 'late').map(r => ({ id: r.studentId, time: r.lateTime || '' })),
  };
}

/**
 * Get all attendance records for a specific student, optionally within a date range.
 */
export function getStudentAttendance(
  studentId: string,
  dateFrom?: string,
  dateTo?: string,
): AttendanceRecord[] {
  let records = attendanceByStudent.get(studentId) || [];
  if (dateFrom) records = records.filter(r => r.date >= dateFrom);
  if (dateTo) records = records.filter(r => r.date <= dateTo);
  return records.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get teacher daily activity for a specific date, optionally filtered by campus.
 */
export function getTeacherActivityForDate(date: string, campusId?: string): TeacherDailyActivity[] {
  let activities = TEACHER_ACTIVITIES.filter(a => a.date === date);
  if (campusId && campusId !== 'all') {
    const teacherIds = new Set(EXTENDED_TEACHERS.filter(t => t.campusId === campusId).map(t => t.id));
    activities = activities.filter(a => teacherIds.has(a.teacherId));
  }
  return activities;
}

/**
 * Get teacher compliance records for a specific date, optionally filtered by campus.
 */
export function getTeacherComplianceForDate(date: string, campusId?: string): TeacherComplianceRecord[] {
  let records = TEACHER_COMPLIANCE_RECORDS.filter(r => r.date === date);
  if (campusId && campusId !== 'all') {
    const teacherIds = new Set(EXTENDED_TEACHERS.filter(t => t.campusId === campusId).map(t => t.id));
    records = records.filter(r => teacherIds.has(r.teacherId));
  }
  return records;
}

/**
 * Get today's date as a string, falling back to the most recent school day.
 */
export function getTodayString(): string {
  const today = new Date();
  while (isWeekend(today)) today.setDate(today.getDate() - 1);
  return formatDate(today);
}
