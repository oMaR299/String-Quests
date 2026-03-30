import type {
  Notification,
  NotificationTemplate,
  SavedAudience,
  FormDefinition,
  FormResponse,
  DeliveryStats,
  ChannelStats,
  NotificationState,
} from '../types/notification';

// --- Helpers ---

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function hoursAgo(n: number): string {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

function generateHourlyOpens(): { hour: string; count: number }[] {
  return Array.from({ length: 24 }, (_, i) => {
    const h = i.toString().padStart(2, '0') + ':00';
    // Peak at 8-9 AM and 1-2 PM
    const base = (i >= 7 && i <= 9) ? 20 : (i >= 13 && i <= 14) ? 15 : (i >= 20 || i <= 5) ? 1 : 8;
    return { hour: h, count: base + Math.floor(Math.random() * 10) };
  });
}

function generateChannelStats(total: number): ChannelStats {
  const sent = total;
  const delivered = Math.round(sent * (0.92 + Math.random() * 0.07));
  const opened = Math.round(delivered * (0.35 + Math.random() * 0.45));
  const clicked = Math.round(opened * (0.15 + Math.random() * 0.35));
  const failed = sent - delivered;
  return {
    sent,
    delivered,
    opened,
    clicked,
    failed,
    bounced: Math.round(failed * 0.3),
    dismissed: Math.round(opened * 0.2),
  };
}

export function simulateDelivery(notification: Notification): DeliveryStats {
  const total = notification.estimatedReach;
  const stats: DeliveryStats = {
    notificationId: notification.id,
    totalTargeted: total,
    channels: {},
    hourlyOpens: generateHourlyOpens(),
    byRole: [
      { role: 'student', count: Math.round(total * 0.5), openRate: 0.65 + Math.random() * 0.2 },
      { role: 'teacher', count: Math.round(total * 0.2), openRate: 0.75 + Math.random() * 0.15 },
      { role: 'parent', count: Math.round(total * 0.25), openRate: 0.45 + Math.random() * 0.3 },
      { role: 'admin', count: Math.round(total * 0.05), openRate: 0.9 + Math.random() * 0.1 },
    ],
  };

  for (const channel of notification.channels) {
    stats.channels[channel] = generateChannelStats(total);
  }
  return stats;
}

// --- Mock Notifications ---

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    title: 'موعد الاختبارات النهائية للفصل الثاني',
    titleEn: 'Final Exams Schedule - Semester 2',
    shortMessage: 'تبدأ الاختبارات النهائية يوم الأحد ١٥ يونيو. يرجى الاطلاع على الجدول.',
    shortMessageEn: 'Final exams start Sunday, June 15. Please check the schedule.',
    body: 'أعزاءنا أولياء الأمور والطلاب،\n\nنود إعلامكم بأن الاختبارات النهائية للفصل الدراسي الثاني ستبدأ يوم الأحد الموافق ١٥ يونيو ٢٠٢٥. يرجى الاطلاع على جدول الاختبارات المرفق والتأكد من حضور أبنائكم في الوقت المحدد.\n\nمع تمنياتنا للجميع بالتوفيق والنجاح.',
    channels: ['email', 'bell', 'popup'],
    priority: 'urgent',
    status: 'sent',
    audience: { roles: ['student', 'parent'], grades: [], sections: [], campusIds: [], individualIds: [] },
    estimatedReach: 45,
    sendAt: null,
    channelConfig: {
      email: { senderName: 'مدارس الخضر الحديثة', ctaButton: { label: 'عرض الجدول', url: '/exams' } },
      popup: { size: 'md', dismissible: true, primaryButton: { label: 'فهمت', url: '#' } },
    },
    createdAt: daysAgo(28),
    updatedAt: daysAgo(28),
    sentAt: daysAgo(28),
    tags: ['exams', 'academic'],
    deliveryStats: {
      notificationId: 'notif-1',
      totalTargeted: 45,
      channels: {
        email: { sent: 45, delivered: 43, opened: 38, clicked: 22, failed: 2, bounced: 1, dismissed: 0 },
        bell: { sent: 45, delivered: 45, opened: 35, clicked: 20, failed: 0, bounced: 0, dismissed: 8 },
        popup: { sent: 45, delivered: 44, opened: 44, clicked: 30, failed: 1, bounced: 0, dismissed: 14 },
      },
      hourlyOpens: generateHourlyOpens(),
      byRole: [
        { role: 'student', count: 25, openRate: 0.78 },
        { role: 'parent', count: 20, openRate: 0.85 },
      ],
    },
  },
  {
    id: 'notif-2',
    title: 'إجازة اليوم الوطني السعودي',
    titleEn: 'Saudi National Day Holiday',
    shortMessage: 'ستكون المدرسة مغلقة يوم الثلاثاء ٢٣ سبتمبر بمناسبة اليوم الوطني.',
    channels: ['email', 'banner'],
    priority: 'normal',
    status: 'sent',
    audience: { roles: ['student', 'teacher', 'parent'], grades: [], sections: [], campusIds: [], individualIds: [] },
    estimatedReach: 83,
    sendAt: null,
    body: 'تحية طيبة،\n\nنود إعلامكم بأن المدارس ستكون مغلقة يوم الثلاثاء الموافق ٢٣ سبتمبر بمناسبة اليوم الوطني السعودي.\n\nكل عام وأنتم بخير.',
    channelConfig: {
      email: { senderName: 'مدارس الخضر الحديثة' },
      banner: { bgGradient: 'from-green-600 to-green-800', textColor: 'white', dismissible: true },
    },
    createdAt: daysAgo(22),
    updatedAt: daysAgo(22),
    sentAt: daysAgo(22),
    tags: ['holiday', 'administrative'],
    deliveryStats: {
      notificationId: 'notif-2',
      totalTargeted: 83,
      channels: {
        email: { sent: 83, delivered: 80, opened: 62, clicked: 5, failed: 3, bounced: 2, dismissed: 0 },
        banner: { sent: 83, delivered: 83, opened: 78, clicked: 12, failed: 0, bounced: 0, dismissed: 45 },
      },
      hourlyOpens: generateHourlyOpens(),
      byRole: [
        { role: 'student', count: 25, openRate: 0.72 },
        { role: 'teacher', count: 15, openRate: 0.92 },
        { role: 'parent', count: 20, openRate: 0.68 },
      ],
    },
  },
  {
    id: 'notif-3',
    title: 'رحلة ميدانية: متحف العلوم والتقنية',
    titleEn: 'Field Trip: Science & Technology Museum',
    shortMessage: 'رحلة ميدانية لطلاب الصف الرابع إلى متحف العلوم يوم الخميس. يرجى تعبئة نموذج الموافقة.',
    channels: ['email', 'bell'],
    priority: 'normal',
    status: 'sent',
    body: 'أولياء أمور طلاب الصف الرابع الكرام،\n\nيسعدنا إعلامكم بتنظيم رحلة ميدانية إلى متحف العلوم والتقنية يوم الخميس القادم. يرجى تعبئة نموذج الموافقة المرفق في أقرب وقت ممكن.',
    audience: { roles: ['parent'], grades: [4], sections: [], campusIds: [], individualIds: [] },
    estimatedReach: 10,
    sendAt: null,
    channelConfig: {
      email: { senderName: 'مدارس الخضر الحديثة', ctaButton: { label: 'تعبئة نموذج الموافقة', url: '#form' } },
    },
    attachedFormId: 'form-1',
    createdAt: daysAgo(15),
    updatedAt: daysAgo(15),
    sentAt: daysAgo(15),
    tags: ['field-trip', 'event'],
    deliveryStats: {
      notificationId: 'notif-3',
      totalTargeted: 10,
      channels: {
        email: { sent: 10, delivered: 10, opened: 9, clicked: 8, failed: 0, bounced: 0, dismissed: 0 },
        bell: { sent: 10, delivered: 10, opened: 8, clicked: 6, failed: 0, bounced: 0, dismissed: 2 },
      },
      hourlyOpens: generateHourlyOpens(),
      byRole: [{ role: 'parent', count: 10, openRate: 0.9 }],
    },
  },
  {
    id: 'notif-4',
    title: 'اجتماع أولياء الأمور - الفصل الثاني',
    titleEn: 'Parent-Teacher Meeting - Semester 2',
    shortMessage: 'اجتماع أولياء الأمور يوم الأربعاء ٢٠ مارس من ٤ إلى ٦ مساءً.',
    channels: ['email', 'popup', 'banner'],
    priority: 'normal',
    status: 'sent',
    body: 'أولياء الأمور الكرام،\n\nيسرنا دعوتكم لحضور اجتماع أولياء الأمور للفصل الدراسي الثاني يوم الأربعاء ٢٠ مارس من الساعة ٤ إلى ٦ مساءً. سيتم مناقشة مستوى أبنائكم الأكاديمي وخطط التطوير.',
    audience: { roles: ['parent'], grades: [], sections: [], campusIds: [], individualIds: [] },
    estimatedReach: 20,
    sendAt: null,
    channelConfig: {
      email: { senderName: 'مدارس الخضر الحديثة' },
      popup: { size: 'md', dismissible: true, primaryButton: { label: 'تأكيد الحضور', url: '#rsvp' } },
      banner: { bgGradient: 'from-blue-500 to-indigo-600', textColor: 'white', dismissible: true, actionButton: { label: 'التفاصيل', url: '#' } },
    },
    attachedFormId: 'form-2',
    createdAt: daysAgo(12),
    updatedAt: daysAgo(12),
    sentAt: daysAgo(12),
    tags: ['meeting', 'parent'],
    deliveryStats: {
      notificationId: 'notif-4',
      totalTargeted: 20,
      channels: {
        email: { sent: 20, delivered: 19, opened: 16, clicked: 12, failed: 1, bounced: 1, dismissed: 0 },
        popup: { sent: 20, delivered: 20, opened: 20, clicked: 14, failed: 0, bounced: 0, dismissed: 6 },
        banner: { sent: 20, delivered: 20, opened: 18, clicked: 10, failed: 0, bounced: 0, dismissed: 12 },
      },
      hourlyOpens: generateHourlyOpens(),
      byRole: [{ role: 'parent', count: 20, openRate: 0.85 }],
    },
  },
  {
    id: 'notif-5',
    title: 'تحديث نظام String الجديد',
    titleEn: 'New String Platform Update',
    shortMessage: 'تم إطلاق تحديث جديد لمنصة String مع ميزات تعليمية محسنة.',
    channels: ['bell', 'banner'],
    priority: 'normal',
    status: 'sent',
    body: 'مرحباً،\n\nيسعدنا إعلامكم بإطلاق التحديث الجديد لمنصة String، والذي يتضمن خريطة المهارات المحسنة وتتبع التقدم الذكي.',
    audience: { roles: ['student', 'teacher'], grades: [], sections: [], campusIds: [], individualIds: [] },
    estimatedReach: 40,
    sendAt: null,
    channelConfig: {
      banner: { bgGradient: 'from-purple-500 to-pink-500', textColor: 'white', dismissible: true, actionButton: { label: 'اكتشف المزيد', url: '/skill-map' } },
    },
    createdAt: daysAgo(8),
    updatedAt: daysAgo(8),
    sentAt: daysAgo(8),
    tags: ['platform', 'update'],
    deliveryStats: {
      notificationId: 'notif-5',
      totalTargeted: 40,
      channels: {
        bell: { sent: 40, delivered: 40, opened: 30, clicked: 18, failed: 0, bounced: 0, dismissed: 5 },
        banner: { sent: 40, delivered: 40, opened: 36, clicked: 22, failed: 0, bounced: 0, dismissed: 20 },
      },
      hourlyOpens: generateHourlyOpens(),
      byRole: [
        { role: 'student', count: 25, openRate: 0.7 },
        { role: 'teacher', count: 15, openRate: 0.88 },
      ],
    },
  },
  {
    id: 'notif-6',
    title: 'تهنئة: أفضل فصل في الشهر!',
    titleEn: 'Congratulations: Best Class of the Month!',
    shortMessage: 'مبارك لفصل ٤أ لحصولهم على لقب أفضل فصل لشهر فبراير!',
    channels: ['bell', 'popup'],
    priority: 'normal',
    status: 'sent',
    body: 'نتقدم بأحر التهاني لطلاب الصف الرابع (أ) وأستاذهم على حصولهم على لقب أفضل فصل لشهر فبراير! أداء متميز ومستوى أكاديمي رائع. نفخر بكم!',
    audience: { roles: ['student', 'teacher', 'parent'], grades: [4], sections: ['A'], campusIds: [], individualIds: [] },
    estimatedReach: 12,
    sendAt: null,
    channelConfig: {
      popup: { size: 'md', dismissible: true, primaryButton: { label: 'شكراً!', url: '#' } },
    },
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
    sentAt: daysAgo(5),
    tags: ['celebration', 'achievement'],
    deliveryStats: {
      notificationId: 'notif-6',
      totalTargeted: 12,
      channels: {
        bell: { sent: 12, delivered: 12, opened: 12, clicked: 8, failed: 0, bounced: 0, dismissed: 0 },
        popup: { sent: 12, delivered: 12, opened: 12, clicked: 10, failed: 0, bounced: 0, dismissed: 2 },
      },
      hourlyOpens: generateHourlyOpens(),
      byRole: [
        { role: 'student', count: 5, openRate: 1 },
        { role: 'teacher', count: 1, openRate: 1 },
        { role: 'parent', count: 5, openRate: 0.8 },
      ],
    },
  },
  {
    id: 'notif-7',
    title: 'تذكير: تسليم مشروع العلوم',
    titleEn: 'Reminder: Science Project Submission',
    shortMessage: 'آخر موعد لتسليم مشروع العلوم هو يوم الأحد القادم.',
    channels: ['bell'],
    priority: 'normal',
    status: 'sent',
    body: 'عزيزي الطالب،\n\nنذكرك بأن آخر موعد لتسليم مشروع العلوم هو يوم الأحد القادم. تأكد من إكمال جميع متطلبات المشروع.',
    audience: { roles: ['student'], grades: [3], sections: [], campusIds: [], individualIds: [] },
    estimatedReach: 15,
    sendAt: null,
    channelConfig: {},
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    sentAt: daysAgo(3),
    tags: ['academic', 'reminder'],
    deliveryStats: {
      notificationId: 'notif-7',
      totalTargeted: 15,
      channels: {
        bell: { sent: 15, delivered: 15, opened: 12, clicked: 5, failed: 0, bounced: 0, dismissed: 3 },
      },
      hourlyOpens: generateHourlyOpens(),
      byRole: [{ role: 'student', count: 15, openRate: 0.8 }],
    },
  },
  {
    id: 'notif-8',
    title: 'إعلان طوارئ: إغلاق المدرسة بسبب الطقس',
    titleEn: 'Emergency: School Closure Due to Weather',
    shortMessage: 'تم إغلاق المدرسة غداً بسبب تحذيرات الأرصاد. التعليم سيكون عن بعد.',
    channels: ['email', 'bell', 'popup', 'banner'],
    priority: 'urgent',
    status: 'sent',
    body: 'أولياء الأمور والطلاب والمعلمين،\n\nنظراً لتحذيرات الأرصاد الجوية بخصوص الأحوال الجوية القاسية، تقرر إغلاق جميع المدارس غداً. سيتم التحول إلى التعليم عن بعد عبر منصة String.\n\nالسلامة أولاً.',
    audience: { roles: ['student', 'teacher', 'parent', 'admin'], grades: [], sections: [], campusIds: [], individualIds: [] },
    estimatedReach: 83,
    sendAt: null,
    channelConfig: {
      email: { senderName: 'مدارس الخضر الحديثة — عاجل' },
      popup: { size: 'lg', dismissible: false, primaryButton: { label: 'فهمت', url: '#' } },
      banner: { bgGradient: 'from-red-600 to-orange-500', textColor: 'white', dismissible: false },
    },
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    sentAt: daysAgo(1),
    tags: ['emergency'],
    deliveryStats: {
      notificationId: 'notif-8',
      totalTargeted: 83,
      channels: {
        email: { sent: 83, delivered: 81, opened: 78, clicked: 5, failed: 2, bounced: 1, dismissed: 0 },
        bell: { sent: 83, delivered: 83, opened: 80, clicked: 10, failed: 0, bounced: 0, dismissed: 3 },
        popup: { sent: 83, delivered: 82, opened: 82, clicked: 75, failed: 1, bounced: 0, dismissed: 7 },
        banner: { sent: 83, delivered: 83, opened: 83, clicked: 15, failed: 0, bounced: 0, dismissed: 0 },
      },
      hourlyOpens: generateHourlyOpens(),
      byRole: [
        { role: 'student', count: 25, openRate: 0.95 },
        { role: 'teacher', count: 15, openRate: 0.98 },
        { role: 'parent', count: 20, openRate: 0.92 },
        { role: 'admin', count: 3, openRate: 1.0 },
      ],
    },
  },
  // --- Drafts ---
  {
    id: 'notif-draft-1',
    title: 'حفل نهاية العام الدراسي',
    shortMessage: 'دعوة لحضور حفل نهاية العام الدراسي يوم الخميس.',
    body: 'يسرنا دعوتكم لحضور حفل نهاية العام الدراسي...',
    channels: ['email', 'popup'],
    priority: 'normal',
    status: 'draft',
    audience: { roles: ['student', 'parent', 'teacher'], grades: [], sections: [], campusIds: [], individualIds: [] },
    estimatedReach: 83,
    sendAt: null,
    channelConfig: {
      email: { senderName: 'مدارس الخضر الحديثة' },
      popup: { size: 'md', dismissible: true },
    },
    createdAt: hoursAgo(6),
    updatedAt: hoursAgo(2),
    tags: ['event', 'celebration'],
  },
  {
    id: 'notif-draft-2',
    title: 'استطلاع رأي: تقييم المنهج الدراسي',
    shortMessage: 'شاركنا رأيك في المنهج الدراسي الحالي.',
    body: 'نرغب في معرفة آرائكم حول المنهج الدراسي...',
    channels: ['email', 'bell'],
    priority: 'normal',
    status: 'draft',
    audience: { roles: ['teacher'], grades: [], sections: [], campusIds: [], individualIds: [] },
    estimatedReach: 15,
    sendAt: null,
    channelConfig: {},
    createdAt: hoursAgo(48),
    updatedAt: hoursAgo(48),
    tags: ['survey', 'academic'],
  },
  // --- Scheduled ---
  {
    id: 'notif-sched-1',
    title: 'تذكير: بداية الفصل الدراسي الثالث',
    shortMessage: 'يبدأ الفصل الدراسي الثالث يوم الأحد. استعدوا!',
    body: 'أعزاءنا الطلاب والمعلمين،\n\nنذكركم بأن الفصل الدراسي الثالث يبدأ يوم الأحد القادم. نتمنى لكم فصلاً دراسياً مليئاً بالإنجازات.',
    channels: ['email', 'bell', 'banner'],
    priority: 'normal',
    status: 'scheduled',
    audience: { roles: ['student', 'teacher', 'parent'], grades: [], sections: [], campusIds: [], individualIds: [] },
    estimatedReach: 83,
    sendAt: daysFromNow(3),
    channelConfig: {
      email: { senderName: 'مدارس الخضر الحديثة' },
      banner: { bgGradient: 'from-emerald-500 to-teal-600', textColor: 'white', dismissible: true },
    },
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    tags: ['academic', 'semester'],
  },
];

// --- Templates ---

export const MOCK_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'إعلان أكاديمي',
    nameEn: 'Academic Announcement',
    description: 'قالب عام للإعلانات الأكاديمية',
    category: 'academic',
    channels: ['email', 'bell'],
    title: 'إعلان أكاديمي: [الموضوع]',
    titleEn: 'Academic Announcement: [Topic]',
    body: 'أعزاءنا الطلاب وأولياء الأمور،\n\n[محتوى الإعلان هنا]\n\nمع أطيب التحيات،\nإدارة المدرسة',
    shortMessage: '[ملخص الإعلان]',
    channelConfig: { email: { senderName: 'مدارس الخضر الحديثة' } },
    isSystem: true,
    usageCount: 12,
    createdAt: daysAgo(90),
  },
  {
    id: 'tmpl-2',
    name: 'تنبيه طوارئ',
    nameEn: 'Emergency Alert',
    description: 'للحالات الطارئة والإغلاق',
    category: 'emergency',
    channels: ['email', 'bell', 'popup', 'banner'],
    title: 'تنبيه عاجل: [الحالة]',
    titleEn: 'Urgent Alert: [Situation]',
    body: 'إلى جميع منسوبي المدرسة،\n\n[تفاصيل الحالة الطارئة]\n\nيرجى اتباع التعليمات الصادرة.\n\nإدارة المدرسة',
    shortMessage: 'تنبيه عاجل من المدرسة',
    channelConfig: {
      popup: { size: 'lg', dismissible: false },
      banner: { bgGradient: 'from-red-600 to-orange-500', textColor: 'white', dismissible: false },
    },
    isSystem: true,
    usageCount: 2,
    createdAt: daysAgo(90),
  },
  {
    id: 'tmpl-3',
    name: 'دعوة فعالية',
    nameEn: 'Event Invitation',
    description: 'دعوة لحضور فعالية أو احتفال مدرسي',
    category: 'event',
    channels: ['email', 'popup'],
    title: 'دعوة: [اسم الفعالية]',
    titleEn: 'Invitation: [Event Name]',
    body: 'يسرنا دعوتكم لحضور [اسم الفعالية] يوم [التاريخ] في [المكان].\n\n[تفاصيل إضافية]\n\nنتطلع لحضوركم!',
    shortMessage: 'دعوة لحضور [اسم الفعالية]',
    channelConfig: {
      email: { senderName: 'مدارس الخضر الحديثة' },
      popup: { size: 'md', dismissible: true, primaryButton: { label: 'تأكيد الحضور', url: '#' } },
    },
    isSystem: true,
    usageCount: 5,
    createdAt: daysAgo(90),
  },
  {
    id: 'tmpl-4',
    name: 'اجتماع أولياء الأمور',
    nameEn: 'Parent-Teacher Meeting',
    description: 'دعوة لاجتماع أولياء الأمور الدوري',
    category: 'administrative',
    channels: ['email', 'bell', 'banner'],
    title: 'اجتماع أولياء الأمور - [الفصل الدراسي]',
    body: 'أولياء الأمور الكرام،\n\nيسرنا دعوتكم لحضور اجتماع أولياء الأمور يوم [التاريخ] من الساعة [الوقت].\n\n[جدول الاجتماع]',
    shortMessage: 'اجتماع أولياء أمور يوم [التاريخ]',
    channelConfig: {
      banner: { bgGradient: 'from-blue-500 to-indigo-600', textColor: 'white', dismissible: true },
    },
    isSystem: true,
    usageCount: 8,
    createdAt: daysAgo(90),
  },
  {
    id: 'tmpl-5',
    name: 'تهنئة وإنجاز',
    nameEn: 'Achievement Celebration',
    description: 'تهنئة بإنجاز أكاديمي أو سلوكي',
    category: 'celebration',
    channels: ['bell', 'popup'],
    title: 'مبارك! [الإنجاز]',
    titleEn: 'Congratulations! [Achievement]',
    body: 'نتقدم بأحر التهاني لـ [الطالب/الفصل] على [الإنجاز]!\n\nنفخر بكم ونتمنى لكم مزيداً من التفوق.',
    shortMessage: 'مبارك! [وصف الإنجاز]',
    channelConfig: {
      popup: { size: 'md', dismissible: true, primaryButton: { label: 'شكراً!', url: '#' } },
    },
    isSystem: true,
    usageCount: 15,
    createdAt: daysAgo(90),
  },
  {
    id: 'tmpl-6',
    name: 'جدول الامتحانات',
    nameEn: 'Exam Schedule',
    description: 'إعلان جدول الاختبارات',
    category: 'academic',
    channels: ['email', 'bell', 'popup'],
    title: 'جدول اختبارات [الفترة]',
    body: 'أعزاءنا الطلاب وأولياء الأمور،\n\nيرجى الاطلاع على جدول اختبارات [الفترة]:\n\n[الجدول]\n\nمع تمنياتنا بالتوفيق.',
    shortMessage: 'جدول الاختبارات متاح الآن',
    channelConfig: {
      email: { senderName: 'مدارس الخضر الحديثة', ctaButton: { label: 'عرض الجدول', url: '#' } },
      popup: { size: 'lg', dismissible: true },
    },
    isSystem: true,
    usageCount: 6,
    createdAt: daysAgo(90),
  },
];

// --- Saved Audiences ---

export const MOCK_SAVED_AUDIENCES: SavedAudience[] = [
  {
    id: 'aud-1',
    name: 'جميع المعلمين',
    nameEn: 'All Teachers',
    target: { roles: ['teacher'], grades: [], sections: [], campusIds: [], individualIds: [] },
    estimatedCount: 15,
    createdAt: daysAgo(60),
  },
  {
    id: 'aud-2',
    name: 'أولياء أمور الصف العاشر',
    nameEn: 'Grade 10 Parents',
    target: { roles: ['parent'], grades: [10], sections: [], campusIds: [], individualIds: [] },
    estimatedCount: 2,
    createdAt: daysAgo(45),
  },
  {
    id: 'aud-3',
    name: 'طلاب الصف الثالث',
    nameEn: 'Grade 3 Students',
    target: { roles: ['student'], grades: [3], sections: [], campusIds: [], individualIds: [] },
    estimatedCount: 15,
    createdAt: daysAgo(30),
  },
];

// --- Forms ---

export const MOCK_FORMS: FormDefinition[] = [
  {
    id: 'form-1',
    title: 'نموذج موافقة الرحلة الميدانية',
    titleEn: 'Field Trip Permission Slip',
    description: 'يرجى تعبئة هذا النموذج للموافقة على مشاركة ابنكم في الرحلة الميدانية.',
    fields: [
      { id: 'f1-1', type: 'yes-no', label: 'أوافق على مشاركة ابني/ابنتي في الرحلة', required: true, order: 1 },
      { id: 'f1-2', type: 'short-text', label: 'اسم ولي الأمر', required: true, order: 2 },
      { id: 'f1-3', type: 'short-text', label: 'رقم الجوال للتواصل', required: true, order: 3, validation: { minLength: 10, maxLength: 15 } },
      { id: 'f1-4', type: 'single-choice', label: 'هل لدى الطالب حساسية غذائية؟', required: true, options: [
        { id: 'o1', label: 'لا' }, { id: 'o2', label: 'نعم — مكسرات' }, { id: 'o3', label: 'نعم — ألبان' }, { id: 'o4', label: 'نعم — أخرى' },
      ], order: 4 },
      { id: 'f1-5', type: 'long-text', label: 'ملاحظات إضافية', helpText: 'أي معلومات صحية أو احتياجات خاصة', required: false, order: 5 },
    ],
    deadline: daysFromNow(5),
    isActive: true,
    notificationId: 'notif-3',
    createdAt: daysAgo(15),
    updatedAt: daysAgo(15),
    responseCount: 8,
  },
  {
    id: 'form-2',
    title: 'تأكيد حضور اجتماع أولياء الأمور',
    titleEn: 'Parent-Teacher Meeting RSVP',
    description: 'يرجى تأكيد حضوركم لاجتماع أولياء الأمور.',
    fields: [
      { id: 'f2-1', type: 'yes-no', label: 'سأحضر الاجتماع', required: true, order: 1 },
      { id: 'f2-2', type: 'single-choice', label: 'عدد الحاضرين', required: true, options: [
        { id: 'o1', label: '١ (ولي الأمر فقط)' }, { id: 'o2', label: '٢ (كلا الوالدين)' },
      ], order: 2 },
      { id: 'f2-3', type: 'multiple-choice', label: 'المواضيع التي ترغب بمناقشتها', required: false, options: [
        { id: 'o1', label: 'المستوى الأكاديمي' }, { id: 'o2', label: 'السلوك' }, { id: 'o3', label: 'الأنشطة اللاصفية' }, { id: 'o4', label: 'الواجبات المنزلية' },
      ], order: 3 },
      { id: 'f2-4', type: 'long-text', label: 'أسئلة أو استفسارات مسبقة', required: false, order: 4 },
    ],
    deadline: daysFromNow(2),
    isActive: true,
    notificationId: 'notif-4',
    createdAt: daysAgo(12),
    updatedAt: daysAgo(12),
    responseCount: 14,
  },
];

// --- Form Responses ---

const PARENT_RESPONDENTS = [
  { id: 'p-1', name: 'سالم السالم', grade: 3, section: 'A' },
  { id: 'p-2', name: 'مريم العمر', grade: 3, section: 'A' },
  { id: 'p-3', name: 'عبدالرحمن الرشيد', grade: 3, section: 'A' },
  { id: 'p-4', name: 'هيا الزهراني', grade: 3, section: 'B' },
  { id: 'p-5', name: 'ناصر القحطاني', grade: 3, section: 'B' },
  { id: 'p-8', name: 'نجلاء الصالح', grade: 4, section: 'A' },
  { id: 'p-9', name: 'ماجد العتيبي', grade: 4, section: 'A' },
  { id: 'p-10', name: 'سميرة الحسن', grade: 4, section: 'B' },
  { id: 'p-11', name: 'عادل الجبر', grade: 4, section: 'B' },
  { id: 'p-12', name: 'لولوة المنصور', grade: 5, section: 'A' },
  { id: 'p-13', name: 'بدر الشمري', grade: 6, section: 'A' },
  { id: 'p-14', name: 'عائشة الدوسري', grade: 7, section: 'A' },
  { id: 'p-15', name: 'خالد المالكي', grade: 8, section: 'A' },
  { id: 'p-16', name: 'نوال السبيعي', grade: 9, section: 'A' },
];

export const MOCK_FORM_RESPONSES: FormResponse[] = [
  // Form 1 responses (field trip permission)
  ...PARENT_RESPONDENTS.slice(0, 8).map((p, i) => ({
    id: `resp-1-${i + 1}`,
    formId: 'form-1',
    respondentId: p.id,
    respondentName: p.name,
    respondentRole: 'parent' as const,
    respondentGrade: p.grade,
    respondentSection: p.section,
    answers: {
      'f1-1': i < 7, // Most consent
      'f1-2': p.name,
      'f1-3': `05${Math.floor(10000000 + Math.random() * 90000000)}`,
      'f1-4': ['لا', 'لا', 'نعم — مكسرات', 'لا', 'نعم — ألبان', 'لا', 'لا', 'نعم — أخرى'][i],
      'f1-5': i === 2 ? 'يرجى الانتباه لحساسية المكسرات' : '',
    },
    submittedAt: daysAgo(14 - i),
  })),
  // Form 2 responses (RSVP)
  ...PARENT_RESPONDENTS.map((p, i) => ({
    id: `resp-2-${i + 1}`,
    formId: 'form-2',
    respondentId: p.id,
    respondentName: p.name,
    respondentRole: 'parent' as const,
    respondentGrade: p.grade,
    respondentSection: p.section,
    answers: {
      'f2-1': i < 11, // Most will attend
      'f2-2': i % 3 === 0 ? '٢ (كلا الوالدين)' : '١ (ولي الأمر فقط)',
      'f2-3': [['المستوى الأكاديمي'], ['السلوك', 'الواجبات المنزلية'], ['المستوى الأكاديمي', 'الأنشطة اللاصفية'], ['الواجبات المنزلية']][i % 4],
      'f2-4': i === 3 ? 'هل يمكن تغيير موعد الاجتماع؟' : '',
    },
    submittedAt: daysAgo(11 - Math.floor(i / 2)),
  })),
];

// --- Initial State ---

export const INITIAL_NOTIFICATION_STATE: NotificationState = {
  notifications: MOCK_NOTIFICATIONS,
  templates: MOCK_TEMPLATES,
  savedAudiences: MOCK_SAVED_AUDIENCES,
  forms: MOCK_FORMS,
  formResponses: MOCK_FORM_RESPONSES,
  activeDraft: null,
};
