
import { Subject, GradeLevel, ClassSection } from './complexLeaderboardData';

export type { Subject, GradeLevel, ClassSection };

export type Role = 'teacher' | 'supervisor';

export interface School {
    id: string;
    name: string;
    type: 'boys' | 'girls' | 'international';
}

export interface StaffMember {
    id: string;
    name: string;
    role: Role;
    avatar: string;
    major: Subject; // The subject they are qualified to teach/supervise
    schoolId: string; // Staff belongs to a specific school (or 'all')
    capacity: number; // Max classes (for teachers) or Max Grade Levels (for supervisors)
    assignedCount: number;
}

export interface AllocationState {
    // Key: "schoolId-grade-section-subject" -> Value: teacherId
    teacherMap: Record<string, string>;
    // Key: "schoolId-gradeStage-subject" -> Value: supervisorId
    // gradeStage can be specific grades or ranges like '1-3'
    supervisorMap: Record<string, string>;
}

export const SCHOOLS: School[] = [
    { id: 'sch-1', name: 'مدرسة النور الدولية (بنين)', type: 'boys' },
    { id: 'sch-2', name: 'مدرسة النور الدولية (بنات)', type: 'girls' },
    { id: 'sch-3', name: 'أكاديمية المستقبل', type: 'international' },
];

const TEACHER_NAMES = [
    "أحمد المحمد", "سارة العلي", "خالد يوسف", "فاطمة حسن", "عمر الفاروق", 
    "ليلى سمير", "ياسر القحطاني", "نورة السعد", "محمود عباس", "رنا البيطار",
    "سعيد الغامدي", "هدى العمري", "فيصل الدوسري", "منى الشمري", "طارق العتيبي",
    "جميلة الزهراني", "بندر العنزي", "أمل الحربي", "سلطان المطيري", "ريما الشهري",
    "عبدالله السالم", "مي الجابر", "فهد الراشد", "شروق الناصر", "ماجد الهذلول",
    "نوف البقمي", "زياد الطويل", "حنان الصالح", "تركي الماجد", "لطيفة الكندري",
    "محمد صلاح", "كريم بنزيمة", "لوكا مودريتش", "توني كروس", "ساديو ماني"
];

const SUPERVISOR_NAMES = [
    "د. محمد العريفي", "أ. نوال السعداوي", "د. طارق سويدان", "أ. مريم نور", 
    "د. أحمد زويل", "أ. غادة السمان", "د. مصطفى محمود", "أ. نجيب محفوظ", 
    "د. طه حسين", "أ. جبران خليل"
];

const SUBJECTS_LIST: Subject[] = ['math', 'science', 'languages', 'history', 'arts', 'physics', 'chemistry', 'biology', 'english', 'islamic', 'social', 'computer'];

// Generate 40 Teachers distributed across schools and subjects
export const STAFF_TEACHERS: StaffMember[] = TEACHER_NAMES.map((name, i) => ({
    id: `t-${i+1}`,
    name,
    role: 'teacher',
    avatar: `bg-${['blue', 'green', 'purple', 'orange', 'pink', 'teal'][i % 6]}-100`,
    major: SUBJECTS_LIST[i % SUBJECTS_LIST.length],
    schoolId: SCHOOLS[i % SCHOOLS.length].id,
    capacity: 18 + Math.floor(Math.random() * 6), // 18-24 classes max
    assignedCount: 0
}));

// Generate Supervisors
export const STAFF_SUPERVISORS: StaffMember[] = SUPERVISOR_NAMES.map((name, i) => ({
    id: `s-${i+1}`,
    name,
    role: 'supervisor',
    avatar: `bg-${['indigo', 'rose', 'cyan', 'amber'][i % 4]}-100`,
    major: SUBJECTS_LIST[i % SUBJECTS_LIST.length], // Supervisors have majors too
    schoolId: 'all', // Supervisors might roam or be assigned to specific schools in logic
    capacity: 10, // Max grade levels they can supervise
    assignedCount: 0
}));

export const CLASS_SECTIONS: ClassSection[] = ['A', 'B', 'C', 'D'];
export const GRADES: GradeLevel[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const GRADE_STAGES = [
    { id: 'elementary_lower', label: 'صفوف أولية (1-3)', grades: [1, 2, 3] },
    { id: 'elementary_upper', label: 'صفوف عليا (4-6)', grades: [4, 5, 6] },
    { id: 'middle', label: 'المرحلة المتوسطة', grades: [7, 8, 9] },
    { id: 'high', label: 'المرحلة الثانوية', grades: [10, 11, 12] },
];
