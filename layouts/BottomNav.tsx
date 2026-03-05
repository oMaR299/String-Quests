import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Trophy,
  BrainCircuit,
  User,
  Settings,
} from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

interface BottomNavItem {
  labelKey: string;
  icon: React.ElementType;
  route: string;
}

const NAV_ITEMS: BottomNavItem[] = [
  { labelKey: 'nav.home', icon: Home, route: '/home' },
  { labelKey: 'nav.learn', icon: BookOpen, route: '/learn' },
  { labelKey: 'nav.leaderboard', icon: Trophy, route: '/leaderboard' },
  { labelKey: 'nav.skillmap', icon: BrainCircuit, route: '/skill-map' },
  { labelKey: 'nav.profile', icon: User, route: '/profile' },
  { labelKey: 'nav.settings', icon: Settings, route: '/settings' },
];

export const BottomNav: React.FC = () => {
  const { t } = useI18n();
  const location = useLocation();

  const isActive = (route: string) => {
    if (route === '/home') return location.pathname === '/home' || location.pathname === '/';
    return location.pathname.startsWith(route);
  };

  return (
    <nav
      className="
        md:hidden fixed bottom-0 left-0 right-0 z-50
        bg-white border-t border-slate-200
        shadow-[0_-4px_20px_rgba(0,0,0,0.05)]
      "
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="h-16 flex items-center justify-around px-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.route);

          return (
            <Link
              key={item.route}
              to={item.route}
              className={`
                flex flex-col items-center justify-center
                min-w-[44px] min-h-[44px] px-1 py-1
                transition-colors duration-150
                ${active ? 'text-[#1CB0F6]' : 'text-slate-400'}
              `}
            >
              <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
              <span
                className={`
                  text-[10px] mt-0.5 font-bold leading-none
                  ${active ? 'text-[#1CB0F6]' : 'text-slate-400'}
                `}
              >
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
