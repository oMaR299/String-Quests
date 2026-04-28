/**
 * ChannelSelector
 *
 * Lives inside the blue-toned Channels SectionCard. Per the integration
 * polish pass: the chips used to use per-channel pastel "selected" states
 * (blue bell, amber popup, purple banner, emerald email) which fought the
 * surrounding card's blue tone — the Channels card looked like a colour
 * casserole.
 *
 * Decision (Option A): drop per-channel pastel selected states. All
 * selected chips adopt the section's blue tone. The channel ICON keeps
 * its identity colour (so admins can still scan the icons by colour),
 * but the chip background, border, indicator dot, and icon-tile bg all
 * unify under one tone. Unselected chips render neutral (white + slate).
 *
 * This makes the Channels card read as a cohesive "pick channels" widget
 * inside its blue card, instead of four mini cards in four different
 * colours competing for attention.
 *
 * --- Premium tier (WhatsApp / SMS) ---
 * Premium channels render alongside the active 4 as a separate row of
 * gold-accented chips. They do NOT toggle selection — clicking opens
 * the PremiumChannelModal (a contact-sales flow). Visually they read
 * as "premium · coming soon" via:
 *   - subtle amber gradient background
 *   - amber border
 *   - small Crown icon in the corner
 *   - "قريبًا · Coming soon" tag under the channel name
 *   - native `title` tooltip "متوفرة في الباقة المميزة قريبًا"
 *
 * Tailwind v4 JIT-safe: every class string is a complete literal.
 */
import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Mail, Bell, MessageSquare, Flag, AlertCircle, Check, Crown } from 'lucide-react';
import type { NotificationChannel } from '../../../types/notification';
import {
  PREMIUM_CHANNELS,
  type PremiumChannelOption,
} from './premiumChannels';
import { PremiumChannelModal } from './PremiumChannelModal';

interface ChannelOption {
  id: NotificationChannel;
  icon: React.FC<{ className?: string }>;
  label: string;
  description: string;
  /** Identity colour for the icon glyph only — chip surfaces stay tone-uniform. */
  iconColor: string;
}

const CHANNEL_OPTIONS: ChannelOption[] = [
  {
    id: 'email',
    icon: Mail,
    label: 'بريد إلكتروني',
    description: 'إرسال بريد إلكتروني مفصّل',
    iconColor: 'text-blue-500',
  },
  {
    id: 'bell',
    icon: Bell,
    label: 'إشعار الجرس',
    description: 'إشعار سريع في لوحة التحكم',
    iconColor: 'text-amber-500',
  },
  {
    id: 'popup',
    icon: MessageSquare,
    label: 'نافذة منبثقة',
    description: 'نافذة تظهر عند تسجيل الدخول',
    iconColor: 'text-purple-500',
  },
  {
    id: 'banner',
    icon: Flag,
    label: 'شريط إعلاني',
    description: 'شريط ثابت أعلى الصفحة',
    iconColor: 'text-emerald-500',
  },
];

interface ChannelSelectorProps {
  selected: NotificationChannel[];
  onChange: (channels: NotificationChannel[]) => void;
}

export const ChannelSelector: React.FC<ChannelSelectorProps> = ({ selected, onChange }) => {
  const reduced = useReducedMotion();
  const hasValidationError = selected.length === 0;
  const [premiumChannel, setPremiumChannel] = useState<PremiumChannelOption | null>(null);

  const toggleChannel = (channelId: NotificationChannel) => {
    if (selected.includes(channelId)) {
      onChange(selected.filter((c) => c !== channelId));
    } else {
      onChange([...selected, channelId]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {CHANNEL_OPTIONS.map((channel) => {
          const isSelected = selected.includes(channel.id);
          const Icon = channel.icon;

          return (
            <motion.button
              key={channel.id}
              type="button"
              whileTap={reduced ? undefined : { scale: 0.97 }}
              onClick={() => toggleChannel(channel.id)}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-center
                ${
                  isSelected
                    ? 'border-sky-400 bg-sky-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }
              `}
            >
              {/* Selection check chip — section-tone (blue) check on selection,
                  hollow neutral circle when unselected. */}
              <div
                className={`absolute top-2.5 left-2.5 w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center
                  ${
                    isSelected
                      ? 'border-sky-500 bg-sky-500'
                      : 'border-slate-300 bg-white'
                  }
                `}
              >
                {isSelected && (
                  <motion.span
                    initial={reduced ? false : { scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: reduced ? 0 : 0.2 }}
                    className="flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </motion.span>
                )}
              </div>

              {/* Icon tile: white-ish on selection so the icon's identity
                  colour reads cleanly against the blue chip; neutral
                  slate when unselected. */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200
                  ${isSelected ? 'bg-white shadow-sm' : 'bg-slate-100'}
                `}
              >
                <Icon className={`w-5 h-5 ${isSelected ? channel.iconColor : 'text-slate-500'}`} />
              </div>

              <div>
                <div
                  className={`text-sm font-bold ${
                    isSelected ? 'text-sky-900' : 'text-slate-800'
                  }`}
                >
                  {channel.label}
                </div>
                <div
                  className={`text-[11px] font-medium mt-0.5 leading-tight ${
                    isSelected ? 'text-sky-700/70' : 'text-slate-400'
                  }`}
                >
                  {channel.description}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Validation error */}
      {hasValidationError && (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
          className="flex items-center gap-2 text-red-500 text-xs font-bold"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>يجب اختيار قناة واحدة على الأقل</span>
        </motion.div>
      )}

      {/* ── Premium tier — coming soon ───────────────────────────────────
          Visually distinct gold accent, never toggles selection.
          Clicking opens the PremiumChannelModal contact-sales flow. */}
      <div className="pt-1">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[11px] font-black text-amber-700 tracking-wide">
            قنوات مميزة · Premium channels
          </span>
          <span className="text-[10px] font-bold text-slate-400 me-auto">
            قادمة قريبًا · coming soon
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {PREMIUM_CHANNELS.map((channel) => {
            const Icon = channel.icon;
            return (
              <motion.button
                key={channel.id}
                type="button"
                whileTap={reduced ? undefined : { scale: 0.97 }}
                onClick={() => setPremiumChannel(channel)}
                title="متوفرة في الباقة المميزة قريبًا · Available on Premium soon"
                className="relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 transition-all duration-200 cursor-pointer text-center"
              >
                {/* Crown corner badge */}
                <div className="absolute top-2.5 left-2.5 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-sm">
                  <Crown className="w-3 h-3 text-white" strokeWidth={2.5} />
                </div>

                {/* Icon tile — white background to make the brand colour pop */}
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${channel.iconColor}`} />
                </div>

                <div>
                  <div className="text-sm font-bold text-amber-900">
                    {channel.label}
                  </div>
                  <div className="text-[11px] font-medium mt-0.5 leading-tight text-amber-700/70">
                    {channel.description}
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100/80 border border-amber-200/80 text-[9px] font-black text-amber-700 tracking-wide">
                    <Crown className="w-2.5 h-2.5" />
                    قريبًا · Coming soon
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Premium modal (single instance, channel-driven) */}
      <PremiumChannelModal
        open={premiumChannel !== null}
        channel={premiumChannel}
        locale="ar"
        onClose={() => setPremiumChannel(null)}
      />
    </div>
  );
};
