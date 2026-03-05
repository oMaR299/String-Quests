import React from 'react';
import {
  LayoutDashboard,
  Swords,
  GraduationCap,
  CalendarDays,
  MessageSquare,
} from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

interface PlatformNavItem {
  key: string;
  labelKey: string;
  icon: React.ElementType;
  href: string;
  active: boolean;
}

const PLATFORM_ITEMS: PlatformNavItem[] = [
  { key: 'dashboard', labelKey: 'platform.dashboard', icon: LayoutDashboard, href: '#', active: false },
  { key: 'quests', labelKey: 'platform.quests', icon: Swords, href: '#', active: true },
  { key: 'grades', labelKey: 'platform.grades', icon: GraduationCap, href: '#', active: false },
  { key: 'calendar', labelKey: 'platform.calendar', icon: CalendarDays, href: '#', active: false },
  { key: 'messages', labelKey: 'platform.messages', icon: MessageSquare, href: '#', active: false },
];

export const PlatformNavbar: React.FC = () => {
  const { t } = useI18n();

  return (
    <nav className="bg-slate-900 text-white h-10 md:h-12 shrink-0 z-50 relative">
      <div className="h-full overflow-x-auto no-scrollbar">
        <div className="h-full flex items-center gap-1 px-3 md:px-6 min-w-max">
          {PLATFORM_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.key}
                href={item.href}
                className={`
                  flex items-center gap-2 px-3 md:px-4 h-full text-xs md:text-sm font-bold
                  transition-colors duration-150 relative whitespace-nowrap
                  ${item.active
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{t(item.labelKey)}</span>
                {item.active && (
                  <span className="absolute bottom-0 inset-x-0 h-[2px] bg-duo-blue" />
                )}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
