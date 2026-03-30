import type {
  Campus, ExtendedStudent, ExtendedTeacher,
  AttendanceRecord, AttendanceStatus, ClassAttendance,
  DailyAttendanceSummary, TeacherDailyActivity, TeacherAction, TeacherActionType,
} from '../types/admin';

// --- Campuses ---

export const CAMPUSES: Campus[] = [
  { id: 'camp-1', name: 'مبنى النور (بنين)', nameEn: 'Al-Noor Building (Boys)', type: 'boys', principalName: 'د. عبدالله العمر', studentCount: 140, teacherCount: 8 },
  { id: 'camp-2', name: 'مبنى النور (بنات)', nameEn: 'Al-Noor Building (Girls)', type: 'girls', principalName: 'أ. نوره الخالد', studentCount: 130, teacherCount: 7 },
  { id: 'camp-3', name: 'أكاديمية المستقبل', nameEn: 'Future Academy', type: 'international', principalName: 'أ. سعود المحمدي', studentCount: 115, teacherCount: 6 },
];

// --- Student Names Pool ---

const BOYS_NAMES = [
  'أحمد السالم', 'محمد الحربي', 'خالد يوسف', 'عمر الفاروق', 'يوسف الرشيد',
  'بندر العتيبي', 'فيصل الدوسري', 'سعود المالكي', 'طارق الشمري', 'عبدالله الجهني',
  'سلطان المطيري', 'فهد الغامدي', 'زياد الطويل', 'تركي الماجد', 'ماجد البلوي',
  'وليد الجبر', 'صالح النجار', 'عبدالعزيز القحطاني', 'ناصر السبيعي', 'بدر الشهري',
  'سعد الزهراني', 'حمد العنزي', 'مشاري الخالدي', 'راشد المنصور', 'عادل الثبيتي',
];
const GIRLS_NAMES = [
  'فاطمة العمر', 'سارة العلي', 'نورة السعد', 'ليلى الرشيد', 'ريم الشمري',
  'دانة الغامدي', 'منى السبيعي', 'هند المالكي', 'لمى الصالح', 'شيماء الحسن',
  'أميرة النجار', 'غدير الثبيتي', 'رنا الشهري', 'هيا الزهراني', 'أمينة الحربي',
  'نجلاء القحطاني', 'لولوة المنصور', 'عائشة الدوسري', 'مها العتيبي', 'رقية الجهني',
  'سلمى الخالد', 'حنان المطيري', 'نوف البقمي', 'جميلة العنزي', 'أمل الغامدي',
];
const INTL_NAMES = [
  'Adam Al-Salem', 'Sara Hassan', 'Omar Khalid', 'Layla Ahmed', 'Yousef Ali',
  'Nora Mohammed', 'Khalid Ibrahim', 'Fatima Saleh', 'Bandar Nasser', 'Reem Fahd',
  'Tariq Saud', 'Dana Sultan', 'Faisal Majed', 'Haya Turki', 'Walid Adel',
  'Amira Badr', 'Saleh Hamad', 'Lulwa Mishari', 'Abdulaziz Rashid', 'Maha Saad',
];

// --- Generate Extended Students (~80 students across grades 1-12) ---

function generateStudents(): ExtendedStudent[] {
  const students: ExtendedStudent[] = [];
  let id = 1;
  const sections = ['A', 'B'];
  const subjects = ['رياضيات', 'علوم', 'لغة عربية', 'لغة إنجليزية', 'تاريخ', 'جغرافيا', 'تربية إسلامية'];

  // Campus 1 (boys): grades 1-6
  for (let g = 1; g <= 6; g++) {
    for (const sec of sections) {
      const count = 3 + Math.floor(Math.random() * 2); // 3-4 students per class
      for (let s = 0; s < count; s++) {
        const nameIdx = (id - 1) % BOYS_NAMES.length;
        students.push({
          id: `stu-${id}`,
          name: BOYS_NAMES[nameIdx],
          nameEn: `Student ${id}`,
          grade: g,
          section: sec,
          campusId: 'camp-1',
          parentName: `ولي أمر ${BOYS_NAMES[nameIdx]}`,
          enrolledSpaces: subjects.map(sub => `space-${g}${sec}-${sub}`),
        });
        id++;
      }
    }
  }

  // Campus 2 (girls): grades 1-6
  for (let g = 1; g <= 6; g++) {
    for (const sec of sections) {
      const count = 3 + Math.floor(Math.random() * 2);
      for (let s = 0; s < count; s++) {
        const nameIdx = (id - 1) % GIRLS_NAMES.length;
        students.push({
          id: `stu-${id}`,
          name: GIRLS_NAMES[nameIdx],
          nameEn: `Student ${id}`,
          grade: g,
          section: sec,
          campusId: 'camp-2',
          parentName: `ولية أمر ${GIRLS_NAMES[nameIdx]}`,
          enrolledSpaces: subjects.map(sub => `space-${g}${sec}-${sub}`),
        });
        id++;
      }
    }
  }

  // Campus 3 (international): grades 7-12
  for (let g = 7; g <= 12; g++) {
    for (const sec of sections) {
      const count = 2 + Math.floor(Math.random() * 2);
      for (let s = 0; s < count; s++) {
        const nameIdx = (id - 1) % INTL_NAMES.length;
        students.push({
          id: `stu-${id}`,
          name: INTL_NAMES[nameIdx],
          nameEn: INTL_NAMES[nameIdx],
          grade: g,
          section: sec,
          campusId: 'camp-3',
          parentName: `Parent of ${INTL_NAMES[nameIdx]}`,
          enrolledSpaces: subjects.map(sub => `space-${g}${sec}-${sub}`),
        });
        id++;
      }
    }
  }

  return students;
}

export const EXTENDED_STUDENTS = generateStudents();

// --- Teachers ---

const TEACHER_DATA: { name: string; nameEn: string; subject: string; subjectEn: string; campusId: string; grades: number[] }[] = [
  { name: 'أحمد المحمد', nameEn: 'Ahmed Al-Mohammed', subject: 'رياضيات', subjectEn: 'Math', campusId: 'camp-1', grades: [1, 2, 3] },
  { name: 'سارة العلي', nameEn: 'Sara Al-Ali', subject: 'علوم', subjectEn: 'Science', campusId: 'camp-1', grades: [1, 2, 3] },
  { name: 'خالد يوسف', nameEn: 'Khalid Yousef', subject: 'لغة عربية', subjectEn: 'Arabic', campusId: 'camp-1', grades: [4, 5, 6] },
  { name: 'فاطمة حسن', nameEn: 'Fatima Hassan', subject: 'رياضيات', subjectEn: 'Math', campusId: 'camp-1', grades: [4, 5, 6] },
  { name: 'عمر الفاروق', nameEn: 'Omar Al-Farouq', subject: 'تربية إسلامية', subjectEn: 'Islamic', campusId: 'camp-1', grades: [1, 2, 3, 4, 5, 6] },
  { name: 'ليلى سمير', nameEn: 'Layla Samir', subject: 'لغة إنجليزية', subjectEn: 'English', campusId: 'camp-1', grades: [1, 2, 3, 4, 5, 6] },
  { name: 'ياسر القحطاني', nameEn: 'Yasser Al-Qahtani', subject: 'تاريخ', subjectEn: 'History', campusId: 'camp-1', grades: [4, 5, 6] },
  { name: 'نورة السعد', nameEn: 'Noura Al-Saad', subject: 'جغرافيا', subjectEn: 'Geography', campusId: 'camp-1', grades: [4, 5, 6] },
  { name: 'محمود عباس', nameEn: 'Mahmoud Abbas', subject: 'رياضيات', subjectEn: 'Math', campusId: 'camp-2', grades: [1, 2, 3] },
  { name: 'رنا البيطار', nameEn: 'Rana Al-Baytar', subject: 'علوم', subjectEn: 'Science', campusId: 'camp-2', grades: [1, 2, 3] },
  { name: 'سعيد الغامدي', nameEn: 'Saeed Al-Ghamdi', subject: 'لغة عربية', subjectEn: 'Arabic', campusId: 'camp-2', grades: [4, 5, 6] },
  { name: 'هدى العمري', nameEn: 'Huda Al-Omari', subject: 'رياضيات', subjectEn: 'Math', campusId: 'camp-2', grades: [4, 5, 6] },
  { name: 'فيصل الدوسري', nameEn: 'Faisal Al-Dosari', subject: 'تربية إسلامية', subjectEn: 'Islamic', campusId: 'camp-2', grades: [1, 2, 3, 4, 5, 6] },
  { name: 'منى الشمري', nameEn: 'Mona Al-Shammari', subject: 'لغة إنجليزية', subjectEn: 'English', campusId: 'camp-2', grades: [1, 2, 3, 4, 5, 6] },
  { name: 'طارق العتيبي', nameEn: 'Tariq Al-Otaibi', subject: 'رياضيات', subjectEn: 'Math', campusId: 'camp-3', grades: [7, 8, 9] },
  { name: 'جميلة الزهراني', nameEn: 'Jamila Al-Zahrani', subject: 'علوم', subjectEn: 'Science', campusId: 'camp-3', grades: [7, 8, 9] },
  { name: 'بندر العنزي', nameEn: 'Bandar Al-Anzi', subject: 'لغة عربية', subjectEn: 'Arabic', campusId: 'camp-3', grades: [10, 11, 12] },
  { name: 'أمل الحربي', nameEn: 'Amal Al-Harbi', subject: 'فيزياء', subjectEn: 'Physics', campusId: 'camp-3', grades: [10, 11, 12] },
  { name: 'سلطان المطيري', nameEn: 'Sultan Al-Mutairi', subject: 'كيمياء', subjectEn: 'Chemistry', campusId: 'camp-3', grades: [10, 11, 12] },
  { name: 'ريما الشهري', nameEn: 'Rima Al-Shahri', subject: 'لغة إنجليزية', subjectEn: 'English', campusId: 'camp-3', grades: [7, 8, 9, 10, 11, 12] },
  { name: 'عبدالله السالم', nameEn: 'Abdullah Al-Salem', subject: 'حاسب آلي', subjectEn: 'Computer', campusId: 'camp-3', grades: [7, 8, 9, 10, 11, 12] },
];

export const EXTENDED_TEACHERS: ExtendedTeacher[] = TEACHER_DATA.map((t, i) => ({
  id: `tch-${i + 1}`,
  name: t.name,
  nameEn: t.nameEn,
  campusId: t.campusId,
  subject: t.subject,
  subjectEn: t.subjectEn,
  spaces: t.grades.flatMap(g => ['A', 'B'].map(s => `space-${g}${s}-${t.subject}`)),
  grades: t.grades,
}));

// --- Generate 30 Days of Attendance Records ---

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 5 || day === 6; // Friday + Saturday in Saudi Arabia
}

// Some students have chronic absence patterns
const CHRONIC_ABSENT_IDS = new Set<string>();
EXTENDED_STUDENTS.slice(0, 4).forEach(s => CHRONIC_ABSENT_IDS.add(s.id));
// Pick 4 more scattered students
[10, 25, 40, 55].forEach(i => {
  if (EXTENDED_STUDENTS[i]) CHRONIC_ABSENT_IDS.add(EXTENDED_STUDENTS[i].id);
});

function generateAttendanceRecords(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date();

  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const date = new Date(today);
    date.setDate(today.getDate() - dayOffset);

    if (isWeekend(date)) continue;

    const dateStr = formatDate(date);
    const isSunday = date.getDay() === 0;

    for (const student of EXTENDED_STUDENTS) {
      let status: AttendanceStatus = 'present';
      let lateTime: string | undefined;

      const r = Math.random();
      const isChronic = CHRONIC_ABSENT_IDS.has(student.id);

      if (isChronic) {
        // Chronic: 25-35% absence rate
        if (r < 0.30) status = 'absent';
        else if (r < 0.38) { status = 'late'; lateTime = `07:${30 + Math.floor(Math.random() * 25)}`; }
      } else if (isSunday) {
        // Sundays: slightly worse attendance
        if (r < 0.06) status = 'absent';
        else if (r < 0.12) { status = 'late'; lateTime = `07:${25 + Math.floor(Math.random() * 30)}`; }
      } else {
        // Normal: 2-4% absence, 3-5% late
        if (r < 0.03) status = 'absent';
        else if (r < 0.07) { status = 'late'; lateTime = `07:${20 + Math.floor(Math.random() * 35)}`; }
      }

      records.push({
        studentId: student.id,
        date: dateStr,
        status,
        lateTime,
        markedBy: 'system',
        markedAt: `${dateStr}T07:15:00`,
      });
    }
  }

  return records;
}

export const ATTENDANCE_RECORDS = generateAttendanceRecords();

// --- Teacher Activity Data ---

const ACTION_TYPES: TeacherActionType[] = ['login', 'mark_attendance', 'open_space', 'review_quiz', 'view_student', 'post_content'];
const ACTION_LABELS: Record<TeacherActionType, string> = {
  login: 'تسجيل دخول',
  mark_attendance: 'تسجيل الحضور',
  open_space: 'فتح مساحة تعليمية',
  review_quiz: 'مراجعة اختبارات',
  view_student: 'عرض ملف طالب',
  post_content: 'نشر محتوى',
};

function generateTeacherActivity(): TeacherDailyActivity[] {
  const activities: TeacherDailyActivity[] = [];
  const today = new Date();

  for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
    const date = new Date(today);
    date.setDate(today.getDate() - dayOffset);
    if (isWeekend(date)) continue;
    const dateStr = formatDate(date);

    for (const teacher of EXTENDED_TEACHERS) {
      const isActive = Math.random() > 0.08; // 92% chance active
      if (!isActive && dayOffset > 0) {
        activities.push({ teacherId: teacher.id, date: dateStr, totalMinutes: 0, actions: [], sessionsCount: 0 });
        continue;
      }

      const loginHour = 6 + Math.floor(Math.random() * 2); // 6-7 AM
      const loginMin = Math.floor(Math.random() * 60);
      const firstLogin = `${loginHour.toString().padStart(2, '0')}:${loginMin.toString().padStart(2, '0')}`;
      const totalMinutes = 60 + Math.floor(Math.random() * 240); // 1-5 hours
      const actionCount = 3 + Math.floor(Math.random() * 8);

      const actions: TeacherAction[] = [];
      actions.push({ teacherId: teacher.id, type: 'login', timestamp: `${dateStr}T${firstLogin}:00`, details: '' });

      for (let a = 1; a < actionCount; a++) {
        const type = ACTION_TYPES[1 + Math.floor(Math.random() * (ACTION_TYPES.length - 1))];
        const hour = loginHour + 1 + Math.floor(Math.random() * 6);
        const min = Math.floor(Math.random() * 60);
        const detail = type === 'mark_attendance' ? `الصف ${teacher.grades[Math.floor(Math.random() * teacher.grades.length)]}` :
                       type === 'open_space' ? teacher.subject :
                       type === 'review_quiz' ? `${Math.floor(Math.random() * 10) + 1} اختبارات` : '';
        actions.push({
          teacherId: teacher.id,
          type,
          timestamp: `${dateStr}T${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:00`,
          details: detail,
        });
      }

      activities.push({
        teacherId: teacher.id,
        date: dateStr,
        firstLogin,
        totalMinutes,
        actions,
        sessionsCount: 1 + Math.floor(Math.random() * 3),
      });
    }
  }

  return activities;
}

export const TEACHER_ACTIVITIES = generateTeacherActivity();

// --- Helper Functions ---

export function getAttendanceForDate(date: string, campusId?: string, grade?: number, section?: string): AttendanceRecord[] {
  let records = ATTENDANCE_RECORDS.filter(r => r.date === date);
  if (campusId && campusId !== 'all') {
    const studentIds = new Set(EXTENDED_STUDENTS.filter(s => s.campusId === campusId).map(s => s.id));
    records = records.filter(r => studentIds.has(r.studentId));
  }
  if (grade) {
    const studentIds = new Set(EXTENDED_STUDENTS.filter(s => s.grade === grade).map(s => s.id));
    records = records.filter(r => studentIds.has(r.studentId));
  }
  if (section) {
    const studentIds = new Set(EXTENDED_STUDENTS.filter(s => s.section === section).map(s => s.id));
    records = records.filter(r => studentIds.has(r.studentId));
  }
  return records;
}

export function getDailySummary(date: string, campusId?: string): DailyAttendanceSummary {
  const records = getAttendanceForDate(date, campusId);
  const present = records.filter(r => r.status === 'present').length;
  const absent = records.filter(r => r.status === 'absent').length;
  const late = records.filter(r => r.status === 'late').length;
  const excused = records.filter(r => r.excuseReason).length;
  const total = records.length;
  return { date, totalStudents: total, present, absent, late, excused, rate: total > 0 ? Math.round((present + late) / total * 1000) / 10 : 0 };
}

export function getClassAttendance(date: string, grade: number, section: string, campusId?: string): ClassAttendance {
  const classStudents = EXTENDED_STUDENTS.filter(s =>
    s.grade === grade && s.section === section && (!campusId || campusId === 'all' || s.campusId === campusId)
  );
  const studentIds = new Set(classStudents.map(s => s.id));
  const records = ATTENDANCE_RECORDS.filter(r => r.date === date && studentIds.has(r.studentId));

  const present = records.filter(r => r.status === 'present').length;
  const absent = records.filter(r => r.status === 'absent').length;
  const late = records.filter(r => r.status === 'late').length;
  const total = records.length;

  return {
    grade, section,
    campusId: campusId || 'all',
    date,
    totalStudents: total,
    present, absent, late,
    rate: total > 0 ? Math.round((present + late) / total * 1000) / 10 : 0,
    absentStudents: records.filter(r => r.status === 'absent').map(r => r.studentId),
    lateStudents: records.filter(r => r.status === 'late').map(r => ({ id: r.studentId, time: r.lateTime || '' })),
  };
}

export function getStudentAttendance(studentId: string, dateFrom?: string, dateTo?: string): AttendanceRecord[] {
  let records = ATTENDANCE_RECORDS.filter(r => r.studentId === studentId);
  if (dateFrom) records = records.filter(r => r.date >= dateFrom);
  if (dateTo) records = records.filter(r => r.date <= dateTo);
  return records.sort((a, b) => a.date.localeCompare(b.date));
}

export function getTeacherActivityForDate(date: string, campusId?: string): TeacherDailyActivity[] {
  let activities = TEACHER_ACTIVITIES.filter(a => a.date === date);
  if (campusId && campusId !== 'all') {
    const teacherIds = new Set(EXTENDED_TEACHERS.filter(t => t.campusId === campusId).map(t => t.id));
    activities = activities.filter(a => teacherIds.has(a.teacherId));
  }
  return activities;
}

export function getTodayString(): string {
  // Use the most recent weekday from our mock data
  const today = new Date();
  while (isWeekend(today)) today.setDate(today.getDate() - 1);
  return formatDate(today);
}

export { ACTION_LABELS };
