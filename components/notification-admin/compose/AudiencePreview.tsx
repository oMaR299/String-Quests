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
  const hasAnyFilter =
    audience.roles.length > 0 ||
    audience.individualIds.length > 0;

  const totalCount = useMemo(() => {
    if (!hasAnyFilter) return 0;
    return estimateAudienceCount({
      roles: audience.roles,
      grades: audience.grades,
      sections: audience.sections,
      campusIds: audience.campusIds,
      individualIds: audience.individualIds,
    });
  }, [audience, hasAnyFilter]);

  // Break down by role
  const roleBreakdown = useMemo(() => {
    if (!hasAnyFilter) return [];
    const users = getUsersByFilter({
      roles: audience.roles,
      grades: audience.grades,
      sections: audience.sections,
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
  }, [audience, hasAnyFilter]);

  if (!hasAnyFilter) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center">
        <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-400">اختر الجمهور لمعاينة العدد</p>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl border border-sky-200 p-5 space-y-3"
    >
      {/* Total Count */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
          <Users className="w-5 h-5 text-sky-600" />
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
                className="inline-block text-xl font-black text-sky-600 mx-1 tabular-nums"
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
    </motion.div>
  );
};
