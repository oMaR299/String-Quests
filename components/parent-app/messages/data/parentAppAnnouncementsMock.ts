// parentAppAnnouncementsMock.ts
// ─────────────────────────────────────────────────────────────────────────────
// Seeded announcements for the Parent App Messages tab → Announcements
// segment. 7 cards total, distributed across kinds + times.
//
// Kinds:
//   • broadcast      — school-wide (e.g. Sports Day)
//   • reminder       — class- or child-scoped (e.g. exam, assignment due)
//   • achievement    — celebratory (e.g. streak milestone)
//   • action-needed  — parent must respond (e.g. permission slip)
//
// CTAs:
//   • message-teacher → opens a 1-on-1 thread to ctaTargetContactId
//   • celebrate       → no-op confetti in v1.x
//   • view-detail     → no-op in v1; would route in v1.1

export type AnnouncementKind =
  | 'broadcast'
  | 'reminder'
  | 'achievement'
  | 'action-needed';

export type AnnouncementScope = 'school' | 'class' | 'child';

export type AnnouncementCtaKind =
  | 'message-teacher'
  | 'celebrate'
  | 'view-detail';

export interface MockAnnouncementFull {
  id: string;
  kind: AnnouncementKind;
  fromContactId: string;
  scope: AnnouncementScope;
  childId?: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  sentIso: string;
  read: boolean;
  dismissed: boolean;
  ctaKind?: AnnouncementCtaKind;
  ctaTargetContactId?: string;
}

function isoMinutesAgo(mins: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - mins);
  return d.toISOString();
}
function isoHoursAgo(h: number) {
  return isoMinutesAgo(h * 60);
}
function isoDaysAgo(d: number) {
  return isoMinutesAgo(d * 24 * 60);
}

export const MOCK_ANNOUNCEMENTS: MockAnnouncementFull[] = [
  // ── Today: school-wide Sports Day
  {
    id: 'ann-1',
    kind: 'broadcast',
    fromContactId: 'staff-admin',
    scope: 'school',
    titleAr: 'يوم الرياضة الخميس',
    titleEn: 'Sports Day on Thursday',
    bodyAr: 'يحضر جميع الطلاب بزي رياضي وزجاجة ماء. الفعاليات تبدأ ٩ ص.',
    bodyEn:
      'All students wear sports uniforms and bring a water bottle. Events start at 9 am.',
    sentIso: isoHoursAgo(3),
    read: false,
    dismissed: false,
  },

  // ── Today: math exam reminder for Sara's class
  {
    id: 'ann-2',
    kind: 'reminder',
    fromContactId: 'teacher-child-sara-math',
    scope: 'class',
    childId: 'child-sara',
    titleAr: 'امتحان الرياضيات الأحد',
    titleEn: "Math exam on Sunday",
    bodyAr:
      'فصول ٣-٤ + المسائل صفحة ٤٢. يا ريت تراجعوا الكسور.',
    bodyEn: 'Chapters 3-4 + problems on p.42. Please review fractions.',
    sentIso: isoHoursAgo(6),
    read: false,
    dismissed: false,
    ctaKind: 'message-teacher',
    ctaTargetContactId: 'teacher-child-sara-math',
  },

  // ── Today: action needed — permission slip for Sara
  {
    id: 'ann-3',
    kind: 'action-needed',
    fromContactId: 'staff-admin',
    scope: 'child',
    childId: 'child-sara',
    titleAr: 'إذن الرحلة المدرسية لسارة',
    titleEn: "Sara's school trip permission",
    bodyAr: 'الرحلة الجمعة. يرجى توقيع نموذج الإذن قبل الأربعاء.',
    bodyEn:
      'Trip is on Friday. Please sign the permission slip before Wednesday.',
    sentIso: isoHoursAgo(8),
    read: false,
    dismissed: false,
    ctaKind: 'view-detail',
  },

  // ── Yesterday: achievement for Lina
  {
    id: 'ann-4',
    kind: 'achievement',
    fromContactId: 'mentor-child-lina',
    scope: 'child',
    childId: 'child-lina',
    titleAr: 'لينا أتمت ٧ أيام متتالية!',
    titleEn: 'Lina hit a 7-day streak!',
    bodyAr: 'الالتزام يبني عادات. احتفلوا معها',
    bodyEn: 'Consistency builds habits. Celebrate with her',
    sentIso: isoDaysAgo(1),
    read: true,
    dismissed: false,
    ctaKind: 'celebrate',
  },

  // ── Yesterday: class reminder for Omar
  {
    id: 'ann-5',
    kind: 'reminder',
    fromContactId: 'teacher-child-omar-arabic',
    scope: 'class',
    childId: 'child-omar',
    titleAr: 'قراءة منزلية لعمر',
    titleEn: "Reading homework for Omar",
    bodyAr: 'قراءة جهرية ١٠ دقايق يومياً من القصة المرفقة.',
    bodyEn: '10 minutes of aloud reading daily from the attached story.',
    sentIso: isoDaysAgo(1),
    read: true,
    dismissed: false,
    ctaKind: 'message-teacher',
    ctaTargetContactId: 'teacher-child-omar-arabic',
  },

  // ── Earlier: school-wide PTA meeting
  {
    id: 'ann-6',
    kind: 'broadcast',
    fromContactId: 'staff-principal',
    scope: 'school',
    titleAr: 'تأجيل اجتماع أولياء الأمور',
    titleEn: 'Parent-teacher meeting rescheduled',
    bodyAr: 'تم تأجيل الاجتماع للأسبوع الجاي. التفاصيل قريباً.',
    bodyEn: 'The meeting has been postponed to next week. Details to follow.',
    sentIso: isoDaysAgo(3),
    read: true,
    dismissed: false,
  },

  // ── Earlier: nurse broadcast
  {
    id: 'ann-7',
    kind: 'reminder',
    fromContactId: 'staff-nurse',
    scope: 'school',
    titleAr: 'فحص النظر السنوي',
    titleEn: 'Annual vision screening',
    bodyAr: 'يجرى للطلاب يوم الأربعاء. لا حاجة لتحضير مسبق.',
    bodyEn: 'For all students on Wednesday. No preparation needed.',
    sentIso: isoDaysAgo(5),
    read: true,
    dismissed: false,
  },
];
