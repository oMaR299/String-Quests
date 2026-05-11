// parentAppThreadsMock.ts
// ─────────────────────────────────────────────────────────────────────────────
// Seeded mock threads + messages for the Parent App Messages tab.
//
// 10 threads distributed:
//   • 3 unread (mentor + subject teacher + cross-child staff)
//   • 4 read recent (today / yesterday)
//   • 3 older read (last week+)
//
// Each thread has 4-8 messages alternating teacher and parent. 2 threads
// include a voice note — we use a tiny WebM-Opus silent dataURI so the
// playback UI renders (the actual audio won't play in every browser but the
// waveform UI exercises). Real recordings via MediaRecorder will replace
// these in-session.

import { MOCK_CONTACTS } from './parentAppContactsMock';

export type MessageKind = 'text' | 'voice' | 'image';
export type MessageState = 'sending' | 'sent' | 'delivered' | 'read';

export interface MockMessage {
  id: string;
  threadId: string;
  fromContactId: string;
  /** Convenience boolean — when true, the parent is the author. */
  fromParent: boolean;
  kind: MessageKind;
  /** Text body for text messages. AR primary, EN mirror. */
  bodyAr?: string;
  bodyEn?: string;
  /** For voice messages: blob URL (mock) + duration in seconds. */
  voiceBlobUrl?: string;
  voiceDurationSec?: number;
  /** For image messages (not used in v1 mock but typed for completeness). */
  imageUrl?: string;
  sentIso: string;
  state: MessageState;
}

export interface MockThread {
  id: string;
  contactId: string;
  childId?: string;
  unreadCount: number;
  pinned: boolean;
  muted: boolean;
  lastMessageAt: string;
}

// ============================================================================
// Time helpers
// ============================================================================

function isoMinutesAgo(mins: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - mins);
  return d.toISOString();
}

function isoHoursAgo(hours: number): string {
  return isoMinutesAgo(hours * 60);
}

function isoDaysAgo(days: number): string {
  return isoMinutesAgo(days * 24 * 60);
}

// A tiny silent WebM-Opus dataURI. ~50ms of nothing. Just enough to render
// the audio element. If the browser can't decode this it'll still let the
// waveform UI tick through.
const SILENT_WEBM_DATAURI =
  'data:audio/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQRChYECGFOAZwH/////////FUmpZpkq17GDD0JATYCGQ2hyb21lV0GGQ2hyb21lFlSua7+uvdeBAXPFh0RhaPmiQHJzKWAAAAEAAAAAAAAAAAAAH8gMnIyB';

// ============================================================================
// Build threads + their messages
// ============================================================================

// Track contacts that DO have threads, so we can render the "Recent" list.
// Use stable contact ids (must match MOCK_CONTACTS).

interface ThreadSeed {
  contactId: string;
  childId?: string;
  pinned?: boolean;
  unread: number;
  lastAt: string;
  /** Pre-built message rows (will be auto-assigned ids + threadId). */
  messages: Array<Omit<MockMessage, 'id' | 'threadId'>>;
}

// Sanity: assert a referenced contact exists.
function need(id: string): string {
  const found = MOCK_CONTACTS.find((c) => c.id === id);
  if (!found) {
    // Don't throw at module load — just log so dev sees it.
    // eslint-disable-next-line no-console
    console.warn('[messagesMock] Unknown contactId in thread seed:', id);
  }
  return id;
}

const PARENT_ID = '__parent__';

const SEEDS: ThreadSeed[] = [
  // ── 1) UNREAD — Sara's math teacher
  {
    contactId: need('teacher-child-sara-math'),
    childId: 'child-sara',
    unread: 2,
    lastAt: isoMinutesAgo(15),
    messages: [
      {
        fromContactId: 'teacher-child-sara-math',
        fromParent: false,
        kind: 'text',
        bodyAr: 'سارة كانت رائعة في درس الكسور اليوم 🌟',
        bodyEn: 'Sara was wonderful in our fractions lesson today 🌟',
        sentIso: isoHoursAgo(3),
        state: 'read',
      },
      {
        fromContactId: 'teacher-child-sara-math',
        fromParent: false,
        kind: 'voice',
        voiceBlobUrl: SILENT_WEBM_DATAURI,
        voiceDurationSec: 14,
        sentIso: isoMinutesAgo(45),
        state: 'delivered',
      },
      {
        fromContactId: 'teacher-child-sara-math',
        fromParent: false,
        kind: 'text',
        bodyAr: 'يا ريت تتابعوا الواجب صفحة ٤٢ مع سارة قبل الأحد.',
        bodyEn: 'Please review the homework on p.42 with Sara before Sunday.',
        sentIso: isoMinutesAgo(15),
        state: 'delivered',
      },
    ],
  },

  // ── 2) UNREAD — Sara's mentor
  {
    contactId: need('mentor-child-sara'),
    childId: 'child-sara',
    pinned: true,
    unread: 1,
    lastAt: isoHoursAgo(2),
    messages: [
      {
        fromContactId: PARENT_ID,
        fromParent: true,
        kind: 'text',
        bodyAr: 'صباح الخير دكتورة، شو رأيك بأداء سارة هاد الأسبوع؟',
        bodyEn: "Good morning Dr., how do you see Sara's week so far?",
        sentIso: isoHoursAgo(20),
        state: 'read',
      },
      {
        fromContactId: 'mentor-child-sara',
        fromParent: false,
        kind: 'text',
        bodyAr:
          'صباح النور 🌷 سارة متفاعلة جداً، خصوصاً برياضيات. اقترحت لها خطة دراسية مركزة على الكسور.',
        bodyEn:
          "Good morning 🌷 Sara is very engaged, especially in math. I've shared a study plan focused on fractions.",
        sentIso: isoHoursAgo(18),
        state: 'read',
      },
      {
        fromContactId: 'mentor-child-sara',
        fromParent: false,
        kind: 'text',
        bodyAr: 'بتحبوا نحدد مكالمة قصيرة الأسبوع الجاي؟',
        bodyEn: 'Would you like to schedule a short call next week?',
        sentIso: isoHoursAgo(2),
        state: 'delivered',
      },
    ],
  },

  // ── 3) UNREAD — Principal (cross-child)
  {
    contactId: need('staff-principal'),
    unread: 1,
    lastAt: isoHoursAgo(5),
    messages: [
      {
        fromContactId: 'staff-principal',
        fromParent: false,
        kind: 'text',
        bodyAr: 'مرحباً، نشكركم على حضور اللقاء الأخير 🌷',
        bodyEn: 'Hello, thank you for attending the last meeting 🌷',
        sentIso: isoDaysAgo(2),
        state: 'read',
      },
      {
        fromContactId: PARENT_ID,
        fromParent: true,
        kind: 'text',
        bodyAr: 'العفو، استفدنا كثير.',
        bodyEn: 'You are welcome, we found it very useful.',
        sentIso: isoDaysAgo(2),
        state: 'read',
      },
      {
        fromContactId: 'staff-principal',
        fromParent: false,
        kind: 'text',
        bodyAr: 'بدنا نتشاور معكم بخصوص فعاليات اليوم الرياضي. ممكن نتواصل؟',
        bodyEn:
          "We'd love your input on Sports Day activities. Can we talk?",
        sentIso: isoHoursAgo(5),
        state: 'delivered',
      },
    ],
  },

  // ── 4) READ recent — Omar's arabic teacher
  {
    contactId: need('teacher-child-omar-arabic'),
    childId: 'child-omar',
    unread: 0,
    lastAt: isoHoursAgo(6),
    messages: [
      {
        fromContactId: 'teacher-child-omar-arabic',
        fromParent: false,
        kind: 'text',
        bodyAr: 'عمر تحسن كثير بالقراءة الجهرية 👏',
        bodyEn: 'Omar has improved a lot with reading aloud 👏',
        sentIso: isoHoursAgo(10),
        state: 'read',
      },
      {
        fromContactId: PARENT_ID,
        fromParent: true,
        kind: 'text',
        bodyAr: 'تسلموا أستاذ، شو ممكن نعمل اكتر بالبيت؟',
        bodyEn: 'Thank you, what else can we do at home?',
        sentIso: isoHoursAgo(8),
        state: 'read',
      },
      {
        fromContactId: 'teacher-child-omar-arabic',
        fromParent: false,
        kind: 'text',
        bodyAr: 'قراءة ١٠ دقايق كل يوم بصوت عالي. حكاية قصيرة بتكفي.',
        bodyEn: '10 mins of aloud reading daily. A short story is enough.',
        sentIso: isoHoursAgo(6),
        state: 'read',
      },
    ],
  },

  // ── 5) READ recent — Lina's science teacher
  {
    contactId: need('teacher-child-lina-science'),
    childId: 'child-lina',
    unread: 0,
    lastAt: isoHoursAgo(8),
    messages: [
      {
        fromContactId: 'teacher-child-lina-science',
        fromParent: false,
        kind: 'text',
        bodyAr: 'تجربة الأسبوع الجاي عن المغناطيس 🧲',
        bodyEn: "Next week's experiment is about magnets 🧲",
        sentIso: isoDaysAgo(1),
        state: 'read',
      },
      {
        fromContactId: PARENT_ID,
        fromParent: true,
        kind: 'text',
        bodyAr: 'حماس! لينا بتحب التجارب 🙌',
        bodyEn: 'Exciting! Lina loves experiments 🙌',
        sentIso: isoHoursAgo(8),
        state: 'read',
      },
    ],
  },

  // ── 6) READ recent — School admin (cross-child)
  {
    contactId: need('staff-admin'),
    unread: 0,
    lastAt: isoHoursAgo(12),
    messages: [
      {
        fromContactId: 'staff-admin',
        fromParent: false,
        kind: 'text',
        bodyAr: 'يرجى تأكيد رقم الطوارئ المسجل عندنا.',
        bodyEn: 'Please confirm the emergency contact we have on file.',
        sentIso: isoDaysAgo(2),
        state: 'read',
      },
      {
        fromContactId: PARENT_ID,
        fromParent: true,
        kind: 'text',
        bodyAr: 'مؤكد، نفس الرقم.',
        bodyEn: 'Confirmed, same number.',
        sentIso: isoHoursAgo(12),
        state: 'read',
      },
    ],
  },

  // ── 7) READ recent — Counselor (with voice note in archive)
  {
    contactId: need('staff-counselor'),
    unread: 0,
    lastAt: isoDaysAgo(2),
    messages: [
      {
        fromContactId: PARENT_ID,
        fromParent: true,
        kind: 'text',
        bodyAr: 'مرحباً دكتورة، ممكن نحكي عن تنظيم وقت سارة بالمذاكرة؟',
        bodyEn: "Hi Dr., can we talk about Sara's study time organization?",
        sentIso: isoDaysAgo(3),
        state: 'read',
      },
      {
        fromContactId: 'staff-counselor',
        fromParent: false,
        kind: 'voice',
        voiceBlobUrl: SILENT_WEBM_DATAURI,
        voiceDurationSec: 23,
        sentIso: isoDaysAgo(2),
        state: 'read',
      },
      {
        fromContactId: 'staff-counselor',
        fromParent: false,
        kind: 'text',
        bodyAr: 'كمان أرسلت ورقة عمل قصيرة على الإيميل.',
        bodyEn: 'I also sent a short worksheet by email.',
        sentIso: isoDaysAgo(2),
        state: 'read',
      },
    ],
  },

  // ── 8) OLDER read — Omar's mentor
  {
    contactId: need('mentor-child-omar'),
    childId: 'child-omar',
    unread: 0,
    lastAt: isoDaysAgo(7),
    messages: [
      {
        fromContactId: 'mentor-child-omar',
        fromParent: false,
        kind: 'text',
        bodyAr: 'عمر بحاجة تمارين إضافية بالإملاء.',
        bodyEn: 'Omar needs extra spelling practice.',
        sentIso: isoDaysAgo(8),
        state: 'read',
      },
      {
        fromContactId: PARENT_ID,
        fromParent: true,
        kind: 'text',
        bodyAr: 'تمام، ابعتلي القائمة من فضلك.',
        bodyEn: 'Got it, please send me the list.',
        sentIso: isoDaysAgo(7),
        state: 'read',
      },
    ],
  },

  // ── 9) OLDER read — Lina's english teacher
  {
    contactId: need('teacher-child-lina-english'),
    childId: 'child-lina',
    unread: 0,
    lastAt: isoDaysAgo(10),
    messages: [
      {
        fromContactId: 'teacher-child-lina-english',
        fromParent: false,
        kind: 'text',
        bodyAr: 'لينا قدمت قصة قصيرة وعجبت الصف 📖',
        bodyEn: 'Lina presented a short story and the class loved it 📖',
        sentIso: isoDaysAgo(11),
        state: 'read',
      },
      {
        fromContactId: PARENT_ID,
        fromParent: true,
        kind: 'text',
        bodyAr: 'يا قلبي 🥰 تسلميلي أستاذة.',
        bodyEn: "Aww 🥰 thank you, miss.",
        sentIso: isoDaysAgo(10),
        state: 'read',
      },
    ],
  },

  // ── 10) OLDER read — Nurse (cross-child)
  {
    contactId: need('staff-nurse'),
    unread: 0,
    lastAt: isoDaysAgo(14),
    messages: [
      {
        fromContactId: 'staff-nurse',
        fromParent: false,
        kind: 'text',
        bodyAr: 'تذكير بفحص النظر السنوي للطلاب يوم الأربعاء.',
        bodyEn:
          "Reminder: students' annual vision screening is on Wednesday.",
        sentIso: isoDaysAgo(15),
        state: 'read',
      },
      {
        fromContactId: PARENT_ID,
        fromParent: true,
        kind: 'text',
        bodyAr: 'شكراً للتذكير.',
        bodyEn: 'Thanks for the reminder.',
        sentIso: isoDaysAgo(14),
        state: 'read',
      },
    ],
  },
];

// ============================================================================
// Materialize: build MockThread[] + flat MockMessage[]
// ============================================================================

export interface MockThreadStore {
  threads: MockThread[];
  messages: MockMessage[];
}

function build(): MockThreadStore {
  const threads: MockThread[] = [];
  const messages: MockMessage[] = [];

  SEEDS.forEach((seed, i) => {
    const threadId = `thread-${i + 1}-${seed.contactId}`;
    threads.push({
      id: threadId,
      contactId: seed.contactId,
      childId: seed.childId,
      unreadCount: seed.unread,
      pinned: !!seed.pinned,
      muted: false,
      lastMessageAt: seed.lastAt,
    });

    seed.messages.forEach((m, j) => {
      messages.push({
        ...m,
        id: `${threadId}-msg-${j + 1}`,
        threadId,
      });
    });
  });

  return { threads, messages };
}

export const MOCK_THREAD_STORE: MockThreadStore = build();
