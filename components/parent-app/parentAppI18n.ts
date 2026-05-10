// parentAppI18n.ts
// ─────────────────────────────────────────────────────────────────────────────
// Co-located bilingual dict for the Parent App home shell. AR is source-of-
// truth (Levantine / Jordan dialect); EN mirrors. Keys are flat under the
// `parentApp.*` namespace.
//
// These strings are also mirrored into `contexts/I18nContext.tsx` so the
// rest of the app can read them through the global `useI18n().t()`. The
// local dict here is for fast iteration during this v1 build — editing
// strings here is a single-file change.
//
// Copy principles:
//   • Benefit-first headlines (what does the parent see?).
//   • Short, action-led, no jargon.
//   • Levantine ("اليوم", "احتفلوا"), Jordan home market.

export type Locale = 'ar' | 'en';

export const parentAppI18n: Record<Locale, Record<string, string>> = {
  ar: {
    // Tabs
    'parentApp.tab.home': 'الرئيسية',
    'parentApp.tab.awareAi': 'مساعد ذكي',
    'parentApp.tab.skillMap': 'خريطة المهارات',
    'parentApp.tab.profile': 'الملف',
    'parentApp.tab.messages': 'الرسائل',

    // Header
    'parentApp.header.addChild': '+ إضافة',
    'parentApp.header.refreshNow': 'تحديث',
    'parentApp.header.justUpdated': 'تم التحديث الآن',
    'parentApp.header.notificationsAria': 'الإشعارات',
    'parentApp.header.profileAria': 'الملف الشخصي',

    // Greeting strip (dynamic per time band — phrases live in
    // data/parentAppGreetings.ts; only fixed labels go here)
    'parentApp.greeting.parentNameFallback': 'هلا',
    'parentApp.greeting.refreshHint': 'حدّث للحصول على رسالة جديدة',

    // Hero card
    'parentApp.hero.todayPill': 'اليوم',
    'parentApp.hero.lessonsHeadline': '{name} أنجزت {n} دروس اليوم 🎉',
    'parentApp.hero.lessonsHeadlineMale': '{name} أنجز {n} دروس اليوم 🎉',
    'parentApp.hero.durationLabel': 'مدة',
    'parentApp.hero.durationValue': '{mins} د',
    'parentApp.hero.accuracyLabel': 'دقة',
    'parentApp.hero.accuracyValue': '{accuracy}%',
    'parentApp.hero.weakAreaLabel': 'نقطة تركيز',
    'parentApp.hero.cheerCta': 'احتفلوا معاً 🎉',
    'parentApp.hero.cheeredToast': 'تم! 🎉',

    // Celebration card
    'parentApp.celebration.streak': 'سلسلة {days} أيام متواصلة! 🔥',
    'parentApp.celebration.mastery': 'أتقن {name} مهارة جديدة 🌟',
    'parentApp.celebration.teacherPraise': 'الأستاذة أشادت بـ {name} 👏',

    // AI convo starter
    'parentApp.ai.title': 'سؤال اليوم',
    'parentApp.ai.suggestedBy': 'اقترح بواسطة AI',
    'parentApp.ai.defaultPrompt': 'اسألوا سارة عن درس الرياضيات اليوم — ما الذي أحبته أكثر؟',

    // Deadline card
    'parentApp.deadline.title': 'موعد قادم',
    'parentApp.deadline.dueIn': 'متبقٍ {days} أيام',
    'parentApp.deadline.dueToday': 'اليوم',
    'parentApp.deadline.dueTomorrow': 'غداً',
    'parentApp.deadline.moreLink': '+{n} مواعيد أخرى',

    // Announcement card
    'parentApp.announcement.tag': 'إعلان مدرسي',

    // Message preview
    'parentApp.message.preview': 'رسالة جديدة',
    'parentApp.message.unread': 'غير مقروءة',

    // Supernova teaser (gated off in v1)
    'parentApp.supernova.title': 'افتح Supernova',
    'parentApp.supernova.body': 'تحليلات أعمق + جلسات AI مع طفلك',
    'parentApp.supernova.cta': 'اعرف المزيد',

    // Aware AI placeholder
    'parentApp.awareAi.headline': 'مساعد ذكي قادم قريباً',
    'parentApp.awareAi.value': 'سيقترح عليك أسئلة يومية، تحليلات أسبوعية، وردود على أي سؤال',
    'parentApp.awareAi.feature1': 'أسئلة تبدأ بها حواراً مع طفلك',
    'parentApp.awareAi.feature2': 'تحليلات أسبوعية تكشف الأنماط',
    'parentApp.awareAi.feature3': 'اسأل أي شيء حول تعلم طفلك',

    // Skill Map placeholder
    'parentApp.skillMap.headline': 'خريطة مهارات طفلك',
    'parentApp.skillMap.value': 'شاهد نقاط القوة، الفجوات، وعمق الإتقان لكل مهارة',
    'parentApp.skillMap.feature1': 'تعرّف على نقاط القوة والضعف',
    'parentApp.skillMap.feature2': 'عمق Bloom لكل مهارة',
    'parentApp.skillMap.feature3': 'تقدم الإتقان بالوقت',
    'parentApp.skillMap.openFull': 'افتح الخريطة الكاملة',

    // Profile placeholder
    'parentApp.profile.childTitle': 'ملف الطفل',
    'parentApp.profile.accountTitle': 'إعدادات الحساب',
    'parentApp.profile.streakStat': 'سلسلة',
    'parentApp.profile.lessonsStat': 'دروس',
    'parentApp.profile.masteryStat': 'إتقان',
    'parentApp.profile.languageLabel': 'اللغة',
    'parentApp.profile.planLabel': 'الخطة',
    'parentApp.profile.planFree': 'خطة مجانية',
    'parentApp.profile.upgradeCta': 'ترقية إلى Supernova',
    'parentApp.profile.phoneLabel': 'رقم الهاتف',
    'parentApp.profile.phoneNotSet': 'غير مضاف',

    // Messages placeholder
    'parentApp.messages.headline': 'الرسائل',
    'parentApp.messages.empty': 'لا توجد رسائل بعد',
    'parentApp.messages.value': 'إعلانات المدرسة، رسائل المعلمين، وإشعارات النظام تصل هنا',
    'parentApp.messages.feature1': 'إعلانات مدرسية',
    'parentApp.messages.feature2': 'رسائل من المعلمين',
    'parentApp.messages.feature3': 'إشعارات النظام',

    // Action items (v1.1 Home)
    'parentApp.actions.sectionHeader': 'ينتظر إجراءك',
    'parentApp.actions.signPermissionTitle': 'توقيع نموذج إذن',
    'parentApp.actions.signPermissionCta': 'توقيع',
    'parentApp.actions.signPermissionResolvedToast': 'تم التوقيع ✓',
    'parentApp.actions.signModalTitle': 'توقيع رقمي',
    'parentApp.actions.signModalBody':
      'بالنقر على "أوافق" أنت تمنح طفلك إذناً للمشاركة في هذه الفعالية. يحفظ توقيعك الرقمي بأمان.',
    'parentApp.actions.signModalConfirm': 'أوافق',
    'parentApp.actions.signModalCancel': 'إلغاء',
    'parentApp.actions.ackNoteTitle': 'إشعار يحتاج قراءة',
    'parentApp.actions.ackNoteCta': 'اقرأ الآن',
    'parentApp.actions.ackNoteResolvedToast': 'تم القراءة ✓',
    'parentApp.actions.replyTitle': 'رد سريع',
    'parentApp.actions.replyChipThanks': 'شكراً 🙏',
    'parentApp.actions.replyChipDone': 'تم 👍',
    'parentApp.actions.replyChipNeedTime': 'أحتاج وقت إضافي',
    'parentApp.actions.replyChipCustom': 'كتابة...',
    'parentApp.actions.replyResolvedToast': 'تم الإرسال ✓',
    'parentApp.actions.replyModalTitle': 'رسالة مخصصة',
    'parentApp.actions.replyModalPlaceholder': 'اكتب ردك هنا...',
    'parentApp.actions.replyModalSend': 'إرسال',
    'parentApp.actions.replyModalCancel': 'إلغاء',
    'parentApp.actions.rsvpTitle': 'تأكيد حضور',
    'parentApp.actions.rsvpYes': 'نعم',
    'parentApp.actions.rsvpNo': 'لا',
    'parentApp.actions.rsvpResolvedToast': 'تم التأكيد ✓',

    // Footer (v1.1 Home)
    'parentApp.footer.lastSynced': 'آخر مزامنة قبل {duration}',
    'parentApp.footer.privacy': 'بياناتك خاصة.',
    'parentApp.footer.manageSharing': 'تحكم في المشاركة',
    'parentApp.footer.justNow': 'لحظات',
    'parentApp.footer.minutesAgo': '{n} دقائق',
    'parentApp.footer.minuteAgo': 'دقيقة',
    'parentApp.footer.hoursAgo': '{n} ساعات',
    'parentApp.footer.hourAgo': 'ساعة',
    'parentApp.footer.refreshAria': 'تحديث',

    // School logistics shortcuts (2x2 strip)
    'parentApp.school.shortcutsLabel': 'مهامّ المدرسة',
    'parentApp.school.calendar.title': 'التقويم',
    'parentApp.school.calendar.subtitle': 'الأحداث القادمة',
    'parentApp.school.assignments.title': 'الواجبات',
    'parentApp.school.assignments.subtitle': 'مهام يومية',
    'parentApp.school.exams.title': 'الاختبارات',
    'parentApp.school.exams.subtitle': 'تحضير قادم',
    'parentApp.school.books.title': 'حقيبة الغد',
    'parentApp.school.books.subtitle': 'كتب الغد',
    'parentApp.school.formsTitle': 'النماذج',
    'parentApp.school.formsSubtitle': 'للتعبئة والتوقيع',
    'parentApp.school.attendanceTitle': 'الحضور',
    'parentApp.school.attendanceSubtitle': 'سجل الحضور والغياب',

    // Forms drawer
    'parentApp.school.forms.drawerTitle': 'النماذج',
    'parentApp.school.forms.statusPending': 'بانتظار التعبئة',
    'parentApp.school.forms.statusCompleted': 'مكتمل',
    'parentApp.school.forms.statusSigned': 'موقّع',
    'parentApp.school.forms.startFilling': 'ابدأ التعبئة',
    'parentApp.school.forms.viewResponse': 'عرض الإجابة',
    'parentApp.school.forms.noFormsEmpty': 'لا توجد نماذج حالياً',
    'parentApp.school.forms.noDeadline': 'بدون موعد',
    'parentApp.school.forms.submittedToast': 'تم! ✓',
    // Forms drawer — fill mode (v1.3)
    'parentApp.school.forms.questionsMeta': '{n} أسئلة · ~{m} دقائق',
    'parentApp.school.forms.backToList': 'العودة إلى النماذج',
    'parentApp.school.forms.submit': 'إرسال',
    'parentApp.school.forms.submitting': 'جارٍ الإرسال...',
    'parentApp.school.forms.close': 'إغلاق',
    'parentApp.school.forms.field.textPlaceholder': 'اكتب الإجابة...',
    'parentApp.school.forms.field.yes': 'نعم',
    'parentApp.school.forms.field.no': 'لا',
    'parentApp.school.forms.field.tapToSign': 'اضغط للتوقيع',
    'parentApp.school.forms.field.signed': 'موقّع',
    'parentApp.school.forms.field.tapToUpload': 'اضغط لرفع ملف',
    'parentApp.school.forms.field.fileAttached': 'ملف مرفق',

    // Attendance drawer
    'parentApp.school.attendance.drawerTitle': 'الحضور',
    'parentApp.school.attendance.statPresent': 'أيام الحضور',
    'parentApp.school.attendance.statAbsent': 'أيام الغياب',
    'parentApp.school.attendance.statTardy': 'تأخير',
    'parentApp.school.attendance.legendPresent': 'حضور',
    'parentApp.school.attendance.legendAbsent': 'غياب',
    'parentApp.school.attendance.legendTardy': 'تأخير',
    'parentApp.school.attendance.legendWeekend': 'عطلة نهاية الأسبوع',
    'parentApp.school.attendance.legendHoliday': 'عطلة رسمية',
    'parentApp.school.attendance.sickLeave': 'إجازة مرضية',
    'parentApp.school.attendance.excused': 'بعذر',
    'parentApp.school.attendance.unexcused': 'بدون عذر',
    'parentApp.school.attendance.tapDayHint': 'اضغط على يوم لعرض التفاصيل',
    'parentApp.school.attendance.dayPresent': 'حاضر',
    'parentApp.school.attendance.dayAbsent': 'غائب',
    'parentApp.school.attendance.dayTardy': 'متأخر',
    'parentApp.school.attendance.dayWeekend': 'عطلة',
    'parentApp.school.attendance.dayHoliday': 'عطلة رسمية',
    'parentApp.school.attendance.dayFuture': 'يوم قادم',
    // Attendance drawer — per-session details (v1.3)
    'parentApp.school.attendance.session.label': 'حصص اليوم',
    'parentApp.school.attendance.session.present': 'حاضر',
    'parentApp.school.attendance.session.late': 'متأخر',
    'parentApp.school.attendance.session.absent': 'غائب',
    'parentApp.school.attendance.session.excused': 'بعذر',
    'parentApp.school.attendance.session.tapHint': 'اضغط على يوم لرؤية الحصص',

    // Calendar drawer
    'parentApp.school.calendar.drawerTitle': 'تقويم المدرسة',
    'parentApp.school.calendar.todayLabel': 'اليوم',
    'parentApp.school.calendar.noEvents': 'لا توجد أحداث في هذا اليوم',
    'parentApp.school.calendar.tapDayHint': 'اضغط على يوم لعرض الأحداث',
    'parentApp.school.calendar.prevMonthAria': 'الشهر السابق',
    'parentApp.school.calendar.nextMonthAria': 'الشهر التالي',
    'parentApp.school.calendar.month.0': 'يناير',
    'parentApp.school.calendar.month.1': 'فبراير',
    'parentApp.school.calendar.month.2': 'مارس',
    'parentApp.school.calendar.month.3': 'أبريل',
    'parentApp.school.calendar.month.4': 'مايو',
    'parentApp.school.calendar.month.5': 'يونيو',
    'parentApp.school.calendar.month.6': 'يوليو',
    'parentApp.school.calendar.month.7': 'أغسطس',
    'parentApp.school.calendar.month.8': 'سبتمبر',
    'parentApp.school.calendar.month.9': 'أكتوبر',
    'parentApp.school.calendar.month.10': 'نوفمبر',
    'parentApp.school.calendar.month.11': 'ديسمبر',
    'parentApp.school.calendar.dow.0': 'أحد',
    'parentApp.school.calendar.dow.1': 'إثن',
    'parentApp.school.calendar.dow.2': 'ثلا',
    'parentApp.school.calendar.dow.3': 'أرب',
    'parentApp.school.calendar.dow.4': 'خمي',
    'parentApp.school.calendar.dow.5': 'جمع',
    'parentApp.school.calendar.dow.6': 'سبت',

    // Assignments drawer (5-state status taxonomy in v1.3)
    'parentApp.school.assignments.drawerTitle': 'الواجبات القادمة',
    'parentApp.school.assignments.empty': 'لا توجد واجبات حالياً',
    'parentApp.school.assignments.statusNotStarted': 'لم يبدأ',
    'parentApp.school.assignments.statusInProgress': 'قيد العمل',
    'parentApp.school.assignments.statusStarted': 'بدأ',
    'parentApp.school.assignments.statusInDanger': 'في خطر',
    'parentApp.school.assignments.statusLate': 'متأخر',
    'parentApp.school.assignments.statusDone': 'مكتمل',
    'parentApp.school.assignments.dueTomorrow': 'غداً',
    'parentApp.school.assignments.dueToday': 'اليوم',
    'parentApp.school.assignments.dueInDays': 'بعد {n} أيام',
    'parentApp.school.assignments.dueOverdue': 'فات الموعد',
    'parentApp.school.assignments.descriptionLabel': 'الوصف',

    // Exams drawer
    'parentApp.school.exams.drawerTitle': 'الاختبارات القادمة',
    'parentApp.school.exams.empty': 'لا توجد اختبارات قريبة',
    'parentApp.school.exams.inDays': 'في غضون {n} أيام',
    'parentApp.school.exams.tomorrow': 'غداً',
    'parentApp.school.exams.today': 'اليوم',
    'parentApp.school.exams.topicsLabel': 'المواضيع',
    'parentApp.school.exams.tipsLabel': 'نصائح للدراسة',
    'parentApp.school.exams.toggleTipsAria': 'إظهار النصائح',

    // Tomorrow's books drawer
    'parentApp.school.books.drawerTitle': 'حقيبة الغد',
    'parentApp.school.books.headerOne': 'غداً ({day}) {name} بحاجة إلى…',
    'parentApp.school.books.headerNext': '{day} {name} بحاجة إلى…',
    'parentApp.school.books.allKidsHeader': 'حقائب الغد',
    'parentApp.school.books.packedCount': '{packed}/{total} جاهز',
    'parentApp.school.books.allPacked': 'كل شيء جاهز! ✨',
    'parentApp.school.books.cta': 'هل جهّزت كل شيء؟',
    'parentApp.school.books.itemsCount': '{n} غرض',
    'parentApp.school.books.booksCount': '{n} كتب',

    // Add child sheet (tapped from the "+" pill on Home)
    'parentApp.addChild.title': 'إضافة طفل',
    'parentApp.addChild.subtitle': 'اربط طفلاً آخر بحسابك بسرعة',
    'parentApp.addChild.scanLabel': 'امسح رمز QR',
    'parentApp.addChild.scanHint': 'وجّه الكاميرا نحو الرمز',
    'parentApp.addChild.scanCta': 'محاكاة المسح',
    'parentApp.addChild.scanning': 'جارٍ المسح...',
    'parentApp.addChild.divider': 'أو',
    'parentApp.addChild.codeTitle': 'أدخل رمز الدعوة',
    'parentApp.addChild.codePlaceholder': 'الرمز من ورقة الدعوة',
    'parentApp.addChild.codeHelper': 'الرمز مكوّن من 6 خانات على الأقل',
    'parentApp.addChild.codeCta': 'ربط',
    'parentApp.addChild.linking': 'جارٍ الربط...',
    'parentApp.addChild.addedToast': 'تم إضافة {name} 🎉',
    'parentApp.addChild.closeAria': 'إغلاق',

    // BottomSheet — drawer-to-drawer swipe affordance (Fix 2)
    'parentApp.sheet.nextDrawerAria': 'القائمة التالية',
    'parentApp.sheet.prevDrawerAria': 'القائمة السابقة',

    // Common
    'parentApp.common.backToHome': 'العودة إلى الرئيسية',
    'parentApp.common.comingSoon': 'قريباً',
  },
  en: {
    // Tabs
    'parentApp.tab.home': 'Home',
    'parentApp.tab.awareAi': 'Aware AI',
    'parentApp.tab.skillMap': 'Skill Map',
    'parentApp.tab.profile': 'Profile',
    'parentApp.tab.messages': 'Messages',

    // Header
    'parentApp.header.addChild': '+ Add',
    'parentApp.header.refreshNow': 'Refresh',
    'parentApp.header.justUpdated': 'Updated just now',
    'parentApp.header.notificationsAria': 'Notifications',
    'parentApp.header.profileAria': 'Profile',

    // Greeting strip (dynamic per time band — phrases live in
    // data/parentAppGreetings.ts; only fixed labels go here)
    'parentApp.greeting.parentNameFallback': 'Hi',
    'parentApp.greeting.refreshHint': 'Refresh for a new message',

    // Hero card
    'parentApp.hero.todayPill': 'Today',
    'parentApp.hero.lessonsHeadline': '{name} finished {n} lessons today 🎉',
    'parentApp.hero.lessonsHeadlineMale': '{name} finished {n} lessons today 🎉',
    'parentApp.hero.durationLabel': 'Time',
    'parentApp.hero.durationValue': '{mins} min',
    'parentApp.hero.accuracyLabel': 'Accuracy',
    'parentApp.hero.accuracyValue': '{accuracy}%',
    'parentApp.hero.weakAreaLabel': 'Focus',
    'parentApp.hero.cheerCta': 'Cheer {name} 🎉',
    'parentApp.hero.cheeredToast': 'Done! 🎉',

    // Celebration card
    'parentApp.celebration.streak': '{days}-day streak! 🔥',
    'parentApp.celebration.mastery': '{name} mastered a new skill 🌟',
    'parentApp.celebration.teacherPraise': 'Teacher praised {name} 👏',

    // AI convo starter
    'parentApp.ai.title': "Today's prompt",
    'parentApp.ai.suggestedBy': 'Suggested by AI',
    'parentApp.ai.defaultPrompt': 'Ask Sara about her math lesson today — what did she love most?',

    // Deadline card
    'parentApp.deadline.title': 'Upcoming',
    'parentApp.deadline.dueIn': 'Due in {days} days',
    'parentApp.deadline.dueToday': 'Today',
    'parentApp.deadline.dueTomorrow': 'Tomorrow',
    'parentApp.deadline.moreLink': '+{n} more deadlines',

    // Announcement card
    'parentApp.announcement.tag': 'School announcement',

    // Message preview
    'parentApp.message.preview': 'New message',
    'parentApp.message.unread': 'unread',

    // Supernova teaser
    'parentApp.supernova.title': 'Unlock Supernova',
    'parentApp.supernova.body': 'Deeper analytics + AI sessions with your child',
    'parentApp.supernova.cta': 'Learn more',

    // Aware AI placeholder
    'parentApp.awareAi.headline': 'Smart AI coach coming soon',
    'parentApp.awareAi.value': 'Daily prompts, weekly insights, and answers to anything you wonder',
    'parentApp.awareAi.feature1': 'Daily conversation starters',
    'parentApp.awareAi.feature2': 'Weekly insights & patterns',
    'parentApp.awareAi.feature3': 'Ask anything about your child',

    // Skill Map placeholder
    'parentApp.skillMap.headline': "Your child's skill map",
    'parentApp.skillMap.value': "See strengths, gaps, and Bloom's depth across every skill",
    'parentApp.skillMap.feature1': 'See strengths & weaknesses',
    "parentApp.skillMap.feature2": "Bloom's depth per skill",
    'parentApp.skillMap.feature3': 'Mastery progress over time',
    'parentApp.skillMap.openFull': 'Open full skill map',

    // Profile placeholder
    'parentApp.profile.childTitle': 'Child profile',
    'parentApp.profile.accountTitle': 'Account settings',
    'parentApp.profile.streakStat': 'Streak',
    'parentApp.profile.lessonsStat': 'Lessons',
    'parentApp.profile.masteryStat': 'Mastery',
    'parentApp.profile.languageLabel': 'Language',
    'parentApp.profile.planLabel': 'Plan',
    'parentApp.profile.planFree': 'Free plan',
    'parentApp.profile.upgradeCta': 'Upgrade to Supernova',
    'parentApp.profile.phoneLabel': 'Phone',
    'parentApp.profile.phoneNotSet': 'Not set',

    // Messages placeholder
    'parentApp.messages.headline': 'Inbox',
    'parentApp.messages.empty': 'No messages yet',
    'parentApp.messages.value': 'School announcements, teacher messages, and system notifications land here',
    'parentApp.messages.feature1': 'School announcements',
    'parentApp.messages.feature2': 'Messages from teachers',
    'parentApp.messages.feature3': 'System notifications',

    // Action items (v1.1 Home)
    'parentApp.actions.sectionHeader': 'Needs your action',
    'parentApp.actions.signPermissionTitle': 'Sign permission slip',
    'parentApp.actions.signPermissionCta': 'Sign',
    'parentApp.actions.signPermissionResolvedToast': 'Signed ✓',
    'parentApp.actions.signModalTitle': 'Digital signature',
    'parentApp.actions.signModalBody':
      'By tapping "Agree" you give your child permission to take part in this activity. Your digital signature is stored securely.',
    'parentApp.actions.signModalConfirm': 'Agree',
    'parentApp.actions.signModalCancel': 'Cancel',
    'parentApp.actions.ackNoteTitle': 'Acknowledge note',
    'parentApp.actions.ackNoteCta': 'Read',
    'parentApp.actions.ackNoteResolvedToast': 'Marked as read ✓',
    'parentApp.actions.replyTitle': 'Quick reply',
    'parentApp.actions.replyChipThanks': 'Thanks 🙏',
    'parentApp.actions.replyChipDone': 'Got it 👍',
    'parentApp.actions.replyChipNeedTime': 'Need more time',
    'parentApp.actions.replyChipCustom': 'Custom...',
    'parentApp.actions.replyResolvedToast': 'Sent ✓',
    'parentApp.actions.replyModalTitle': 'Custom message',
    'parentApp.actions.replyModalPlaceholder': 'Type your reply here...',
    'parentApp.actions.replyModalSend': 'Send',
    'parentApp.actions.replyModalCancel': 'Cancel',
    'parentApp.actions.rsvpTitle': 'RSVP',
    'parentApp.actions.rsvpYes': 'Yes',
    'parentApp.actions.rsvpNo': 'No',
    'parentApp.actions.rsvpResolvedToast': 'Confirmed ✓',

    // Footer (v1.1 Home)
    'parentApp.footer.lastSynced': 'Last synced {duration} ago',
    'parentApp.footer.privacy': 'Your data is private.',
    'parentApp.footer.manageSharing': 'Manage sharing',
    'parentApp.footer.justNow': 'just now',
    'parentApp.footer.minutesAgo': '{n} minutes',
    'parentApp.footer.minuteAgo': '1 minute',
    'parentApp.footer.hoursAgo': '{n} hours',
    'parentApp.footer.hourAgo': '1 hour',
    'parentApp.footer.refreshAria': 'Refresh',

    // School logistics shortcuts (2x2 strip)
    'parentApp.school.shortcutsLabel': 'School logistics',
    'parentApp.school.calendar.title': 'Calendar',
    'parentApp.school.calendar.subtitle': 'Upcoming events',
    'parentApp.school.assignments.title': 'Assignments',
    'parentApp.school.assignments.subtitle': 'Daily tasks',
    'parentApp.school.exams.title': 'Exams',
    'parentApp.school.exams.subtitle': 'Up next',
    'parentApp.school.books.title': "Tomorrow's bag",
    'parentApp.school.books.subtitle': 'Books needed',
    'parentApp.school.formsTitle': 'Forms',
    'parentApp.school.formsSubtitle': 'Fill & sign',
    'parentApp.school.attendanceTitle': 'Attendance',
    'parentApp.school.attendanceSubtitle': 'Present & absent record',

    // Forms drawer
    'parentApp.school.forms.drawerTitle': 'Forms',
    'parentApp.school.forms.statusPending': 'Awaiting fill',
    'parentApp.school.forms.statusCompleted': 'Completed',
    'parentApp.school.forms.statusSigned': 'Signed',
    'parentApp.school.forms.startFilling': 'Start filling',
    'parentApp.school.forms.viewResponse': 'View response',
    'parentApp.school.forms.noFormsEmpty': 'No forms right now',
    'parentApp.school.forms.noDeadline': 'No deadline',
    'parentApp.school.forms.submittedToast': 'Done! ✓',
    // Forms drawer — fill mode (v1.3)
    'parentApp.school.forms.questionsMeta': '{n} questions · ~{m} min',
    'parentApp.school.forms.backToList': 'Back to forms',
    'parentApp.school.forms.submit': 'Submit',
    'parentApp.school.forms.submitting': 'Sending...',
    'parentApp.school.forms.close': 'Close',
    'parentApp.school.forms.field.textPlaceholder': 'Type your answer...',
    'parentApp.school.forms.field.yes': 'Yes',
    'parentApp.school.forms.field.no': 'No',
    'parentApp.school.forms.field.tapToSign': 'Tap to sign',
    'parentApp.school.forms.field.signed': 'Signed',
    'parentApp.school.forms.field.tapToUpload': 'Tap to upload',
    'parentApp.school.forms.field.fileAttached': 'File attached',

    // Attendance drawer
    'parentApp.school.attendance.drawerTitle': 'Attendance',
    'parentApp.school.attendance.statPresent': 'Present days',
    'parentApp.school.attendance.statAbsent': 'Absent days',
    'parentApp.school.attendance.statTardy': 'Tardy',
    'parentApp.school.attendance.legendPresent': 'Present',
    'parentApp.school.attendance.legendAbsent': 'Absent',
    'parentApp.school.attendance.legendTardy': 'Tardy',
    'parentApp.school.attendance.legendWeekend': 'Weekend',
    'parentApp.school.attendance.legendHoliday': 'Holiday',
    'parentApp.school.attendance.sickLeave': 'Sick leave',
    'parentApp.school.attendance.excused': 'Excused',
    'parentApp.school.attendance.unexcused': 'Unexcused',
    'parentApp.school.attendance.tapDayHint': 'Tap a day to see details',
    'parentApp.school.attendance.dayPresent': 'Present',
    'parentApp.school.attendance.dayAbsent': 'Absent',
    'parentApp.school.attendance.dayTardy': 'Tardy',
    'parentApp.school.attendance.dayWeekend': 'Weekend',
    'parentApp.school.attendance.dayHoliday': 'Holiday',
    'parentApp.school.attendance.dayFuture': 'Upcoming',
    // Attendance drawer — per-session details (v1.3)
    'parentApp.school.attendance.session.label': 'Today\'s sessions',
    'parentApp.school.attendance.session.present': 'Present',
    'parentApp.school.attendance.session.late': 'Late',
    'parentApp.school.attendance.session.absent': 'Absent',
    'parentApp.school.attendance.session.excused': 'Excused',
    'parentApp.school.attendance.session.tapHint': 'Tap a day to see sessions',

    // Calendar drawer
    'parentApp.school.calendar.drawerTitle': 'School calendar',
    'parentApp.school.calendar.todayLabel': 'Today',
    'parentApp.school.calendar.noEvents': 'No events on this day',
    'parentApp.school.calendar.tapDayHint': 'Tap a day to see events',
    'parentApp.school.calendar.prevMonthAria': 'Previous month',
    'parentApp.school.calendar.nextMonthAria': 'Next month',
    'parentApp.school.calendar.month.0': 'January',
    'parentApp.school.calendar.month.1': 'February',
    'parentApp.school.calendar.month.2': 'March',
    'parentApp.school.calendar.month.3': 'April',
    'parentApp.school.calendar.month.4': 'May',
    'parentApp.school.calendar.month.5': 'June',
    'parentApp.school.calendar.month.6': 'July',
    'parentApp.school.calendar.month.7': 'August',
    'parentApp.school.calendar.month.8': 'September',
    'parentApp.school.calendar.month.9': 'October',
    'parentApp.school.calendar.month.10': 'November',
    'parentApp.school.calendar.month.11': 'December',
    'parentApp.school.calendar.dow.0': 'Sun',
    'parentApp.school.calendar.dow.1': 'Mon',
    'parentApp.school.calendar.dow.2': 'Tue',
    'parentApp.school.calendar.dow.3': 'Wed',
    'parentApp.school.calendar.dow.4': 'Thu',
    'parentApp.school.calendar.dow.5': 'Fri',
    'parentApp.school.calendar.dow.6': 'Sat',

    // Assignments drawer (5-state status taxonomy in v1.3)
    'parentApp.school.assignments.drawerTitle': 'Upcoming assignments',
    'parentApp.school.assignments.empty': 'No assignments right now',
    'parentApp.school.assignments.statusNotStarted': 'Not started',
    'parentApp.school.assignments.statusInProgress': 'In progress',
    'parentApp.school.assignments.statusStarted': 'Started',
    'parentApp.school.assignments.statusInDanger': 'In danger',
    'parentApp.school.assignments.statusLate': 'Late',
    'parentApp.school.assignments.statusDone': 'Done',
    'parentApp.school.assignments.dueTomorrow': 'Tomorrow',
    'parentApp.school.assignments.dueToday': 'Today',
    'parentApp.school.assignments.dueInDays': 'In {n} days',
    'parentApp.school.assignments.dueOverdue': 'Past due',
    'parentApp.school.assignments.descriptionLabel': 'Description',

    // Exams drawer
    'parentApp.school.exams.drawerTitle': 'Upcoming exams',
    'parentApp.school.exams.empty': 'No exams coming up',
    'parentApp.school.exams.inDays': 'In {n} days',
    'parentApp.school.exams.tomorrow': 'Tomorrow',
    'parentApp.school.exams.today': 'Today',
    'parentApp.school.exams.topicsLabel': 'Topics',
    'parentApp.school.exams.tipsLabel': 'Study tips',
    'parentApp.school.exams.toggleTipsAria': 'Show study tips',

    // Tomorrow's books drawer
    'parentApp.school.books.drawerTitle': "Tomorrow's bag",
    'parentApp.school.books.headerOne': 'Tomorrow ({day}) {name} needs…',
    'parentApp.school.books.headerNext': '{day} {name} needs…',
    'parentApp.school.books.allKidsHeader': "Tomorrow's bags",
    'parentApp.school.books.packedCount': '{packed}/{total} packed',
    'parentApp.school.books.allPacked': 'All packed! ✨',
    'parentApp.school.books.cta': 'All packed?',
    'parentApp.school.books.itemsCount': '{n} items',
    'parentApp.school.books.booksCount': '{n} books',

    // Add child sheet (tapped from the "+" pill on Home)
    'parentApp.addChild.title': 'Add a child',
    'parentApp.addChild.subtitle': 'Link another child to your account in seconds',
    'parentApp.addChild.scanLabel': 'Scan QR code',
    'parentApp.addChild.scanHint': 'Point the camera at the code',
    'parentApp.addChild.scanCta': 'Simulate scan',
    'parentApp.addChild.scanning': 'Scanning...',
    'parentApp.addChild.divider': 'or',
    'parentApp.addChild.codeTitle': 'Enter invite code',
    'parentApp.addChild.codePlaceholder': 'Code from the invite paper',
    'parentApp.addChild.codeHelper': 'Codes are at least 6 characters',
    'parentApp.addChild.codeCta': 'Link',
    'parentApp.addChild.linking': 'Linking...',
    'parentApp.addChild.addedToast': '{name} added 🎉',
    'parentApp.addChild.closeAria': 'Close',

    // BottomSheet — drawer-to-drawer swipe affordance (Fix 2)
    'parentApp.sheet.nextDrawerAria': 'Next sheet',
    'parentApp.sheet.prevDrawerAria': 'Previous sheet',

    // Common
    'parentApp.common.backToHome': 'Back to Home',
    'parentApp.common.comingSoon': 'Coming soon',
  },
};

/** Lookup helper. Falls back to the key when missing. */
export function getParentAppString(locale: Locale, key: string): string {
  return parentAppI18n[locale][key] ?? key;
}

/** Tiny `{name}` template substitution. Missing vars are left untouched. */
export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : `{${key}}`
  );
}
