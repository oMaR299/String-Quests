/**
 * RestoreStreakButton — Phoenix CTA shown inside the StreakWidget when
 * the streak just broke "yesterday" AND the user owns at least one
 * Phoenix (`streak_revive`).
 *
 * Trigger logic (matches plan's edge-case row "Phoenix not applicable"):
 *   - getOwned('streak_revive') >= 1
 *   - AND streak status === 'broken-yesterday', meaning the user was
 *     active up to two days ago but missed yesterday. We derive this
 *     from `lastActiveDate` being exactly the day before yesterday
 *     (i.e. the gap between "today" and `lastActiveDate` is 2 calendar
 *     days). currentStreak being 0 also counts as "broken" — covers the
 *     case where the streak already fell off via the existing reducer.
 *
 * On click → dispatches `RESTORE_STREAK` (Wave A reducer stub) which
 * consumes 1 Phoenix and bridges `lastActiveDate` to yesterday so the
 * next correct answer increments the streak. A success toast confirms.
 *
 * Phoenix is a v2 power-up but per the "All 13 with v2 stubs" decision
 * we still surface the button — the reducer is a stub, no backend.
 *
 * Layout: full-width 3D warning button with Flame icon + subtitle.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { useUser } from '../../contexts/UserContext';
import { usePowerups } from '../../hooks/usePowerups';
import { SqButton } from '../design-system/components/Button';
import { SqToast } from '../design-system/components/Toast';
import { SQ_SPRING, MOTION_FALLBACK } from '../design-system/tokens/motion';

const MS_PER_DAY = 86_400_000;

/**
 * Returns true iff `lastActiveDate` is exactly 2 calendar days behind today
 * (UTC YYYY-MM-DD compare). Means: the user was active 2 days ago and missed
 * yesterday — the only window when Phoenix can usefully bridge.
 */
function isBrokenYesterday(lastActiveDate: string | null | undefined): boolean {
  if (!lastActiveDate) return false;
  const today = new Date().toISOString().split('T')[0];
  const dayBeforeYesterday = new Date(Date.now() - 2 * MS_PER_DAY)
    .toISOString()
    .split('T')[0];
  // If user already came back today, no need for Phoenix.
  if (lastActiveDate === today) return false;
  return lastActiveDate === dayBeforeYesterday;
}

export interface RestoreStreakButtonProps {
  className?: string;
}

export const RestoreStreakButton: React.FC<RestoreStreakButtonProps> = ({
  className,
}) => {
  const { t, locale } = useI18n();
  const { state, dispatch } = useUser();
  const { getOwned } = usePowerups();
  const reduce = useReducedMotion();
  const [toastOpen, setToastOpen] = useState(false);

  const owned = getOwned('streak_revive');
  const streakBroken = useMemo(
    () => state.currentStreak === 0 || isBrokenYesterday(state.lastActiveDate),
    [state.currentStreak, state.lastActiveDate]
  );

  const handleRestore = useCallback(() => {
    if (owned <= 0 || !streakBroken) return;
    dispatch({ type: 'RESTORE_STREAK' });
    setToastOpen(true);
  }, [owned, streakBroken, dispatch]);

  // Null-render guard — vanish completely when conditions don't match.
  if (owned <= 0 || !streakBroken) return null;

  const subtitle =
    locale === 'ar' ? 'ضحّ بطائر الفينيق ×1' : 'Spend 1 Phoenix';
  const toastTitle = locale === 'ar' ? '+يوم واحد جُسِر' : '+1 day bridged';

  // Subtle attention-pulse — guarded by reduced-motion + SQ_SPRING.gentle pacing.
  const pulseAnimate = reduce
    ? {}
    : { scale: [1, 1.015, 1], boxShadow: [
        '0 0 0 0 rgba(245, 158, 11, 0.0)',
        '0 0 0 6px rgba(245, 158, 11, 0.18)',
        '0 0 0 0 rgba(245, 158, 11, 0.0)',
      ] };

  return (
    <>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? MOTION_FALLBACK : SQ_SPRING.gentle}
        className={['mt-3', className ?? ''].filter(Boolean).join(' ')}
      >
        <motion.div
          animate={pulseAnimate}
          transition={
            reduce
              ? MOTION_FALLBACK
              : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
          }
          className="rounded-2xl"
        >
          <SqButton
            variant="3d"
            tone="warning"
            size="md"
            fullWidth
            leadingIcon={Flame}
            onClick={handleRestore}
            aria-label={t('powerups.streak.restore')}
          >
            {t('powerups.streak.restore')}
          </SqButton>
        </motion.div>
        <p className="mt-1.5 text-center text-[10px] font-bold text-amber-300/80">
          {subtitle}
        </p>
      </motion.div>

      <SqToast
        open={toastOpen}
        variant="success"
        title={toastTitle}
        onClose={() => setToastOpen(false)}
      />
    </>
  );
};

export default RestoreStreakButton;
