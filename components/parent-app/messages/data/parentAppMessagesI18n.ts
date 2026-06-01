// parentAppMessagesI18n.ts
// ─────────────────────────────────────────────────────────────────────────────
// Local AR + EN dictionary for the entire Messages module. Mirrored into
// the global `contexts/I18nContext.tsx` so any consumer of the global
// `useI18n().t()` sees the same keys.
//
// AR is source-of-truth (Levantine, Jordan home market). EN mirrors.
// Keys live under `parentApp.messages.*`.

export type Locale = 'ar' | 'en';

export const parentAppMessagesI18n: Record<Locale, Record<string, string>> = {
  ar: {
    // Segmented control
    'parentApp.messages.segments.inbox': 'الرسائل',
    'parentApp.messages.segments.announcements': 'الإعلانات',

    // Search
    'parentApp.messages.search.placeholder': 'ابحث عن معلم أو رسالة...',

    // Mentor hero
    'parentApp.messages.mentor.roleLabel': 'مرشد {name} الأكاديمي',
    'parentApp.messages.mentor.replyTimeMinutes':
      'ترد عادة خلال {minutes} دقيقة',
    'parentApp.messages.mentor.replyTimeHours': 'ترد عادة خلال {hours} ساعة',
    'parentApp.messages.mentor.replyTimeApproxHour': 'ترد عادة خلال ساعة',
    'parentApp.messages.mentor.openChat': 'بدء محادثة',
    'parentApp.messages.mentor.statusOnline': 'متاحة الآن',
    'parentApp.messages.mentor.statusBusy': 'مشغولة الآن',
    'parentApp.messages.mentor.statusOffline': 'غير متصلة',

    // Tile section headers
    'parentApp.messages.tiles.teachersHeader': 'معلمو {name}',
    'parentApp.messages.tiles.staffHeader': 'موظفو المدرسة',

    // Subjects (AR display names)
    'parentApp.messages.subjects.math': 'رياضيات',
    'parentApp.messages.subjects.arabic': 'عربي',
    'parentApp.messages.subjects.english': 'إنجليزي',
    'parentApp.messages.subjects.science': 'علوم',
    'parentApp.messages.subjects.pe': 'رياضة',
    'parentApp.messages.subjects.art': 'فن',

    // Subject EN labels (rendered as secondary copy on tiles)
    'parentApp.messages.subjects.math.en': 'Math',
    'parentApp.messages.subjects.arabic.en': 'Arabic',
    'parentApp.messages.subjects.english.en': 'English',
    'parentApp.messages.subjects.science.en': 'Science',
    'parentApp.messages.subjects.pe.en': 'PE',
    'parentApp.messages.subjects.art.en': 'Art',

    // Roles
    'parentApp.messages.roles.principal': 'المدير',
    'parentApp.messages.roles.counselor': 'المرشدة الأكاديمية',
    'parentApp.messages.roles.admin': 'السكرتارية',
    'parentApp.messages.roles.nurse': 'الممرضة',
    'parentApp.messages.roles.mentor': 'المرشد الأكاديمي',
    'parentApp.messages.roles.teacher': 'المعلم',

    // Recent threads
    'parentApp.messages.recent.header': 'المحادثات الأخيرة',
    'parentApp.messages.recent.headerWithUnread':
      'المحادثات الأخيرة ({count} غير مقروءة)',
    'parentApp.messages.recent.emptyState': 'ابدأ محادثة من الأعلى',
    'parentApp.messages.recent.noResults': 'لا توجد نتائج مطابقة',

    // Announcements
    'parentApp.messages.announcements.kindLabel.broadcast': 'إعلان مدرسي',
    'parentApp.messages.announcements.kindLabel.reminder': 'تذكير',
    'parentApp.messages.announcements.kindLabel.achievement': 'إنجاز',
    'parentApp.messages.announcements.kindLabel.actionNeeded': 'يحتاج إجراء',
    'parentApp.messages.announcements.markRead': 'قرأت',
    'parentApp.messages.announcements.dismiss': 'تجاهل',
    'parentApp.messages.announcements.messageTeacher': 'اسأل المعلم',
    'parentApp.messages.announcements.celebrate': 'احتفلوا معاً',
    'parentApp.messages.announcements.filterAll': 'الكل',
    'parentApp.messages.announcements.filterSchool': 'مدرسي',
    'parentApp.messages.announcements.filterClass': 'صف {name}',
    'parentApp.messages.announcements.filterUnread': 'غير مقروء',
    'parentApp.messages.announcements.emptyState': 'لا توجد إعلانات حالياً',
    'parentApp.messages.announcements.fromLabel': 'من: {name}',

    // Time grouping
    'parentApp.messages.time.today': 'اليوم',
    'parentApp.messages.time.yesterday': 'أمس',
    'parentApp.messages.time.earlier': 'سابقاً',
    'parentApp.messages.time.justNow': 'الآن',
    'parentApp.messages.time.minutesAgo': 'قبل {n} د',
    'parentApp.messages.time.hoursAgo': 'قبل {n} س',
    'parentApp.messages.time.daysAgo': 'قبل {n} يوم',

    // Thread view
    'parentApp.messages.thread.backAria': 'رجوع',
    'parentApp.messages.thread.menuAria': 'المزيد',
    'parentApp.messages.thread.daySeparator.today': 'اليوم',
    'parentApp.messages.thread.daySeparator.yesterday': 'أمس',
    'parentApp.messages.thread.read.sent': 'تم الإرسال',
    'parentApp.messages.thread.read.delivered': 'تم التسليم',
    'parentApp.messages.thread.read.read': 'تم القراءة',
    'parentApp.messages.thread.menuMute': 'كتم المحادثة',
    'parentApp.messages.thread.menuArchive': 'أرشفة',
    'parentApp.messages.thread.menuProfile': 'عرض الملف',

    // Compose
    'parentApp.messages.compose.placeholder': 'اكتب رسالة...',
    'parentApp.messages.compose.attachAria': 'إرفاق ملف',
    'parentApp.messages.compose.cameraAria': 'الكاميرا',
    'parentApp.messages.compose.micAria': 'تسجيل صوتي',
    'parentApp.messages.compose.sendAria': 'إرسال',
    'parentApp.messages.compose.tapToHold': 'اضغط واستمر للتسجيل',
    'parentApp.messages.compose.swipeToCancel': 'اسحب للأعلى للإلغاء',
    'parentApp.messages.compose.recording': 'جاري التسجيل...',
    'parentApp.messages.compose.voiceUnsupported':
      'تسجيل الصوت غير مدعوم على هذا المتصفح',
    'parentApp.messages.compose.maxLengthReached': 'وصلت للحد الأقصى (٦٠ ث)',
    'parentApp.messages.compose.cancel': 'إلغاء',

    // Voice playback
    'parentApp.messages.voice.playAria': 'تشغيل',
    'parentApp.messages.voice.pauseAria': 'إيقاف',
  },
  en: {
    // Segmented control
    'parentApp.messages.segments.inbox': 'Inbox',
    'parentApp.messages.segments.announcements': 'Announcements',

    // Search
    'parentApp.messages.search.placeholder': 'Search teachers or messages...',

    // Mentor hero
    'parentApp.messages.mentor.roleLabel': "{name}'s Academic Mentor",
    'parentApp.messages.mentor.replyTimeMinutes': 'Usually replies in ~{minutes}m',
    'parentApp.messages.mentor.replyTimeHours': 'Usually replies in ~{hours}h',
    'parentApp.messages.mentor.replyTimeApproxHour': 'Usually replies in ~1h',
    'parentApp.messages.mentor.openChat': 'Open chat',
    'parentApp.messages.mentor.statusOnline': 'Online now',
    'parentApp.messages.mentor.statusBusy': 'Busy',
    'parentApp.messages.mentor.statusOffline': 'Offline',

    // Tile section headers
    'parentApp.messages.tiles.teachersHeader': "{name}'s teachers",
    'parentApp.messages.tiles.staffHeader': 'School staff',

    // Subjects
    'parentApp.messages.subjects.math': 'Math',
    'parentApp.messages.subjects.arabic': 'Arabic',
    'parentApp.messages.subjects.english': 'English',
    'parentApp.messages.subjects.science': 'Science',
    'parentApp.messages.subjects.pe': 'PE',
    'parentApp.messages.subjects.art': 'Art',
    'parentApp.messages.subjects.math.en': 'Math',
    'parentApp.messages.subjects.arabic.en': 'Arabic',
    'parentApp.messages.subjects.english.en': 'English',
    'parentApp.messages.subjects.science.en': 'Science',
    'parentApp.messages.subjects.pe.en': 'PE',
    'parentApp.messages.subjects.art.en': 'Art',

    // Roles
    'parentApp.messages.roles.principal': 'Principal',
    'parentApp.messages.roles.counselor': 'Counselor',
    'parentApp.messages.roles.admin': 'Admin',
    'parentApp.messages.roles.nurse': 'Nurse',
    'parentApp.messages.roles.mentor': 'Academic Mentor',
    'parentApp.messages.roles.teacher': 'Teacher',

    // Recent threads
    'parentApp.messages.recent.header': 'Recent',
    'parentApp.messages.recent.headerWithUnread': 'Recent ({count} unread)',
    'parentApp.messages.recent.emptyState': 'Start a conversation above',
    'parentApp.messages.recent.noResults': 'No matching conversations',

    // Announcements
    'parentApp.messages.announcements.kindLabel.broadcast':
      'School announcement',
    'parentApp.messages.announcements.kindLabel.reminder': 'Reminder',
    'parentApp.messages.announcements.kindLabel.achievement': 'Achievement',
    'parentApp.messages.announcements.kindLabel.actionNeeded': 'Action needed',
    'parentApp.messages.announcements.markRead': 'Mark read',
    'parentApp.messages.announcements.dismiss': 'Dismiss',
    'parentApp.messages.announcements.messageTeacher': 'Message teacher',
    'parentApp.messages.announcements.celebrate': 'Celebrate',
    'parentApp.messages.announcements.filterAll': 'All',
    'parentApp.messages.announcements.filterSchool': 'School-wide',
    'parentApp.messages.announcements.filterClass': "{name}'s class",
    'parentApp.messages.announcements.filterUnread': 'Unread',
    'parentApp.messages.announcements.emptyState': 'No announcements right now',
    'parentApp.messages.announcements.fromLabel': 'From: {name}',

    // Time grouping
    'parentApp.messages.time.today': 'Today',
    'parentApp.messages.time.yesterday': 'Yesterday',
    'parentApp.messages.time.earlier': 'Earlier',
    'parentApp.messages.time.justNow': 'Just now',
    'parentApp.messages.time.minutesAgo': '{n}m ago',
    'parentApp.messages.time.hoursAgo': '{n}h ago',
    'parentApp.messages.time.daysAgo': '{n}d ago',

    // Thread view
    'parentApp.messages.thread.backAria': 'Back',
    'parentApp.messages.thread.menuAria': 'More',
    'parentApp.messages.thread.daySeparator.today': 'Today',
    'parentApp.messages.thread.daySeparator.yesterday': 'Yesterday',
    'parentApp.messages.thread.read.sent': 'Sent',
    'parentApp.messages.thread.read.delivered': 'Delivered',
    'parentApp.messages.thread.read.read': 'Read',
    'parentApp.messages.thread.menuMute': 'Mute conversation',
    'parentApp.messages.thread.menuArchive': 'Archive',
    'parentApp.messages.thread.menuProfile': 'View profile',

    // Compose
    'parentApp.messages.compose.placeholder': 'Type a message...',
    'parentApp.messages.compose.attachAria': 'Attach file',
    'parentApp.messages.compose.cameraAria': 'Camera',
    'parentApp.messages.compose.micAria': 'Record voice note',
    'parentApp.messages.compose.sendAria': 'Send',
    'parentApp.messages.compose.tapToHold': 'Tap & hold to record',
    'parentApp.messages.compose.swipeToCancel': 'Swipe up to cancel',
    'parentApp.messages.compose.recording': 'Recording...',
    'parentApp.messages.compose.voiceUnsupported':
      'Voice notes not supported in this browser',
    'parentApp.messages.compose.maxLengthReached': 'Max length reached (60s)',
    'parentApp.messages.compose.cancel': 'Cancel',

    // Voice playback
    'parentApp.messages.voice.playAria': 'Play',
    'parentApp.messages.voice.pauseAria': 'Pause',
  },
};

/** Resolve a key. Falls back to the key itself if missing. */
export function getMessagesString(locale: Locale, key: string): string {
  return parentAppMessagesI18n[locale][key] ?? key;
}

/** `{name}` template substitution; missing vars are left as `{key}`. */
export function interpolate(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : `{${key}}`
  );
}
