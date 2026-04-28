import React from 'react';
import { Home, BookOpen, Trophy, User, Search, Bell } from 'lucide-react';

interface MockAppBackdropProps {
  /** Faded so a popup/banner reads as the focus. */
  faded?: boolean;
  /** Show top bar with bell + badge. */
  showTopBar?: boolean;
  /** Show bell with badge count. */
  bellBadge?: number;
  /** Compact = no bottom nav, shorter content. */
  compact?: boolean;
}

/**
 * A faked String Quests app screen, used as the visual context behind
 * popup / banner / bell previews so the admin sees what the student sees.
 */
export const MockAppBackdrop: React.FC<MockAppBackdropProps> = ({
  faded = false,
  showTopBar = true,
  bellBadge,
  compact = false,
}) => {
  return (
    <div
      className={`relative w-full h-full bg-gradient-to-b from-sky-50 via-white to-white ${
        faded ? 'opacity-60' : ''
      }`}
      dir="rtl"
    >
      {/* Top bar */}
      {showTopBar && (
        <div className="px-4 py-3 flex items-center justify-between bg-white/80 backdrop-blur border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-black shadow-sm">
              S
            </div>
            <span className="text-sm font-black text-slate-800">String</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg hover:bg-slate-100">
              <Search className="w-4 h-4 text-slate-500" />
            </button>
            <button className="relative p-1.5 rounded-lg hover:bg-slate-100">
              <Bell className="w-4 h-4 text-slate-600" />
              {bellBadge !== undefined && bellBadge > 0 && (
                <span className="absolute -top-0.5 -left-0.5 min-w-[16px] h-[16px] flex items-center justify-center px-1 rounded-full bg-red-500 text-white text-[9px] font-black shadow-sm">
                  {bellBadge}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Hero card */}
      <div className="p-3 space-y-3">
        <div className="rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-white/80">رحلتك اليومية</p>
              <p className="text-base font-black text-white mt-0.5">الرياضيات</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-white rounded-full" />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] font-bold text-white/90">٦٥٪ مكتمل</span>
            <span className="text-[10px] font-bold text-white">+١٢٠ نقطة</span>
          </div>
        </div>

        {/* Lesson rows */}
        {!compact && (
          <>
            <div className="rounded-2xl bg-white border border-slate-100 p-3 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-800 truncate">قواعد الجمع والطرح</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">٣ نجوم · مكتمل</p>
              </div>
              <div className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                ١٠٠٪
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-100 p-3 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-800 truncate">قراءة النصوص الأدبية</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">قيد التقدم</p>
              </div>
              <div className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                ٤٢٪
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom nav */}
      {!compact && (
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-100 px-2 py-2 flex items-center justify-around">
          {[
            { icon: Home, active: true },
            { icon: BookOpen, active: false },
            { icon: Trophy, active: false },
            { icon: User, active: false },
          ].map(({ icon: Icon, active }, i) => (
            <button
              key={i}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl ${
                active ? 'text-sky-500' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className={`w-1 h-1 rounded-full ${active ? 'bg-sky-500' : 'bg-transparent'}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
