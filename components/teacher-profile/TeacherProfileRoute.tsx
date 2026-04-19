import React, { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { TeacherProfilePage } from './TeacherProfilePage';
import type { TeacherProfileData } from './TeacherProfileModal';
import {
  MOCK_SCHOOL_DATA, SUBJECT_UNITS,
  type StudentProfile, type Subject, type ClassSection,
} from '../../data/complexLeaderboardData';

/* ═══════════════════════════════════════════════════════════════
   Helpers — same seeded random & generation logic as TeachersTab
   ═══════════════════════════════════════════════════════════════ */

function seededRandom(seed: number) {
  return ((seed * 9301 + 49297) % 233280) / 233280;
}

const CAMPUSES = [
  { id: 'camp-1', name: 'مبنى النور (بنين)', nameEn: 'Al-Noor (Boys)' },
  { id: 'camp-2', name: 'مبنى الزهراء (بنات)', nameEn: 'Al-Zahra (Girls)' },
  { id: 'camp-3', name: 'المبنى الدولي', nameEn: 'International' },
];

const TEACHER_NAMES = [
  'أحمد المنصور', 'محمد الخالدي', 'يوسف العمري', 'عمر القحطاني', 'خالد الشمري', 'إبراهيم العتيبي',
  'سعيد الزهراني', 'حسن الغامدي', 'فهد الدوسري', 'ماجد المطيري', 'عبدالله الشهري', 'سلطان الحربي',
  'فيصل العنزي', 'بندر السالم', 'ناصر الرشيدي', 'تركي المالكي', 'عادل الجهني', 'سامي البلوي',
  'سارة المنصور', 'ليلى الخالدي', 'نورة العمري', 'فاطمة القحطاني', 'مريم الشمري', 'زينب العتيبي',
  'هند الزهراني', 'سلمى الغامدي', 'آية الدوسري', 'جود المطيري', 'ريم الشهري', 'دانة الحربي',
  'لمى العنزي', 'غادة السالم', 'منى الرشيدي', 'هيا المالكي', 'عبير الجهني', 'نوف البلوي',
];

function generateTeachers(subjectKey: string): TeacherProfileData[] {
  const sub = (subjectKey === 'all' ? 'math' : subjectKey) as Exclude<Subject, 'all'>;
  const units = SUBJECT_UNITS[sub] ?? SUBJECT_UNITS.math;
  const teachers: TeacherProfileData[] = [];
  let nameIdx = 0;

  const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const sections: ClassSection[] = ['A', 'B', 'C', 'D', 'E', 'F'];

  for (const g of grades) {
    for (const s of sections) {
      const campusId = g <= 6 ? (s <= 'C' ? 'camp-1' : 'camp-2') : 'camp-3';
      const students = MOCK_SCHOOL_DATA.filter(st => st.grade === g && st.section === s);
      if (students.length === 0) continue;

      const teacher = TEACHER_NAMES[nameIdx % TEACHER_NAMES.length];
      nameIdx++;

      const accuracies = students.map(st => st.subjectDetails[sub]?.accuracy ?? 0).filter(a => a > 0);
      const avgAcc = accuracies.length > 0 ? Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length) : 0;
      const avgXp = Math.round(students.reduce((s, st) => s + (st.subjectXp[sub] ?? 0), 0) / students.length);

      const unitAccuracies = units.map(unit => {
        const key = `${sub}-${unit}`;
        const accs = students.map(st => st.lessonDetails[key]?.accuracy ?? 0).filter(a => a > 0);
        return { unit, accuracy: accs.length > 0 ? Math.round(accs.reduce((a, b) => a + b, 0) / accs.length) : 0 };
      });

      const sortedUnits = [...unitAccuracies].sort((a, b) => b.accuracy - a.accuracy);
      const bestUnit = sortedUnits[0]?.unit ?? units[0];
      const worstUnit = sortedUnits[sortedUnits.length - 1]?.unit ?? units[units.length - 1];
      const starRating = avgAcc >= 90 ? 5 : avgAcc >= 82 ? 4 : avgAcc >= 74 ? 3 : avgAcc >= 66 ? 2 : 1;

      const seed = g * 100 + s.charCodeAt(0);
      const weeklyTrend = Array.from({ length: 8 }, (_, i) => {
        const base = avgAcc - 10 + i * 1.5;
        return Math.round(Math.max(40, Math.min(99, base + (seededRandom(seed + i * 13) * 12 - 6))));
      });

      const trendSlope = weeklyTrend[7] - weeklyTrend[0];
      const trend: 'up' | 'down' | 'stable' = trendSlope > 3 ? 'up' : trendSlope < -3 ? 'down' : 'stable';
      const engagementHours = Math.round((0.5 + seededRandom(seed + 999) * 4.5) * 10) / 10;

      const rng = (n: number) => seededRandom(seed + 5000 + n);
      const studentAvgActiveTime = Math.round((1.5 + rng(10) * 3.5) * 10) / 10;
      const studentWeeklyLoginRate = Math.round(55 + rng(11) * 40);
      const studentDailyLoginRate = Math.round(30 + rng(12) * 55);
      const attendanceMarked = rng(13) > 0.15;
      const studentEngagementScore = Math.round(
        studentWeeklyLoginRate * 0.3 + avgAcc * 0.25 + studentDailyLoginRate * 0.25 + (attendanceMarked ? 20 : 0)
      );

      const academic: 'green' | 'amber' | 'red' = avgAcc >= 80 ? 'green' : avgAcc >= 65 ? 'amber' : 'red';
      const engSignal: 'green' | 'amber' | 'red' = engagementHours >= 3 ? 'green' : engagementHours >= 1.5 ? 'amber' : 'red';
      const trendSignal: 'green' | 'amber' | 'red' = trend === 'up' ? 'green' : trend === 'stable' ? 'amber' : 'red';
      const avgStreak = students.reduce((s, st) => s + (st.weeklyActivity?.reduce((a, b) => a + b, 0) ?? 0), 0) / students.length;
      const retentionSignal: 'green' | 'amber' | 'red' = avgStreak > 350 ? 'green' : avgStreak > 200 ? 'amber' : 'red';
      const studentPushSignal: 'green' | 'amber' | 'red' = studentEngagementScore > 75 ? 'green' : studentEngagementScore >= 50 ? 'amber' : 'red';

      teachers.push({
        id: `teacher-${g}-${s}`,
        name: teacher,
        campusId, grade: g, section: s,
        students, studentCount: students.length,
        avgAccuracy: avgAcc, avgXp,
        bestUnit, worstUnit, starRating,
        campusDelta: 0, trend, engagementHours,
        unitAccuracies, weeklyTrend,
        healthSignals: { academic, engagement: engSignal, trend: trendSignal, retention: retentionSignal, studentPush: studentPushSignal },
        studentAvgActiveTime, studentAvgXp: avgXp, studentAvgAccuracy: avgAcc,
        studentWeeklyLoginRate, studentDailyLoginRate, attendanceMarked, studentEngagementScore,
      });
    }
  }

  // Campus deltas
  const campusAvgs: Record<string, number> = {};
  for (const c of CAMPUSES) {
    const ct = teachers.filter(t => t.campusId === c.id);
    campusAvgs[c.id] = ct.length > 0 ? Math.round(ct.reduce((s, t) => s + t.avgAccuracy, 0) / ct.length) : 0;
  }
  for (const t of teachers) {
    t.campusDelta = t.avgAccuracy - (campusAvgs[t.campusId] ?? 0);
  }

  return teachers;
}

/* ═══════════════════════════════════════════════════════════════
   Route Component
   ═══════════════════════════════════════════════════════════════ */

export const TeacherProfileRoute: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const teacherId = params.get('id') ?? '';
  const subject = params.get('subject') ?? 'math';
  const locale = (params.get('locale') as 'ar' | 'en') ?? 'ar';

  const teachers = useMemo(() => generateTeachers(subject), [subject]);
  const teacher = useMemo(() => teachers.find(t => t.id === teacherId), [teachers, teacherId]);

  if (!teacher) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-black text-slate-300 font-['Cairo'] mb-4">المعلم غير موجود</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-sky-500 text-white font-bold px-6 py-3 rounded-2xl font-['Cairo'] hover:bg-sky-600 transition-colors"
          >
            رجوع
          </button>
        </div>
      </div>
    );
  }

  return (
    <TeacherProfilePage
      teacher={teacher}
      locale={locale}
      subject={subject}
      onExit={() => navigate(-1)}
    />
  );
};

export default TeacherProfileRoute;
