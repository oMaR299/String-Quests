/**
 * Skill Model Context
 *
 * Provides the StudentModel state to the entire app.
 * Handles loading from localStorage, migration, and saving.
 * Exposes processAttempt() for quiz integration.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { StudentModel, KCState, MasteryLevel } from '../models/types';
import { loadStudentModel, saveStudentModel, processAttempt } from '../utils/skillModelStorage';
import { flagDecayingKCs } from '../models/fsrs';
import { classifyMastery, getMasterySummary } from '../models/masteryClassifier';
import { seedDemoData, shouldSeedDemo } from '../utils/seedDemoData';

interface SkillModelContextValue {
  /** The current student model */
  model: StudentModel;

  /** Process a quiz answer - updates BKT, FSRS, IRT */
  recordAttempt: (
    questionId: number,
    correct: boolean,
    responseTimeMs: number,
    lessonSlug: string,
    subjectSlug: string,
  ) => void;

  /** Get mastery level for a specific KC */
  getKCMastery: (kcId: string) => MasteryLevel;

  /** Get KC state (or undefined if not started) */
  getKCState: (kcId: string) => KCState | undefined;

  /** Get summary of all mastery levels */
  masterySummary: Record<MasteryLevel, number>;

  /** Force reload from storage */
  reload: () => void;
}

const SkillModelCtx = createContext<SkillModelContextValue | null>(null);

export function SkillModelProvider({ children }: { children: React.ReactNode }) {
  const [model, setModel] = useState<StudentModel>(() => {
    // Auto-seed demo data if no student data exists
    if (shouldSeedDemo()) {
      return seedDemoData();
    }
    return loadStudentModel();
  });
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On mount: check for decaying KCs and update review queue
  useEffect(() => {
    const now = new Date();
    const updatedQueue = flagDecayingKCs(model.kcs, model.reviewQueue, now);
    if (updatedQueue.length !== model.reviewQueue.length) {
      setModel(prev => ({ ...prev, reviewQueue: updatedQueue }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced save to localStorage (avoid saving on every keystroke/answer)
  const debouncedSave = useCallback((newModel: StudentModel) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveStudentModel(newModel);
    }, 500);
  }, []);

  const recordAttempt = useCallback((
    questionId: number,
    correct: boolean,
    responseTimeMs: number,
    lessonSlug: string,
    subjectSlug: string,
  ) => {
    setModel(prev => {
      const updated = processAttempt(prev, questionId, correct, responseTimeMs, lessonSlug, subjectSlug);
      debouncedSave(updated);
      return updated;
    });
  }, [debouncedSave]);

  const getKCMastery = useCallback((kcId: string): MasteryLevel => {
    const state = model.kcs[kcId];
    if (!state) return 'not-started';
    return classifyMastery(state, new Date());
  }, [model.kcs]);

  const getKCState = useCallback((kcId: string): KCState | undefined => {
    return model.kcs[kcId];
  }, [model.kcs]);

  const masterySummary = React.useMemo(
    () => getMasterySummary(model.kcs, new Date()),
    [model.kcs],
  );

  const reload = useCallback(() => {
    setModel(loadStudentModel());
  }, []);

  const value: SkillModelContextValue = {
    model,
    recordAttempt,
    getKCMastery,
    getKCState,
    masterySummary,
    reload,
  };

  return (
    <SkillModelCtx.Provider value={value}>
      {children}
    </SkillModelCtx.Provider>
  );
}

/** Hook to access the skill model context */
export function useSkillModel(): SkillModelContextValue {
  const ctx = useContext(SkillModelCtx);
  if (!ctx) {
    throw new Error('useSkillModel must be used within <SkillModelProvider>');
  }
  return ctx;
}
