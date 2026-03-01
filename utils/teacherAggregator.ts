
import { MOCK_SCHOOL_DATA, StudentProfile, SUBJECT_UNITS, GradeLevel, Subject } from '../data/complexLeaderboardData';

export const getSchoolStats = () => {
    const totalStudents = MOCK_SCHOOL_DATA.length;
    const activeStudents = MOCK_SCHOOL_DATA.filter(s => s.weeklyActivity[6] > 0).length; // Active on the last day
    
    // Calculate School-Wide Averages
    const totalXP = MOCK_SCHOOL_DATA.reduce((acc, s) => acc + s.totalXp, 0);
    const avgXP = Math.round(totalXP / totalStudents);

    // Calculate Global Accuracy
    let totalAccSum = 0;
    let subjectCount = 0;
    MOCK_SCHOOL_DATA.forEach(s => {
        Object.values(s.subjectDetails).forEach(detail => {
            if(detail.accuracy > 0) { // Only count if they have data
                totalAccSum += detail.accuracy;
                subjectCount++;
            }
        });
    });
    const avgAccuracy = subjectCount > 0 ? Math.round(totalAccSum / subjectCount) : 0;

    const totalMinutes = MOCK_SCHOOL_DATA.reduce((acc, s) => {
        const studentTotal = Object.values(s.subjectDetails).reduce((a, b) => a + b.timeSpent, 0);
        return acc + studentTotal;
    }, 0);
    const totalHours = Math.round(totalMinutes / 60);

    return {
        totalStudents,
        activeStudents,
        activePercentage: Math.round((activeStudents / totalStudents) * 100),
        avgXP,
        avgAccuracy,
        totalHours
    };
};

export const getGradePerformance = () => {
    const gradeStats: Record<string, { xp: number, count: number, accuracy: number }> = {};
    
    MOCK_SCHOOL_DATA.forEach(s => {
        if (!gradeStats[s.grade]) gradeStats[s.grade] = { xp: 0, count: 0, accuracy: 0 };
        
        gradeStats[s.grade].xp += s.totalXp;
        gradeStats[s.grade].count += 1;
        
        const activeSubjs = Object.values(s.subjectDetails).filter(d => d.xp > 0);
        const sAcc = activeSubjs.length > 0 ? activeSubjs.reduce((a, b) => a + b.accuracy, 0) / activeSubjs.length : 0;
        
        gradeStats[s.grade].accuracy += sAcc;
    });

    return Object.entries(gradeStats).map(([grade, data]) => ({
        grade: Number(grade),
        avgXP: Math.round(data.xp / data.count),
        avgAccuracy: Math.round(data.accuracy / data.count)
    })).sort((a, b) => a.grade - b.grade);
};

export const getSubjectPerformance = () => {
    const subjects = Object.keys(SUBJECT_UNITS) as Subject[];
    const stats: Record<string, { sum: number, count: number }> = {};

    subjects.forEach(subj => {
        stats[subj] = { sum: 0, count: 0 };
        MOCK_SCHOOL_DATA.forEach(s => {
            const detail = (s.subjectDetails as any)[subj];
            if(detail && detail.xp > 0) {
                stats[subj].sum += detail.accuracy;
                stats[subj].count++;
            }
        });
    });

    return Object.entries(stats)
        .filter(([_, data]) => data.count > 0)
        .map(([subject, data]) => ({ subject, score: Math.round(data.sum / data.count) }))
        .sort((a, b) => a.score - b.score);
};

export const getCriticalAlerts = () => {
    const alerts: { type: 'danger' | 'warning' | 'info', message: string, count: number }[] = [];

    // 1. Struggling Students
    const strugglingCount = MOCK_SCHOOL_DATA.filter(s => {
        const activeSubjs = Object.values(s.subjectDetails).filter(d => d.xp > 0);
        const sAcc = activeSubjs.length > 0 ? activeSubjs.reduce((a, b) => a + b.accuracy, 0) / activeSubjs.length : 0;
        return sAcc < 50 && sAcc > 0;
    }).length;

    if (strugglingCount > 0) {
        alerts.push({
            type: 'danger',
            message: 'طلاب يحتاجون لتدخل أكاديمي عاجل (دقة < 50%)',
            count: strugglingCount
        });
    }

    // 2. Low Engagement Classes
    const classActivity: Record<string, { total: number, count: number }> = {};
    MOCK_SCHOOL_DATA.forEach(s => {
        const key = `${s.grade}-${s.section}`;
        if (!classActivity[key]) classActivity[key] = { total: 0, count: 0 };
        classActivity[key].total += s.weeklyActivity[6]; // Last day activity
        classActivity[key].count++;
    });

    Object.entries(classActivity).forEach(([cls, data]) => {
        const avg = data.total / data.count;
        if (avg < 30) {
            alerts.push({
                type: 'warning',
                message: `انخفاض النشاط في الصف ${cls.replace('-', '/')}`,
                count: Math.round(avg) // showing avg % here instead of count
            });
        }
    });

    return alerts;
};

// --- NEW: Supervisor Matrix Aggregation ---
export const getSupervisorMatrix = () => {
    // We want a map: Grade -> { Subject: AverageScore }
    // Grades: 1-12
    // Subjects: All
    const matrix: Record<string, Record<string, { total: number, count: number }>> = {};
    
    // Initialize
    for(let g=1; g<=12; g++) {
        matrix[g] = {};
        Object.keys(SUBJECT_UNITS).forEach(s => {
            matrix[g][s] = { total: 0, count: 0 };
        });
    }

    MOCK_SCHOOL_DATA.forEach(s => {
        if(matrix[s.grade]) { // Ensure grade exists in matrix
            Object.keys(SUBJECT_UNITS).forEach(subj => {
                const detail = (s.subjectDetails as any)[subj];
                if(detail && detail.xp > 0) { // Only count active students in that subject
                    matrix[s.grade][subj].total += detail.accuracy;
                    matrix[s.grade][subj].count++;
                }
            });
        }
    });

    // Flatten to usable format
    const processedMatrix: any[] = [];
    for(let g=1; g<=12; g++) {
        const row: any = { grade: g };
        Object.keys(SUBJECT_UNITS).forEach(subj => {
            const data = matrix[g][subj];
            row[subj] = data.count > 0 ? Math.round(data.total / data.count) : null;
        });
        processedMatrix.push(row);
    }
    return processedMatrix;
};

// NEW: Get detailed stats for a specific cell in the matrix (Grade + Subject)
export const getGradeSubjectDetails = (grade: number, subject: string) => {
    const students = MOCK_SCHOOL_DATA.filter(s => s.grade === grade);
    if (students.length === 0) return null;

    // 1. Section Comparison
    const sections: Record<string, { total: number, count: number }> = {};
    const strugglingStudents: StudentProfile[] = [];
    const topStudents: StudentProfile[] = [];

    students.forEach(s => {
        const detail = (s.subjectDetails as any)[subject];
        if (detail && detail.xp > 0) {
            if (!sections[s.section]) sections[s.section] = { total: 0, count: 0 };
            sections[s.section].total += detail.accuracy;
            sections[s.section].count += 1;

            if (detail.accuracy < 60) strugglingStudents.push(s);
            if (detail.accuracy > 90) topStudents.push(s);
        }
    });

    const sectionStats = Object.entries(sections).map(([sec, data]) => ({
        section: sec,
        avg: Math.round(data.total / data.count)
    })).sort((a,b) => b.avg - a.avg);

    // 2. Unit Performance in this Grade
    const units = SUBJECT_UNITS[subject as Subject];
    const unitStats = units ? units.map(u => {
        let uTotal = 0;
        let uCount = 0;
        students.forEach(s => {
            const lesson = s.lessonDetails[`${subject}-${u}`];
            if(lesson) {
                uTotal += lesson.accuracy;
                uCount++;
            }
        });
        return { name: u, avg: uCount > 0 ? Math.round(uTotal / uCount) : 0 };
    }).sort((a,b) => a.avg - b.avg) : [];

    return {
        grade,
        subject,
        studentCount: students.length,
        sectionStats,
        unitStats,
        strugglingStudents: strugglingStudents.slice(0, 5), // Limit
        topStudents: topStudents.slice(0, 3)
    };
};

export const getClassComparisonBySubject = (subject: string) => {
    const classStats: Record<string, { totalScore: number; count: number }> = {};

    MOCK_SCHOOL_DATA.forEach(s => {
        const key = `${s.grade}-${s.section}`;
        if (!classStats[key]) classStats[key] = { totalScore: 0, count: 0 };
        
        const subjectData = (s.subjectDetails as any)[subject];
        if (subjectData && subjectData.xp > 0) {
            classStats[key].totalScore += subjectData.accuracy;
            classStats[key].count += 1;
        }
    });

    return Object.entries(classStats).map(([key, val]) => {
        const [grade, section] = key.split('-');
        return {
            id: key,
            grade: Number(grade),
            section,
            avgScore: val.count > 0 ? Math.round(val.totalScore / val.count) : 0,
            studentCount: val.count
        };
    }).filter(c => c.studentCount > 0).sort((a, b) => {
        if (a.grade !== b.grade) return a.grade - b.grade;
        return b.avgScore - a.avgScore; 
    });
};

export const getSubjectBreakdownForClass = (students: StudentProfile[]) => {
    const subjects = Object.keys(SUBJECT_UNITS) as string[];
    const stats: Record<string, { totalAcc: number; totalXP: number; count: number }> = {};

    students.forEach(s => {
        subjects.forEach(subj => {
            if (!stats[subj]) stats[subj] = { totalAcc: 0, totalXP: 0, count: 0 };
            const d = (s.subjectDetails as any)[subj];
            if (d && d.xp > 0) {
                stats[subj].totalAcc += d.accuracy;
                stats[subj].totalXP += d.xp;
                stats[subj].count += 1;
            }
        });
    });

    return subjects.map(subj => ({
        subject: subj,
        avgAccuracy: stats[subj].count > 0 ? Math.round(stats[subj].totalAcc / stats[subj].count) : 0,
        avgXP: stats[subj].count > 0 ? Math.round(stats[subj].totalXP / stats[subj].count) : 0
    })).filter(s => s.avgXP > 0); // Only return subjects with data
};

// --- Single Class Single Subject Aggregation (Updated for Detailed Lessons) ---
export const getClassSubjectStats = (students: StudentProfile[], subject: Subject) => {
    if (!students || students.length === 0) return null;
    
    const subjectDetailsList = students.map(s => (s.subjectDetails as any)[subject]);
    const avgAccuracy = Math.round(subjectDetailsList.reduce((acc, curr) => acc + (curr?.accuracy || 0), 0) / students.length) || 0;
    const avgTime = Math.round(subjectDetailsList.reduce((acc, curr) => acc + (curr?.timeSpent || 0), 0) / students.length) || 0;
    
    const strugglingCount = subjectDetailsList.filter(d => (d?.accuracy || 0) < 60).length;
    const excellingCount = subjectDetailsList.filter(d => (d?.accuracy || 0) >= 90).length;

    const distributionBuckets = {
        excellent: subjectDetailsList.filter(d => (d?.accuracy || 0) >= 90).length,
        good: subjectDetailsList.filter(d => (d?.accuracy || 0) >= 75 && (d?.accuracy || 0) < 90).length,
        average: subjectDetailsList.filter(d => (d?.accuracy || 0) >= 60 && (d?.accuracy || 0) < 75).length,
        struggling: subjectDetailsList.filter(d => (d?.accuracy || 0) < 60).length,
    };

    const aggHourly = new Array(24).fill(0);
    students.forEach(s => {
        if(s.hourlyActivity && s.hourlyActivity.length === 24) {
            s.hourlyActivity.forEach((val, idx) => {
                aggHourly[idx] += val;
            });
        }
    });
    const maxHourly = Math.max(...aggHourly) || 1;
    const normalizedHourly = aggHourly.map(v => Math.round((v / maxHourly) * 100));

    const units = SUBJECT_UNITS[subject as keyof typeof SUBJECT_UNITS] || [];
    const unitStats = units.map(unit => {
        const key = `${subject}-${unit}`;
        let totalScore = 0;
        let totalTime = 0;
        let count = 0;
        
        let distribution = { high: 0, mid: 0, low: 0 };

        students.forEach(s => {
            const lesson = s.lessonDetails[key];
            if(lesson) {
                totalScore += lesson.accuracy;
                totalTime += lesson.timeSpent; 
                count++;

                if (lesson.accuracy >= 80) distribution.high++;
                else if (lesson.accuracy >= 60) distribution.mid++;
                else distribution.low++;
            } else {
                distribution.low++;
            }
        });

        return { 
            name: unit, 
            avgAccuracy: count > 0 ? Math.round(totalScore / count) : 0,
            avgTime: count > 0 ? Math.round(totalTime / count) : 0,
            distribution
        };
    });

    const processedStudents = students.map(s => {
        const details = (s.subjectDetails as any)[subject];
        const baseAcc = details?.accuracy || 50;
        const history = Array.from({length: 5}, () => {
            const varAcc = Math.min(100, Math.max(0, baseAcc + (Math.random() * 40 - 20)));
            return varAcc >= 80 ? 'good' : varAcc >= 60 ? 'avg' : 'bad';
        });

        return {
            ...s,
            subjectXP: details?.xp || 0,
            subjectAccuracy: details?.accuracy || 0,
            subjectTime: details?.timeSpent || 0,
            history
        };
    }).sort((a,b) => b.subjectAccuracy - a.subjectAccuracy);

    return {
        avgAccuracy,
        avgTime,
        strugglingCount,
        excellingCount,
        distributionBuckets,
        hourlyActivity: normalizedHourly,
        unitStats,
        processedStudents
    };
};

// --- NEW: Single Class Single Unit Aggregation ---
export const getClassUnitStats = (students: StudentProfile[], subject: Subject, unit: string) => {
    if (!students || students.length === 0) return null;

    const unitKey = `${subject}-${unit}`;
    const lessonScores = students.map(s => s.lessonDetails[unitKey]);
    
    // Stats for this unit
    const avgAccuracy = Math.round(lessonScores.reduce((acc, curr) => acc + (curr?.accuracy || 0), 0) / students.length) || 0;
    const avgTime = Math.round(lessonScores.reduce((acc, curr) => acc + (curr?.timeSpent || 0), 0) / students.length) || 0;
    const strugglingCount = lessonScores.filter(d => (d?.accuracy || 0) < 60).length;
    const excellingCount = lessonScores.filter(d => (d?.accuracy || 0) >= 90).length;

    const distributionBuckets = {
        excellent: lessonScores.filter(d => (d?.accuracy || 0) >= 90).length,
        good: lessonScores.filter(d => (d?.accuracy || 0) >= 75 && (d?.accuracy || 0) < 90).length,
        average: lessonScores.filter(d => (d?.accuracy || 0) >= 60 && (d?.accuracy || 0) < 75).length,
        struggling: lessonScores.filter(d => (d?.accuracy || 0) < 60).length,
    };

    // Use general hourly activity as a proxy for the unit pulse
    const aggHourly = new Array(24).fill(0);
    students.forEach(s => {
        if(s.hourlyActivity) s.hourlyActivity.forEach((val, idx) => aggHourly[idx] += val);
    });
    const maxHourly = Math.max(...aggHourly) || 1;
    const normalizedHourly = aggHourly.map(v => Math.round((v / maxHourly) * 100));

    // Mock "Lessons" breakdown for this unit
    const lessonNames = [
        "مقدمة ومفاهيم أساسية",
        "تطبيقات عملية (1)",
        "تطبيقات عملية (2)",
        "حل المشكلات المتقدم",
        "الاختبار القصير"
    ];

    const lessonStats = lessonNames.map((lessonName, idx) => {
        // Vary accuracy based on index to simulate progression difficulty
        const variance = Math.sin(idx) * 10;
        const lAcc = Math.min(100, Math.max(0, Math.round(avgAccuracy + variance)));
        
        // Mock distribution for this lesson
        const distribution = {
            high: Math.round(students.length * (lAcc / 120)),
            mid: Math.round(students.length * 0.4),
            low: Math.round(students.length * ((100 - lAcc) / 150))
        };
        // Normalize count
        const total = distribution.high + distribution.mid + distribution.low;
        if(total !== students.length) distribution.mid += (students.length - total);

        return {
            name: lessonName,
            avgAccuracy: lAcc,
            avgTime: Math.round(avgTime / 5) + Math.floor(Math.random() * 10),
            distribution
        };
    });

    const processedStudents = students.map(s => {
        const details = s.lessonDetails[unitKey];
        const baseAcc = details?.accuracy || 50;
        const history = Array.from({length: 5}, () => {
            const varAcc = Math.min(100, Math.max(0, baseAcc + (Math.random() * 40 - 20)));
            return varAcc >= 80 ? 'good' : varAcc >= 60 ? 'avg' : 'bad';
        });

        return {
            ...s,
            subjectXP: details?.xp || 0, // Using Unit XP here
            subjectAccuracy: details?.accuracy || 0,
            subjectTime: details?.timeSpent || 0,
            history
        };
    }).sort((a,b) => b.subjectAccuracy - a.subjectAccuracy);

    return {
        avgAccuracy,
        avgTime,
        strugglingCount,
        excellingCount,
        distributionBuckets,
        hourlyActivity: normalizedHourly,
        lessonStats,
        processedStudents
    };
};

export const getAllClassesSummary = () => {
    const classes: Record<string, { grade: number, section: string, studentCount: number, avgAccuracy: number, totalXP: number }> = {};

    MOCK_SCHOOL_DATA.forEach(s => {
        const key = `${s.grade}-${s.section}`;
        if (!classes[key]) {
            classes[key] = { 
                grade: Number(s.grade), 
                section: s.section, 
                studentCount: 0, 
                avgAccuracy: 0,
                totalXP: 0 
            };
        }
        
        const activeSubjs = Object.values(s.subjectDetails).filter(d => d.xp > 0);
        const sAcc = activeSubjs.length > 0 ? activeSubjs.reduce((a, b) => a + b.accuracy, 0) / activeSubjs.length : 0;
        
        classes[key].studentCount++;
        classes[key].avgAccuracy += sAcc;
        classes[key].totalXP += s.totalXp;
    });

    return Object.values(classes).map(c => ({
        ...c,
        avgAccuracy: Math.round(c.avgAccuracy / c.studentCount),
        avgXP: Math.round(c.totalXP / c.studentCount)
    })).sort((a, b) => a.grade - b.grade || a.section.localeCompare(b.section));
};
