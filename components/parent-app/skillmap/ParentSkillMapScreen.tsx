// ParentSkillMapScreen.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Orchestrator for the parent "النتائج والتقدّم" hub (/parent/skill-map). A
// persistent warm HeroHeader sits above a 3-segment control:
//
//   • المواد (Map)        — overall ring + subject rings (centerpiece) + coaching
//                            + "needs your attention" + strengths
//   • التقدّم (Progress)   — pastel widget grid (streak/points/focus/effectiveness)
//                            + progress curve + study behavior + recent sessions
//   • تعرّف أكثر (Learn more) — opens a full-screen overlay of the deeper, plain-
//                            language insights (how they learn, standing, rhythm…)
//
// Tapping a subject ring opens the full-screen SubjectDetailScreen. Runtime state
// (areas, today's focus, sent/cooldown) lives in useParentSkillMap.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../../../contexts/I18nContext';
import { getParentAppString } from '../parentAppI18n';
import { useParentAppContext } from '../useParentAppContext';
import { useParentSkillMap } from './useParentSkillMap';
import { HeroHeader } from './HeroHeader';
import { MapView } from './MapView';
import { ProgressView } from './ProgressView';
import { LearnMoreView } from './LearnMoreView';
import { SubjectDetailScreen } from './SubjectDetailScreen';
import { getViewBrief } from './data/parentAppAiBriefs';
import { getGrowthSummary } from './data/parentAppGrowthMock';
import type { ParentSkillArea } from './data/parentAppSkillMapMock';

type View = 'map' | 'progress';

/** Map any incoming deep-link `view` (incl. legacy 6-tab values) to the new IA. */
function resolveDeepLink(rv: string): { view?: View; learn?: boolean } {
  if (rv === 'map' || rv === 'snapshot' || rv === 'tasks') return { view: 'map' };
  if (rv === 'progress' || rv === 'growth' || rv === 'daily') return { view: 'progress' };
  if (rv === 'learn' || rv === 'learnMore' || rv === 'standing') return { learn: true };
  return {};
}

export const ParentSkillMapScreen: React.FC = () => {
  const { locale } = useI18n();
  const { activeChild } = useParentAppContext();
  const t = useCallback((key: string) => getParentAppString(locale, key), [locale]);

  const childId = activeChild?.id ?? '';
  const childName = activeChild ? (locale === 'ar' ? activeChild.nameAr : activeChild.nameEn) : '';

  const { areas, today, sentAreaIds, sendPractice } = useParentSkillMap(childId);

  const statusLine = useMemo(
    () => (childId ? getViewBrief(childId, childName, 'snapshot', locale) : ''),
    [childId, childName, locale],
  );
  const summary = useMemo(() => (childId ? getGrowthSummary(childId) : null), [childId]);

  // Deep-link support: other tabs (e.g. the Home logistics strip) navigate here
  // with `state: { view: '…' }`. Legacy 6-tab values are forward-mapped.
  const location = useLocation();
  const navigate = useNavigate();
  const [view, setView] = useState<View>(() => {
    const rv = (location.state as { view?: string } | null)?.view;
    return rv ? (resolveDeepLink(rv).view ?? 'map') : 'map';
  });
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);
  useEffect(() => {
    const rv = (location.state as { view?: string } | null)?.view;
    if (rv) {
      const r = resolveDeepLink(rv);
      if (r.view) setView(r.view);
      if (r.learn) setLearnMoreOpen(true);
      // Consume the deep-link so a later same-route navigation can't reset things.
      navigate('.', { replace: true });
    }
    // location.key changes on every navigation; intentionally the only dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  // Subject detail (full-screen overlay).
  const [openAreaId, setOpenAreaId] = useState<string | null>(null);
  const [openFocus, setOpenFocus] = useState<'overview' | 'exam'>('overview');
  const openArea = useMemo(() => areas.find((a) => a.id === openAreaId) ?? null, [areas, openAreaId]);
  const handleSelectSubject = useCallback((area: ParentSkillArea) => {
    setOpenFocus('overview');
    setOpenAreaId(area.id);
  }, []);
  const handleOpenExam = useCallback((area: ParentSkillArea) => {
    setOpenFocus('exam');
    setOpenAreaId(area.id);
  }, []);

  if (!activeChild || !summary) return null;

  const SEGMENTS: { id: 'map' | 'progress' | 'learn'; label: string }[] = [
    { id: 'map', label: t('parentApp.skillMap.segMap') },
    { id: 'progress', label: t('parentApp.skillMap.segProgressTab') },
    { id: 'learn', label: t('parentApp.skillMap.segLearnMore') },
  ];

  return (
    <>
      <div className="px-5 pt-5 pb-8 flex flex-col gap-5">
        {/* Persistent warm hero (stays across tab switches) */}
        <HeroHeader child={activeChild} childName={childName} statusLine={statusLine} summary={summary} />

        {/* 3-segment control */}
        <div
          className="-mx-5 px-5 overflow-x-auto [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="inline-flex gap-1 rounded-2xl bg-slate-100 p-1">
            {SEGMENTS.map((s) => {
              const selected = s.id === 'learn' ? learnMoreOpen : view === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    if (s.id === 'learn') {
                      setLearnMoreOpen(true);
                    } else {
                      setLearnMoreOpen(false);
                      setView(s.id);
                    }
                  }}
                  className={`whitespace-nowrap rounded-xl px-4 py-2 text-[12.5px] font-extrabold transition-colors ${
                    selected ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {view === 'map' && (
          <MapView
            childId={activeChild.id}
            childName={childName}
            areas={areas}
            focus={today.focus}
            sentAreaIds={sentAreaIds}
            onSendPractice={sendPractice}
            onSelectSubject={handleSelectSubject}
            onOpenExam={handleOpenExam}
          />
        )}
        {view === 'progress' && (
          <ProgressView childId={activeChild.id} onOpenLearnMore={() => setLearnMoreOpen(true)} />
        )}
      </div>

      <SubjectDetailScreen
        open={openArea !== null}
        onClose={() => setOpenAreaId(null)}
        childId={activeChild.id}
        childName={childName}
        area={openArea}
        initialFocus={openFocus}
        sent={openArea ? sentAreaIds.includes(openArea.id) : false}
        onSendPractice={sendPractice}
      />

      <LearnMoreView
        open={learnMoreOpen}
        onClose={() => setLearnMoreOpen(false)}
        childId={activeChild.id}
        childName={childName}
      />
    </>
  );
};

export default ParentSkillMapScreen;
