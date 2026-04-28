// InteractionOptions.tsx
//
// Sender-side controls that opt the notification into recipient-side
// "do it later" affordances:
//   - Allow snooze (with admin-picked snooze choices)
//   - Allow add-to-tasks (surface a "save to my to-dos" link to the student)
//   - Reminder before deadline (only when deadlineAt is set)
//
// Frontend-only state shape lives on the notification draft as the
// `interaction` field. Defaults are sensible and live in
// `types/notification.ts` as DEFAULT_INTERACTION.
//
// Tailwind v4 JIT-safe — every class string literal. RTL via logical
// properties. Cairo font inherited.

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Clock, ListTodo, BellRing, Calendar, AlertCircle,
} from 'lucide-react';
import type {
  NotificationInteraction,
  SnoozeOption,
  DeadlineReminderInterval,
} from '../../../types/notification';

interface InteractionOptionsProps {
  value: NotificationInteraction;
  onChange: (next: NotificationInteraction) => void;
}

const SNOOZE_OPTIONS: { id: SnoozeOption; labelAr: string; labelEn: string }[] = [
  { id: '1h', labelAr: '1 ساعة', labelEn: '1 hour' },
  { id: '3h', labelAr: '3 ساعات', labelEn: '3 hours' },
  { id: 'tomorrow', labelAr: 'غدًا صباحًا', labelEn: 'Tomorrow morning' },
  { id: '3d', labelAr: 'بعد 3 أيام', labelEn: 'In 3 days' },
  { id: 'custom', labelAr: 'تاريخ مخصص', labelEn: 'Custom date' },
];

const REMINDER_INTERVALS: { id: DeadlineReminderInterval; labelAr: string; labelEn: string }[] = [
  { id: '1h', labelAr: 'قبل ساعة', labelEn: '1h before' },
  { id: '1d', labelAr: 'قبل يوم', labelEn: '1d before' },
  { id: '1w', labelAr: 'قبل أسبوع', labelEn: '1w before' },
];

export const InteractionOptions: React.FC<InteractionOptionsProps> = ({
  value,
  onChange,
}) => {
  const reduced = useReducedMotion();

  const toggleSnooze = () => {
    onChange({ ...value, allowSnooze: !value.allowSnooze });
  };

  const toggleAddToTasks = () => {
    onChange({ ...value, allowAddToTasks: !value.allowAddToTasks });
  };

  const toggleSnoozeOption = (opt: SnoozeOption) => {
    const has = value.snoozeOptions.includes(opt);
    onChange({
      ...value,
      snoozeOptions: has
        ? value.snoozeOptions.filter((s) => s !== opt)
        : [...value.snoozeOptions, opt],
    });
  };

  const toggleReminderInterval = (iv: DeadlineReminderInterval) => {
    const has = value.reminderBeforeDeadline.includes(iv);
    onChange({
      ...value,
      reminderBeforeDeadline: has
        ? value.reminderBeforeDeadline.filter((s) => s !== iv)
        : [...value.reminderBeforeDeadline, iv],
    });
  };

  const setDeadline = (iso: string | null) => {
    onChange({ ...value, deadlineAt: iso });
  };

  // Convert ISO datetime to local "yyyy-mm-ddThh:mm" for the input.
  const deadlineInputValue = (() => {
    if (!value.deadlineAt) return '';
    try {
      const d = new Date(value.deadlineAt);
      if (Number.isNaN(d.getTime())) return '';
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '';
    }
  })();

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 text-xs text-slate-400 leading-relaxed">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-300" />
        <p>
          إذا طُلب من الطالب إجراء لا يمكنه فعله الآن، يمكنه التأجيل أو إضافة
          الإشعار لمهامه. تظهر هذه الخيارات للمستلم في المعاينة.
        </p>
      </div>

      {/* Allow Snooze */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-3">
        <button
          type="button"
          onClick={toggleSnooze}
          className="flex items-center gap-2 text-sm font-bold text-slate-700 w-full"
        >
          <Toggle on={value.allowSnooze} />
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="flex-1 text-start">السماح بالتأجيل</span>
          <span className="text-[10px] font-medium text-slate-400 not-italic">
            Allow snooze
          </span>
        </button>

        <AnimatePresence>
          {value.allowSnooze && (
            <motion.div
              initial={reduced ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-2 space-y-2">
                <p className="text-[11px] font-bold text-slate-500">
                  خيارات التأجيل المتاحة للمستلم
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SNOOZE_OPTIONS.map((opt) => {
                    const isSel = value.snoozeOptions.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleSnoozeOption(opt.id)}
                        className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-all duration-200
                          ${
                            isSel
                              ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-sm shadow-rose-500/10'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                          }
                        `}
                      >
                        {opt.labelAr}
                      </button>
                    );
                  })}
                </div>
                {value.snoozeOptions.length === 0 && (
                  <p className="text-[10px] font-bold text-amber-700 bg-amber-50/70 border border-amber-200 rounded-lg px-2 py-1.5">
                    اختر خيار تأجيل واحدًا على الأقل أو أوقف التأجيل
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Allow Add to Tasks */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
        <button
          type="button"
          onClick={toggleAddToTasks}
          className="flex items-center gap-2 text-sm font-bold text-slate-700 w-full"
        >
          <Toggle on={value.allowAddToTasks} />
          <ListTodo className="w-4 h-4 text-slate-400" />
          <span className="flex-1 text-start">إضافة إلى مهامي</span>
          <span className="text-[10px] font-medium text-slate-400 not-italic">
            Add to my tasks
          </span>
        </button>
        <p className="text-[11px] font-medium text-slate-400 ps-9">
          يحفظ الإشعار في قائمة مهام الطالب اليومية ليتذكره لاحقًا
        </p>
      </div>

      {/* Deadline + Reminder before deadline */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-bold text-slate-700 flex-1">
            موعد نهائي
          </span>
          <span className="text-[10px] font-medium text-slate-400 not-italic">
            Deadline
          </span>
        </div>
        <input
          type="datetime-local"
          value={deadlineInputValue}
          onChange={(e) => {
            const v = e.target.value;
            setDeadline(v ? new Date(v).toISOString() : null);
          }}
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-duo-purple/30 focus:border-duo-purple transition"
          dir="ltr"
        />

        <AnimatePresence>
          {value.deadlineAt && (
            <motion.div
              initial={reduced ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-2 space-y-2 border-t border-slate-100">
                <div className="flex items-center gap-2 pt-2">
                  <BellRing className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-[11px] font-bold text-slate-500 flex-1">
                    تذكير قبل الموعد النهائي
                  </p>
                  <span className="text-[10px] font-medium text-slate-400 not-italic">
                    Reminder before deadline
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {REMINDER_INTERVALS.map((iv) => {
                    const isSel = value.reminderBeforeDeadline.includes(iv.id);
                    return (
                      <button
                        key={iv.id}
                        type="button"
                        onClick={() => toggleReminderInterval(iv.id)}
                        className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-all duration-200
                          ${
                            isSel
                              ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-sm shadow-amber-500/10'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                          }
                        `}
                      >
                        {iv.labelAr}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ─── Toggle ─────────────────────────────────────────────────────────── */

const Toggle: React.FC<{ on: boolean }> = ({ on }) => (
  <span
    className={`relative inline-flex w-9 h-5 rounded-full transition-colors duration-200 shrink-0 ${
      on ? 'bg-violet-500' : 'bg-slate-200'
    }`}
  >
    <span
      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
        on ? 'start-[18px]' : 'start-0.5'
      }`}
    />
  </span>
);

export default InteractionOptions;
