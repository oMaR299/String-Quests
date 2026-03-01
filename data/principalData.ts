
export type StageType = 'kg' | 'elementary' | 'intermediate' | 'secondary';

export interface StageEntity {
    id: StageType;
    name: string;
    studentsCount: number;
    teachersCount: number;
    attendanceRate: number;
    
    // Performance metrics for different timeframes
    performanceData: {
        daily: number;
        monthly: number;
        semester: number;
    };
    
    accuracy: number; // Avg Quality
    totalXP: number;
    activeHours: number[]; // 24h activity intensity 0-100
    trend: 'up' | 'down' | 'stable';
    color: string;
    icon: string;
}

const generateHourlyProfile = (type: 'kg' | 'elem' | 'mid' | 'high') => {
    // 00:00 to 23:00
    const profile = new Array(24).fill(0);
    
    // School Hours (7 AM - 1 PM) - High intensity for all
    for (let i = 7; i <= 13; i++) {
        profile[i] = 85 + Math.random() * 15;
    }

    // Homework/Evening Hours (varies by level)
    if (type === 'kg') {
        // Little evening activity
        profile[16] = 20 + Math.random() * 10;
        profile[17] = 10 + Math.random() * 5;
    } else if (type === 'elem') {
        // Moderate evening (4 PM - 6 PM)
        for (let i = 16; i <= 18; i++) profile[i] = 50 + Math.random() * 20;
    } else if (type === 'mid') {
        // Longer evening (4 PM - 8 PM)
        for (let i = 16; i <= 20; i++) profile[i] = 60 + Math.random() * 25;
    } else {
        // Late night study (High School)
        for (let i = 16; i <= 23; i++) profile[i] = 70 + Math.random() * 30;
        // Some late night owls
        profile[0] = 30; 
        profile[1] = 10;
    }

    return profile;
};

export const SCHOOL_ENTITIES: StageEntity[] = [
    {
        id: 'kg',
        name: 'رياض الأطفال',
        studentsCount: 120,
        teachersCount: 8,
        attendanceRate: 98,
        performanceData: { daily: 92, monthly: 90, semester: 94 },
        accuracy: 88,
        totalXP: 45000,
        activeHours: generateHourlyProfile('kg'),
        trend: 'up',
        color: 'from-orange-400 to-amber-500',
        icon: 'baby'
    },
    {
        id: 'elementary',
        name: 'المرحلة الابتدائية',
        studentsCount: 930, // Combined boys & girls
        teachersCount: 53,
        attendanceRate: 96,
        performanceData: { daily: 81, monthly: 83, semester: 80 },
        accuracy: 79,
        totalXP: 267000,
        activeHours: generateHourlyProfile('elem'),
        trend: 'up',
        color: 'from-emerald-400 to-teal-500',
        icon: 'backpack'
    },
    {
        id: 'intermediate',
        name: 'المرحلة المتوسطة',
        studentsCount: 640,
        teachersCount: 42,
        attendanceRate: 92,
        performanceData: { daily: 76, monthly: 78, semester: 75 },
        accuracy: 74,
        totalXP: 198000,
        activeHours: generateHourlyProfile('mid'),
        trend: 'stable',
        color: 'from-blue-500 to-indigo-600',
        icon: 'book'
    },
    {
        id: 'secondary',
        name: 'المرحلة الثانوية',
        studentsCount: 660,
        teachersCount: 45,
        attendanceRate: 89,
        performanceData: { daily: 85, monthly: 82, semester: 88 },
        accuracy: 85,
        totalXP: 254000,
        activeHours: generateHourlyProfile('high'),
        trend: 'down', // Maybe due to exams difficulty
        color: 'from-purple-600 to-fuchsia-700',
        icon: 'grad'
    }
];

export const GLOBAL_STATS = {
    totalStudents: 2350,
    totalTeachers: 148,
    avgAttendance: 93.8,
    avgPerformance: 83,
    performanceHistory: [75, 78, 80, 82, 81, 83, 85]
};
