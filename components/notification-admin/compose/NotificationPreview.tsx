import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Mail, Bell, MessageSquare, Flag,
  Monitor, Tablet, Smartphone,
  Lock, Crown,
} from 'lucide-react';
import type {
  NotificationChannel,
  NotificationPriority,
  NotificationInteraction,
} from '../../../types/notification';
import { DeviceFrame } from './DeviceFrame';
import { BellPreview } from './BellPreview';
import { PopupPreview } from './PopupPreview';
import { BannerPreview } from './BannerPreview';
import { EmailPreview } from './EmailPreview';
import { WhatsAppPreview } from './WhatsAppPreview';
import { SmsPreview } from './SmsPreview';
import { PremiumChannelModal } from './PremiumChannelModal';
import {
  PREMIUM_CHANNELS,
  type PremiumChannelId,
  type PremiumChannelOption,
} from './premiumChannels';
import type { FocusField } from './previewFocus';

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

/**
 * The active-channel union extended with the premium ids so the tab bar +
 * preview stage can switch on a single discriminator. Premium ids never
 * make it back into Notification.channels — they're preview-only state.
 */
type ActiveTab = NotificationChannel | PremiumChannelId | null;

const DEVICE_OPTIONS: { mode: DeviceMode; label: string; icon: React.FC<{ className?: string }> }[] = [
  { mode: 'desktop', label: 'سطح المكتب', icon: Monitor },
  { mode: 'tablet', label: 'جهاز لوحي', icon: Tablet },
  { mode: 'mobile', label: 'جوال', icon: Smartphone },
];

interface NotificationPreviewProps {
  title: string;
  shortMessage: string;
  body: string;
  imageUrl: string;
  ctaButton: { label: string; url: string } | null;
  channels: NotificationChannel[];
  priority: NotificationPriority;
  bannerGradient: string;
  /** Currently-focused content field — forwarded to each sub-preview. */
  focusedField?: FocusField;
  /** When non-null, the notification is attached to a form id — previews
   *  show a small form-metadata chip + form icon prefix on the CTA. */
  attachedFormId?: string | null;
  /** Interaction options — drives the snooze / add-to-tasks / deadline UI
   *  in the recipient-side previews. */
  interaction?: NotificationInteraction;
}

const CHANNEL_TABS: Record<NotificationChannel, { label: string; icon: React.FC<{ className?: string }>; color: string }> = {
  email: { label: 'بريد إلكتروني', icon: Mail, color: 'text-sky-500' },
  bell: { label: 'إشعار الجرس', icon: Bell, color: 'text-amber-500' },
  popup: { label: 'نافذة منبثقة', icon: MessageSquare, color: 'text-purple-500' },
  banner: { label: 'شريط إعلاني', icon: Flag, color: 'text-emerald-500' },
};

function isPremiumTab(tab: ActiveTab): tab is PremiumChannelId {
  return tab === 'whatsapp' || tab === 'sms';
}

export const NotificationPreview: React.FC<NotificationPreviewProps> = ({
  title,
  shortMessage,
  body,
  imageUrl,
  ctaButton,
  channels,
  priority,
  bannerGradient,
  focusedField = null,
  attachedFormId = null,
  interaction,
}) => {
  const [activeChannel, setActiveChannel] = useState<ActiveTab>(null);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('mobile');
  const [premiumModalChannel, setPremiumModalChannel] =
    useState<PremiumChannelOption | null>(null);

  // Auto-select first active channel when channels change.
  // Premium tabs (whatsapp/sms) survive across re-renders since they're
  // not part of `channels`, but if the user had an active selection the
  // hook only nudges them when the active tab is no longer valid.
  useEffect(() => {
    if (isPremiumTab(activeChannel)) {
      // Premium preview is always available — keep showing it.
      return;
    }
    if (channels.length > 0) {
      if (!activeChannel || !channels.includes(activeChannel as NotificationChannel)) {
        setActiveChannel(channels[0]);
      }
    } else {
      setActiveChannel(null);
    }
  }, [channels, activeChannel]);

  // Empty state — only when no active channels AND no premium tab open.
  if (channels.length === 0 && !isPremiumTab(activeChannel)) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-sm font-bold text-slate-400 mb-3">
          اختر قناة إرسال لمعاينة الإشعار
        </p>
        {/* Even with no active channels, premium tabs are still discoverable */}
        <div className="flex items-center justify-center gap-2">
          {PREMIUM_CHANNELS.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setActiveChannel(p.id);
                }}
                title="خاصية مميزة · انقر للمعرفة المزيد"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 text-[11px] font-black text-amber-700 hover:from-amber-100 hover:to-yellow-100 transition-colors"
              >
                <Icon className={`w-3.5 h-3.5 ${p.iconColor}`} />
                <span>{p.label}</span>
                <Lock className="w-3 h-3 opacity-60" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const isEmpty = !title.trim();
  // Raw values are forwarded to sub-previews so they can render their own
  // animated empty-state placeholders (live preview = direct manipulation).

  // Email is best viewed in desktop chrome — force desktop frame for email
  // (mobile email apps look different but most school comms are read on desktop)
  const effectiveDeviceMode: DeviceMode =
    activeChannel === 'email' && deviceMode === 'mobile' ? 'desktop' : deviceMode;

  // Premium previews always render in mobile (they're phone-app mocks).
  const previewDeviceMode: DeviceMode = isPremiumTab(activeChannel)
    ? 'mobile'
    : effectiveDeviceMode;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      {/* Device Selector Bar */}
      <div className="flex items-center justify-center gap-1.5 px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
        {DEVICE_OPTIONS.map(({ mode, label, icon: Icon }) => {
          const isActive = deviceMode === mode;
          const isLocked = isPremiumTab(activeChannel) && mode !== 'mobile';
          return (
            <button
              key={mode}
              type="button"
              onClick={() => !isLocked && setDeviceMode(mode)}
              disabled={isLocked}
              title={isLocked ? 'المعاينة المميزة على الجوال فقط' : undefined}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isLocked
                  ? 'text-slate-300 cursor-not-allowed'
                  : isActive
                    ? 'bg-sky-100 text-sky-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Channel Tab Bar — chips pop on enable, fade on disable.
          Reduced motion: skip the scale/pop, just opacity-swap.
          Premium tabs render in their locked state at the end. */}
      <ChannelTabBar
        channels={channels}
        activeChannel={activeChannel}
        onSelect={setActiveChannel}
        onPremiumLearnMore={(c) => setPremiumModalChannel(c)}
      />

      {/* Preview Stage — generous py-7 to give the device frame room to
          breathe under the channel tab bar above it. */}
      <PreviewStage
        deviceMode={previewDeviceMode}
        activeChannel={activeChannel}
        title={title}
        shortMessage={shortMessage}
        body={body}
        imageUrl={imageUrl}
        ctaButton={ctaButton}
        priority={priority}
        bannerGradient={bannerGradient}
        isEmpty={isEmpty}
        focusedField={focusedField}
        attachedFormId={attachedFormId}
        interaction={interaction}
        onPremiumLearnMore={(c) => setPremiumModalChannel(c)}
      />

      {/* Premium contact-sales modal — same one used by ChannelSelector */}
      <PremiumChannelModal
        open={premiumModalChannel !== null}
        channel={premiumModalChannel}
        locale="ar"
        onClose={() => setPremiumModalChannel(null)}
      />
    </div>
  );
};

/* ===== Channel tab bar (extracted so we can hook reduced motion) ===== */

interface ChannelTabBarProps {
  channels: NotificationChannel[];
  activeChannel: ActiveTab;
  onSelect: (c: ActiveTab) => void;
  onPremiumLearnMore: (channel: PremiumChannelOption) => void;
}

const ChannelTabBar: React.FC<ChannelTabBarProps> = ({
  channels,
  activeChannel,
  onSelect,
  onPremiumLearnMore,
}) => {
  const reduced = useReducedMotion();
  return (
    <div className="flex border-b border-slate-100 overflow-x-auto">
      <AnimatePresence initial={false}>
        {channels.map((channel) => {
          const config = CHANNEL_TABS[channel];
          const Icon = config.icon;
          const isActive = activeChannel === channel;

          return (
            <motion.button
              key={channel}
              type="button"
              layout
              initial={reduced ? false : { opacity: 0, scale: 0.92, y: -2 }}
              animate={
                reduced
                  ? { opacity: 1 }
                  : { opacity: 1, scale: [0.92, 1.04, 1], y: 0 }
              }
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: -4 }}
              transition={{ duration: reduced ? 0 : 0.22, ease: 'easeOut' }}
              onClick={() => onSelect(channel)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 shrink-0 origin-bottom
                ${
                  isActive
                    ? 'border-sky-500 text-sky-600 bg-sky-50/50'
                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }
              `}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? config.color : ''}`} />
              {config.label}
            </motion.button>
          );
        })}
      </AnimatePresence>

      {/* Premium tabs — always rendered as locked siblings.
          Click selects them (so the admin can preview), but a tiny
          "learn more" sub-affordance opens the modal too. */}
      {PREMIUM_CHANNELS.map((p) => {
        const Icon = p.icon;
        const isActive = activeChannel === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              onPremiumLearnMore(p);
            }}
            title="خاصية مميزة · انقر للمعرفة المزيد"
            className={`relative flex items-center gap-1.5 px-4 py-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 shrink-0 origin-bottom
              ${
                isActive
                  ? 'border-amber-400 text-amber-700 bg-gradient-to-b from-amber-50 to-yellow-50'
                  : 'border-transparent text-slate-400 hover:text-amber-700 hover:bg-amber-50/50 saturate-50 hover:saturate-100'
              }
            `}
          >
            <span className="relative">
              <Icon className={`w-3.5 h-3.5 ${isActive ? p.iconColor : ''}`} />
              {/* Lock overlay */}
              <span
                className={`absolute -bottom-1 -end-1 w-3 h-3 rounded-full bg-amber-500 border border-white flex items-center justify-center ${
                  isActive ? 'opacity-100' : 'opacity-80'
                }`}
              >
                <Lock className="w-1.5 h-1.5 text-white" strokeWidth={3} />
              </span>
            </span>
            <span>{p.label}</span>
            <Crown className="w-3 h-3 text-amber-500" />
          </button>
        );
      })}
    </div>
  );
};

/* ===== Preview stage (extracted for reduced motion + key hashing) ===== */

interface PreviewStageProps {
  deviceMode: DeviceMode;
  activeChannel: ActiveTab;
  title: string;
  shortMessage: string;
  body: string;
  imageUrl: string;
  ctaButton: { label: string; url: string } | null;
  priority: NotificationPriority;
  bannerGradient: string;
  isEmpty: boolean;
  focusedField: FocusField;
  attachedFormId?: string | null;
  interaction?: NotificationInteraction;
  onPremiumLearnMore: (channel: PremiumChannelOption) => void;
}

const PreviewStage: React.FC<PreviewStageProps> = (props) => {
  const reduced = useReducedMotion();
  const {
    deviceMode,
    activeChannel,
    title,
    shortMessage,
    body,
    imageUrl,
    ctaButton,
    priority,
    bannerGradient,
    isEmpty,
    focusedField,
    attachedFormId,
    interaction,
    onPremiumLearnMore,
  } = props;
  return (
    <div className="px-5 py-7 bg-gradient-to-b from-slate-100/60 to-slate-50/40 min-h-[520px] flex items-start justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${deviceMode}-${activeChannel}`}
          initial={reduced ? false : { opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: reduced ? 0 : 0.22, ease: 'easeOut' }}
          className="w-full flex justify-center"
        >
          {renderPreview({
            deviceMode,
            activeChannel,
            title,
            shortMessage,
            body,
            imageUrl,
            ctaButton,
            priority,
            bannerGradient,
            isEmpty,
            focusedField,
            attachedFormId,
            interaction,
            onPremiumLearnMore,
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/* ===== Premium preview wrapper ───────────────────────────────────────
   Adds the translucent "Preview only · Premium feature" banner above
   the device frame, plus a "Learn more" CTA that re-opens the modal. */

interface PremiumPreviewWrapperProps {
  channel: PremiumChannelOption;
  onLearnMore: (c: PremiumChannelOption) => void;
  children: React.ReactNode;
}

const PremiumPreviewWrapper: React.FC<PremiumPreviewWrapperProps> = ({
  channel,
  onLearnMore,
  children,
}) => {
  return (
    <div className="w-full flex flex-col items-center gap-2.5">
      <div className="w-full max-w-[340px] flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-50/90 to-yellow-50/90 backdrop-blur-sm border border-amber-200 shadow-sm">
        <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-black text-amber-700 leading-tight">
            وضع المعاينة فقط · Preview only
          </div>
          <div className="text-[9px] font-bold text-amber-600/80 leading-tight">
            خاصية مميزة · Premium feature
          </div>
        </div>
        <button
          type="button"
          onClick={() => onLearnMore(channel)}
          className="text-[10px] font-black text-amber-700 hover:text-amber-800 underline decoration-dotted underline-offset-2 shrink-0"
        >
          اطلب الترقية
        </button>
      </div>
      {children}
    </div>
  );
};

/* ===== Preview composer ===== */

function renderPreview({
  deviceMode,
  activeChannel,
  title,
  shortMessage,
  body,
  imageUrl,
  ctaButton,
  priority,
  bannerGradient,
  isEmpty,
  focusedField,
  attachedFormId,
  interaction,
  onPremiumLearnMore,
}: {
  deviceMode: DeviceMode;
  activeChannel: ActiveTab;
  title: string;
  shortMessage: string;
  body: string;
  imageUrl: string;
  ctaButton: { label: string; url: string } | null;
  priority: NotificationPriority;
  bannerGradient: string;
  isEmpty: boolean;
  focusedField: FocusField;
  attachedFormId?: string | null;
  interaction?: NotificationInteraction;
  onPremiumLearnMore: (channel: PremiumChannelOption) => void;
}) {
  if (!activeChannel) return null;

  // ── PREMIUM: WHATSAPP ─────────────────────────────────
  if (activeChannel === 'whatsapp') {
    const channel = PREMIUM_CHANNELS.find((p) => p.id === 'whatsapp')!;
    return (
      <PremiumPreviewWrapper channel={channel} onLearnMore={onPremiumLearnMore}>
        <DeviceFrame mode="mobile" fullBleed>
          <WhatsAppPreview
            title={title}
            shortMessage={shortMessage}
            imageUrl={imageUrl}
            ctaButton={ctaButton}
            isEmpty={isEmpty}
          />
        </DeviceFrame>
      </PremiumPreviewWrapper>
    );
  }

  // ── PREMIUM: SMS ──────────────────────────────────────
  if (activeChannel === 'sms') {
    const channel = PREMIUM_CHANNELS.find((p) => p.id === 'sms')!;
    return (
      <PremiumPreviewWrapper channel={channel} onLearnMore={onPremiumLearnMore}>
        <DeviceFrame mode="mobile" fullBleed>
          <SmsPreview title={title} shortMessage={shortMessage} isEmpty={isEmpty} />
        </DeviceFrame>
      </PremiumPreviewWrapper>
    );
  }

  const isMobileLike = deviceMode === 'mobile' || deviceMode === 'tablet';

  // ── EMAIL ─────────────────────────────────────────────
  if (activeChannel === 'email') {
    return (
      <DeviceFrame mode={deviceMode}>
        <EmailPreview
          title={title}
          shortMessage={shortMessage}
          body={body}
          ctaButton={ctaButton}
          priority={priority}
          isEmpty={isEmpty}
          focusedField={focusedField}
          attachedFormId={attachedFormId}
          interaction={interaction}
        />
      </DeviceFrame>
    );
  }

  // ── BELL ──────────────────────────────────────────────
  if (activeChannel === 'bell') {
    return (
      <DeviceFrame mode={deviceMode} fullBleed={isMobileLike}>
        <div className={isMobileLike ? 'p-3' : ''}>
          <BellPreview
            title={title}
            shortMessage={shortMessage}
            priority={priority}
            isEmpty={isEmpty}
            focusedField={focusedField}
            attachedFormId={attachedFormId}
            interaction={interaction}
          />
        </div>
      </DeviceFrame>
    );
  }

  // ── POPUP ─────────────────────────────────────────────
  if (activeChannel === 'popup') {
    return (
      <DeviceFrame mode={deviceMode} fullBleed={isMobileLike}>
        <PopupPreview
          title={title}
          body={body}
          imageUrl={imageUrl}
          ctaButton={ctaButton}
          priority={priority}
          bannerGradient={bannerGradient}
          isEmpty={isEmpty}
          fullBleed={isMobileLike}
          focusedField={focusedField}
          attachedFormId={attachedFormId}
          interaction={interaction}
        />
      </DeviceFrame>
    );
  }

  // ── BANNER ────────────────────────────────────────────
  if (activeChannel === 'banner') {
    return (
      <DeviceFrame mode={deviceMode} fullBleed={isMobileLike}>
        <BannerPreview
          shortMessage={shortMessage}
          gradient={bannerGradient}
          ctaButton={ctaButton}
          priority={priority}
          isEmpty={isEmpty}
          fullBleed={isMobileLike}
          focusedField={focusedField}
          attachedFormId={attachedFormId}
          interaction={interaction}
        />
      </DeviceFrame>
    );
  }

  return null;
}
