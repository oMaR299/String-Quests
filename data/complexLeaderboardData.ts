
// Types
export type GradeLevel = 'KG' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type ClassSection = 'A' | 'B' | 'C' | 'D';
export type Subject = 
  | 'all' 
  | 'math' | 'science' | 'languages' | 'history' | 'arts' 
  | 'islamic' | 'social' | 'physics' | 'chemistry' | 'biology' | 'computer' | 'english';

export type League = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type Timeframe = 'daily' | 'weekly' | 'monthly' | 'all-time';

// Grade Groups for UI filtering
export const GRADE_GROUPS = {
    'elementary': ['KG', 1, 2, 3, 4, 5],
    'middle': [6, 7, 8, 9],
    'high': [10, 11, 12]
};

// Expanded Subject Units
export const SUBJECT_UNITS: Record<Exclude<Subject, 'all'>, string[]> = {
    math: ['arithmetic', 'algebra', 'geometry', 'calculus', 'statistics'],
    science: ['matter', 'energy', 'forces', 'ecosystems'],
    languages: ['grammar', 'literature', 'poetry', 'writing'],
    history: ['ancient', 'islamic_history', 'modern', 'geography'],
    arts: ['drawing', 'colors', 'history_of_art'],
    islamic: ['quran', 'hadith', 'fiqh', 'tafsir'],
    social: ['citizenship', 'economics', 'sociology'],
    physics: ['mechanics', 'thermodynamics', 'optics', 'quantum'],
    chemistry: ['periodic_table', 'reactions', 'organic', 'acids'],
    biology: ['cells', 'genetics', 'anatomy', 'ecology'],
    computer: ['coding', 'hardware', 'networks', 'ai'],
    english: ['vocabulary', 'grammar', 'reading', 'speaking']
};

export interface StudentProfile {
  id: string;
  name: string;
  grade: GradeLevel;
  section: ClassSection;
  avatar: string;
  league: League;
  
  // XP Stats
  totalXp: number;
  subjectXp: Record<Exclude<Subject, 'all'>, number>;
  
  lessonScores: Record<string, number>; 
  subjectDetails: Record<Exclude<Subject, 'all'>, { xp: number; accuracy: number; timeSpent: number }>; 
  lessonDetails: Record<string, { xp: number; accuracy: number; timeSpent: number }>;

  trend: 'up' | 'down' | 'stable';
  weeklyActivity: number[]; 
  hourlyActivity: number[]; 
  focusDistribution: Record<Exclude<Subject, 'all'>, number>;
  improvementHistory: { month: string; score: number }[];
  timeframeScores: Record<Timeframe, number>;
}

const FIRST_NAMES = [
  "أحمد", "محمد", "يوسف", "عمر", "علي", "خالد", "إبراهيم", "سعيد", "حسن", "حسين",
  "سارة", "ليلى", "نورة", "فاطمة", "مريم", "زينب", "هند", "سلمى", "آية", "جود"
];

const LAST_NAMES = [
  "المنصور", "العبدالله", "السالم", "الخالدي", "العمري", "القحطاني", "الشمري", "العتيبي", 
  "الزهراني", "الغامدي", "الدوسري", "المطيري", "الشهري", "الحربي", "العنزي"
];

const LEAGUES: League[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

const generateHourlyActivity = () => {
    const curve = [
        0, 0, 0, 0, 0, 2, 5, 15, 
        30, 45, 40, 35, 30, 25, 20, 
        15, 50, 85, 95, 70, 40, 
        20, 10, 5 
    ];
    return curve.map(val => Math.max(0, val + Math.floor(Math.random() * 20 - 10)));
};

const generateStudent = (id: string, grade: GradeLevel, section: ClassSection): StudentProfile => {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  
  const lessonScores: Record<string, number> = {};
  const lessonDetails: Record<string, any> = {};
  
  // Initialize with 0
  const subjectXp: any = {};
  const subjectDetails: any = {};
  const focusDistribution: any = {};
  
  const allSubjects = Object.keys(SUBJECT_UNITS) as Exclude<Subject, 'all'>[];
  
  let totalXp = 0;
  let totalMinutes = 0;

  allSubjects.forEach(subj => {
      let subjXp = 0;
      let subjTime = 0;
      let subjAccSum = 0;
      let unitCount = 0;

      // Grade-based logic: High schoolers take Physics, lower grades take General Science
      // This is a mock simplification
      const isHighSchool = typeof grade === 'number' && grade >= 10;
      const isAdvancedScience = ['physics', 'chemistry', 'biology'].includes(subj);
      const isGeneralScience = subj === 'science';

      let shouldInclude = true;
      if (isHighSchool && isGeneralScience) shouldInclude = false;
      if (!isHighSchool && isAdvancedScience) shouldInclude = false;

      if (shouldInclude) {
          SUBJECT_UNITS[subj].forEach(unit => {
              const score = Math.floor(Math.random() * 1000);
              const accuracy = 60 + Math.floor(Math.random() * 40); 
              const time = 10 + Math.floor(Math.random() * 120); 
              
              const key = `${subj}-${unit}`;
              
              lessonScores[key] = score;
              lessonDetails[key] = { xp: score, accuracy, timeSpent: time };

              subjXp += score;
              subjTime += time;
              subjAccSum += accuracy;
              unitCount++;
          });
      }

      subjectXp[subj] = subjXp;
      subjectDetails[subj] = {
          xp: subjXp,
          accuracy: unitCount > 0 ? Math.round(subjAccSum / unitCount) : 0,
          timeSpent: subjTime
      };
      
      totalXp += subjXp;
      totalMinutes += subjTime;
  });

  // Calculate Focus Distribution
  let remainingPct = 100;
  const activeSubjects = allSubjects.filter(s => subjectDetails[s].xp > 0);
  
  activeSubjects.forEach((subj, idx) => {
      if (idx === activeSubjects.length - 1) {
          focusDistribution[subj] = Math.max(5, remainingPct);
      } else {
          const val = Math.max(5, Math.floor(Math.random() * (remainingPct / (activeSubjects.length - idx))));
          focusDistribution[subj] = val;
          remainingPct -= val;
      }
  });

  const leagueIndex = Math.min(4, Math.floor((totalXp / 30000) * 5)); 
  const league = LEAGUES[leagueIndex] || 'bronze';

  return {
    id,
    name: `${firstName} ${lastName}`,
    grade,
    section,
    avatar: `bg-${['blue', 'red', 'green', 'yellow', 'purple', 'pink'][Math.floor(Math.random() * 6)]}-100`,
    league,
    subjectXp,
    lessonScores,
    subjectDetails,
    lessonDetails,
    totalXp,
    trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down',
    weeklyActivity: Array.from({ length: 7 }, () => 20 + Math.floor(Math.random() * 80)),
    hourlyActivity: generateHourlyActivity(),
    focusDistribution,
    improvementHistory: [
        { month: 'يناير', score: 40 + Math.floor(Math.random() * 20) },
        { month: 'فبراير', score: 50 + Math.floor(Math.random() * 20) },
        { month: 'مارس', score: 60 + Math.floor(Math.random() * 20) },
        { month: 'أبريل', score: 65 + Math.floor(Math.random() * 20) },
        { month: 'مايو', score: 75 + Math.floor(Math.random() * 20) },
        { month: 'يونيو', score: 85 + Math.floor(Math.random() * 15) },
    ],
    timeframeScores: {
        'all-time': totalXp,
        'monthly': Math.floor(totalXp * 0.3),
        'weekly': Math.floor(totalXp * 0.08),
        'daily': Math.floor(totalXp * 0.015)
    }
  };
};

export const MOCK_SCHOOL_DATA: StudentProfile[] = [];
export const CURRENT_USER_ID = 'user-me';

// Generate data for Grades 1-12
const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as GradeLevel[];
for (const g of grades) {
  for (const s of ['A', 'B'] as ClassSection[]) {
    const count = 5 + Math.floor(Math.random() * 3); // Fewer students for per-class view performance
    for (let i = 0; i < count; i++) {
      MOCK_SCHOOL_DATA.push(generateStudent(`st-${g}-${s}-${i}`, g, s));
    }
  }
}
