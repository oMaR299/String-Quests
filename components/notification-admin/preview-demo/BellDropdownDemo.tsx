import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ChevronLeft } from 'lucide-react';

// --- Sample notifications ---

interface DemoNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  unread: boolean;
}

const DEFAULT_SAMPLES: DemoNotification[] = [
  {
    id: 'demo-2',
    title: 'تذكير: تسليم مشروع العلوم',
    message: 'آخر موعد لتسليم مشروع العلوم هو يوم الأحد',
    timestamp: 'منذ ٣ ساعات',
    unread: true,
  },
  {
    id: 'demo-3',
    title: 'تحديث نظام String',
    message: 'تم إطلاق تحديث جديد لمنصة String',
    timestamp: 'منذ يوم',
    unread: false,
  },
];

// --- Component ---

interface BellDropdownDemoProps {
  title?: string;
  shortMessage?: string;
}

export const BellDropdownDemo: React.FC<BellDropdownDemoProps> = ({
  title,
  shortMessage,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  // Build notification list: user's notification first, then samples
  const notifications: DemoNotification[] = [
    {
      id: 'demo-user',
      title: title || 'إشعار جديد',
      message: shortMessage || 'محتوى الإشعار...',
      timestamp: 'الآن',
      unread: true,
    },
    ...DEFAULT_SAMPLES,
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="relative w-full max-w-sm mx-auto" dir="rtl">
      {/* Mock TopBar */}
      <div className="bg-white rounded-t-2xl border border-b-0 border-slate-200 px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-black text-slate-800">String</span>

        {/* Bell button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          {/* Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full bg-red-500 text-white text-[10px] font-black">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-b-2xl border border-slate-200 shadow-xl overflow-hidden origin-top"
          >
            {/* Dropdown header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-800">الإشعارات</h4>
              <span className="text-xs font-bold text-sky-500">{unreadCount} جديد</span>
            </div>

            {/* Notification items */}
            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
              {notifications.map((notif, index) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors ${
                    notif.unread
                      ? 'bg-sky-50/50 hover:bg-sky-50'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Unread dot */}
                  <div className="pt-1.5 shrink-0">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        notif.unread ? 'bg-sky-500' : 'bg-transparent'
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-tight truncate ${
                      notif.unread ? 'font-black text-slate-800' : 'font-bold text-slate-600'
                    }`}>
                      {notif.title}
                    </p>
                    <p className="text-xs font-medium text-slate-400 mt-0.5 truncate">
                      {notif.message}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">
                      {notif.timestamp}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer link */}
            <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
              <button className="w-full flex items-center justify-center gap-1 text-xs font-bold text-sky-500 hover:text-sky-600 transition-colors">
                <span>عرض الكل</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
