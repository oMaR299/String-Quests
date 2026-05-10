// ProfilePlaceholder.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Two stacked cards per the plan:
//
//   • Top "Child profile" — avatar + name + 3 stats (streak / lessons /
//     mastery) for the active child.
//   • Bottom "Account settings" — language toggle (LocaleToggle) + plan row
//     ("Free plan" → mock upgrade CTA) + masked phone.
//
// Read-only in v1.

import React, { useCallback } from 'react';
import { Crown, Phone, Flame } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';
import { useParentAppContext } from '../useParentAppContext';
import { AVATAR_STYLES } from '../parentAppMockData';
import { LocaleToggle } from '../../parent-onboarding/LocaleToggle';

export const ProfilePlaceholder: React.FC = () => {
  const { locale } = useI18n();
  const { state, activeChild } = useParentAppContext();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  // activeChild is always non-null in single-child mode.
  const child = activeChild;
  const style = AVATAR_STYLES[child.avatarColor];
  const name = locale === 'ar' ? child.nameAr : child.nameEn;

  return (
    <div className="space-y-4 px-5 pt-5 pb-6">
      {/* Child profile card */}
      <section className="rounded-3xl bg-white/95 backdrop-blur border border-white/80 shadow-[0_2px_24px_rgba(28,176,246,0.10)] p-5 space-y-4">
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          {t('parentApp.profile.childTitle')}
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`w-16 h-16 rounded-full inline-flex items-center justify-center shrink-0 ${style.bg} ${style.text} ${style.shadow}`}
          >
            <span className="text-2xl font-black">{child.avatarInitial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xl font-black text-slate-800 leading-tight truncate">{name}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Stat label={t('parentApp.profile.streakStat')} value={`${child.streakDays}`} accent="text-duo-orange" iconBg="bg-duo-orange-light" Icon={Flame} />
          <Stat label={t('parentApp.profile.lessonsStat')} value={`${child.totalLessons}`} accent="text-duo-blue" iconBg="bg-duo-blue-light" />
          <Stat label={t('parentApp.profile.masteryStat')} value={`${child.masteryPct}%`} accent="text-[#4CAD00]" iconBg="bg-duo-green-light" />
        </div>
      </section>

      {/* Account settings card */}
      <section className="rounded-3xl bg-white/95 backdrop-blur border border-white/80 shadow-[0_2px_24px_rgba(28,176,246,0.10)] p-5 space-y-4">
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          {t('parentApp.profile.accountTitle')}
        </div>

        {/* Language */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-extrabold text-slate-700">
            {t('parentApp.profile.languageLabel')}
          </span>
          <LocaleToggle />
        </div>

        {/* Phone */}
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <span className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-700">
            <Phone className="w-4 h-4 text-slate-400" />
            {t('parentApp.profile.phoneLabel')}
          </span>
          <span className="text-sm font-bold text-slate-500" dir="ltr">
            {state.parentPhoneMasked || t('parentApp.profile.phoneNotSet')}
          </span>
        </div>

        {/* Plan / Supernova */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
          <div className="w-10 h-10 rounded-full bg-duo-purple-light inline-flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5 text-duo-purple" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-extrabold text-slate-800 leading-tight">
              {t('parentApp.profile.planLabel')}
            </div>
            <div className="text-xs font-bold text-slate-500">
              {t('parentApp.profile.planFree')}
            </div>
          </div>
          <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px] font-extrabold">
            {t('parentApp.common.comingSoon')}
          </span>
        </div>
      </section>
    </div>
  );
};

interface StatProps {
  label: string;
  value: string;
  accent: string;
  iconBg: string;
  Icon?: React.ElementType;
}

const Stat: React.FC<StatProps> = ({ label, value, accent, iconBg, Icon }) => (
  <div className="rounded-2xl bg-slate-50 p-3 text-center">
    {Icon && (
      <div className={`w-7 h-7 rounded-full mx-auto mb-1.5 inline-flex items-center justify-center ${iconBg}`}>
        <Icon className={`w-4 h-4 ${accent}`} strokeWidth={2.5} />
      </div>
    )}
    <div className={`text-lg font-black leading-tight ${accent}`}>{value}</div>
    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
      {label}
    </div>
  </div>
);

export default ProfilePlaceholder;
