// MessageBubble.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Render a single message as a bubble. Direction depends on author (parent =
// end-aligned blue, contact = start-aligned white). Tail-style: the
// inside-corner is squared, outside-corners rounded.

import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { useI18n } from '../../../../contexts/I18nContext';
import { getMessagesString } from '../data/parentAppMessagesI18n';
import type { MockMessage } from '../data/parentAppThreadsMock';
import { VoiceMessagePlayer } from './VoiceMessagePlayer';

interface Props {
  message: MockMessage;
  /** Imperative auto-advance hook for voice messages. */
  registerVoicePlay?: (messageId: string, play: () => void) => void;
  onVoiceEnded?: (messageId: string) => void;
}

function fmtClock(iso: string, locale: 'ar' | 'en'): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const hour = d.getHours();
  const min = String(d.getMinutes()).padStart(2, '0');
  const h12 = ((hour + 11) % 12) + 1;
  const suffix = locale === 'ar' ? (hour >= 12 ? 'م' : 'ص') : hour >= 12 ? 'PM' : 'AM';
  return `${h12}:${min} ${suffix}`;
}

export const MessageBubble: React.FC<Props> = ({
  message: m,
  registerVoicePlay,
  onVoiceEnded,
}) => {
  const { locale } = useI18n();
  const t = (k: string) => getMessagesString(locale, k);

  const isOwn = m.fromParent;
  const wrapperAlign = isOwn ? 'justify-end' : 'justify-start';

  const bubbleBase =
    'max-w-[78%] px-3 py-2 text-sm leading-snug shadow-[0_1px_0_0_rgba(15,23,42,0.06)]';

  const bubbleTone = isOwn
    ? 'bg-duo-blue text-white rounded-2xl rounded-ee-md'
    : 'bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-ss-md';

  const opacity = m.state === 'sending' ? 'opacity-70' : 'opacity-100';

  // Time + (own only) read receipt
  const timeColor = isOwn ? 'text-white/75' : 'text-slate-400';
  const receiptColor =
    m.state === 'read'
      ? 'text-cyan-200'
      : m.state === 'delivered'
        ? 'text-white/85'
        : 'text-white/70';

  const receiptIcon = (() => {
    if (!isOwn) return null;
    if (m.state === 'sending') return null;
    if (m.state === 'sent') {
      return (
        <Check
          className={`w-3.5 h-3.5 ${receiptColor}`}
          strokeWidth={3}
          aria-label={t('parentApp.messages.thread.read.sent')}
        />
      );
    }
    return (
      <CheckCheck
        className={`w-3.5 h-3.5 ${receiptColor}`}
        strokeWidth={3}
        aria-label={
          m.state === 'read'
            ? t('parentApp.messages.thread.read.read')
            : t('parentApp.messages.thread.read.delivered')
        }
      />
    );
  })();

  return (
    <div className={`w-full flex ${wrapperAlign} px-1`}>
      <div className={`${bubbleBase} ${bubbleTone} ${opacity}`}>
        {m.kind === 'text' && (
          <p className="whitespace-pre-wrap break-words">
            {locale === 'ar' ? m.bodyAr : m.bodyEn}
          </p>
        )}

        {m.kind === 'voice' && m.voiceBlobUrl && (
          <VoiceMessagePlayer
            messageId={m.id}
            src={m.voiceBlobUrl}
            durationSec={m.voiceDurationSec ?? 0}
            fromParent={isOwn}
            onEnded={() => onVoiceEnded?.(m.id)}
            registerPlay={(p) => registerVoicePlay?.(m.id, p)}
          />
        )}

        <div
          className={`mt-1 flex items-center gap-1 ${
            isOwn ? 'justify-end' : 'justify-end'
          }`}
        >
          <span className={`text-[10px] font-semibold ${timeColor}`}>
            {fmtClock(m.sentIso, locale)}
          </span>
          {receiptIcon}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
