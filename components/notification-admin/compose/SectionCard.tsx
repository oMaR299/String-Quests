// SectionCard.tsx
// Reusable section shell for the compose page. Each form group renders inside
// one of these so the page reads as a stack of self-contained, polished cards.
//
// API:
//   <SectionCard
//     icon={MessageSquareText}                 // lucide icon component
//     tone="violet"                            // gradient tone token (see TONE_MAP)
//     titleAr="محتوى الإشعار"
//     titleEn="Content"
//     subtitleAr="..."                         // optional descriptive subtitle
//     subtitleEn="..."                         // optional EN counterpart
//     status="complete" | "incomplete" | undefined
//     statusLabel={{ ar, en }}                 // optional override, defaults to مكتمل/غير مكتمل
//     meta={<...>}                             // optional right-side meta slot (overrides status pill)
//     locale="ar" | "en"
//   >{children}</SectionCard>
//
// Cairo font, AR-first, RTL-aware. Tailwind v4 JIT-safe: tone classes are
// declared as full literals in the static map so the JIT picks them up.

import React from 'react';
import { Check } from 'lucide-react';

export type SectionTone =
  | 'violet'
  | 'blue'
  | 'amber'
  | 'emerald'
  | 'rose'
  | 'slate';

interface ToneStyle {
  /** Gradient applied to the icon tile */
  iconGradient: string;
  /** Soft drop shadow color matching the tone */
  iconShadow: string;
  /** Color for the small uppercase EN eyebrow under the title */
  eyebrow: string;
  /** Complete-pill background (when section is complete) */
  pillBg: string;
  /** Complete-pill border */
  pillBorder: string;
  /** Complete-pill text color */
  pillText: string;
  /** Complete-pill inner check-circle bg */
  pillCheckBg: string;
}

// Static map — every class string must be a complete literal so Tailwind v4
// JIT sees it without needing a runtime concatenation. Do NOT compose these
// strings programmatically.
const TONE_MAP: Record<SectionTone, ToneStyle> = {
  violet: {
    iconGradient: 'bg-gradient-to-br from-violet-500 to-purple-600',
    iconShadow: 'shadow-md shadow-violet-500/25',
    eyebrow: 'text-violet-500',
    pillBg: 'bg-violet-50',
    pillBorder: 'border-violet-200',
    pillText: 'text-violet-700',
    pillCheckBg: 'bg-violet-500',
  },
  blue: {
    iconGradient: 'bg-gradient-to-br from-sky-500 to-blue-600',
    iconShadow: 'shadow-md shadow-sky-500/25',
    eyebrow: 'text-sky-500',
    pillBg: 'bg-sky-50',
    pillBorder: 'border-sky-200',
    pillText: 'text-sky-700',
    pillCheckBg: 'bg-sky-500',
  },
  amber: {
    iconGradient: 'bg-gradient-to-br from-amber-400 to-orange-500',
    iconShadow: 'shadow-md shadow-amber-500/25',
    eyebrow: 'text-amber-600',
    // Amber complete-pill is too loud; use emerald for the universal
    // "this is good, ship it" signal. The amber identity stays on the
    // icon tile + rail; only the success affirmation uses emerald.
    pillBg: 'bg-emerald-50',
    pillBorder: 'border-emerald-200',
    pillText: 'text-emerald-700',
    pillCheckBg: 'bg-emerald-500',
  },
  emerald: {
    iconGradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    iconShadow: 'shadow-md shadow-emerald-500/25',
    eyebrow: 'text-emerald-600',
    pillBg: 'bg-emerald-50',
    pillBorder: 'border-emerald-200',
    pillText: 'text-emerald-700',
    pillCheckBg: 'bg-emerald-500',
  },
  rose: {
    iconGradient: 'bg-gradient-to-br from-rose-500 to-pink-600',
    iconShadow: 'shadow-md shadow-rose-500/25',
    eyebrow: 'text-rose-500',
    pillBg: 'bg-rose-50',
    pillBorder: 'border-rose-200',
    pillText: 'text-rose-700',
    pillCheckBg: 'bg-rose-500',
  },
  slate: {
    iconGradient: 'bg-gradient-to-br from-slate-500 to-slate-700',
    iconShadow: 'shadow-md shadow-slate-500/25',
    eyebrow: 'text-slate-500',
    pillBg: 'bg-slate-100',
    pillBorder: 'border-slate-200',
    pillText: 'text-slate-700',
    pillCheckBg: 'bg-slate-600',
  },
};

export type SectionStatus = 'complete' | 'incomplete';

interface SectionCardProps {
  icon: React.FC<{ className?: string }>;
  tone: SectionTone;
  titleAr: string;
  titleEn?: string;
  subtitleAr?: string;
  subtitleEn?: string;
  status?: SectionStatus;
  statusLabel?: { ar: string; en: string };
  /** Custom right-side meta — when provided, replaces the status pill */
  meta?: React.ReactNode;
  locale?: 'ar' | 'en';
  children: React.ReactNode;
  className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  icon: Icon,
  tone,
  titleAr,
  titleEn,
  subtitleAr,
  subtitleEn,
  status,
  statusLabel,
  meta,
  locale = 'ar',
  children,
  className = '',
}) => {
  const toneStyle = TONE_MAP[tone];
  const isAr = locale === 'ar';
  const title = isAr ? titleAr : titleEn ?? titleAr;
  const subtitle = isAr ? subtitleAr : subtitleEn ?? subtitleAr;

  const defaultStatusLabel =
    statusLabel ??
    (status === 'complete'
      ? { ar: 'مكتمل', en: 'Complete' }
      : { ar: 'غير مكتمل', en: 'Incomplete' });

  return (
    <section
      className={`rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-sm p-6 md:p-8 transition-all font-cairo ${className}`}
    >
      <header className="flex items-start gap-4 mb-6">
        {/* Gradient icon tile — 44px */}
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${toneStyle.iconGradient} ${toneStyle.iconShadow}`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>

        {/* Title + subtitle stack */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-black text-slate-900 leading-tight tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right-side meta slot — `me-auto`-ish spacing already handled by flex */}
        {meta ? (
          <div className="shrink-0 flex items-center">{meta}</div>
        ) : status ? (
          <StatusPill
            status={status}
            label={isAr ? defaultStatusLabel.ar : defaultStatusLabel.en}
            toneStyle={toneStyle}
          />
        ) : null}
      </header>

      <div>{children}</div>
    </section>
  );
};

/* ─── Status pill ──────────────────────────────────────────────────────── */

interface StatusPillProps {
  status: SectionStatus;
  label: string;
  toneStyle: ToneStyle;
}

const StatusPill: React.FC<StatusPillProps> = ({ status, label, toneStyle }) => {
  if (status === 'complete') {
    // Toned complete pill — adopts the section's identity so the eye reads
    // "this section is done" in the section's own colour. The single
    // exception is the amber Priority section: shipping a pill in amber
    // would read like a warning, so the TONE_MAP entry above maps amber's
    // pill colours to emerald (universal "OK"). The *negative* state
    // stays neutral slate.
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${toneStyle.pillBg} border ${toneStyle.pillBorder} text-[11px] font-bold ${toneStyle.pillText} shrink-0`}
      >
        <span
          className={`w-3.5 h-3.5 rounded-full ${toneStyle.pillCheckBg} flex items-center justify-center`}
        >
          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
        </span>
        {label}
      </span>
    );
  }
  // Negative ("incomplete") state stays neutral — over-coloring it would
  // read like an error rather than "not yet done."
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-500 shrink-0">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      {label}
    </span>
  );
};

export default SectionCard;
