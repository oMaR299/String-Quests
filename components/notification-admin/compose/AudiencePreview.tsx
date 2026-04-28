import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users } from 'lucide-react';
import type { AudienceTarget, UserRole } from '../../../types/notification';
import { estimateAudienceCount, getUsersByFilter } from '../../../data/mockUserDirectory';

interface AudiencePreviewProps {
  audience: AudienceTarget;
}

const ROLE_LABELS: Record<UserRole, string> = {
  student: 'طلاب',
  teacher: 'معلمون',
  parent: 'أولياء أمور',
  admin: 'إداريون',
};

const ROLE_COLORS: Record<UserRole, string> = {
  student: 'bg-blue-100 text-blue-700',
  teacher: 'bg-emerald-100 text-emerald-700',
  parent: 'bg-purple-100 text-purple-700',
  admin: 'bg-amber-100 text-amber-700',
};

export const AudiencePreview: React.FC<AudiencePreviewProps> = ({ audience }) => {
  const gradeSections: Record<number, string[]> = audience.gradeSections ?? {};
  const hasPerGrade = Object.values(gradeSections).some(
    (arr: string[]) => arr.length > 0
  );
  const hasAnyFilter =
    audience.roles.length > 0 ||
    audience.individualIds.length > 0 ||
    hasPerGrade ||
    audience.campusIds.length > 0;

  const totalCount = useMemo(() => {
    if (!hasAnyFilter) return 0;
    return estimateAudienceCount({
      roles: audience.roles,
      grades: audience.grades,
      sections: audience.sections,
      gradeSections,
      campusIds: audience.campusIds,
      individualIds: audience.individualIds,
    });
  }, [audience, hasAnyFilter, gradeSections]);

  // Break down by role
  const roleBreakdown = useMemo(() => {
    if (!hasAnyFilter) return [];
    const users = getUsersByFilter({
      roles: audience.roles,
      grades: audience.grades,
      sections: audience.sections,
      gradeSections,
      campusIds: audience.campusIds,
      individualIds: audience.individualIds,
    });

    const counts: Partial<Record<UserRole, number>> = {};
    users.forEach((u) => {
      counts[u.role] = (counts[u.role] || 0) + 1;
    });

    return (Object.entries(counts) as [UserRole, number][])
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [audience, hasAnyFilter, gradeSections]);

  // Per-grade summary lines: "الصف 1: شعبة A, B"
  const gradeSummaryLines = useMemo(() => {
    const entries: { grade: number; sections: string[] }[] = [];
    for (const g of audience.grades) {
      const secs = gradeSections[g] ?? [];
      if (secs.length > 0) entries.push({ grade: g, sections: [...secs].sort() });
    }
    return entries.sort((a, b) => a.grade - b.grade);
  }, [audience.grades, gradeSections]);

  if (!hasAnyFilter) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-5 text-center">
        <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-400">اختر الجمهور لمعاينة العدد</p>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-5 space-y-3"
    >
      {/* Total Count */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
          <Users className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-600">
            سيصل هذا الإشعار إلى{' '}
            <AnimatePresence mode="wait">
              <motion.span
                key={totalCount}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="inline-block text-xl font-black text-emerald-700 mx-1 tabular-nums"
              >
                {totalCount}
              </motion.span>
            </AnimatePresence>
            مستخدم
          </p>
        </div>
      </div>

      {/* Role Breakdown */}
      {roleBreakdown.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {roleBreakdown.map(([role, count]) => (
            <motion.span
              key={role}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${ROLE_COLORS[role]}`}
            >
              {ROLE_LABELS[role]}: {count}
            </motion.span>
          ))}
        </div>
      )}

      {/* Per-grade section summary — at most 3 lines, then a "+N more" tail. */}
      {gradeSummaryLines.length > 0 && (
        <div className="space-y-1 pt-1 border-t border-emerald-200/60">
          {gradeSummaryLines.slice(0, 3).map(({ grade, sections }) => (
            <p
              key={grade}
              className="text-[11px] font-bold text-emerald-800/90 leading-relaxed"
            >
              <span className="text-emerald-600">الصف {grade}:</span>{' '}
              <span className="text-emerald-700">
                شعبة {sections.join('، ')}
              </span>
            </p>
          ))}
          {gradeSummaryLines.length > 3 && (
            <p className="text-[10px] font-bold text-emerald-600/80">
              + {gradeSummaryLines.length - 3} صفوف أخرى
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};
