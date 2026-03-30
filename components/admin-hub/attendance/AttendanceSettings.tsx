import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, RotateCcw, AlertCircle, Settings, Shield, Bell, Clock } from 'lucide-react';

const STORAGE_KEY = 'string-quests-attendance-settings';

interface AttendanceSettingsData {
  lateThreshold: number;
  submissionWindow: number;
  warningThreshold: number;
  criticalThreshold: number;
  consecutiveAbsenceDays: number;
  requireOverrideReason: boolean;
}

const DEFAULTS: AttendanceSettingsData = {
  lateThreshold: 10,
  submissionWindow: 15,
  warningThreshold: 85,
  criticalThreshold: 70,
  consecutiveAbsenceDays: 3,
  requireOverrideReason: true,
};

function loadSettings(): AttendanceSettingsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULTS };
}

interface AttendanceSettingsProps {
  locale: 'ar' | 'en';
}

export function AttendanceSettings({ locale }: AttendanceSettingsProps) {
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const isRtl = locale === 'ar';

  const [settings, setSettings] = useState<AttendanceSettingsData>(loadSettings);
  const [saved, setSaved] = useState<AttendanceSettingsData>(loadSettings);
  const [showSaveFlash, setShowSaveFlash] = useState(false);

  const isDirty = JSON.stringify(settings) !== JSON.stringify(saved);

  const update = useCallback(<K extends keyof AttendanceSettingsData>(key: K, value: AttendanceSettingsData[K]) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      // Enforce critical < warning
      if (key === 'warningThreshold' && next.criticalThreshold >= (value as number)) {
        next.criticalThreshold = Math.max(0, (value as number) - 5);
      }
      if (key === 'criticalThreshold' && (value as number) >= next.warningThreshold) {
        return prev; // block invalid
      }
      return next;
    });
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved({ ...settings });
    setShowSaveFlash(true);
    setTimeout(() => setShowSaveFlash(false), 2000);
  };

  const handleReset = () => {
    setSettings({ ...DEFAULTS });
  };

  // Preview text
  const previewLines = [
    t(
      `سيتم تسجيل الطالب كمتأخر إذا حضر بعد ${settings.lateThreshold} دقيقة من بداية الحصة.`,
      `A student will be marked late if they arrive ${settings.lateThreshold} minutes after class starts.`
    ),
    t(
      `سيُرسل تنبيه إذا لم يسجل المعلم الحضور خلال ${settings.submissionWindow} دقيقة.`,
      `An alert will be sent if a teacher hasn't submitted attendance within ${settings.submissionWindow} minutes.`
    ),
    t(
      `حد التحذير: عندما تنخفض نسبة الحضور عن ${settings.warningThreshold}%.`,
      `Warning threshold: when attendance drops below ${settings.warningThreshold}%.`
    ),
    t(
      `حد الحالة الحرجة: عندما تنخفض نسبة الحضور عن ${settings.criticalThreshold}%.`,
      `Critical threshold: when attendance drops below ${settings.criticalThreshold}%.`
    ),
    t(
      `سيُرسل تنبيه بعد ${settings.consecutiveAbsenceDays} أيام غياب متتالية.`,
      `An alert will be sent after ${settings.consecutiveAbsenceDays} consecutive absent days.`
    ),
    settings.requireOverrideReason
      ? t('يجب تقديم سبب عند تعديل سجل الحضور.', 'A reason is required when overriding attendance records.')
      : t('لا يُطلب سبب عند تعديل سجل الحضور.', 'No reason is required when overriding attendance records.'),
  ];

  return (
    <div className="w-full max-w-2xl mx-auto font-[Cairo]" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Unsaved changes indicator */}
      {isDirty && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {t('يوجد تغييرات غير محفوظة', 'You have unsaved changes')}
        </motion.div>
      )}

      {/* Save flash */}
      {showSaveFlash && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm"
        >
          <Save className="w-4 h-4 shrink-0" />
          {t('تم حفظ الإعدادات بنجاح', 'Settings saved successfully')}
        </motion.div>
      )}

      {/* Card 1: Timing */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-purple-500" />
          <h3 className="text-sm font-bold text-slate-800">{t('إعدادات التوقيت', 'Timing Settings')}</h3>
        </div>

        <div className="space-y-5">
          {/* Late threshold */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {t('تسجيل التأخر بعد (دقيقة)', 'Late arrival threshold (minutes)')}
            </label>
            <p className="text-xs text-slate-400 mb-2">
              {t('عدد الدقائق بعد بداية الحصة لتسجيل الطالب كمتأخر', 'Minutes after class start to mark a student as late')}
            </p>
            <input
              type="number"
              min={1}
              max={60}
              value={settings.lateThreshold}
              onChange={e => update('lateThreshold', Math.max(1, Math.min(60, parseInt(e.target.value) || 1)))}
              className="w-28 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 transition-all"
            />
          </div>

          {/* Teacher submission window */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {t('تنبيه إذا لم يسجل المعلم خلال (دقيقة)', 'Teacher submission alert window (minutes)')}
            </label>
            <p className="text-xs text-slate-400 mb-2">
              {t('تنبيه المدير إذا لم يسجل المعلم الحضور خلال هذه المدة', 'Alert admin if teacher hasn\'t submitted within this time')}
            </p>
            <input
              type="number"
              min={5}
              max={60}
              value={settings.submissionWindow}
              onChange={e => update('submissionWindow', Math.max(5, Math.min(60, parseInt(e.target.value) || 5)))}
              className="w-28 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Card 2: Thresholds */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-800">{t('حدود النسب', 'Attendance Thresholds')}</h3>
        </div>

        <div className="space-y-6">
          {/* Warning threshold */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {t('حد التحذير %', 'Warning threshold %')}
            </label>
            <p className="text-xs text-slate-400 mb-2">
              {t('تنبيه عند انخفاض الحضور عن هذه النسبة', 'Alert when attendance drops below this rate')}
            </p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={50}
                max={100}
                step={1}
                value={settings.warningThreshold}
                onChange={e => update('warningThreshold', parseInt(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none bg-slate-200 accent-amber-500 cursor-pointer"
              />
              <span className="w-14 text-center text-sm font-bold text-amber-600 bg-amber-50 rounded-lg px-2 py-1">
                {settings.warningThreshold}%
              </span>
            </div>
          </div>

          {/* Critical threshold */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {t('حد الحالة الحرجة %', 'Critical threshold %')}
            </label>
            <p className="text-xs text-slate-400 mb-2">
              {t('يجب أن يكون أقل من حد التحذير', 'Must be less than the warning threshold')}
            </p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={30}
                max={settings.warningThreshold - 1}
                step={1}
                value={settings.criticalThreshold}
                onChange={e => update('criticalThreshold', parseInt(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none bg-slate-200 accent-red-500 cursor-pointer"
              />
              <span className="w-14 text-center text-sm font-bold text-red-600 bg-red-50 rounded-lg px-2 py-1">
                {settings.criticalThreshold}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Alert rules */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-blue-500" />
          <h3 className="text-sm font-bold text-slate-800">{t('قواعد التنبيهات', 'Alert Rules')}</h3>
        </div>

        <div className="space-y-5">
          {/* Consecutive absence days */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {t('تنبيه بعد غياب متتالي (أيام)', 'Consecutive absence alert (days)')}
            </label>
            <p className="text-xs text-slate-400 mb-2">
              {t('إرسال تنبيه بعد هذا العدد من أيام الغياب المتتالية', 'Send alert after this many consecutive absent days')}
            </p>
            <input
              type="number"
              min={1}
              max={30}
              value={settings.consecutiveAbsenceDays}
              onChange={e => update('consecutiveAbsenceDays', Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
              className="w-28 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 transition-all"
            />
          </div>

          {/* Require override reason */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-0.5">
                {t('طلب سبب عند تعديل الحضور', 'Require override reason')}
              </label>
              <p className="text-xs text-slate-400">
                {t('إلزام المعلم بتقديم سبب عند تعديل سجل حضور سابق', 'Require teachers to provide a reason when modifying past records')}
              </p>
            </div>
            <button
              onClick={() => update('requireOverrideReason', !settings.requireOverrideReason)}
              className={`shrink-0 relative w-11 h-6 rounded-full transition-colors duration-200 ${
                settings.requireOverrideReason ? 'bg-purple-500' : 'bg-slate-300'
              }`}
            >
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                style={{
                  [isRtl ? 'right' : 'left']: settings.requireOverrideReason
                    ? (isRtl ? '2px' : '22px')
                    : (isRtl ? '22px' : '2px'),
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Preview box */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-4 h-4 text-slate-500" />
          <h4 className="text-sm font-bold text-slate-600">{t('ملخص الإعدادات', 'Settings Summary')}</h4>
        </div>
        <ul className="space-y-1.5">
          {previewLines.map((line, i) => (
            <li key={i} className="text-xs text-slate-500 leading-relaxed flex items-start gap-1.5">
              <span className="shrink-0 mt-1 w-1 h-1 rounded-full bg-slate-400" />
              {line}
            </li>
          ))}
        </ul>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={!isDirty}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            isDirty
              ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Save className="w-4 h-4" />
          {t('حفظ الإعدادات', 'Save Settings')}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          {t('إعادة تعيين', 'Reset to Defaults')}
        </button>
      </div>
    </div>
  );
}
