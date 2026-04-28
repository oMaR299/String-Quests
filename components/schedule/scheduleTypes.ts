// scheduleTypes.ts
// All shared types + the static Tailwind-safelist-friendly color class map
// for the Schedule module.

export type DayIndex = 0 | 1 | 2 | 3 | 4;          // 0 = Sunday … 4 = Thursday
export type SlotIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = P1 … 6 = P7
// Gaps live BETWEEN slots (and bracket the day). A day with 7 slots has 8 gaps:
//   gap 0 = before P1, gap 1 = between P1 and P2, …, gap 7 = after P7.
export type GapIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

// Template-literal SlotKey for O(1) occupancy lookup: `${day}-${slot}`
export type SlotKey = `${DayIndex}-${SlotIndex}`;
// Template-literal GapKey for O(1) gap-rect lookup: `${day}-gap-${gapIndex}`
export type GapKey = `${DayIndex}-gap-${GapIndex}`;

export const DAY_INDEXES: DayIndex[] = [0, 1, 2, 3, 4];
export const SLOT_INDEXES: SlotIndex[] = [0, 1, 2, 3, 4, 5, 6];
export const GAP_INDEXES: GapIndex[] = [0, 1, 2, 3, 4, 5, 6, 7];
export const TOTAL_SLOTS = 35;

export function slotKey(day: number, slot: number): SlotKey {
  return `${day}-${slot}` as SlotKey;
}

export function gapKey(day: number, gapIndex: number): GapKey {
  return `${day}-gap-${gapIndex}` as GapKey;
}

// ─────────────────────────────────────────────────────────────────────────────
// Domain entities
// ─────────────────────────────────────────────────────────────────────────────

export type ColorToken =
  | 'duo-blue'
  | 'duo-green'
  | 'duo-gold'
  | 'duo-purple'
  | 'duo-orange';

export type SubjectKey =
  | 'math'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'arabic'
  | 'english'
  | 'history'
  | 'geography';

export type SectionKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface ClassItem {
  id: string;
  subject: SubjectKey;
  grade: number;
  section: SectionKey;
  weeklyTarget: number;
  colorToken: ColorToken;
}

export interface Placement {
  classId: string;
  day: number; // 0..4
  slot: number; // 0..6
}

/**
 * A break is an INTER-SLOT divider — it does not occupy a slot. It lives at
 * a gap index within a day column and visually shifts every subsequent slot
 * in that day downward. At most one break may exist per (day, gapIndex).
 */
export interface DayBreak {
  day: number;      // 0..4
  gapIndex: number; // 0..7  (0 = before P1, 7 = after P7)
}

export interface Teacher {
  id: string;
  nameAr: string;
  nameEn: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Reducer state + pending confirmation intents
// ─────────────────────────────────────────────────────────────────────────────

export interface ScheduleState {
  teacherId: string;
  classes: ClassItem[];
  /** Classes only — breaks live in `breaks`. */
  placements: Placement[];
  /** Inter-slot dividers. At most one per (day, gapIndex). */
  breaks: DayBreak[];
}

export type PendingActionKind =
  | 'clearWeek'
  | 'removeSlot'
  | 'overwriteSlot'
  | 'exceedQuota'
  | 'switchTeacher';

export type PendingAction =
  | { kind: 'clearWeek' }
  | { kind: 'removeSlot'; day: number; slot: number }
  | {
      kind: 'overwriteSlot';
      day: number;
      slot: number;
      incoming: Placement;
      // If present, the drop also exceeds the incoming class's weekly target.
      alsoExceedsQuota?: boolean;
    }
  | {
      kind: 'exceedQuota';
      classId: string;
      day: number;
      slot: number;
    }
  | { kind: 'switchTeacher'; nextTeacherId: string };

// ─────────────────────────────────────────────────────────────────────────────
// Static Tailwind color map — DO NOT build class names via string concatenation.
// Every string below is literal so the Tailwind JIT source scanner sees them.
// ─────────────────────────────────────────────────────────────────────────────

export interface SubjectColorClassSet {
  bg: string;
  border: string;
  text: string;
  accent: string; // solid block for progress bars
}

export const SUBJECT_COLOR_CLASSES: Record<ColorToken, SubjectColorClassSet> = {
  'duo-blue': {
    bg: 'bg-duo-blue-light',
    border: 'border-duo-blue/30',
    text: 'text-duo-blue-dark',
    accent: 'bg-duo-blue',
  },
  'duo-green': {
    bg: 'bg-duo-green-light',
    border: 'border-duo-green/30',
    text: 'text-duo-green-dark',
    accent: 'bg-duo-green',
  },
  'duo-gold': {
    bg: 'bg-duo-gold-light',
    border: 'border-duo-gold/40',
    text: 'text-duo-gold-dark',
    accent: 'bg-duo-gold',
  },
  'duo-purple': {
    bg: 'bg-duo-purple-light',
    border: 'border-duo-purple/30',
    // No `duo-purple-dark` token in tailwind.config.ts — hex is intentional.
    text: 'text-[#8B3FD6]',
    accent: 'bg-duo-purple',
  },
  'duo-orange': {
    bg: 'bg-duo-orange-light',
    border: 'border-duo-orange/40',
    text: 'text-duo-orange',
    accent: 'bg-duo-orange',
  },
};

// Break chip uses a neutral palette — breaks are "air between content", not a
// subject. Muted slate tones read as structural UI, never as a class card.
export const BREAK_COLOR_CLASSES: SubjectColorClassSet = {
  bg: 'bg-slate-100/80',
  border: 'border-slate-200',
  text: 'text-slate-500',
  accent: 'bg-slate-300',
};

// subject → colorToken lookup used by mock data generator
export const SUBJECT_COLOR_TOKEN: Record<SubjectKey, ColorToken> = {
  math: 'duo-blue',
  physics: 'duo-purple',
  chemistry: 'duo-green',
  biology: 'duo-gold',
  arabic: 'duo-orange',
  english: 'duo-blue',
  history: 'duo-gold',
  geography: 'duo-green',
};
