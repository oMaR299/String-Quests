/**
 * premiumChannels — single source of truth for the "coming-soon"
 * channel tier rendered alongside the active 4-channel selector.
 *
 * These are NOT part of `Notification.channels` — they're rendered
 * as additional chips in the ChannelSelector and as locked tabs
 * in the NotificationPreview. Clicking opens the PremiumChannelModal
 * (a contact-sales flow) instead of toggling selection.
 *
 * Keeping the list as a static array means the component code stays
 * declarative and the visual treatment (gold accent, crown badge,
 * locked preview tab, mailto draft body) is shared without coupling
 * to runtime state.
 */
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';

export type PremiumChannelId = 'whatsapp' | 'sms';

export interface PremiumChannelOption {
  id: PremiumChannelId;
  icon: React.FC<{ className?: string }>;
  /** Identity tone for the icon glyph in chips & previews. */
  iconColor: string;
  label: string;
  labelEn: string;
  description: string;
  descriptionEn: string;
  /** Headline copy used inside the premium modal. */
  modalHeadline: string;
  modalHeadlineEn: string;
  /** Sub-copy explaining the channel's value prop. */
  modalSubcopy: string;
  modalSubcopyEn: string;
  /** Bullet list of capabilities ("what's included"). */
  bullets: { ar: string; en: string }[];
  /** Mailto subject when admin clicks the contact CTA. */
  mailSubject: string;
}

export const PREMIUM_CHANNELS: PremiumChannelOption[] = [
  {
    id: 'whatsapp',
    icon: WhatsAppIcon,
    iconColor: 'text-emerald-500',
    label: 'واتساب',
    labelEn: 'WhatsApp',
    description: 'رسالة واتساب مباشرة',
    descriptionEn: 'Direct WhatsApp message',
    modalHeadline: 'قنوات الواتساب متوفرة في الباقة المميزة',
    modalHeadlineEn: 'WhatsApp is available on our Premium plan',
    modalSubcopy:
      'أرسل إشعارات مباشرة لرقم الواتساب الخاص بكل ولي أمر مع تأكيد الاستلام والقراءة. مثالي للإعلانات الطارئة وتذكيرات المواعيد المهمة.',
    modalSubcopyEn:
      'Send direct WhatsApp notifications to every parent with delivery and read receipts. Perfect for urgent announcements and important deadline reminders.',
    bullets: [
      { ar: 'توصيل فوري للهاتف', en: 'Instant delivery to phone' },
      { ar: 'تأكيد الاستلام والقراءة (✓✓)', en: 'Delivery & read receipts (✓✓)' },
      { ar: 'ردود ثنائية الاتجاه من ولي الأمر', en: 'Two-way replies from parents' },
      { ar: 'دعم الصور وأزرار الإجراء', en: 'Supports images & action buttons' },
    ],
    mailSubject: 'Premium Channels Inquiry — WhatsApp',
  },
  {
    id: 'sms',
    icon: MessageSquare,
    iconColor: 'text-sky-500',
    label: 'رسالة نصية',
    labelEn: 'SMS',
    description: 'رسالة SMS قصيرة',
    descriptionEn: 'Short SMS text message',
    modalHeadline: 'الرسائل النصية متوفرة في الباقة المميزة',
    modalHeadlineEn: 'SMS is available on our Premium plan',
    modalSubcopy:
      'وصل إلى أولياء الأمور حتى بدون اتصال بالإنترنت أو تطبيق مثبّت. الرسائل النصية تضمن وصول الإعلانات المهمة لكل عائلة.',
    modalSubcopyEn:
      'Reach parents even without internet or an installed app. SMS guarantees critical announcements get delivered to every family, every time.',
    bullets: [
      { ar: 'يصل لكل هاتف بدون تطبيق', en: 'Reaches every phone, no app needed' },
      { ar: 'موثوقية تصل إلى 98%', en: 'Up to 98% delivery rate' },
      { ar: 'يعمل بدون إنترنت', en: 'Works without internet' },
      { ar: 'رمز مرسل قصير معرَّف للمدرسة', en: 'Identified short-code sender ID' },
    ],
    mailSubject: 'Premium Channels Inquiry — SMS',
  },
];

/** Build a polished mailto link with a sensible draft body. */
export function buildPremiumMailto(channel: PremiumChannelOption): string {
  const body = [
    `Hi String team,`,
    ``,
    `I'm interested in enabling ${channel.labelEn} notifications for our school.`,
    ``,
    `Could you share details on:`,
    `- Pricing & rollout timeline`,
    `- Setup requirements (sender registration, opt-in flow)`,
    `- Pilot availability for our campus`,
    ``,
    `Looking forward to hearing back.`,
    ``,
    `— Sent from String-Quests Notification Composer`,
  ].join('\n');
  const subject = encodeURIComponent(channel.mailSubject);
  const encodedBody = encodeURIComponent(body);
  return `mailto:premium@stringquests.app?subject=${subject}&body=${encodedBody}`;
}

export function getPremiumChannelById(
  id: PremiumChannelId,
): PremiumChannelOption | null {
  return PREMIUM_CHANNELS.find((c) => c.id === id) ?? null;
}
