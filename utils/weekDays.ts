export interface DayStatus {
  day: string;
  label: string;
  status: 'done' | 'current' | 'locked';
}

export function computeWeekDays(currentStreak: number, lastActiveDate: string): DayStatus[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const jsDay = today.getDay();
  const arabicDayIndex = (jsDay + 1) % 7;

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - arabicDayIndex);

  const dayLetters = ['S', 'S', 'M', 'T', 'W', 'T', 'F'];
  const dayLabels = ['سب', 'أح', 'إث', 'ثل', 'أر', 'خم', 'جم'];

  const days: DayStatus[] = [];
  const isActiveToday = lastActiveDate === todayStr;

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    d.setHours(0, 0, 0, 0);
    const dStr = d.toISOString().split('T')[0];

    let status: 'done' | 'current' | 'locked';

    if (dStr === todayStr) {
      status = isActiveToday ? 'done' : 'current';
    } else if (d > today) {
      status = 'locked';
    } else {
      const daysAgo = Math.round((today.getTime() - d.getTime()) / 86400000);
      const streakReach = isActiveToday ? currentStreak : currentStreak + 1;
      status = daysAgo < streakReach ? 'done' : 'locked';
    }

    days.push({ day: dayLetters[i], label: dayLabels[i], status });
  }

  return days;
}
