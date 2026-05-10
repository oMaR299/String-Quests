/**
 * sq-FormSection — composes SqCard (variant=section) with consistent
 * inner spacing rhythm. Use when you need a labelled form group.
 *
 * The wrapper enforces the spacing recipe so every consumer's form
 * sections feel rhythmically aligned.
 */

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { SqCard } from '../components/Card';
import type { SqTone } from '../tokens/colors';

interface SqFormSectionProps {
  icon: LucideIcon;
  tone?: SqTone;
  titleAr: string;
  titleEn?: string;
  subtitleAr?: string;
  subtitleEn?: string;
  status?: 'complete' | 'incomplete';
  locale?: 'ar' | 'en';
  children: React.ReactNode;
  className?: string;
}

export const SqFormSection: React.FC<SqFormSectionProps> = ({
  icon,
  tone = 'brand',
  titleAr,
  titleEn,
  subtitleAr,
  subtitleEn,
  status,
  locale = 'ar',
  children,
  className = '',
}) => {
  return (
    <SqCard
      variant="section"
      tone={tone}
      icon={icon}
      titleAr={titleAr}
      titleEn={titleEn}
      subtitleAr={subtitleAr}
      subtitleEn={subtitleEn}
      status={status}
      locale={locale}
      className={className}
    >
      <div className="space-y-4">{children}</div>
    </SqCard>
  );
};

export default SqFormSection;
