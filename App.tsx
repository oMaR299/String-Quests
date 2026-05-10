import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { QuizSessionProvider } from './contexts/QuizSessionContext';
import { I18nProvider } from './contexts/I18nContext';
import { SkillModelProvider } from './contexts/SkillModelContext';
import { AppShell } from './layouts/AppShell';

// Pages (lazy loaded for code splitting)
const HomePage = lazy(() => import('./pages/HomePage'));
const LearnPage = lazy(() => import('./pages/LearnPage'));
const TopicDetailsPage = lazy(() => import('./pages/TopicDetailsPage'));
const QuizSessionPage = lazy(() => import('./pages/QuizSessionPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const SkillMapPage = lazy(() => import('./pages/SkillMapPage'));
const TextbookPage = lazy(() => import('./pages/TextbookPage'));
const ParentReportPage = lazy(() => import('./pages/ParentReportPage'));
const StardustShopPage = lazy(() => import('./pages/StardustShopPage'));

// Curriculum admin (lazy, full-screen)
const CurriculumAdminPage = lazy(() => import('./components/curriculum-admin/CurriculumAdminPage').then(m => ({ default: m.CurriculumAdminPage })));

// Parent onboarding (lazy, full-screen mobile-first flow)
const ParentOnboardingLayout = lazy(() =>
  import('./components/parent-onboarding/ParentOnboardingLayout').then(m => ({ default: m.ParentOnboardingLayout }))
);

// Parent app (lazy, post-onboarding home shell with bottom tab bar)
const ParentHomeLayout = lazy(() =>
  import('./components/parent-app/ParentHomeLayout').then(m => ({ default: m.ParentHomeLayout }))
);
const HomeTab = lazy(() =>
  import('./components/parent-app/screens/HomeTab').then(m => ({ default: m.HomeTab }))
);
const AwareAiPlaceholder = lazy(() =>
  import('./components/parent-app/screens/AwareAiPlaceholder').then(m => ({ default: m.AwareAiPlaceholder }))
);
const ParentSkillMapPlaceholder = lazy(() =>
  import('./components/parent-app/screens/SkillMapPlaceholder').then(m => ({ default: m.SkillMapPlaceholder }))
);
const ParentProfilePlaceholder = lazy(() =>
  import('./components/parent-app/screens/ProfilePlaceholder').then(m => ({ default: m.ProfilePlaceholder }))
);
const ParentMessagesPlaceholder = lazy(() =>
  import('./components/parent-app/screens/MessagesPlaceholder').then(m => ({ default: m.MessagesPlaceholder }))
);

// Design System showcase (lazy)
const DesignSystemLayout = lazy(() => import('./components/design-system/showcase/DesignSystemLayout').then(m => ({ default: m.DesignSystemLayout })));

// Role-based layouts (keep as-is)
import { TeacherLayout } from './components/teacher/TeacherLayout';
import { EduMatrixAllocation } from './components/admin/EduMatrixAllocation';
import { PrincipalLayout } from './components/principal/PrincipalLayout';
import { NotificationLayout } from './components/notification-admin/NotificationLayout';
import { AdminHubLayout } from './components/admin-hub/AdminHubLayout';
import { LeaderboardShowcase } from './components/leaderboard-widgets/LeaderboardShowcase';
import { TopicManagerLayout } from './components/topic-manager/TopicManagerLayout';
import { ScheduleLayout } from './components/schedule/ScheduleLayout';
import { SkillMapPremiumPage } from './components/skill-map-premium/SkillMapPremiumPage';
import { EdisonProposal } from './components/proposal/EdisonProposal';
import { TeacherProfileRoute } from './components/teacher-profile/TeacherProfileRoute';

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-10 h-10 border-4 border-slate-200 border-t-[#1CB0F6] rounded-full animate-spin" />
  </div>
);

const App: React.FC = () => {
  return (
    <UserProvider>
      <I18nProvider>
        <SkillModelProvider>
        <QuizSessionProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Shell routes (with sidebar navigation) */}
              <Route element={<AppShell />}>
                <Route path="/home" element={<HomePage />} />
                <Route path="/learn" element={<LearnPage />} />
                <Route path="/learn/:subjectSlug" element={<TopicDetailsPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/skill-map" element={<SkillMapPage />} />
                <Route path="/textbook" element={<TextbookPage />} />
                <Route path="/shop" element={<StardustShopPage />} />
              </Route>

              {/* Immersive routes (no sidebar, full-screen) */}
              <Route path="/learn/:subjectSlug/:lessonSlug/play" element={<QuizSessionPage />} />

              {/* Role-based routes (own layouts, untouched) */}
              <Route path="/teacher/*" element={<TeacherLayout onLogout={() => window.location.href = '/home'} />} />
              <Route path="/admin/hub/*" element={<AdminHubLayout onExit={() => window.location.href = '/home'} />} />
              <Route path="/admin/notifications/*" element={<NotificationLayout onExit={() => window.location.href = '/home'} />} />
              <Route path="/admin/*" element={<EduMatrixAllocation onExit={() => window.location.href = '/home'} />} />
              <Route path="/curriculum-admin" element={<CurriculumAdminPage />} />
              <Route path="/principal/*" element={<PrincipalLayout onLogout={() => window.location.href = '/home'} />} />

              {/* Leaderboard showcase */}
              <Route path="/leaderboard-widgets" element={<LeaderboardShowcase onExit={() => window.location.href = '/home'} />} />

              {/* Topic Manager */}
              <Route path="/topic-manager/*" element={<TopicManagerLayout onExit={() => window.location.href = '/home'} />} />

              {/* Schedule */}
              <Route path="/schedule/*" element={<ScheduleLayout onExit={() => window.location.href = '/home'} />} />

              {/* Design System showcase */}
              <Route path="/design-system/*" element={<DesignSystemLayout onExit={() => window.location.href = '/home'} />} />

              {/* Premium Skill Map */}
              <Route path="/skill-map-premium" element={<SkillMapPremiumPage onExit={() => window.location.href = '/home'} />} />

              {/* Teacher Profile */}
              <Route path="/teacher-profile" element={<TeacherProfileRoute />} />

              {/* Proposal */}
              <Route path="/proposal/edison" element={<EdisonProposal />} />

              {/* Stakeholder report routes */}
              <Route path="/parent-report" element={<ParentReportPage />} />

              {/* Parent onboarding (mobile-first phone shell). The onboarding
                  flow now lives at /parent/onboarding/* — the new Parent App
                  home + tab shell mounts at /parent. */}
              <Route path="/parent/onboarding/*" element={<ParentOnboardingLayout />} />

              {/* Parent app — post-onboarding home + bottom-tab shell. The
                  layout renders the shared PhoneShell + sticky header + tab
                  bar; the matched child route renders inside <Outlet />. */}
              <Route path="/parent" element={<ParentHomeLayout />}>
                <Route index element={<Navigate to="/parent/home" replace />} />
                <Route path="home" element={<HomeTab />} />
                <Route path="aware-ai" element={<AwareAiPlaceholder />} />
                <Route path="skill-map" element={<ParentSkillMapPlaceholder />} />
                <Route path="profile" element={<ParentProfilePlaceholder />} />
                <Route path="messages" element={<ParentMessagesPlaceholder />} />
              </Route>

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </Suspense>
        </QuizSessionProvider>
        </SkillModelProvider>
      </I18nProvider>
    </UserProvider>
  );
};

export default App;
