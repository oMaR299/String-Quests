/**
 * SmsPreview — locked-state mock of how a notification renders inside
 * a native iMessage / Messages app SMS thread.
 *
 * SMS realism touches:
 *   - Sender shown as a 5-digit short code "29345" (the format real
 *     transactional SMS senders use), with avatar pill
 *   - Plain gray bubble (iMessage non-iMessage gray, not blue) — we
 *     are an SMS, not iMessage, so left/incoming gray is correct
 *   - No image attachment (SMS limitation — sells the upgrade story)
 *   - No rich CTA button — link is rendered inline (or omitted if not set)
 *   - Body shows just title + shortMessage
 *   - Timestamp & "Delivered" sublabel for that real iMessage feel
 */
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, Video, Info } from 'lucide-react';

interface SmsPreviewProps {
  title: string;
  shortMessage: string;
  isEmpty?: boolean;
}

const SHORT_CODE = '29345';

export const SmsPreview: React.FC<SmsPreviewProps> = ({
  title,
  shortMessage,
  isEmpty,
}) => {
  const reduced = useReducedMotion();
  const displayTitle = isEmpty ? 'عنوان الإشعار' : title;
  const displayShort = isEmpty
    ? 'الرسالة القصيرة ستظهر هنا للمستلم'
    : shortMessage || 'رسالة قصيرة...';

  // SMS body is just title + short message concatenated, with a clear separator.
  const smsBody = `${displayTitle}\n\n${displayShort}`;

  return (
    <div className="w-full bg-white">
      {/* iMessage-style header */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center gap-2">
        <ChevronLeft className="w-4 h-4 text-sky-500 shrink-0" />
        <div className="flex-1 flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white font-black text-[11px] mb-0.5">
            {SHORT_CODE.slice(0, 2)}
          </div>
          <div className="text-[10px] font-bold text-slate-700">{SHORT_CODE}</div>
          <div className="text-[8px] font-medium text-slate-400 -mt-0.5">
            رمز قصير · short code
          </div>
        </div>
        <Info className="w-4 h-4 text-sky-500 shrink-0" />
        <Video className="w-4 h-4 text-slate-300 shrink-0" />
      </div>

      {/* SMS thread */}
      <div className="px-3 py-4 min-h-[280px] bg-white relative">
        {/* Date separator */}
        <div className="flex items-center justify-center mb-3">
          <span className="text-[9px] font-bold text-slate-400 tracking-wide">
            رسالة نصية · TEXT MESSAGE
            <br />
            <span className="text-slate-300">اليوم ١٠:٤٢ ص · TODAY 10:42 AM</span>
          </span>
        </div>

        {/* Gray bubble (incoming SMS) */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
          className="flex justify-start"
        >
          <div className="max-w-[80%]">
            <div
              className={`bg-slate-200 text-slate-800 rounded-2xl rounded-bs-sm px-3.5 py-2 text-[12px] font-medium leading-snug whitespace-pre-line ${
                isEmpty ? 'opacity-60' : ''
              }`}
            >
              {smsBody}
            </div>
            <div className="text-[9px] font-bold text-slate-400 mt-1 ms-2">
              تم التسليم · Delivered
            </div>
          </div>
        </motion.div>

        {/* Faux input bar */}
        <div className="absolute bottom-2 inset-x-2 flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-[10px]">
            +
          </div>
          <div className="flex-1 bg-white border border-slate-200 rounded-full px-3 py-1 text-[10px] font-medium text-slate-300">
            رسالة نصية SMS
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmsPreview;
