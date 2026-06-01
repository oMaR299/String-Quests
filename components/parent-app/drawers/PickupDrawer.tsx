// PickupDrawer.tsx
// ─────────────────────────────────────────────────────────────────────────────
// 7th logistics drawer — daily pickup tracking + setup. Mirrors the
// "Forms" two-mode pattern: an overview mode (default) and an edit mode
// where the parent picks a new method (bus / parent / walk / aftercare).
//
// Mode 1 — Overview:
//   • Default method card (shows current default + driver/guardian/program)
//   • Today's timeline (3 events: boarded → en-route → arrived)
//   • Last 7 days history list
//
// Mode 2 — Edit:
//   • 4 method tiles (chip-style)
//   • Sub-picker (bus number, guardian, program — depending on method)
//   • "Apply to today only" toggle
//   • Save / Cancel
//
// While in edit mode we set `swipeLocked(true)` so horizontal swipes don't
// teleport the parent to the Attendance drawer mid-edit (matches FormsDrawer
// behavior).
//
// AR-first RTL via logical properties. Lucide icons only. No emojis.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Bus,
  Car,
  Footprints,
  Sun,
  Edit2,
  ChevronRight,
  Check,
  X as XIcon,
  CircleDashed,
} from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString, interpolate } from '../parentAppI18n';
import { BottomSheet } from './BottomSheet';
import {
  MOCK_BUSES,
  MOCK_AFTERCARE_PROGRAMS,
  MOCK_PARENT_GUARDIANS,
  type PickupMethod,
  type PickupMethodDetails,
} from '../data/parentAppSchoolMockData';
import { useParentAppContext } from '../useParentAppContext';
import { usePickupForChild, formatTime } from '../hooks/usePickupForChild';

interface Props {
  open: boolean;
  onClose: () => void;
  onSwipeNext?: () => void;
  onSwipePrev?: () => void;
}

// ─── Method icon + tone map (Tailwind v4 JIT-safe literals) ─────────────────

const METHOD_ICONS: Record<PickupMethod, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  bus: Bus,
  parent: Car,
  walk: Footprints,
  aftercare: Sun,
};

const METHOD_TONE: Record<PickupMethod, { bg: string; text: string; tile: string }> = {
  bus: {
    bg: 'bg-duo-blue',
    text: 'text-white',
    tile: 'bg-duo-blue-light text-duo-blue border-duo-blue/30',
  },
  parent: {
    bg: 'bg-duo-green',
    text: 'text-white',
    tile: 'bg-duo-green-light text-[#4CAD00] border-duo-green/30',
  },
  walk: {
    bg: 'bg-duo-orange',
    text: 'text-white',
    tile: 'bg-duo-orange-light text-orange-700 border-duo-orange/30',
  },
  aftercare: {
    bg: 'bg-duo-purple',
    text: 'text-white',
    tile: 'bg-duo-purple-light text-purple-700 border-duo-purple/30',
  },
};

const METHOD_LABEL_KEY: Record<PickupMethod, string> = {
  bus: 'parentApp.school.pickup.method.bus',
  parent: 'parentApp.school.pickup.method.parent',
  walk: 'parentApp.school.pickup.method.walk',
  aftercare: 'parentApp.school.pickup.method.aftercare',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Compose the small subtitle line that goes under the method label (bus
 *  number with driver, guardian name, aftercare program). */
function methodSubtitle(
  details: PickupMethodDetails,
  locale: 'ar' | 'en',
  t: (key: string) => string
): string | null {
  if (details.method === 'bus') {
    const parts: string[] = [];
    if (details.busNumber) {
      parts.push(
        interpolate(t('parentApp.school.pickup.method.busNumber'), {
          n: details.busNumber,
        })
      );
    }
    const driver = locale === 'ar' ? details.busDriverNameAr : details.busDriverNameEn;
    if (driver) {
      parts.push(
        interpolate(t('parentApp.school.pickup.method.withDriver'), { name: driver })
      );
    }
    return parts.join(' · ');
  }
  if (details.method === 'parent') {
    const guardian =
      locale === 'ar' ? details.parentGuardianAr : details.parentGuardianEn;
    return guardian
      ? interpolate(t('parentApp.school.pickup.method.withGuardian'), {
          name: guardian,
        })
      : null;
  }
  if (details.method === 'aftercare') {
    return locale === 'ar'
      ? details.aftercareProgramAr ?? null
      : details.aftercareProgramEn ?? null;
  }
  return null;
}

// ─── PickupDrawerContent ────────────────────────────────────────────────────

export const PickupDrawerContent: React.FC = () => {
  const { locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const { activeChildId, setSwipeLocked } = useParentAppContext();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  const {
    defaultMethod,
    todayPickup,
    history7d,
    setDefaultMethod,
    overrideTodayMethod,
  } = usePickupForChild(activeChildId);

  // ── Edit mode state ─────────────────────────────────────────────────────
  const [mode, setMode] = useState<'overview' | 'edit'>('overview');
  const [draftMethod, setDraftMethod] = useState<PickupMethod>(defaultMethod.method);
  const [draftBusNumber, setDraftBusNumber] = useState<string | undefined>(
    defaultMethod.busNumber
  );
  const [draftGuardian, setDraftGuardian] = useState<string | undefined>(
    locale === 'ar' ? defaultMethod.parentGuardianAr : defaultMethod.parentGuardianEn
  );
  const [draftProgram, setDraftProgram] = useState<string | undefined>(
    locale === 'ar' ? defaultMethod.aftercareProgramAr : defaultMethod.aftercareProgramEn
  );
  const [todayOnly, setTodayOnly] = useState<boolean>(false);

  // Locking horizontal swipe between drawers while editing so the parent
  // doesn't get yanked to Attendance mid-pick. Mirrors FormsDrawer.
  useEffect(() => {
    setSwipeLocked(mode === 'edit');
    return () => setSwipeLocked(false);
  }, [mode, setSwipeLocked]);

  const beginEdit = useCallback(() => {
    setDraftMethod(defaultMethod.method);
    setDraftBusNumber(defaultMethod.busNumber);
    setDraftGuardian(
      locale === 'ar' ? defaultMethod.parentGuardianAr : defaultMethod.parentGuardianEn
    );
    setDraftProgram(
      locale === 'ar'
        ? defaultMethod.aftercareProgramAr
        : defaultMethod.aftercareProgramEn
    );
    setTodayOnly(false);
    setMode('edit');
  }, [defaultMethod, locale]);

  const beginTodayOverride = useCallback(() => {
    beginEdit();
    setTodayOnly(true);
  }, [beginEdit]);

  const cancelEdit = useCallback(() => {
    setMode('overview');
  }, []);

  const canSave = useMemo(() => {
    if (draftMethod === 'bus') return !!draftBusNumber;
    if (draftMethod === 'parent') return !!draftGuardian;
    if (draftMethod === 'aftercare') return !!draftProgram;
    return true; // walk needs nothing extra
  }, [draftMethod, draftBusNumber, draftGuardian, draftProgram]);

  const composeDraftDetails = useCallback((): PickupMethodDetails => {
    if (draftMethod === 'bus') {
      const bus = MOCK_BUSES.find((b) => b.busNumber === draftBusNumber);
      return bus ?? MOCK_BUSES[0];
    }
    if (draftMethod === 'parent') {
      const guardian = MOCK_PARENT_GUARDIANS.find(
        (g) =>
          (locale === 'ar' ? g.parentGuardianAr : g.parentGuardianEn) === draftGuardian
      );
      return guardian ?? MOCK_PARENT_GUARDIANS[0];
    }
    if (draftMethod === 'aftercare') {
      const program = MOCK_AFTERCARE_PROGRAMS.find(
        (p) =>
          (locale === 'ar' ? p.aftercareProgramAr : p.aftercareProgramEn) ===
          draftProgram
      );
      return program ?? MOCK_AFTERCARE_PROGRAMS[0];
    }
    return { method: 'walk' };
  }, [draftMethod, draftBusNumber, draftGuardian, draftProgram, locale]);

  const handleSave = useCallback(() => {
    if (!canSave) return;
    const details = composeDraftDetails();
    if (todayOnly) {
      overrideTodayMethod(details);
    } else {
      setDefaultMethod(details);
    }
    setMode('overview');
    setSavedToast(t('parentApp.school.pickup.savedToast'));
    window.setTimeout(() => setSavedToast(null), 1800);
  }, [
    canSave,
    composeDraftDetails,
    todayOnly,
    overrideTodayMethod,
    setDefaultMethod,
    t,
  ]);

  const [savedToast, setSavedToast] = useState<string | null>(null);

  // ── Render ──────────────────────────────────────────────────────────────

  if (mode === 'edit') {
    return (
      <>
        <EditMode
          draftMethod={draftMethod}
          draftBusNumber={draftBusNumber}
          draftGuardian={draftGuardian}
          draftProgram={draftProgram}
          todayOnly={todayOnly}
          onMethodChange={setDraftMethod}
          onBusNumberChange={setDraftBusNumber}
          onGuardianChange={setDraftGuardian}
          onProgramChange={setDraftProgram}
          onTodayOnlyChange={setTodayOnly}
          onSave={handleSave}
          onCancel={cancelEdit}
          canSave={canSave}
        />
        <ToastBanner toast={savedToast} reduceMotion={!!reduceMotion} />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Default method card */}
        <section aria-label={t('parentApp.school.pickup.defaultMethodLabel')}>
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 ps-1">
            {t('parentApp.school.pickup.defaultMethodLabel')}
          </div>
          <MethodCard
            details={defaultMethod}
            actionLabel={t('parentApp.school.pickup.editCta')}
            onAction={beginEdit}
          />
        </section>

        {/* Today's timeline */}
        <section aria-label={t('parentApp.school.pickup.timelineLabel')}>
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 ps-1">
            {t('parentApp.school.pickup.todaysLabel')}
          </div>
          {todayPickup ? (
            <div className="rounded-2xl bg-white border border-slate-200 p-3">
              <TodayTimeline
                method={todayPickup.details.method}
                status={todayPickup.status}
                events={todayPickup.events}
                busTypicalArrival={todayPickup.details.busTypicalArrival}
                reduceMotion={!!reduceMotion}
              />
              <div className="mt-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={beginTodayOverride}
                  className="text-[11px] font-extrabold text-duo-blue hover:underline active:scale-[0.98] transition-all"
                >
                  {t('parentApp.school.pickup.overrideTodayCta')}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-center">
              <p className="text-xs font-bold text-slate-500">
                {t('parentApp.school.pickup.weekend')}
              </p>
            </div>
          )}
        </section>

        {/* History */}
        <section aria-label={t('parentApp.school.pickup.historyLabel')}>
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 ps-1">
            {t('parentApp.school.pickup.historyLabel')}
          </div>
          <ul className="space-y-1.5">
            {history7d.map((d) => (
              <HistoryRow key={d.dateIso} day={d} />
            ))}
          </ul>
        </section>
      </div>

      <ToastBanner toast={savedToast} reduceMotion={!!reduceMotion} />
    </>
  );
};

// ─── Sub-components ─────────────────────────────────────────────────────────

interface MethodCardProps {
  details: PickupMethodDetails;
  actionLabel: string;
  onAction: () => void;
}

const MethodCard: React.FC<MethodCardProps> = ({ details, actionLabel, onAction }) => {
  const { locale } = useI18n();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);
  const Icon = METHOD_ICONS[details.method];
  const tone = METHOD_TONE[details.method];
  const label = t(METHOD_LABEL_KEY[details.method]);
  const subtitle = methodSubtitle(details, locale, t);

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-3 flex items-center gap-3">
      <div
        className={`w-11 h-11 rounded-full inline-flex items-center justify-center shrink-0 ${tone.bg} ${tone.text}`}
        aria-hidden="true"
      >
        <Icon className="w-5 h-5" strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-black text-slate-800 leading-tight">{label}</div>
        {subtitle && (
          <div className="text-[11px] font-bold text-slate-500 leading-tight mt-0.5 truncate">
            {subtitle}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onAction}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-extrabold active:scale-[0.97] transition-all"
      >
        <Edit2 className="w-3 h-3" strokeWidth={2.5} />
        {actionLabel}
      </button>
    </div>
  );
};

interface TodayTimelineProps {
  method: PickupMethod;
  status: 'not-yet' | 'boarded' | 'en-route' | 'arrived' | 'cancelled';
  events: Array<{ kind: 'boarded' | 'en-route' | 'arrived' | 'cancelled'; timeIso: string }>;
  busTypicalArrival?: string;
  reduceMotion: boolean;
}

const TodayTimeline: React.FC<TodayTimelineProps> = ({
  method,
  status,
  events,
  busTypicalArrival,
  reduceMotion,
}) => {
  const { locale } = useI18n();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 text-[11px] font-extrabold text-rose-700">
        <XIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
        {t('parentApp.school.pickup.status.cancelled')}
      </div>
    );
  }

  const eventByKind = new Map<string, string>(
    events.map((e) => [e.kind, e.timeIso] as const)
  );
  const boardedAt: string | undefined = eventByKind.get('boarded');
  const enRouteAt: string | undefined = eventByKind.get('en-route');
  const arrivedAt: string | undefined = eventByKind.get('arrived');

  const boardedLabel =
    method === 'bus'
      ? t('parentApp.school.pickup.status.boarded')
      : t('parentApp.school.pickup.status.boardedParent');

  const steps: Array<{
    key: 'boarded' | 'en-route' | 'arrived';
    label: string;
    time?: string;
    expected?: string;
    state: 'pending' | 'active' | 'done';
  }> = [
    {
      key: 'boarded',
      label: boardedLabel,
      time: boardedAt ? formatTime(boardedAt) : undefined,
      state: boardedAt ? 'done' : status === 'not-yet' ? 'pending' : 'active',
    },
    {
      key: 'en-route',
      label: t('parentApp.school.pickup.status.enRoute'),
      time: enRouteAt ? formatTime(enRouteAt) : undefined,
      state:
        enRouteAt || arrivedAt
          ? 'done'
          : status === 'en-route'
            ? 'active'
            : 'pending',
    },
    {
      key: 'arrived',
      label: t('parentApp.school.pickup.status.arrived'),
      time: arrivedAt ? formatTime(arrivedAt) : undefined,
      expected:
        !arrivedAt && busTypicalArrival
          ? interpolate(t('parentApp.school.pickup.expected'), {
              time: busTypicalArrival,
            })
          : undefined,
      state: arrivedAt ? 'done' : 'pending',
    },
  ];

  return (
    <ol className="space-y-1.5">
      {steps.map((step) => {
        const isActive = step.state === 'active';
        const isDone = step.state === 'done';
        return (
          <li key={step.key} className="flex items-center gap-3">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                isDone
                  ? 'bg-duo-green'
                  : isActive
                    ? `bg-duo-blue ${reduceMotion ? '' : 'motion-safe:animate-pulse'}`
                    : 'bg-slate-200'
              }`}
              aria-hidden="true"
            />
            <div className="flex-1 min-w-0 flex items-baseline justify-between gap-2">
              <span
                className={`text-xs font-extrabold ${
                  isDone || isActive ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
              <span className="text-[11px] font-bold tabular-nums text-slate-500">
                {step.time ?? step.expected ?? ''}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

interface HistoryRowProps {
  day: {
    dateIso: string;
    details: PickupMethodDetails;
    status: 'not-yet' | 'boarded' | 'en-route' | 'arrived' | 'cancelled';
    events: Array<{ kind: 'boarded' | 'en-route' | 'arrived' | 'cancelled'; timeIso: string }>;
  };
}

const HistoryRow: React.FC<HistoryRowProps> = ({ day }) => {
  const { locale } = useI18n();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);
  const Icon = METHOD_ICONS[day.details.method];
  const tone = METHOD_TONE[day.details.method];

  const arrivedAt = day.events.find((e) => e.kind === 'arrived')?.timeIso;
  const dow = (() => {
    const d = new Date(day.dateIso);
    const dowIdx = d.getDay();
    return t(`parentApp.school.calendar.dow.${dowIdx}`);
  })();

  return (
    <li className="rounded-xl bg-white border border-slate-100 p-2 flex items-center gap-2.5">
      <div
        className={`w-8 h-8 rounded-full inline-flex items-center justify-center shrink-0 ${tone.bg} ${tone.text}`}
        aria-hidden="true"
      >
        <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0 flex items-baseline gap-2">
        <span className="text-xs font-extrabold text-slate-800 shrink-0">{dow}</span>
        <span className="text-[11px] font-bold text-slate-500 truncate">
          {t(METHOD_LABEL_KEY[day.details.method])}
        </span>
      </div>
      <div className="text-[11px] font-bold tabular-nums text-slate-500 shrink-0">
        {day.status === 'arrived' && arrivedAt
          ? `${t('parentApp.school.pickup.status.arrived')} ${formatTime(arrivedAt)}`
          : day.status === 'not-yet'
            ? t('parentApp.school.pickup.status.notYet')
            : t(`parentApp.school.pickup.status.${day.status}`)}
      </div>
    </li>
  );
};

// ─── Edit mode UI ───────────────────────────────────────────────────────────

interface EditModeProps {
  draftMethod: PickupMethod;
  draftBusNumber?: string;
  draftGuardian?: string;
  draftProgram?: string;
  todayOnly: boolean;
  onMethodChange: (m: PickupMethod) => void;
  onBusNumberChange: (n: string | undefined) => void;
  onGuardianChange: (g: string | undefined) => void;
  onProgramChange: (p: string | undefined) => void;
  onTodayOnlyChange: (b: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
  canSave: boolean;
}

const EditMode: React.FC<EditModeProps> = ({
  draftMethod,
  draftBusNumber,
  draftGuardian,
  draftProgram,
  todayOnly,
  onMethodChange,
  onBusNumberChange,
  onGuardianChange,
  onProgramChange,
  onTodayOnlyChange,
  onSave,
  onCancel,
  canSave,
}) => {
  const { locale } = useI18n();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  // When method changes, clear stale sub-picker selections so the form
  // doesn't carry a "guardian: Mom" choice into a bus-method draft.
  useEffect(() => {
    if (draftMethod !== 'bus') onBusNumberChange(undefined);
    if (draftMethod !== 'parent') onGuardianChange(undefined);
    if (draftMethod !== 'aftercare') onProgramChange(undefined);
    // Auto-pick the first option of the chosen method so the user can save
    // without picking a sub-option if they don't care which bus.
    if (draftMethod === 'bus' && !draftBusNumber) {
      onBusNumberChange(MOCK_BUSES[0].busNumber);
    }
    if (draftMethod === 'parent' && !draftGuardian) {
      onGuardianChange(
        locale === 'ar'
          ? MOCK_PARENT_GUARDIANS[0].parentGuardianAr
          : MOCK_PARENT_GUARDIANS[0].parentGuardianEn
      );
    }
    if (draftMethod === 'aftercare' && !draftProgram) {
      onProgramChange(
        locale === 'ar'
          ? MOCK_AFTERCARE_PROGRAMS[0].aftercareProgramAr
          : MOCK_AFTERCARE_PROGRAMS[0].aftercareProgramEn
      );
    }
  }, [
    draftMethod,
    draftBusNumber,
    draftGuardian,
    draftProgram,
    locale,
    onBusNumberChange,
    onGuardianChange,
    onProgramChange,
  ]);

  return (
    <div className="space-y-4">
      {/* Method tiles */}
      <section>
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 ps-1">
          {t('parentApp.school.pickup.chooseMethod')}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(['bus', 'parent', 'walk', 'aftercare'] as PickupMethod[]).map((m) => {
            const Icon = METHOD_ICONS[m];
            const active = draftMethod === m;
            const tone = METHOD_TONE[m];
            return (
              <button
                key={m}
                type="button"
                onClick={() => onMethodChange(m)}
                aria-pressed={active}
                className={`rounded-2xl border-2 p-3 flex items-center gap-2 transition-all active:scale-[0.97] ${
                  active
                    ? `${tone.tile} border-current`
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                <span className="text-xs font-extrabold leading-tight">
                  {t(METHOD_LABEL_KEY[m])}
                </span>
                {active && (
                  <Check className="w-3.5 h-3.5 ms-auto" strokeWidth={3} />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Sub-picker — only for methods that need one */}
      {draftMethod === 'bus' && (
        <SubPicker
          label={t('parentApp.school.pickup.chooseBus')}
          options={MOCK_BUSES.map((b) => ({
            value: b.busNumber ?? '',
            label: interpolate(t('parentApp.school.pickup.method.busNumber'), {
              n: b.busNumber ?? '',
            }),
            sub: locale === 'ar' ? b.busDriverNameAr : b.busDriverNameEn,
          }))}
          selected={draftBusNumber}
          onSelect={onBusNumberChange}
        />
      )}
      {draftMethod === 'parent' && (
        <SubPicker
          label={t('parentApp.school.pickup.chooseGuardian')}
          options={MOCK_PARENT_GUARDIANS.map((g) => ({
            value: (locale === 'ar' ? g.parentGuardianAr : g.parentGuardianEn) ?? '',
            label: (locale === 'ar' ? g.parentGuardianAr : g.parentGuardianEn) ?? '',
          }))}
          selected={draftGuardian}
          onSelect={onGuardianChange}
        />
      )}
      {draftMethod === 'aftercare' && (
        <SubPicker
          label={t('parentApp.school.pickup.chooseProgram')}
          options={MOCK_AFTERCARE_PROGRAMS.map((p) => ({
            value:
              (locale === 'ar' ? p.aftercareProgramAr : p.aftercareProgramEn) ?? '',
            label:
              (locale === 'ar' ? p.aftercareProgramAr : p.aftercareProgramEn) ?? '',
          }))}
          selected={draftProgram}
          onSelect={onProgramChange}
        />
      )}

      {/* Today-only toggle */}
      <label className="flex items-center gap-2.5 rounded-2xl bg-slate-50 border border-slate-200 p-3 cursor-pointer hover:bg-slate-100 active:scale-[0.99] transition-all">
        <input
          type="checkbox"
          checked={todayOnly}
          onChange={(e) => onTodayOnlyChange(e.target.checked)}
          className="w-4 h-4 accent-duo-blue"
        />
        <span className="text-xs font-extrabold text-slate-700">
          {t('parentApp.school.pickup.applyToTodayOnly')}
        </span>
      </label>

      {/* Save / Cancel */}
      <div className="flex items-center gap-2 justify-end pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-full text-xs font-extrabold text-slate-600 hover:bg-slate-100 active:scale-[0.97] transition-all"
        >
          {t('parentApp.school.pickup.cancel')}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          className={`px-5 py-2 rounded-full text-xs font-black transition-all active:scale-[0.97] ${
            canSave
              ? 'bg-duo-blue text-white hover:bg-duo-blue-dark'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {t('parentApp.school.pickup.save')}
        </button>
      </div>
    </div>
  );
};

interface SubPickerOption {
  value: string;
  label: string;
  sub?: string;
}
interface SubPickerProps {
  label: string;
  options: SubPickerOption[];
  selected: string | undefined;
  onSelect: (value: string) => void;
}

const SubPicker: React.FC<SubPickerProps> = ({ label, options, selected, onSelect }) => (
  <section>
    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 ps-1">
      {label}
    </div>
    <ul className="space-y-1.5">
      {options.map((opt) => {
        const active = opt.value === selected;
        return (
          <li key={opt.value}>
            <button
              type="button"
              onClick={() => onSelect(opt.value)}
              aria-pressed={active}
              className={`w-full rounded-xl border p-2.5 flex items-center gap-2 transition-all active:scale-[0.99] ${
                active
                  ? 'bg-duo-blue-light border-duo-blue/40 text-duo-blue'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {active ? (
                <Check className="w-4 h-4 shrink-0" strokeWidth={3} />
              ) : (
                <CircleDashed className="w-4 h-4 shrink-0 text-slate-400" strokeWidth={2.5} />
              )}
              <div className="flex-1 min-w-0 text-start">
                <div className="text-xs font-extrabold leading-tight truncate">
                  {opt.label}
                </div>
                {opt.sub && (
                  <div className="text-[11px] font-bold text-slate-500 leading-tight truncate">
                    {opt.sub}
                  </div>
                )}
              </div>
              <ChevronRight
                className="w-3.5 h-3.5 text-slate-300 shrink-0 rtl:rotate-180"
                strokeWidth={2.5}
              />
            </button>
          </li>
        );
      })}
    </ul>
  </section>
);

// ─── Toast banner ───────────────────────────────────────────────────────────

interface ToastBannerProps {
  toast: string | null;
  reduceMotion: boolean;
}

const ToastBanner: React.FC<ToastBannerProps> = ({ toast, reduceMotion }) => (
  <AnimatePresence>
    {toast && (
      <motion.div
        key={toast}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -14, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.92 }}
        transition={{ duration: reduceMotion ? 0.18 : 0.22 }}
        className="fixed top-4 inset-x-0 flex justify-center pointer-events-none z-[310] px-4"
        aria-live="polite"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-duo-green text-white text-sm font-bold">
          <Check className="w-4 h-4" strokeWidth={2.5} />
          <span>{toast}</span>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Standalone wrapper (back-compat) ───────────────────────────────────────

interface StandaloneProps {
  open: boolean;
  onClose: () => void;
  onSwipeNext?: () => void;
  onSwipePrev?: () => void;
}

export const PickupDrawer: React.FC<StandaloneProps> = ({
  open,
  onClose,
  onSwipeNext,
  onSwipePrev,
}) => {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      titleAr={getParentAppString('ar', 'parentApp.school.pickup.drawerTitle')}
      titleEn={getParentAppString('en', 'parentApp.school.pickup.drawerTitle')}
      onSwipeNext={onSwipeNext}
      onSwipePrev={onSwipePrev}
      transitionKey="pickup"
    >
      <PickupDrawerContent />
    </BottomSheet>
  );
};

export default PickupDrawer;
