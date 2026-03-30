// ==================== Admin Hub Types ====================

// --- School Structure ---

export interface Campus {
  id: string;
  name: string;
  nameEn: string;
  type: 'boys' | 'girls' | 'international';
  principalName: string;
  studentCount: number;
  teacherCount: number;
}

export interface ExtendedStudent {
  id: string;
  name: string;
  nameEn: string;
  grade: number;
  section: string;
  campusId: string;
  parentId?: string;
  parentName?: string;
  enrolledSpaces: string[];
}

export interface ExtendedTeacher {
  id: string;
  name: string;
  nameEn: string;
  campusId: string;
  subject: string;
  subjectEn: string;
  spaces: string[];  // Space IDs they teach
  grades: number[];  // Grades they teach
}

// --- Attendance ---

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface AttendanceRecord {
  studentId: string;
  date: string;        // YYYY-MM-DD
  status: AttendanceStatus;
  lateTime?: string;   // HH:MM (for late arrivals)
  excuseReason?: string;
  markedBy: string;    // teacher/admin ID
  markedAt: string;    // ISO timestamp
}

export interface DailyAttendanceSummary {
  date: string;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  rate: number;        // percentage 0-100
}

export interface ClassAttendance {
  grade: number;
  section: string;
  campusId: string;
  date: string;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  rate: number;
  absentStudents: string[];  // student IDs
  lateStudents: { id: string; time: string }[];
}

// --- Teacher Activity ---

export type TeacherActionType =
  | 'login'
  | 'mark_attendance'
  | 'open_space'
  | 'review_quiz'
  | 'view_student'
  | 'post_content';

export interface TeacherAction {
  teacherId: string;
  type: TeacherActionType;
  timestamp: string;
  details?: string;   // e.g., "Grade 3A" for mark_attendance
}

export interface TeacherDailyActivity {
  teacherId: string;
  date: string;
  firstLogin?: string;   // HH:MM
  totalMinutes: number;
  actions: TeacherAction[];
  sessionsCount: number;
}

// --- Filters ---

export interface AttendanceFilters {
  campusId: string;     // 'all' or specific
  grade: number | null;
  section: string | null;
  dateFrom: string;
  dateTo: string;
}
