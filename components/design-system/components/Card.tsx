/**
 * sq-Card — three archetypes that cover every surface in the codebase.
 *
 *   - glass    : `bg-white/80 backdrop-blur-xl` + soft border. Used in
 *                admin shells (NotificationAdmin, TopicManager).
 *   - solid    : `bg-white border-2`. Used in the Phone App (PhoneCard).
 *   - section  : Glass + gradient icon tile + heading + optional status
 *                pill. Generalised from notification-admin/SectionCard.
 *
 * All variants accept `tone` from the SqTone union (defaults to brand).
 */

import React from 'react';
import { Check, type LucideIcon } from 'lucide-react';
import { SQ_TONES, type SqTone } from '../tokens/colors';

export type SqCardVariant = 'glass' | 'solid' | 'section';

interface SqCardBaseProps {
  variant?: SqCardVariant;
  tone?: SqTone;
  className?: string;
  children?: React.ReactNode;
  /** Click handler — adds tactile hover affordance. */
  onClick?: () => void;
  /** When true, renders as <button> for keyboard accessibility. */
  interactive?: boolean;
  /** Selected state (solid variant only — for option pickers). */
  selected?: boolean;
}

interface SqSectionCardProps extends SqCardBaseProps {
  variant: 'section';
  icon: LucideIcon;
  titleAr: string;
  titleEn?: string;
  subtitleAr?: string;
  subtitleEn?: string;
  status?: 'complete' | 'incomplete';
  statusLabel?: { ar: string; en: string };
  meta?: React.ReactNode;
  locale?: 'ar' | 'en';
}

export type SqCardProps = SqCardBaseProps | SqSectionCardProps;

/* ─── Selected-state shadows (solid variant) ──────────────────────────── */

const SELECTED_TONE_BG: Record<SqTone, string> = {
  brand:   'bg-sq-brand-50 border-sq-brand-500 shadow-[0_4px_0_0_#7C3AED]',
  success: 'bg-sq-success-50 border-sq-success-500 shadow-[0_4px_0_0_#10B981]',
  warning: 'bg-sq-warning-50 border-sq-warning-500 shadow-[0_4px_0_0_#F59E0B]',
  danger:  'bg-sq-danger-50 border-sq-danger-500 shadow-[0_4px_0_0_#F43F5E]',
  info:    'bg-sq-info-50 border-sq-info-500 shadow-[0_4px_0_0_#0EA5E9]',
  neutral: 'bg-slate-50 border-slate-500 shadow-[0_4px_0_0_#64748B]',
};

const HOVER_TONE_BORDER: Record<SqTone, string> = {
  brand:   'hover:border-sq-brand-500/50',
  success: 'hover:border-sq-success-500/50',
  warning: 'hover:border-sq-warning-500/50',
  danger:  'hover:border-sq-danger-500/50',
  info:    'hover:border-sq-info-500/50',
  neutral: 'hover:border-slate-400',
};

/* ─── Component ───────────────────────────────────────────────────────── */

export const SqCard: React.FC<SqCardProps> = (props) => {
  const tone: SqTone = props.tone ?? 'brand';
  const className = props.className ?? '';
  const variant = props.variant ?? 'glass';

  if (variant === 'section') {
    const p = props as SqSectionCardProps;
    return <SectionVariant {...p} tone={tone} className={className} />;
  }

  const base =
    variant === 'glass'
      ? 'rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-sm p-6 md:p-8 font-cairo'
      : 'rounded-2xl bg-white border-2 border-slate-200 p-4 font-cairo';

  const interactive = props.interactive || !!props.onClick;
  const selected = props.selected ?? false;

  const stateClasses = interactive
    ? selected
      ? SELECTED_TONE_BG[tone]
      : `transition-colors duration-150 ${HOVER_TONE_BORDER[tone]}`
    : '';

  if (interactive) {
    return (
      <button
        type="button"
        onClick={props.onClick}
        className={[base, stateClasses, 'text-start w-full', className].join(' ')}
      >
        {props.children}
      </button>
    );
  }

  return (
    <div className={[base, stateClasses, className].join(' ')}>
      {props.children}
    </div>
  );
};

/* ─── Section variant ─────────────────────────────────────────────────── */

const SectionVariant: React.FC<
  SqSectionCardProps & { className: string; tone: SqTone }
> = ({
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
  className,
  children,
}) => {
  const t = SQ_TONES[tone];
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
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${t.gradient} ${t.shadow}`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-black text-slate-900 leading-tight tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500 leading-relaxed">{subtitle}</p>
          )}
        </div>

        {meta ? (
          <div className="shrink-0 flex items-center">{meta}</div>
        ) : status ? (
          <SectionStatusPill
            status={status}
            label={isAr ? defaultStatusLabel.ar : defaultStatusLabel.en}
            tone={tone}
          />
        ) : null}
      </header>

      <div>{children}</div>
    </section>
  );
};

const SectionStatusPill: React.FC<{
  status: 'complete' | 'incomplete';
  label: string;
  tone: SqTone;
}> = ({ status, label, tone }) => {
  const t = SQ_TONES[tone];
  if (status === 'complete') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${t.softBg} border ${t.border} text-[11px] font-bold ${t.text} shrink-0`}
      >
        <span
          className={`w-3.5 h-3.5 rounded-full ${t.solidBg} flex items-center justify-center`}
        >
          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
        </span>
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-500 shrink-0">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      {label}
    </span>
  );
};

export default SqCard;
