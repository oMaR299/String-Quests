// useProfileState.ts
// In-memory profile state per teacher. Resets when teacher changes.
// No localStorage — pure React state.

import { useCallback, useEffect, useState } from 'react';
import { emptyProfile, type ProfileData } from './profileTypes';
import { getTeacherById } from './scheduleMockData';

export interface UseProfileStateReturn {
  profile: ProfileData;
  /** Update a single field. */
  setField: <K extends keyof ProfileData>(field: K, value: ProfileData[K]) => void;
  /** Set photo dataURL from file reader. */
  setPhoto: (dataUrl: string) => void;
  /** Reset to the given teacher's baseline (empty + pre-filled names). */
  resetProfile: (teacherId: string) => void;
  /** Baseline display names for the current teacher — used by dirty-check. */
  baselineNameAr: string;
  baselineNameEn: string;
}

function baselineFor(teacherId: string): { ar: string; en: string } {
  const t = getTeacherById(teacherId);
  return { ar: t?.nameAr ?? '', en: t?.nameEn ?? '' };
}

export function useProfileState(teacherId: string): UseProfileStateReturn {
  const [baseline, setBaseline] = useState(() => baselineFor(teacherId));
  const [profile, setProfile] = useState<ProfileData>(() => {
    const b = baselineFor(teacherId);
    return emptyProfile(b.ar, b.en);
  });

  // Keep baseline + profile in sync when teacherId changes OUTSIDE of the
  // explicit resetProfile flow (e.g., initial mount). The explicit flow is
  // preferred to keep reset ordering deterministic in the layout.
  useEffect(() => {
    const b = baselineFor(teacherId);
    setBaseline(b);
    // NOTE: We do NOT auto-reset profile here — the layout calls resetProfile
    // explicitly when a teacher switch is confirmed. This effect only tracks
    // the baseline so dirty-check always compares against the right names.
  }, [teacherId]);

  const setField = useCallback(
    <K extends keyof ProfileData>(field: K, value: ProfileData[K]) => {
      setProfile(prev => ({ ...prev, [field]: value }));
    },
    [],
  );

  const setPhoto = useCallback((dataUrl: string) => {
    setProfile(prev => ({ ...prev, photoDataUrl: dataUrl }));
  }, []);

  const resetProfile = useCallback((nextTeacherId: string) => {
    const b = baselineFor(nextTeacherId);
    setBaseline(b);
    setProfile(emptyProfile(b.ar, b.en));
  }, []);

  return {
    profile,
    setField,
    setPhoto,
    resetProfile,
    baselineNameAr: baseline.ar,
    baselineNameEn: baseline.en,
  };
}
