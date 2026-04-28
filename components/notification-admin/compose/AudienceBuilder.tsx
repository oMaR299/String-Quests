import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  GraduationCap, BookOpen, Users2, ShieldCheck,
  Search, X, Building2, UserPlus, FolderOpen,
  Layers, Info, AlertCircle,
} from 'lucide-react';
import type { AudienceTarget, UserRole } from '../../../types/notification';
import { getUsersByFilter } from '../../../data/mockUserDirectory';
import { SCHOOLS } from '../../../data/adminData';
import { MOCK_CLASSES } from '../../../data/mockSchoolData';
import type { MockClass } from '../../../data/mockSchoolData';
import { SavedAudienceModal } from './SavedAudienceModal';

interface AudienceBuilderProps {
  audience: AudienceTarget;
  onChange: (audience: AudienceTarget) => void;
}

const ROLE_OPTIONS: { id: UserRole; label: string; icon: React.FC<{ className?: string }>; color: string }[] = [
  { id: 'student', label: 'طلاب', icon: GraduationCap, color: 'text-blue-500 bg-blue-50 border-blue-200' },
  { id: 'teacher', label: 'معلمون', icon: BookOpen, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
  { id: 'parent', label: 'أولياء أمور', icon: Users2, color: 'text-purple-500 bg-purple-50 border-purple-200' },
  { id: 'admin', label: 'إداريون', icon: ShieldCheck, color: 'text-amber-500 bg-amber-50 border-amber-200' },
];

const GRADES = Array.from({ length: 12 }, (_, i) => i + 1);
const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * Migrate legacy global `sections` arrays into a per-grade map. When the
 * audience is loaded with the deprecated flat array set, we copy that array
 * into every selected grade's bucket so the UI reads cleanly. Idempotent —
 * if `gradeSections` already has entries we leave it alone.
 */
function migrateLegacySections(audience: AudienceTarget): AudienceTarget {
  const existing = audience.gradeSections ?? {};
  const hasPerGrade = Object.keys(existing).length > 0;
  if (hasPerGrade) {
    return { ...audience, gradeSections: existing };
  }
  if (audience.sections && audience.sections.length > 0 && audience.grades.length > 0) {
    const next: Record<number, string[]> = {};
    for (const g of audience.grades) {
      next[g] = [...audience.sections];
    }
    return { ...audience, gradeSections: next };
  }
  return { ...audience, gradeSections: {} };
}

export const AudienceBuilder: React.FC<AudienceBuilderProps> = ({ audience, onChange }) => {
  const reduced = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSavedModal, setShowSavedModal] = useState(false);

  const showGrades = audience.roles.includes('student') || audience.roles.includes('parent');

  // Lazy migration: if a legacy audience (with flat sections, no gradeSections)
  // arrives, copy the flat list into each selected grade's bucket exactly once
  // so subsequent edits operate on the new shape.
  useEffect(() => {
    const hasPerGrade =
      audience.gradeSections && Object.keys(audience.gradeSections).length > 0;
    if (
      !hasPerGrade &&
      audience.sections &&
      audience.sections.length > 0 &&
      audience.grades.length > 0
    ) {
      onChange(migrateLegacySections(audience));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audience.savedAudienceId]);

  // Effective per-grade map — defensive read so consumers don't crash on
  // legacy audiences that haven't been migrated yet.
  const gradeSections: Record<number, string[]> = audience.gradeSections ?? {};

  // Search users for individual selection
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return [];
    const allUsers = getUsersByFilter({});
    const q = searchQuery.trim().toLowerCase();
    return allUsers
      .filter(
        (u) =>
          (u.name.toLowerCase().includes(q) ||
            u.nameEn?.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)) &&
          !audience.individualIds.includes(u.id)
      )
      .slice(0, 8);
  }, [searchQuery, audience.individualIds]);

  // Get individual user details for display
  const selectedIndividualUsers = useMemo(() => {
    if (audience.individualIds.length === 0) return [];
    return getUsersByFilter({ individualIds: audience.individualIds });
  }, [audience.individualIds]);

  const toggleRole = (role: UserRole) => {
    const newRoles = audience.roles.includes(role)
      ? audience.roles.filter((r) => r !== role)
      : [...audience.roles, role];

    // If removing student/parent and no student/parent left, clear grades/sections
    const hasGradeRole = newRoles.includes('student') || newRoles.includes('parent');
    onChange({
      ...audience,
      roles: newRoles,
      grades: hasGradeRole ? audience.grades : [],
      sections: hasGradeRole && audience.grades.length > 0 ? audience.sections : [],
      gradeSections: hasGradeRole ? gradeSections : {},
    });
  };

  const toggleGrade = (grade: number) => {
    const isSelected = audience.grades.includes(grade);
    const newGrades = isSelected
      ? audience.grades.filter((g) => g !== grade)
      : [...audience.grades, grade].sort((a, b) => a - b);

    const newGradeSections = { ...gradeSections };
    if (isSelected) {
      // Removing the grade entirely — drop its bucket.
      delete newGradeSections[grade];
    } else {
      // Adding a new grade — seed an empty bucket so the per-grade row renders.
      newGradeSections[grade] = newGradeSections[grade] ?? [];
    }

    onChange({
      ...audience,
      grades: newGrades,
      gradeSections: newGradeSections,
      // Clear deprecated flat sections once we've moved to per-grade.
      sections: [],
    });
  };

  const toggleSectionForGrade = (grade: number, section: string) => {
    const current = gradeSections[grade] ?? [];
    const next = current.includes(section)
      ? current.filter((s) => s !== section)
      : [...current, section].sort();

    onChange({
      ...audience,
      gradeSections: { ...gradeSections, [grade]: next },
      sections: [], // ensure legacy stays cleared
    });
  };

  const selectAllSectionsForGrade = (grade: number) => {
    const current = gradeSections[grade] ?? [];
    const allSelected = current.length === SECTIONS.length;
    onChange({
      ...audience,
      gradeSections: {
        ...gradeSections,
        [grade]: allSelected ? [] : [...SECTIONS],
      },
      sections: [],
    });
  };

  const removeGrade = (grade: number) => {
    const newGradeSections = { ...gradeSections };
    delete newGradeSections[grade];
    onChange({
      ...audience,
      grades: audience.grades.filter((g) => g !== grade),
      gradeSections: newGradeSections,
      sections: [],
    });
  };

  const removeSummaryPill = (grade: number, section: string) => {
    toggleSectionForGrade(grade, section);
  };

  const toggleCampus = (campusId: string) => {
    const newCampusIds = audience.campusIds.includes(campusId)
      ? audience.campusIds.filter((c) => c !== campusId)
      : [...audience.campusIds, campusId];

    onChange({ ...audience, campusIds: newCampusIds });
  };

  const addIndividual = (userId: string) => {
    onChange({ ...audience, individualIds: [...audience.individualIds, userId] });
    setSearchQuery('');
  };

  const removeIndividual = (userId: string) => {
    onChange({ ...audience, individualIds: audience.individualIds.filter((id) => id !== userId) });
  };

  const handleSelectSavedAudience = (savedTarget: AudienceTarget) => {
    // Migrate the saved target on load — old saves only have flat `sections`.
    onChange(migrateLegacySections(savedTarget));
    setShowSavedModal(false);
  };

  const toggleAllGrades = () => {
    const allSelected = audience.grades.length === GRADES.length;
    if (allSelected) {
      onChange({
        ...audience,
        grades: [],
        gradeSections: {},
        sections: [],
      });
    } else {
      const next: Record<number, string[]> = { ...gradeSections };
      for (const g of GRADES) {
        next[g] = next[g] ?? [];
      }
      onChange({
        ...audience,
        grades: [...GRADES],
        gradeSections: next,
        sections: [],
      });
    }
  };

  const selectClass = (cls: MockClass) => {
    const sectionLetter = cls.id.replace(/\d+/g, ''); // Extract letter(s) from "3A" -> "A"
    const grade = cls.grade;

    const newGrades = audience.grades.includes(grade)
      ? audience.grades
      : [...audience.grades, grade].sort((a, b) => a - b);

    const currentForGrade = gradeSections[grade] ?? [];
    const newSectionsForGrade = currentForGrade.includes(sectionLetter)
      ? currentForGrade
      : [...currentForGrade, sectionLetter].sort();

    onChange({
      ...audience,
      grades: newGrades,
      gradeSections: {
        ...gradeSections,
        [grade]: newSectionsForGrade,
      },
      sections: [],
    });
  };

  // Live summary: list of (grade, section) tuples for the selection summary pills.
  const summaryTuples = useMemo(() => {
    const tuples: { grade: number; section: string }[] = [];
    for (const g of audience.grades) {
      const secs = gradeSections[g] ?? [];
      for (const s of secs) tuples.push({ grade: g, section: s });
    }
    return tuples.sort((a, b) =>
      a.grade !== b.grade ? a.grade - b.grade : a.section.localeCompare(b.section)
    );
  }, [audience.grades, gradeSections]);

  const roleColorMap: Record<UserRole, string> = {
    student: 'bg-blue-100 text-blue-700',
    teacher: 'bg-emerald-100 text-emerald-700',
    parent: 'bg-purple-100 text-purple-700',
    admin: 'bg-amber-100 text-amber-700',
  };

  const roleLabelMap: Record<UserRole, string> = {
    student: 'طالب',
    teacher: 'معلم',
    parent: 'ولي أمر',
    admin: 'إداري',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setShowSavedModal(true)}
          className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          تحميل جمهور محفوظ
        </button>
      </div>

      {/* By Role */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
        <label className="text-sm font-bold text-slate-600">حسب الدور</label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {ROLE_OPTIONS.map((role) => {
            const isSelected = audience.roles.includes(role.id);
            const Icon = role.icon;
            const colorParts = role.color.split(' ');

            return (
              <button
                key={role.id}
                type="button"
                onClick={() => toggleRole(role.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-bold transition-all duration-200
                  ${
                    isSelected
                      ? `${colorParts[1]} ${colorParts[2]} ${colorParts[0]}`
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }
                `}
              >
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all
                    ${isSelected ? `${colorParts[2]} ${colorParts[1]}` : 'border-slate-300 bg-white'}
                  `}
                >
                  {isSelected && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3 h-3"
                      viewBox="0 0 12 12"
                    >
                      <path
                        d="M2 6l3 3 5-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </motion.svg>
                  )}
                </div>
                <Icon className="w-4 h-4" />
                <span>{role.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* By Grade */}
      <AnimatePresence>
        {showGrades && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-600">حسب الصف</label>
                <button
                  type="button"
                  onClick={toggleAllGrades}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors"
                >
                  {audience.grades.length === GRADES.length ? 'إلغاء الكل' : 'تحديد الكل'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {GRADES.map((grade) => {
                  const isSelected = audience.grades.includes(grade);
                  return (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => toggleGrade(grade)}
                      className={`min-w-[3rem] px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200
                        ${
                          isSelected
                            ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }
                      `}
                    >
                      {grade}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Per-grade section rows — one per selected grade. Lets the admin
          express "Grade 1 → A, B + Grade 2 → C, D" without sections leaking. */}
      <AnimatePresence>
        {showGrades && audience.grades.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400" />
                الشعب لكل صف
                <span className="text-xs font-medium text-slate-400">
                  · اختر الشعب المستهدفة لكل صف على حدة
                </span>
              </label>

              <div className="space-y-2.5">
                <AnimatePresence initial={false}>
                  {audience.grades.map((grade) => {
                    const sectionsForGrade = gradeSections[grade] ?? [];
                    const allSelected = sectionsForGrade.length === SECTIONS.length;
                    const incomplete = sectionsForGrade.length === 0;
                    return (
                      <motion.div
                        key={grade}
                        layout={!reduced}
                        initial={reduced ? false : { opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: reduced ? 0 : 0.18, ease: 'easeOut' }}
                        className={`rounded-xl border bg-white p-3 transition-colors ${
                          incomplete
                            ? 'border-amber-200/80'
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Grade pill (RTL start) — with X to deselect */}
                          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg ps-2.5 pe-1 py-1 shrink-0">
                            <span className="text-xs font-black text-emerald-700">
                              الصف {grade}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeGrade(grade)}
                              className="p-0.5 rounded hover:bg-emerald-100 transition-colors text-emerald-500 hover:text-emerald-700"
                              title="إلغاء الصف"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Section letter pills */}
                          <div className="flex flex-wrap gap-1.5 flex-1">
                            {SECTIONS.map((section) => {
                              const isSel = sectionsForGrade.includes(section);
                              return (
                                <button
                                  key={`${grade}-${section}`}
                                  type="button"
                                  onClick={() => toggleSectionForGrade(grade, section)}
                                  className={`w-9 h-9 rounded-lg text-xs font-black transition-all duration-200
                                    ${
                                      isSel
                                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                                    }
                                  `}
                                >
                                  {section}
                                </button>
                              );
                            })}
                          </div>

                          {/* Select-all link (logical end) */}
                          <button
                            type="button"
                            onClick={() => selectAllSectionsForGrade(grade)}
                            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50/60 hover:bg-emerald-100 px-2 py-1 rounded-md transition-colors shrink-0"
                          >
                            {allSelected ? 'إلغاء الكل' : 'تحديد الكل'}
                          </button>
                        </div>

                        {/* Empty-bucket hint */}
                        <AnimatePresence>
                          {incomplete && (
                            <motion.div
                              initial={reduced ? false : { opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50/70 border border-amber-200/70 rounded-lg px-2.5 py-1.5">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>اختر شعبة واحدة على الأقل لهذا الصف</span>
                                <span className="mx-1 text-amber-300">·</span>
                                <span className="font-medium not-italic text-amber-600/90">
                                  Choose at least one section for this grade
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live summary — bottom strip with (grade, section) tuples + class shortcuts.
          The "تحديد فصل كامل" shortcut row populates from the selected tuples and
          lets the admin click to remove any tuple. */}
      <AnimatePresence>
        {showGrades && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400" />
                تحديد فصل كامل
                <span className="text-xs font-medium text-slate-400">
                  · اختياري · ينشئ تركيبة (صف + شعبة) واحدة
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {MOCK_CLASSES.map((cls) => {
                  const sectionLetter = cls.id.replace(/\d+/g, '');
                  const isSelected =
                    audience.grades.includes(cls.grade) &&
                    (gradeSections[cls.grade] ?? []).includes(sectionLetter);
                  return (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => selectClass(cls)}
                      className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-200
                        ${
                          isSelected
                            ? 'bg-violet-500 text-white shadow-sm shadow-violet-500/20'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }
                      `}
                      title={cls.nameAr}
                    >
                      {cls.id}
                    </button>
                  );
                })}
              </div>

              {/* Live tuple summary */}
              {summaryTuples.length > 0 ? (
                <div className="border-t border-slate-200/70 pt-3 space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-500">
                    التحديدات الحالية
                    <span className="mx-1 text-slate-300">·</span>
                    <span className="font-medium not-italic text-slate-400">Currently selected</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <AnimatePresence initial={false}>
                      {summaryTuples.map(({ grade, section }) => (
                        <motion.button
                          key={`${grade}-${section}`}
                          type="button"
                          layout={!reduced}
                          initial={reduced ? false : { scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={reduced ? { opacity: 0 } : { scale: 0.85, opacity: 0 }}
                          transition={{ duration: reduced ? 0 : 0.16, ease: 'easeOut' }}
                          onClick={() => removeSummaryPill(grade, section)}
                          className="inline-flex items-center gap-1 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 px-2 py-1 rounded-lg text-[11px] font-black transition-colors"
                          title="إزالة هذه الشعبة من هذا الصف"
                        >
                          <span>{grade}{section}</span>
                          <X className="w-3 h-3" />
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] font-medium text-slate-400 border-t border-slate-200/70 pt-3">
                  لم يتم اختيار أي تركيبة (صف · شعبة) بعد
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* By Campus */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
        <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-400" />
          حسب المدرسة
        </label>
        <div className="space-y-2">
          {SCHOOLS.map((school) => {
            const isSelected = audience.campusIds.includes(school.id);
            return (
              <div key={school.id} className="space-y-2">
                <button
                  type="button"
                  onClick={() => toggleCampus(school.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all duration-200 text-start
                    ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }
                  `}
                >
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0
                      ${isSelected ? 'border-emerald-400 bg-emerald-500' : 'border-slate-300 bg-white'}
                    `}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12">
                        <path
                          d="M2 6l3 3 5-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span>{school.name}</span>
                </button>
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 me-7">
                        <Info className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="text-[11px] font-bold text-emerald-700">
                          سيشمل جميع الطلاب والمعلمين في هذه المدرسة
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual Users */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
        <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-slate-400" />
          مستخدمون محددون
        </label>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم أو البريد الإلكتروني..."
            className="w-full bg-white border border-slate-200 rounded-xl ps-10 pe-3.5 py-2.5 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-duo-purple/30 focus:border-duo-purple transition"
            dir="rtl"
          />
        </div>

        {/* Search Results */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-lg"
            >
              {searchResults.map((user, idx) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => addIndividual(user.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-start hover:bg-emerald-50 transition-colors
                    ${idx > 0 ? 'border-t border-slate-100' : ''}
                  `}
                >
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-black text-slate-500 shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-800 truncate">{user.name}</div>
                    <div className="text-[11px] font-medium text-slate-400 truncate">{user.email}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleColorMap[user.role]}`}>
                    {roleLabelMap[user.role]}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Individuals */}
        {selectedIndividualUsers.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {selectedIndividualUsers.map((user) => (
              <motion.span
                key={user.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-bold"
              >
                {user.name}
                <button
                  type="button"
                  onClick={() => removeIndividual(user.id)}
                  className="hover:bg-emerald-200 rounded p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </div>
        )}
      </div>

      {/* Saved Audience Modal */}
      <SavedAudienceModal
        isOpen={showSavedModal}
        onClose={() => setShowSavedModal(false)}
        currentAudience={audience}
        onSelect={handleSelectSavedAudience}
      />
    </div>
  );
};
