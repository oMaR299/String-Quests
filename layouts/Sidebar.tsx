import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Trophy,
  BrainCircuit,
  User,
  Settings,
  GraduationCap,
  Settings2,
  Building2,
  FileText,
  Database,
  Megaphone,
} from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

interface NavItem {
  labelKey: string;
  icon: React.ElementType;
  route: string;
}

const NAV_ITEMS: NavItem[] = [
  { labelKey: 'nav.home', icon: Home, route: '/home' },
  { labelKey: 'nav.learn', icon: BookOpen, route: '/learn' },
  { labelKey: 'nav.leaderboard', icon: Trophy, route: '/leaderboard' },
  { labelKey: 'nav.skillmap', icon: BrainCircuit, route: '/skill-map' },
  { labelKey: 'nav.textbook', icon: FileText, route: '/textbook' },
  { labelKey: 'nav.profile', icon: User, route: '/profile' },
  { labelKey: 'nav.settings', icon: Settings, route: '/settings' },
];

interface DevToggle {
  label: string;
  icon: React.ElementType;
  route: string;
  color: string;
}

const DEV_TOGGLES: DevToggle[] = [
  { label: 'Teacher', icon: GraduationCap, route: '/teacher', color: 'text-slate-500' },
  { label: 'Admin', icon: Settings2, route: '/admin', color: 'text-indigo-400' },
  { label: 'Principal', icon: Building2, route: '/principal', color: 'text-emerald-400' },
  { label: 'Parent Report', icon: FileText, route: '/parent-report', color: 'text-violet-400' },
  { label: 'Curriculum', icon: Database, route: '/curriculum-admin', color: 'text-cyan-400' },
  { label: 'Notifications', icon: Megaphone, route: '/admin/notifications', color: 'text-sky-400' },
  { label: 'Admin Hub', icon: Building2, route: '/admin/hub', color: 'text-rose-400' },
  { label: 'Leaderboards', icon: Trophy, route: '/leaderboard-widgets', color: 'text-amber-400' },
];

export const Sidebar: React.FC = () => {
  const { t, dir } = useI18n();
  const location = useLocation();

  const isActive = (route: string) => {
    if (route === '/home') return location.pathname === '/home' || location.pathname === '/';
    return location.pathname.startsWith(route);
  };

  return (
    <aside
      className={`
        hidden md:flex flex-col shrink-0 bg-white
        w-20 lg:w-72 transition-all duration-200
        ${dir === 'rtl' ? 'border-l border-slate-200' : 'border-r border-slate-200'}
      `}
    >
      {/* Main Navigation */}
      <nav className="flex-1 py-4 px-2 lg:px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.route);

          return (
            <Link
              key={item.route}
              to={item.route}
              className={`
                group relative flex items-center gap-3
                px-3 lg:px-4 py-3 rounded-xl
                font-bold text-sm transition-all duration-150
                ${active
                  ? 'bg-[#E5F4FF] text-[#1CB0F6]'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }
              `}
            >
              {/* Active indicator bar */}
              {active && (
                <span
                  className={`
                    absolute top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-full bg-[#1CB0F6]
                    ${dir === 'rtl' ? 'right-0' : 'left-0'}
                  `}
                />
              )}

              <Icon className="w-6 h-6 shrink-0" />

              {/* Label: visible on lg, tooltip on md */}
              <span className="hidden lg:block">{t(item.labelKey)}</span>

              {/* Tooltip for collapsed state (md only, not lg) */}
              <span
                className={`
                  hidden md:block lg:hidden
                  absolute top-1/2 -translate-y-1/2
                  ${dir === 'rtl' ? 'right-full mr-3' : 'left-full ml-3'}
                  bg-slate-800 text-white text-xs font-bold
                  px-3 py-1.5 rounded-lg whitespace-nowrap
                  opacity-0 pointer-events-none
                  group-hover:opacity-100 group-hover:pointer-events-auto
                  transition-opacity duration-150 z-50
                  shadow-lg
                `}
              >
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Dev Mode Toggles */}
      <div className="px-2 lg:px-3 pb-4 space-y-1 opacity-20 hover:opacity-100 transition-opacity duration-300">
        <div className="hidden lg:block px-4 mb-1">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Dev</span>
        </div>
        {DEV_TOGGLES.map((toggle) => {
          const Icon = toggle.icon;
          return (
            <Link
              key={toggle.route}
              to={toggle.route}
              className={`
                group relative flex items-center gap-2
                px-3 lg:px-4 py-2 rounded-lg
                text-xs font-bold transition-colors duration-150
                ${toggle.color} hover:bg-slate-50
              `}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden lg:block">{toggle.label}</span>

              {/* Tooltip for collapsed state */}
              <span
                className={`
                  hidden md:block lg:hidden
                  absolute top-1/2 -translate-y-1/2
                  ${dir === 'rtl' ? 'right-full mr-3' : 'left-full ml-3'}
                  bg-slate-800 text-white text-[10px] font-bold
                  px-2 py-1 rounded-md whitespace-nowrap
                  opacity-0 pointer-events-none
                  group-hover:opacity-100 group-hover:pointer-events-auto
                  transition-opacity duration-150 z-50
                `}
              >
                {toggle.label}
              </span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};
