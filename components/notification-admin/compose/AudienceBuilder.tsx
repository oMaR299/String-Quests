import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, BookOpen, Users2, ShieldCheck,
  Search, X, Building2, UserPlus, FolderOpen,
  Layers, Info,
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
const SECTIONS = ['A', 'B', 'C', 'D'];

export const AudienceBuilder: React.FC<AudienceBuilderProps> = ({ audience, onChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSavedModal, setShowSavedModal] = useState(false);

  const showGrades = audience.roles.includes('student') || audience.roles.includes('parent');
  const showSections = audience.grades.length > 0;

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
    });
  };

  const toggleGrade = (grade: number) => {
    const newGrades = audience.grades.includes(grade)
      ? audience.grades.filter((g) => g !== grade)
      : [...audience.grades, grade].sort((a, b) => a - b);

    onChange({
      ...audience,
      grades: newGrades,
      sections: newGrades.length > 0 ? audience.sections : [],
    });
  };

  const toggleSection = (section: string) => {
    const newSections = audience.sections.includes(section)
      ? audience.sections.filter((s) => s !== section)
      : [...audience.sections, section];

    onChange({ ...audience, sections: newSections });
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
    onChange(savedTarget);
    setShowSavedModal(false);
  };

  const toggleAllGrades = () => {
    const allSelected = audience.grades.length === GRADES.length;
    onChange({
      ...audience,
      grades: allSelected ? [] : [...GRADES],
      sections: allSelected ? [] : audience.sections,
    });
  };

  const toggleAllSections = () => {
    const allSelected = audience.sections.length === SECTIONS.length;
    onChange({
      ...audience,
      sections: allSelected ? [] : [...SECTIONS],
    });
  };

  const selectClass = (cls: MockClass) => {
    const sectionLetter = cls.id.replace(/\d+/g, ''); // Extract letter(s) from "3A" -> "A"
    const grade = cls.grade;

    const newGrades = audience.grades.includes(grade)
      ? audience.grades
      : [...audience.grades, grade].sort((a, b) => a - b);

    const newSections = audience.sections.includes(sectionLetter)
      ? audience.sections
      : [...audience.sections, sectionLetter];

    onChange({
      ...audience,
      grades: newGrades,
      sections: newSections,
    });
  };

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
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800">الجمهور المستهدف</h3>
        <button
          type="button"
          onClick={() => setShowSavedModal(true)}
          className="flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          تحميل جمهور محفوظ
        </button>
      </div>

      {/* By Role */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
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
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-600">حسب الصف</label>
                <button
                  type="button"
                  onClick={toggleAllGrades}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg transition-colors"
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
                            ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
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

      {/* By Section */}
      <AnimatePresence>
        {showSections && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-600">حسب الشعبة</label>
                <button
                  type="button"
                  onClick={toggleAllSections}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg transition-colors"
                >
                  {audience.sections.length === SECTIONS.length ? 'إلغاء الكل' : 'تحديد الكل'}
                </button>
              </div>
              <div className="flex gap-2">
                {SECTIONS.map((section) => {
                  const isSelected = audience.sections.includes(section);
                  return (
                    <button
                      key={section}
                      type="button"
                      onClick={() => toggleSection(section)}
                      className={`w-12 h-12 rounded-xl text-sm font-bold transition-all duration-200
                        ${
                          isSelected
                            ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }
                      `}
                    >
                      {section}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* By Class (Quick Select) */}
      <AnimatePresence>
        {showGrades && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400" />
                تحديد فصل كامل
              </label>
              <div className="flex flex-wrap gap-2">
                {MOCK_CLASSES.map((cls) => {
                  const sectionLetter = cls.id.replace(/\d+/g, '');
                  const isSelected = audience.grades.includes(cls.grade) && audience.sections.includes(sectionLetter);
                  return (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => selectClass(cls)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
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
              <p className="text-[11px] font-medium text-slate-400">
                النقر على فصل يحدد الصف والشعبة تلقائيا
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* By Campus */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all duration-200 text-right
                    ${
                      isSelected
                        ? 'border-sky-400 bg-sky-50 text-sky-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }
                  `}
                >
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0
                      ${isSelected ? 'border-sky-400 bg-sky-500' : 'border-slate-300 bg-white'}
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
                      <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2 mr-7">
                        <Info className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <span className="text-[11px] font-bold text-sky-600">
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
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
        <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-slate-400" />
          مستخدمون محددون
        </label>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم أو البريد الإلكتروني..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
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
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-right hover:bg-sky-50 transition-colors
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
                className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-1 rounded-lg text-xs font-bold"
              >
                {user.name}
                <button
                  type="button"
                  onClick={() => removeIndividual(user.id)}
                  className="hover:bg-sky-200 rounded p-0.5 transition-colors"
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
