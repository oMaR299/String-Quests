/**
 * WhatsAppPreview — locked-state mock of how a notification would
 * render inside a WhatsApp chat thread on a phone.
 *
 * Realism touches:
 *   - WhatsApp-green app bar with school avatar + school name
 *   - Beige-paper chat backdrop (mimics WhatsApp's signature wallpaper)
 *   - Left-aligned message bubble in LTR / right-aligned in RTL
 *     (WhatsApp itself flips bubble alignment based on app locale)
 *   - Title (bold) + shortMessage in the bubble
 *   - Optional image attachment thumbnail
 *   - Optional CTA rendered as a WhatsApp interactive button row
 *     (the divider + tappable label is the real-product convention)
 *   - Timestamp + double-check ✓✓ delivered/read indicator
 *
 * Rendered inside DeviceFrame at mobile size — looks like a real
 * phone screenshot. Sells the feature without being interactive.
 */
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Phone, Video, MoreVertical, ArrowLeft, Check } from 'lucide-react';

interface WhatsAppPreviewProps {
  title: string;
  shortMessage: string;
  imageUrl: string;
  ctaButton: { label: string; url: string } | null;
  isEmpty?: boolean;
}

export const WhatsAppPreview: React.FC<WhatsAppPreviewProps> = ({
  title,
  shortMessage,
  imageUrl,
  ctaButton,
  isEmpty,
}) => {
  const reduced = useReducedMotion();
  const displayTitle = isEmpty ? 'عنوان الإشعار سيظهر هنا' : title;
  const displayShort = isEmpty
    ? 'رسالة قصيرة تشرح فحوى الإشعار للمستلم'
    : shortMessage || 'رسالة قصيرة...';

  return (
    <div className="w-full bg-white">
      {/* WhatsApp top app bar */}
      <div className="bg-emerald-700 text-white px-3 py-2.5 flex items-center gap-2.5">
        <ArrowLeft className="w-4 h-4 shrink-0" />
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-black text-[11px] shrink-0 border-2 border-emerald-400">
          م.خ
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-bold truncate">مدارس الخضر الحديثة</div>
          <div className="text-[10px] font-medium text-emerald-100/90">
            متصل الآن · online
          </div>
        </div>
        <Video className="w-4 h-4 opacity-90" />
        <Phone className="w-4 h-4 opacity-90" />
        <MoreVertical className="w-4 h-4 opacity-90" />
      </div>

      {/* Chat backdrop — WhatsApp's beige paper feel */}
      <div
        className="px-3 py-4 min-h-[280px] relative"
        style={{
          backgroundColor: '#ECE5DD',
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(0,0,0,0.025) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(0,0,0,0.025) 0%, transparent 50%)',
        }}
      >
        {/* Day separator */}
        <div className="flex items-center justify-center mb-3">
          <span className="px-2.5 py-0.5 rounded-md bg-white/85 text-[10px] font-bold text-slate-500 shadow-sm">
            اليوم · TODAY
          </span>
        </div>

        {/* Message bubble — left-aligned (incoming) */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
          className="flex justify-start"
        >
          <div className="max-w-[85%] bg-white rounded-lg rounded-ts-sm shadow-sm overflow-hidden">
            {/* Optional image attachment */}
            {imageUrl ? (
              <div className="p-1">
                <div className="rounded-md overflow-hidden bg-slate-100">
                  <img
                    src={imageUrl}
                    alt=""
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            ) : null}

            {/* Body */}
            <div className="px-3 py-2">
              <div
                className={`text-[12px] font-black leading-snug mb-0.5 ${
                  isEmpty ? 'text-slate-300' : 'text-slate-800'
                }`}
              >
                {displayTitle}
              </div>
              <div
                className={`text-[12px] font-medium leading-snug ${
                  isEmpty ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                {displayShort}
              </div>

              {/* Timestamp + delivery indicator */}
              <div className="flex items-center justify-end gap-1 mt-1.5 -mb-0.5">
                <span className="text-[9px] font-medium text-slate-400">
                  ١٠:٤٢ ص
                </span>
                <span className="flex items-center -space-x-1.5 text-sky-500">
                  <Check className="w-3 h-3" strokeWidth={3} />
                  <Check className="w-3 h-3" strokeWidth={3} />
                </span>
              </div>
            </div>

            {/* WhatsApp interactive CTA button (rendered as bordered-top row) */}
            {ctaButton?.label ? (
              <div className="border-t border-slate-100">
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 text-[12px] font-black text-emerald-600 hover:bg-emerald-50/40 transition-colors flex items-center justify-center gap-1.5 cursor-default"
                >
                  <span>{ctaButton.label}</span>
                </button>
              </div>
            ) : null}
          </div>
        </motion.div>

        {/* Faux input bar at bottom for realism */}
        <div className="absolute bottom-2 inset-x-2 flex items-center gap-1.5">
          <div className="flex-1 bg-white rounded-full px-3 py-1.5 shadow-sm text-[10px] font-medium text-slate-400">
            اكتب رسالة...
          </div>
          <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px]">
            ↑
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppPreview;
