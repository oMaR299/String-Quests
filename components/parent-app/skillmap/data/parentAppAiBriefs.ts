// parentAppAiBriefs.ts
// ─────────────────────────────────────────────────────────────────────────────
// Short AI "briefs" for the skill map — one per general view and one per subject
// sheet tab. Assembled from the existing seeded data (constrained templates,
// never free-form), so they're always specific, warm, and safe.

import { getChildSkillAreas, type ParentSkillStatus } from './parentAppSkillMapMock';
import { getSubjectTree } from './parentAppTextbookTreeMock';
import {
  getStrengths,
  getRiskFlags,
  getSubjectSeries,
  getSubjectPeer,
  getSubjectPages,
  getUpcomingExams,
} from './parentAppSkillAnalyticsMock';
import { getDnaProfile, getSkillTypeBreakdown } from './parentAppLearnProfileMock';
import { getStringStanding } from './parentAppStandingMock';
import { getHomeworkForChild, SUBJECT_STYLES } from '../../data/parentAppSchoolMockData';

type Loc = 'ar' | 'en';

const STATUS_WORD: Record<ParentSkillStatus, { ar: string; en: string }> = {
  needsHelp: { ar: 'يحتاج دعماً', en: 'needs support' },
  developing: { ar: 'قيد التطوّر', en: 'developing' },
  proficient: { ar: 'جيّد', en: 'proficient' },
  mastered: { ar: 'متقَن', en: 'mastered' },
};

// ── General view briefs ─────────────────────────────────────────────────────────

export type GeneralView = 'snapshot' | 'tasks' | 'learn' | 'standing';

export function getViewBrief(childId: string, childName: string, view: GeneralView, locale: Loc): string {
  const ar = locale === 'ar';

  if (view === 'tasks') {
    const homework = getHomeworkForChild(childId);
    const total = homework.length;
    const doneCount = homework.filter((h) => h.calmStatus === 'done').length;
    const nextExam = getUpcomingExams(childId)[0];
    const hwBit =
      total === 0
        ? ar
          ? 'لا واجبات حالياً'
          : 'No homework right now'
        : ar
          ? `أنجز ${childName} ${doneCount} من ${total} واجبات`
          : `${childName} finished ${doneCount} of ${total} tasks`;
    if (!nextExam) {
      return ar ? `${hwBit}. لا اختبارات قادمة حالياً.` : `${hwBit}. No upcoming exams.`;
    }
    const subjAr = SUBJECT_STYLES[nextExam.exam.subject].labelAr;
    const subjEn = SUBJECT_STYLES[nextExam.exam.subject].labelEn;
    const d = nextExam.daysUntil;
    return ar
      ? `${hwBit}. امتحان ${subjAr} بعد ${d} ${d === 1 ? 'يوم' : 'أيام'} — الجاهزية ${nextExam.readinessPct}%.`
      : `${hwBit}. ${subjEn} exam in ${d} ${d === 1 ? 'day' : 'days'} — ${nextExam.readinessPct}% ready.`;
  }

  if (view === 'snapshot') {
    const risks = getRiskFlags(childId);
    const strengths = getStrengths(childId);
    const top = strengths[0];
    if (risks.length === 0) {
      return ar
        ? `${childName} في حالة ممتازة اليوم — كل المواد على المسار. استمرّوا في التشجيع!`
        : `${childName} is in great shape today — every subject is on track. Keep cheering them on!`;
    }
    const r = risks[0].area;
    const strengthBit = top
      ? ar
        ? ` وفي المقابل، يتألق في ${top.subjectAr}.`
        : ` On the bright side, they shine in ${top.subjectEn}.`
      : '';
    return ar
      ? `أولوية اليوم: ${r.subjectAr}.${strengthBit}`
      : `Today's priority: ${r.subjectEn}.${strengthBit}`;
  }

  if (view === 'learn') {
    const dna = getDnaProfile(childId);
    const types = getSkillTypeBreakdown(childId);
    const strongest = [...types].sort((a, b) => b.value - a.value)[0];
    const weakest = [...types].sort((a, b) => a.value - b.value)[0];
    return ar
      ? `${childName} ${dna.typeAr}. أقوى في ${strongest.labelAr} ويحتاج دعماً في ${weakest.labelAr}.`
      : `${childName} is ${dna.typeEn}. Strongest at ${strongest.labelEn}, needs support with ${weakest.labelEn}.`;
  }

  // standing
  const standing = getStringStanding(childId, childName, locale);
  const areas = getChildSkillAreas(childId);
  const aboveAvg = areas.filter((a) => a.masteryPct > getSubjectPeer(childId, a.subjectKey).classAvgPct).length;
  return ar
    ? `${childName} ${standing.bandAr}، ومتقدّم على متوسط الصف في ${aboveAvg} من ${areas.length} مواد.`
    : `${childName} is ${standing.bandEn}, ahead of the class average in ${aboveAvg} of ${areas.length} subjects.`;
}

// ── Subject sheet tab briefs ─────────────────────────────────────────────────────

export type SubjectTab = 'overview' | 'trends' | 'pages';

export function getSubjectTabBrief(
  childId: string,
  subjectKey: string,
  childName: string,
  tab: SubjectTab,
  locale: Loc,
): string {
  const ar = locale === 'ar';
  const area = getChildSkillAreas(childId).find((a) => a.subjectKey === subjectKey);
  if (!area) return '';
  const subject = ar ? area.subjectAr : area.subjectEn;
  const tree = getSubjectTree(childId, subjectKey);
  const weakestUnit = [...tree.units].sort((a, b) => a.masteryPct - b.masteryPct)[0];

  if (tab === 'overview') {
    const word = STATUS_WORD[area.status];
    return ar
      ? `${childName} ${word.ar} في ${subject} بإتقان ${area.masteryPct}%. الخطوة التالية: ${weakestUnit ? weakestUnit.titleAr : 'المراجعة'}.`
      : `${childName} is ${word.en} in ${subject} at ${area.masteryPct}%. Next step: ${weakestUnit ? weakestUnit.titleEn : 'review'}.`;
  }

  if (tab === 'trends') {
    const series = getSubjectSeries(childId, subjectKey, 30);
    const mDelta = series.length ? series[series.length - 1].masteryPct - series[0].masteryPct : 0;
    const aDelta = series.length ? series[series.length - 1].accuracyPct - series[0].accuracyPct : 0;
    const verdict =
      mDelta >= 5
        ? ar ? 'تقدّم واضح هذا الشهر' : 'clear progress this month'
        : mDelta <= -5
          ? ar ? 'تراجع يستحق المتابعة' : 'a dip worth watching'
          : ar ? 'مستقرّ هذا الشهر' : 'holding steady this month';
    const fmt = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
    return ar
      ? `${verdict}. الإتقان ${fmt(mDelta)}% والدقة ${fmt(aDelta)}% خلال ٣٠ يوماً.`
      : `${verdict[0].toUpperCase()}${verdict.slice(1)}. Mastery ${fmt(mDelta)}%, accuracy ${fmt(aDelta)}% over 30 days.`;
  }

  // pages
  const pages = getSubjectPages(childId, subjectKey);
  const mastered = pages.filter((p) => p.masteryPct >= 90).length;
  return ar
    ? `${childName} أتقن ${mastered} من ${pages.length} صفحة. ركّزوا على وحدة ${weakestUnit ? weakestUnit.titleAr : 'الأضعف'}.`
    : `${childName} has mastered ${mastered} of ${pages.length} pages. Focus on ${weakestUnit ? weakestUnit.titleEn : 'the weakest unit'}.`;
}
