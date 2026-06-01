// AttendanceDrawer.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Bottom-sheet drawer with attendance stats + a 6-week monthly grid + a
// per-day session breakdown panel that appears below the calendar when the
// user taps a school day.
//
// Layout:
//   ┌─────────────────────────────────────┐
//   │  [present #] [absent #] [tardy #]   │  ← stat tiles
//   ├─────────────────────────────────────┤
//   │  [DOW header]                       │
//   │  [6 weeks × 7 days grid]            │
//   ├─────────────────────────────────────┤
//   │  legend (4 states)                  │
//   ├─────────────────────────────────────┤
//   │  selected day session panel         │  ← v1.3 — was a single-line note
//   │   ├─ Day status banner              │
//   │   └─ N session rows (time, subject, │
//   │       per-session status, note)     │
//   └─────────────────────────────────────┘
//
// Day-level cell colors (Tailwind v4 JIT — every class is a literal):
//   present  → bg-emerald-100 + small dot
//   absent   → bg-rose-100    + X icon
//   tardy    → bg-amber-100   + clock icon
//   weekend  → bg-slate-50    (Fri/Sat in Jordan)
//   holiday  → bg-slate-100
//   future   → transparent (just the day number, faded)
//
// Session-level rows (4 statuses):
//   present  → emerald check
//   late     → amber clock
//   absent   → rose X
//   excused  → slate doc

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X as XIcon,
  Clock,
  FileText,
  MessageSquare,
  Edit2,
  Plus,
} from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';
import { BottomSheet } from './BottomSheet';
import {
  getAttendanceStats,
  ABSENCE_REASON_CHIPS,
  type AbsenceReasonChipId,
  type AttendanceStatus,
  type SessionStatus,
  type AttendanceSession,
} from '../data/parentAppSchoolMockData';
import { useParentAppContext } from '../useParentAppContext';
import { useAttendanceForChild } from '../hooks/useAttendanceForChild';
import { MessageTeacherSheet } from '../messages/MessageTeacherSheet';
import { getHomeroomTeacher } from '../messages/data/parentAppContactsMock';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Forwarded to BottomSheet — enables horizontal swipe between drawers. */
  onSwipeNext?: () => void;
  onSwipePrev?: () => void;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function buildIso(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

// ─── Static Tailwind v4 JIT-safe class maps ────────────────────────────────
// Each entry is a literal class string so the JIT picks them up at build time.

const CELL_BG: Record<AttendanceStatus, string> = {
  present: 'bg-emerald-100',
  absent: 'bg-rose-100',
  tardy: 'bg-amber-100',
  weekend: 'bg-slate-50',
  holiday: 'bg-slate-100',
  future: 'bg-transparent',
};

const CELL_TEXT: Record<AttendanceStatus, string> = {
  present: 'text-emerald-800',
  absent: 'text-rose-800',
  tardy: 'text-amber-800',
  weekend: 'text-slate-400',
  holiday: 'text-slate-500',
  future: 'text-slate-300',
};

const CELL_RING: Record<AttendanceStatus, string> = {
  present: 'ring-emerald-300',
  absent: 'ring-rose-300',
  tardy: 'ring-amber-300',
  weekend: 'ring-slate-300',
  holiday: 'ring-slate-300',
  future: 'ring-slate-200',
};

// Per-session colored chip palette. Static literals.
const SESSION_PILL_BG: Record<SessionStatus, string> = {
  present: 'bg-emerald-50',
  late: 'bg-amber-50',
  absent: 'bg-rose-50',
  excused: 'bg-slate-100',
};

const SESSION_PILL_BORDER: Record<SessionStatus, string> = {
  present: 'border-emerald-100',
  late: 'border-amber-100',
  absent: 'border-rose-100',
  excused: 'border-slate-200',
};

const SESSION_ICON_BG: Record<SessionStatus, string> = {
  present: 'bg-emerald-100',
  late: 'bg-amber-100',
  absent: 'bg-rose-100',
  excused: 'bg-slate-200',
};

const SESSION_ICON_TEXT: Record<SessionStatus, string> = {
  present: 'text-emerald-700',
  late: 'text-amber-700',
  absent: 'text-rose-700',
  excused: 'text-slate-600',
};

const SESSION_LABEL_KEY: Record<SessionStatus, string> = {
  present: 'parentApp.school.attendance.session.present',
  late: 'parentApp.school.attendance.session.late',
  absent: 'parentApp.school.attendance.session.absent',
  excused: 'parentApp.school.attendance.session.excused',
};

function renderSessionIcon(status: SessionStatus) {
  switch (status) {
    case 'present':
      return <Check className="w-3.5 h-3.5" strokeWidth={3} aria-hidden="true" />;
    case 'late':
      return <Clock className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />;
    case 'absent':
      return <XIcon className="w-3.5 h-3.5" strokeWidth={3} aria-hidden="true" />;
    case 'excused':
      return <FileText className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />;
  }
}

interface SessionRowProps {
  session: AttendanceSession;
}

const SessionRow: React.FC<SessionRowProps> = ({ session }) => {
  const { locale } = useI18n();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);
  const subject = locale === 'ar' ? session.subjectAr : session.subjectEn;
  const note = locale === 'ar' ? session.noteAr : session.noteEn;
  const pillBg = SESSION_PILL_BG[session.status];
  const pillBorder = SESSION_PILL_BORDER[session.status];
  const iconBg = SESSION_ICON_BG[session.status];
  const iconText = SESSION_ICON_TEXT[session.status];

  return (
    <li className={`rounded-xl border ${pillBg} ${pillBorder} p-2.5 flex items-start gap-3`}>
      <div
        className={`w-8 h-8 rounded-full inline-flex items-center justify-center shrink-0 ${iconBg} ${iconText}`}
        aria-hidden="true"
      >
        {renderSessionIcon(session.status)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-extrabold tabular-nums text-slate-500">
            {session.startTime} — {session.endTime}
          </span>
          <span className="text-sm font-extrabold text-slate-800 leading-tight">
            {subject}
          </span>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${iconBg} ${iconText}`}>
            {t(SESSION_LABEL_KEY[session.status])}
          </span>
        </div>
        {note && (
          <p className="mt-0.5 text-[11px] font-bold italic text-slate-500 leading-snug">
            {note}
          </p>
        )}
      </div>
    </li>
  );
};

/**
 * Body-only renderer used by SchoolLogisticsStrip's shared BottomSheet (Fix 2).
 */
export const AttendanceDrawerContent: React.FC = () => {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const { activeChildId } = useParentAppContext();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  // Hook owns the reason-override layer on top of the seeded mock data.
  const { getDay, setAbsenceReason } = useAttendanceForChild(activeChildId);

  // Today (immutable per render).
  const today = useMemo(() => new Date(), []);
  const todayIso = useMemo(
    () => buildIso(today.getFullYear(), today.getMonth(), today.getDate()),
    [today]
  );

  // Cursor month — initialized to current month.
  const [cursorYear, setCursorYear] = useState(() => today.getFullYear());
  const [cursorMonth, setCursorMonth] = useState(() => today.getMonth());

  // Selected day for the inline session panel. Default to today.
  const [selectedIso, setSelectedIso] = useState<string>(todayIso);

  // Stat tiles aggregate the seeded 30-day window for the active child.
  const stats = useMemo(
    () => getAttendanceStats(activeChildId),
    [activeChildId]
  );

  // Build 6×7 calendar grid. Each cell carries its derived attendance status.
  const grid = useMemo(() => {
    const firstOfMonth = new Date(cursorYear, cursorMonth, 1);
    const startDow = firstOfMonth.getDay(); // 0=Sun
    const daysInMonth = new Date(cursorYear, cursorMonth + 1, 0).getDate();
    const cells: Array<{
      day: number | null;
      iso: string | null;
      status: AttendanceStatus | null;
    }> = [];
    for (let i = 0; i < startDow; i++) {
      cells.push({ day: null, iso: null, status: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = buildIso(cursorYear, cursorMonth, d);
      const cellDate = new Date(cursorYear, cursorMonth, d);
      cellDate.setHours(0, 0, 0, 0);

      // Look up seeded attendance first; otherwise infer from weekend/future.
      const seeded = getDay(iso);
      let status: AttendanceStatus;
      if (seeded) {
        status = seeded.status;
      } else {
        const dow = cellDate.getDay();
        if (cellDate.getTime() > today.getTime()) {
          status = 'future';
        } else if (dow === 5 || dow === 6) {
          status = 'weekend';
        } else {
          // Older than the seeded 30-day window — treat as future-blank.
          status = 'future';
        }
      }
      cells.push({ day: d, iso, status });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ day: null, iso: null, status: null });
    }
    return cells;
  }, [cursorYear, cursorMonth, getDay, today]);

  const goPrev = useCallback(() => {
    if (cursorMonth === 0) {
      setCursorMonth(11);
      setCursorYear((y) => y - 1);
    } else {
      setCursorMonth((m) => m - 1);
    }
  }, [cursorMonth]);

  const goNext = useCallback(() => {
    if (cursorMonth === 11) {
      setCursorMonth(0);
      setCursorYear((y) => y + 1);
    } else {
      setCursorMonth((m) => m + 1);
    }
  }, [cursorMonth]);

  const monthLabel = `${t(`parentApp.school.calendar.month.${cursorMonth}`)} ${cursorYear}`;

  // Selected-day attendance lookup (with parent-saved reason overrides
  // merged on top of the seed).
  const selectedDay = useMemo(
    () => getDay(selectedIso),
    [getDay, selectedIso]
  );

  // ── Reason-edit state (inline form inside the selectedDay panel) ──────────
  // Editing is local — pressing "Edit" or "Add reason" reveals the form pre-
  // filled with the current chip / notes. "Save" commits via the hook;
  // "Cancel" closes without changes. Re-opens fresh per absence day.
  const [editingReasonForIso, setEditingReasonForIso] = useState<string | null>(null);
  const [editChipId, setEditChipId] = useState<AbsenceReasonChipId | null>(null);
  const [editNotes, setEditNotes] = useState<string>('');

  // Close the edit form whenever the user navigates to a different day.
  useEffect(() => {
    if (editingReasonForIso && editingReasonForIso !== selectedIso) {
      setEditingReasonForIso(null);
    }
  }, [selectedIso, editingReasonForIso]);

  const beginEditReason = useCallback(() => {
    if (!selectedDay) return;
    // Best-effort: try to match the current reason text to a known chip.
    const currentAr = selectedDay.reasonAr ?? '';
    const currentEn = selectedDay.reasonEn ?? '';
    let chip: AbsenceReasonChipId | null = null;
    let notes = '';
    for (const c of ABSENCE_REASON_CHIPS) {
      if (currentAr.startsWith(c.ar) || currentEn.toLowerCase().startsWith(c.en.toLowerCase())) {
        chip = c.id;
        // Everything after the chip label + an optional " — " is treated as
        // notes (only triggers when the parent saved chip+notes earlier).
        const restAr = currentAr.slice(c.ar.length).replace(/^\s*[—\-:]\s*/, '');
        const restEn = currentEn.slice(c.en.length).replace(/^\s*[—\-:]\s*/, '');
        notes = restAr || restEn;
        break;
      }
    }
    if (!chip && (currentAr || currentEn)) {
      // Free-text only — assume "other" chip and put the body in notes.
      chip = 'other';
      notes = currentAr || currentEn;
    }
    setEditChipId(chip);
    setEditNotes(notes);
    setEditingReasonForIso(selectedIso);
  }, [selectedDay, selectedIso]);

  const cancelEditReason = useCallback(() => {
    setEditingReasonForIso(null);
    setEditChipId(null);
    setEditNotes('');
  }, []);

  const saveReason = useCallback(() => {
    if (!editingReasonForIso || !editChipId) return;
    const chip = ABSENCE_REASON_CHIPS.find((c) => c.id === editChipId);
    if (!chip) return;
    const notes = editNotes.trim();
    let reasonAr: string = chip.ar;
    let reasonEn: string = chip.en;
    if (editChipId === 'other') {
      // 'other' chip uses ONLY the free-text notes as the reason — the chip
      // label itself is just a UI signal that this is custom-text.
      if (!notes) return;
      reasonAr = notes;
      reasonEn = notes;
    } else if (notes) {
      reasonAr = `${chip.ar} — ${notes}`;
      reasonEn = `${chip.en} — ${notes}`;
    }
    setAbsenceReason(editingReasonForIso, reasonAr, reasonEn);
    cancelEditReason();
    // Lightweight in-component toast — uses the same ariaLive region the
    // sheet primitive already provides via aria-modal; for now a simple
    // local timeout-driven banner.
    setSavedToast(t('parentApp.school.attendance.reason.savedToast'));
    window.setTimeout(() => setSavedToast(null), 1800);
  }, [editingReasonForIso, editChipId, editNotes, setAbsenceReason, cancelEditReason, t]);

  const [savedToast, setSavedToast] = useState<string | null>(null);

  // MessageTeacherSheet state — opens with the child's homeroom teacher
  // pre-selected when the parent taps the contextual CTA on an absent day.
  const [messageOpen, setMessageOpen] = useState(false);
  const homeroom = useMemo(() => getHomeroomTeacher(activeChildId), [activeChildId]);
  const messageContextLabel = useMemo(() => {
    if (!selectedDay) return undefined;
    const reasonText =
      locale === 'ar' ? selectedDay.reasonAr : selectedDay.reasonEn;
    const datePart = selectedIso;
    if (reasonText) {
      return locale === 'ar'
        ? `غياب ${datePart} — ${reasonText}`
        : `Absence ${datePart} — ${reasonText}`;
    }
    return locale === 'ar'
      ? `غياب ${datePart}`
      : `Absence ${datePart}`;
  }, [selectedDay, selectedIso, locale]);

  // Helper — render the per-cell glyph (dot, X, clock, or nothing).
  const renderGlyph = (status: AttendanceStatus) => {
    if (status === 'present') {
      return (
        <span
          className="mt-0.5 w-1.5 h-1.5 rounded-full bg-emerald-600"
          aria-hidden="true"
        />
      );
    }
    if (status === 'absent') {
      return <XIcon className="w-3 h-3 text-rose-600 mt-0.5" strokeWidth={3} />;
    }
    if (status === 'tardy') {
      return <Clock className="w-3 h-3 text-amber-700 mt-0.5" strokeWidth={2.5} />;
    }
    return null;
  };

  // Selected day status label + reason copy
  let selectedStatusLabel = '';
  let selectedReason = '';
  if (selectedDay) {
    const map: Record<AttendanceStatus, string> = {
      present: 'parentApp.school.attendance.dayPresent',
      absent: 'parentApp.school.attendance.dayAbsent',
      tardy: 'parentApp.school.attendance.dayTardy',
      weekend: 'parentApp.school.attendance.dayWeekend',
      holiday: 'parentApp.school.attendance.dayHoliday',
      future: 'parentApp.school.attendance.dayFuture',
    };
    selectedStatusLabel = t(map[selectedDay.status]);
    if (selectedDay.reasonAr || selectedDay.reasonEn) {
      selectedReason = locale === 'ar' ? (selectedDay.reasonAr ?? '') : (selectedDay.reasonEn ?? '');
    }
  }

  const hasSessions = !!selectedDay && selectedDay.sessions.length > 0;

  return (
    <>
      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-3 text-center">
          <div className="text-2xl font-black text-emerald-700">{stats.present}</div>
          <div className="text-[10px] font-extrabold text-emerald-600 mt-0.5 uppercase tracking-wider">
            {t('parentApp.school.attendance.statPresent')}
          </div>
        </div>
        <div
          className={`rounded-2xl border p-3 text-center ${
            stats.absent > 0
              ? 'bg-rose-50 border-rose-100'
              : 'bg-slate-50 border-slate-100'
          }`}
        >
          <div
            className={`text-2xl font-black ${
              stats.absent > 0 ? 'text-rose-700' : 'text-slate-500'
            }`}
          >
            {stats.absent}
          </div>
          <div
            className={`text-[10px] font-extrabold mt-0.5 uppercase tracking-wider ${
              stats.absent > 0 ? 'text-rose-600' : 'text-slate-500'
            }`}
          >
            {t('parentApp.school.attendance.statAbsent')}
          </div>
        </div>
        <div
          className={`rounded-2xl border p-3 text-center ${
            stats.tardy > 0
              ? 'bg-amber-50 border-amber-100'
              : 'bg-slate-50 border-slate-100'
          }`}
        >
          <div
            className={`text-2xl font-black ${
              stats.tardy > 0 ? 'text-amber-700' : 'text-slate-500'
            }`}
          >
            {stats.tardy}
          </div>
          <div
            className={`text-[10px] font-extrabold mt-0.5 uppercase tracking-wider ${
              stats.tardy > 0 ? 'text-amber-600' : 'text-slate-500'
            }`}
          >
            {t('parentApp.school.attendance.statTardy')}
          </div>
        </div>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={goPrev}
          aria-label={t('parentApp.school.calendar.prevMonthAria')}
          className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-slate-600"
        >
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" strokeWidth={2.5} />
        </button>
        <div className="text-base font-black text-slate-800">{monthLabel}</div>
        <button
          type="button"
          onClick={goNext}
          aria-label={t('parentApp.school.calendar.nextMonthAria')}
          className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-slate-600"
        >
          <ChevronRight className="w-5 h-5 rtl:rotate-180" strokeWidth={2.5} />
        </button>
      </div>

      {/* DOW header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {[0, 1, 2, 3, 4, 5, 6].map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-extrabold uppercase text-slate-400 tracking-wider py-1"
          >
            {t(`parentApp.school.calendar.dow.${d}`)}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {grid.map((cell, idx) => {
          if (!cell.day || !cell.iso || !cell.status) {
            return <div key={`b-${idx}`} className="aspect-square" />;
          }
          const isToday = cell.iso === todayIso;
          const isSelected = cell.iso === selectedIso;
          const bg = CELL_BG[cell.status];
          const text = CELL_TEXT[cell.status];
          const ring = CELL_RING[cell.status];

          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => setSelectedIso(cell.iso!)}
              className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-extrabold transition-colors motion-safe:active:scale-95 ${bg} ${text} ${
                isToday ? 'ring-2 ring-duo-blue' : isSelected ? `ring-2 ${ring}` : ''
              }`}
              aria-label={`${cell.day} — ${t(`parentApp.school.attendance.day${cell.status.charAt(0).toUpperCase() + cell.status.slice(1)}`)}`}
            >
              <span>{cell.day}</span>
              {renderGlyph(cell.status)}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-emerald-100 inline-flex items-center justify-center">
            <span className="w-1 h-1 rounded-full bg-emerald-600" aria-hidden="true" />
          </span>
          <span>{t('parentApp.school.attendance.legendPresent')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-rose-100 inline-flex items-center justify-center">
            <XIcon className="w-2 h-2 text-rose-600" strokeWidth={3} />
          </span>
          <span>{t('parentApp.school.attendance.legendAbsent')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-amber-100 inline-flex items-center justify-center">
            <Clock className="w-2 h-2 text-amber-700" strokeWidth={2.5} />
          </span>
          <span>{t('parentApp.school.attendance.legendTardy')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-slate-50 border border-slate-200" aria-hidden="true" />
          <span>{t('parentApp.school.attendance.legendWeekend')}</span>
        </div>
      </div>

      {/* Selected day session panel */}
      <div className="mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIso}
            initial={reduceMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.18 }}
            className="rounded-2xl bg-white border border-slate-100 p-3"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-full inline-flex items-center justify-center shrink-0 ${
                  selectedDay
                    ? CELL_BG[selectedDay.status]
                    : 'bg-slate-100'
                }`}
                aria-hidden="true"
              >
                {selectedDay?.status === 'present' && (
                  <Check className="w-4 h-4 text-emerald-700" strokeWidth={3} />
                )}
                {selectedDay?.status === 'absent' && (
                  <XIcon className="w-4 h-4 text-rose-700" strokeWidth={3} />
                )}
                {selectedDay?.status === 'tardy' && (
                  <Clock className="w-4 h-4 text-amber-700" strokeWidth={2.5} />
                )}
                {(!selectedDay ||
                  selectedDay.status === 'weekend' ||
                  selectedDay.status === 'holiday' ||
                  selectedDay.status === 'future') && (
                  <span className="text-base font-black text-slate-500">·</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-extrabold text-slate-800 leading-snug">
                  {selectedStatusLabel || t('parentApp.school.attendance.session.tapHint')}
                </div>
                {selectedReason ? (
                  <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                    {selectedReason}
                    {selectedDay?.unexcused && (
                      <span className="ms-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-100 text-rose-700">
                        {t('parentApp.school.attendance.unexcused')}
                      </span>
                    )}
                  </div>
                ) : (
                  selectedDay && (
                    <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                      {selectedIso}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Per-session breakdown */}
            {hasSessions && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  {t('parentApp.school.attendance.session.label')}
                </div>
                <ul className="space-y-1.5">
                  {selectedDay!.sessions.map((s) => (
                    <SessionRow key={s.id} session={s} />
                  ))}
                </ul>
              </div>
            )}

            {/* No-sessions hint for cells without seeded data */}
            {!hasSessions && selectedDay && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-[11px] font-bold italic text-slate-400 text-center">
                  {t('parentApp.school.attendance.session.tapHint')}
                </p>
              </div>
            )}

            {/* Reason add / edit + Message teacher — only for absent days.
                Lives inside the selected-day panel so the user's focus stays
                in one place. Form expands inline (no nested sheet). */}
            {selectedDay && selectedDay.status === 'absent' && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                {editingReasonForIso === selectedIso ? (
                  <ReasonEditForm
                    chipId={editChipId}
                    notes={editNotes}
                    onChipChange={setEditChipId}
                    onNotesChange={setEditNotes}
                    onSave={saveReason}
                    onCancel={cancelEditReason}
                  />
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedReason ? (
                      <button
                        type="button"
                        onClick={beginEditReason}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-slate-100 text-slate-700 text-[11px] font-extrabold hover:bg-slate-200 active:scale-[0.97] transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                        {t('parentApp.school.attendance.reason.editCta')}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={beginEditReason}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-duo-blue-light text-duo-blue text-[11px] font-extrabold hover:bg-duo-blue/15 active:scale-[0.97] transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                        {t('parentApp.school.attendance.reason.addCta')}
                      </button>
                    )}
                    {selectedReason && homeroom && (
                      <button
                        type="button"
                        onClick={() => setMessageOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-duo-blue-light text-duo-blue text-[11px] font-extrabold hover:bg-duo-blue/15 active:scale-[0.97] transition-all"
                      >
                        <MessageSquare
                          className="w-3.5 h-3.5 rtl:scale-x-[-1]"
                          strokeWidth={2.5}
                        />
                        {t('parentApp.school.attendance.reason.messageTeacherCta')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Saved toast (local to this drawer — independent of the message
          sheet's own toast). */}
      <AnimatePresence>
        {savedToast && (
          <motion.div
            key={savedToast}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -14, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.92 }}
            transition={{ duration: reduceMotion ? 0.18 : 0.22 }}
            className="fixed top-4 inset-x-0 flex justify-center pointer-events-none z-[310] px-4"
            aria-live="polite"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-duo-green text-white text-sm font-bold">
              <Check className="w-4 h-4" strokeWidth={2.5} />
              <span>{savedToast}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message-teacher sheet — child's homeroom teacher, attendance-context label. */}
      {homeroom && (
        <MessageTeacherSheet
          open={messageOpen}
          onClose={() => setMessageOpen(false)}
          contactId={homeroom.id}
          childId={activeChildId}
          contextLabel={messageContextLabel}
        />
      )}
    </>
  );
};

// ─── Reason edit form (inline, sub-component for readability) ───────────────

interface ReasonEditFormProps {
  chipId: AbsenceReasonChipId | null;
  notes: string;
  onChipChange: (id: AbsenceReasonChipId) => void;
  onNotesChange: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const ReasonEditForm: React.FC<ReasonEditFormProps> = ({
  chipId,
  notes,
  onChipChange,
  onNotesChange,
  onSave,
  onCancel,
}) => {
  const { locale } = useI18n();
  const t = useCallback(
    (key: string) => getParentAppString(locale, key),
    [locale]
  );
  // 'other' requires non-empty notes to be saveable; every other chip is
  // valid on its own.
  const canSave = chipId !== null && (chipId !== 'other' || notes.trim().length > 0);

  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 space-y-3">
      <div className="space-y-1.5">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
          {t('parentApp.school.attendance.reason.pickReasonLabel')}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ABSENCE_REASON_CHIPS.map((chip) => {
            const active = chipId === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => onChipChange(chip.id)}
                aria-pressed={active}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-extrabold transition-all active:scale-[0.97] ${
                  active
                    ? 'bg-duo-blue text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {locale === 'ar'
                  ? t(`parentApp.school.attendance.reason.chip.${chip.id}`)
                  : t(`parentApp.school.attendance.reason.chip.${chip.id}`)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
          {t('parentApp.school.attendance.reason.notesLabel')}
          {chipId === 'other' && <span className="text-rose-500 ms-0.5">*</span>}
        </div>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder={
            chipId === 'other'
              ? t('parentApp.school.attendance.reason.notesRequiredPlaceholder')
              : t('parentApp.school.attendance.reason.notesPlaceholder')
          }
          rows={3}
          className="w-full rounded-xl bg-white border border-slate-200 p-2.5 text-xs font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-semibold focus:border-duo-blue focus:outline-none focus:ring-4 focus:ring-duo-blue/15 transition-all resize-none"
        />
      </div>

      <div className="flex items-center gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-full text-[11px] font-extrabold text-slate-600 hover:bg-slate-200 active:scale-[0.97] transition-all"
        >
          {t('parentApp.school.attendance.reason.cancel')}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          className={`px-4 py-1.5 rounded-full text-[11px] font-black transition-all active:scale-[0.97] ${
            canSave
              ? 'bg-duo-blue text-white hover:bg-duo-blue-dark'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {t('parentApp.school.attendance.reason.save')}
        </button>
      </div>
    </div>
  );
};

/**
 * Standalone wrapper — kept for back-compat. SchoolLogisticsStrip uses
 * `AttendanceDrawerContent` inside its shared BottomSheet.
 */
export const AttendanceDrawer: React.FC<Props> = ({
  open,
  onClose,
  onSwipeNext,
  onSwipePrev,
}) => {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      titleAr={getParentAppString('ar', 'parentApp.school.attendance.drawerTitle')}
      titleEn={getParentAppString('en', 'parentApp.school.attendance.drawerTitle')}
      onSwipeNext={onSwipeNext}
      onSwipePrev={onSwipePrev}
      transitionKey="attendance"
    >
      <AttendanceDrawerContent />
    </BottomSheet>
  );
};

export default AttendanceDrawer;
