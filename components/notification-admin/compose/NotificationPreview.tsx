import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Bell, MessageSquare, Flag,
  X, Clock, ExternalLink,
  Monitor, Tablet, Smartphone,
} from 'lucide-react';
import type { NotificationChannel, NotificationPriority } from '../../../types/notification';
import { EmailPreviewRenderer } from './EmailPreviewRenderer';

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

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
}

const CHANNEL_TABS: Record<NotificationChannel, { label: string; icon: React.FC<{ className?: string }> }> = {
  email: { label: 'بريد إلكتروني', icon: Mail },
  bell: { label: 'إشعار الجرس', icon: Bell },
  popup: { label: 'نافذة منبثقة', icon: MessageSquare },
  banner: { label: 'شريط إعلاني', icon: Flag },
};

export const NotificationPreview: React.FC<NotificationPreviewProps> = ({
  title,
  shortMessage,
  body,
  imageUrl,
  ctaButton,
  channels,
  priority,
  bannerGradient,
}) => {
  const [activeChannel, setActiveChannel] = useState<NotificationChannel | null>(null);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');

  // Auto-select first channel when channels change
  useEffect(() => {
    if (channels.length > 0) {
      if (!activeChannel || !channels.includes(activeChannel)) {
        setActiveChannel(channels[0]);
      }
    } else {
      setActiveChannel(null);
    }
  }, [channels, activeChannel]);

  if (channels.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-sm font-bold text-slate-400">اختر قناة إرسال لمعاينة الإشعار</p>
      </div>
    );
  }

  const displayTitle = title || 'عنوان الإشعار';
  const displayShort = shortMessage || 'رسالة مختصرة...';
  const displayBody = body || 'محتوى الرسالة سيظهر هنا...';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      {/* Device Selector Bar */}
      <div className="flex items-center justify-center gap-1.5 px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
        {DEVICE_OPTIONS.map(({ mode, label, icon: Icon }) => {
          const isActive = deviceMode === mode;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => setDeviceMode(mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isActive
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

      {/* Tab Bar */}
      <div className="flex border-b border-slate-100 overflow-x-auto">
        {channels.map((channel) => {
          const config = CHANNEL_TABS[channel];
          const Icon = config.icon;
          const isActive = activeChannel === channel;

          return (
            <button
              key={channel}
              type="button"
              onClick={() => setActiveChannel(channel)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 shrink-0
                ${
                  isActive
                    ? 'border-sky-500 text-sky-600 bg-sky-50/50'
                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Preview Content with Device Frame */}
      <div className="p-4 bg-slate-50/30">
        <AnimatePresence mode="wait">
          <motion.div
            key={deviceMode}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex justify-center"
          >
            {deviceMode === 'desktop' && (
              <div className="w-full">
                <PreviewContent
                  activeChannel={activeChannel}
                  displayTitle={displayTitle}
                  displayShort={displayShort}
                  displayBody={displayBody}
                  imageUrl={imageUrl}
                  ctaButton={ctaButton}
                  priority={priority}
                  bannerGradient={bannerGradient}
                />
              </div>
            )}

            {deviceMode === 'tablet' && (
              <div className="w-full max-w-[768px] mx-auto border-2 border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <div className="w-full h-1.5 bg-slate-100 flex justify-center items-center">
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                </div>
                <PreviewContent
                  activeChannel={activeChannel}
                  displayTitle={displayTitle}
                  displayShort={displayShort}
                  displayBody={displayBody}
                  imageUrl={imageUrl}
                  ctaButton={ctaButton}
                  priority={priority}
                  bannerGradient={bannerGradient}
                />
              </div>
            )}

            {deviceMode === 'mobile' && (
              <div className="w-full max-w-[375px] mx-auto border-4 border-slate-800 rounded-[2rem] overflow-hidden bg-white shadow-lg relative">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-800 rounded-b-2xl z-10 flex items-center justify-center">
                  <div className="w-12 h-1.5 bg-slate-600 rounded-full" />
                </div>
                {/* Top spacer for notch */}
                <div className="h-5 bg-white" />
                <PreviewContent
                  activeChannel={activeChannel}
                  displayTitle={displayTitle}
                  displayShort={displayShort}
                  displayBody={displayBody}
                  imageUrl={imageUrl}
                  ctaButton={ctaButton}
                  priority={priority}
                  bannerGradient={bannerGradient}
                />
                {/* Bottom home indicator */}
                <div className="h-5 bg-white flex items-center justify-center">
                  <div className="w-24 h-1 bg-slate-300 rounded-full" />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ===== Preview Content (extracted to share across device frames) ===== */

function PreviewContent({
  activeChannel,
  displayTitle,
  displayShort,
  displayBody,
  imageUrl,
  ctaButton,
  priority,
  bannerGradient,
}: {
  activeChannel: NotificationChannel | null;
  displayTitle: string;
  displayShort: string;
  displayBody: string;
  imageUrl: string;
  ctaButton: { label: string; url: string } | null;
  priority: NotificationPriority;
  bannerGradient: string;
}) {
  return (
    <div className="p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeChannel}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {activeChannel === 'email' && (
            <EmailPreview
              title={displayTitle}
              body={displayBody}
              ctaButton={ctaButton}
            />
          )}
          {activeChannel === 'bell' && (
            <BellPreview
              title={displayTitle}
              shortMessage={displayShort}
              priority={priority}
            />
          )}
          {activeChannel === 'popup' && (
            <PopupPreview
              title={displayTitle}
              body={displayBody}
              imageUrl={imageUrl}
              ctaButton={ctaButton}
            />
          )}
          {activeChannel === 'banner' && (
            <BannerPreview
              shortMessage={displayShort}
              gradient={bannerGradient}
              ctaButton={ctaButton}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ===== Individual Preview Renderers ===== */

function EmailPreview({
  title,
  body,
  ctaButton,
}: {
  title: string;
  body: string;
  ctaButton: { label: string; url: string } | null;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-4 h-4 text-sky-500" />
        <span className="text-xs font-bold text-slate-500">معاينة البريد الإلكتروني</span>
      </div>
      <EmailPreviewRenderer
        title={title}
        body={body}
        ctaButton={ctaButton || undefined}
      />
    </div>
  );
}

function BellPreview({
  title,
  shortMessage,
  priority,
}: {
  title: string;
  shortMessage: string;
  priority: NotificationPriority;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-bold text-slate-500">معاينة إشعار الجرس</span>
      </div>

      {/* Mockup of bell dropdown */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 max-w-sm">
        <div className="flex items-start gap-3">
          {/* Unread dot */}
          <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${priority === 'urgent' ? 'bg-red-500' : 'bg-sky-500'}`} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${priority === 'urgent' ? 'bg-red-100' : 'bg-sky-100'}`}>
                <Bell className={`w-4 h-4 ${priority === 'urgent' ? 'text-red-500' : 'text-sky-500'}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{title}</p>
                <p className="text-xs font-medium text-slate-500 line-clamp-2 mt-0.5">{shortMessage}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-2">
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400">الآن</span>
              {priority === 'urgent' && (
                <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded mr-1">عاجل</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PopupPreview({
  title,
  body,
  imageUrl,
  ctaButton,
}: {
  title: string;
  body: string;
  imageUrl: string;
  ctaButton: { label: string; url: string } | null;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-4 h-4 text-purple-500" />
        <span className="text-xs font-bold text-slate-500">معاينة النافذة المنبثقة</span>
      </div>

      {/* Mockup popup overlay */}
      <div className="relative bg-slate-900/20 rounded-xl p-6 min-h-[280px] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden">
          {/* Close button */}
          <div className="flex justify-end p-3 pb-0">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              <X className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Image */}
          {imageUrl && (
            <div className="px-4">
              <img
                src={imageUrl}
                alt=""
                className="w-full h-28 object-cover rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Content */}
          <div className="p-4 text-center">
            <h4 className="text-sm font-bold text-slate-800 mb-2">{title}</h4>
            <p className="text-xs font-medium text-slate-500 leading-relaxed line-clamp-4">
              {body}
            </p>
          </div>

          {/* Buttons */}
          <div className="px-4 pb-4 space-y-2">
            {ctaButton?.label && (
              <button
                type="button"
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5"
              >
                {ctaButton.label}
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              className="w-full bg-slate-100 text-slate-600 text-xs font-bold py-2.5 rounded-xl"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BannerPreview({
  shortMessage,
  gradient,
  ctaButton,
}: {
  shortMessage: string;
  gradient: string;
  ctaButton: { label: string; url: string } | null;
}) {
  const gradientClass = gradient || 'from-sky-400 to-blue-500';

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Flag className="w-4 h-4 text-emerald-500" />
        <span className="text-xs font-bold text-slate-500">معاينة الشريط الإعلاني</span>
      </div>

      {/* Mockup page with banner */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
        {/* Banner */}
        <div className={`bg-gradient-to-r ${gradientClass} px-4 py-3 flex items-center justify-between gap-3`}>
          <p className="text-white text-xs font-bold flex-1 truncate">{shortMessage}</p>
          <div className="flex items-center gap-2 shrink-0">
            {ctaButton?.label && (
              <button
                type="button"
                className="bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold px-3 py-1 rounded-lg transition-colors"
              >
                {ctaButton.label}
              </button>
            )}
            <button
              type="button"
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Fake page content */}
        <div className="p-4 space-y-2">
          <div className="h-4 bg-slate-200 rounded-full w-3/4" />
          <div className="h-4 bg-slate-200 rounded-full w-1/2" />
          <div className="h-20 bg-slate-200 rounded-xl w-full mt-3" />
        </div>
      </div>
    </div>
  );
}
