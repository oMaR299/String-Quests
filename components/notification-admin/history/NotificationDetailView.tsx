import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Copy, Pencil, Trash2, AlertTriangle,
  Calendar, Clock, CalendarCheck, CalendarX,
  ExternalLink, FileText, Image as ImageIcon,
  Bell, MessageSquare, ChevronDown, Mail, Flag, Eye,
} from 'lucide-react';
import { useNotifications } from '../../../contexts/NotificationContext';
import { ChannelIcon } from '../shared/ChannelIcon';
import { StatusBadge } from '../shared/StatusBadge';
import { DeliveryAnalyticsCard } from './DeliveryAnalyticsCard';
import { useConfirmDialog } from '../../ui/useConfirmDialog';
import type { Notification, UserRole, NotificationChannel } from '../../../types/notification';

interface NotificationDetailViewProps {
  notificationId: string;
  isOpen: boolean;
  onClose: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  student: 'الطلاب',
  teacher: 'المعلمون',
  parent: 'أولياء الأمور',
  admin: 'المسؤولون',
};

const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  email: 'البريد الإلكتروني',
  bell: 'إشعار الجرس',
  popup: 'نافذة منبثقة',
  banner: 'شريط إعلاني',
};

const PREVIEW_ROLE_OPTIONS: { id: 'student' | 'teacher' | 'parent'; label: string }[] = [
  { id: 'student', label: 'طالب' },
  { id: 'teacher', label: 'معلم' },
  { id: 'parent', label: 'ولي أمر' },
];

function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '---';
  try {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '---';
  }
}

export const NotificationDetailView: React.FC<NotificationDetailViewProps> = ({
  notificationId,
  isOpen,
  onClose,
  onDuplicate,
  onEdit,
}) => {
  const { state, dispatch } = useNotifications();
  const { confirm, dialog: confirmDialog } = useConfirmDialog();
  const [previewRole, setPreviewRole] = useState<'student' | 'teacher' | 'parent'>('student');

  const notification = useMemo(
    () => state.notifications.find((n) => n.id === notificationId),
    [state.notifications, notificationId]
  );

  const attachedForm = useMemo(() => {
    if (!notification?.attachedFormId) return null;
    return state.forms.find((f) => f.id === notification.attachedFormId) ?? null;
  }, [state.forms, notification]);

  const handleDelete = async () => {
    if (!notification) return;
    const ok = await confirm({
      titleAr: 'حذف إشعار',
      titleEn: 'Delete notification',
      bodyAr: `سيتم حذف "${notification.title}" نهائيًا. هذا الإجراء لا يمكن التراجع عنه.`,
      bodyEn: `Will permanently delete "${notification.title}". This action cannot be undone.`,
      confirmLabelAr: 'حذف نهائيًا',
      confirmLabelEn: 'Delete permanently',
      destructive: true,
    });
    if (!ok) return;
    dispatch({ type: 'DELETE_NOTIFICATION', payload: notificationId });
    onClose();
  };

  // Build timeline entries
  const timelineEntries = useMemo(() => {
    if (!notification) return [];
    const entries: { label: string; date: string | null; icon: React.FC<{ className?: string }>; color: string; active: boolean }[] = [];

    entries.push({
      label: 'تم الإنشاء',
      date: notification.createdAt,
      icon: Calendar,
      color: 'bg-slate-400',
      active: true,
    });

    if (notification.sendAt) {
      entries.push({
        label: 'مجدول للإرسال',
        date: notification.sendAt,
        icon: Clock,
        color: 'bg-amber-400',
        active: notification.status === 'scheduled' || notification.status === 'sent',
      });
    }

    if (notification.sentAt) {
      entries.push({
        label: 'تم الإرسال',
        date: notification.sentAt,
        icon: CalendarCheck,
        color: 'bg-emerald-400',
        active: true,
      });
    }

    if (notification.expiresAt) {
      const isExpired = new Date(notification.expiresAt) < new Date();
      entries.push({
        label: isExpired ? 'انتهت الصلاحية' : 'تنتهي الصلاحية',
        date: notification.expiresAt,
        icon: CalendarX,
        color: isExpired ? 'bg-rose-400' : 'bg-slate-300',
        active: isExpired,
      });
    }

    return entries;
  }, [notification]);

  return (
    <AnimatePresence>
      {isOpen && notification && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-3xl my-8 bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-6 py-5 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <StatusBadge status={notification.status} />
                  {notification.priority === 'urgent' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-black">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      عاجل
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-black text-slate-900 leading-tight truncate">
                  {notification.title}
                </h2>
                {notification.titleEn && (
                  <p className="text-sm text-slate-400 font-medium mt-0.5" dir="ltr">
                    {notification.titleEn}
                  </p>
                )}
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Short Message */}
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-sm font-bold text-slate-500 mb-1">الرسالة المختصرة</p>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">
                  {notification.shortMessage}
                </p>
              </div>

              {/* Image preview */}
              {notification.imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-100">
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-100">
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-400">صورة مرفقة</span>
                  </div>
                  <img
                    src={notification.imageUrl}
                    alt=""
                    className="w-full max-h-60 object-cover"
                  />
                </div>
              )}

              {/* Full Body */}
              <div>
                <p className="text-sm font-bold text-slate-500 mb-2">نص الإشعار الكامل</p>
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                    {notification.body}
                  </p>
                </div>
              </div>

              {/* CTA Preview */}
              {notification.ctaButton && (
                <div>
                  <p className="text-sm font-bold text-slate-500 mb-2">زر الإجراء</p>
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl text-sm font-bold">
                    <ExternalLink className="w-4 h-4" />
                    {notification.ctaButton.label}
                  </div>
                </div>
              )}

              {/* Channels */}
              <div>
                <p className="text-sm font-bold text-slate-500 mb-2">القنوات المستخدمة</p>
                <div className="flex flex-wrap gap-2">
                  {notification.channels.map((ch) => (
                    <span
                      key={ch}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-700"
                    >
                      <ChannelIcon channel={ch} size={16} />
                      {CHANNEL_LABELS[ch]}
                    </span>
                  ))}
                </div>
              </div>

              {/* Audience */}
              <div>
                <p className="text-sm font-bold text-slate-500 mb-2">الجمهور المستهدف</p>
                <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                  {/* Roles */}
                  {notification.audience.roles.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-400">الفئات:</span>
                      {notification.audience.roles.map((role) => (
                        <span key={role} className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-600">
                          {ROLE_LABELS[role]}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Grades */}
                  {notification.audience.grades.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-400">الصفوف:</span>
                      {notification.audience.grades.map((g) => (
                        <span key={g} className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-600">
                          الصف {g}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Per-grade sections (new shape) */}
                  {notification.audience.gradeSections &&
                    Object.values(notification.audience.gradeSections).some(
                      (arr: string[]) => arr.length > 0
                    ) && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-400">الشُعب لكل صف:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(notification.audience.gradeSections)
                            .map(([g, secs]) => ({
                              grade: Number(g),
                              sections: secs as string[],
                            }))
                            .filter((e) => e.sections.length > 0)
                            .sort((a, b) => a.grade - b.grade)
                            .map(({ grade, sections }) => (
                              <span
                                key={grade}
                                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-600"
                              >
                                الصف {grade}: {sections.join('، ')}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}

                  {/* Legacy flat sections — fallback for older notifications */}
                  {(!notification.audience.gradeSections ||
                    Object.keys(notification.audience.gradeSections).length === 0) &&
                    notification.audience.sections.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-400">الشُعب:</span>
                        {notification.audience.sections.map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-600"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                  {/* Estimated reach */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                    <span className="text-xs font-bold text-slate-400">العدد التقديري:</span>
                    <span className="text-sm font-black text-slate-700">{notification.estimatedReach} مستخدم</span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              {timelineEntries.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-slate-500 mb-3">الجدول الزمني</p>
                  <div className="relative pr-4">
                    {/* Vertical line */}
                    <div className="absolute right-[7px] top-2 bottom-2 w-0.5 bg-slate-200" />

                    <div className="space-y-4">
                      {timelineEntries.map((entry, idx) => {
                        const Icon = entry.icon;
                        return (
                          <div key={idx} className="flex items-start gap-3 relative">
                            <div className={`w-4 h-4 rounded-full ${entry.active ? entry.color : 'bg-slate-200'} shrink-0 mt-0.5 ring-4 ring-white z-10`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Icon className={`w-4 h-4 ${entry.active ? 'text-slate-600' : 'text-slate-300'}`} />
                                <span className={`text-sm font-bold ${entry.active ? 'text-slate-700' : 'text-slate-400'}`}>
                                  {entry.label}
                                </span>
                              </div>
                              <p className={`text-xs font-medium mt-0.5 ${entry.active ? 'text-slate-500' : 'text-slate-300'}`}>
                                {formatDate(entry.date)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Analytics */}
              {notification.deliveryStats && (
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <DeliveryAnalyticsCard stats={notification.deliveryStats} />
                </div>
              )}

              {/* Preview as User */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <p className="text-sm font-bold text-slate-500">معاينة كمستخدم</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-5">
                  {/* Role Selector */}
                  <div className="relative">
                    <label className="text-xs font-bold text-slate-400 mb-1.5 block">عرض الإشعار كـ</label>
                    <div className="relative w-full max-w-[200px]">
                      <select
                        value={previewRole}
                        onChange={(e) => setPreviewRole(e.target.value as 'student' | 'teacher' | 'parent')}
                        className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-4 pl-10 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all cursor-pointer"
                        dir="rtl"
                      >
                        {PREVIEW_ROLE_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Channel Previews */}
                  <div className="space-y-4">
                    {/* Bell Preview */}
                    {notification.channels.includes('bell') && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Bell className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-xs font-bold text-slate-400">{CHANNEL_LABELS.bell}</span>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                          <div className="flex items-start gap-3 p-4 hover:bg-slate-50/50 transition-colors" dir="rtl">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                              <Bell className="w-5 h-5 text-amber-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-black text-slate-800 truncate">{notification.title}</p>
                                <div className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" title="غير مقروء" />
                              </div>
                              <p className="text-xs font-medium text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                                {notification.shortMessage}
                              </p>
                              <p className="text-[11px] font-bold text-slate-300 mt-1.5">الآن</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Popup Preview */}
                    {notification.channels.includes('popup') && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
                          <span className="text-xs font-bold text-slate-400">{CHANNEL_LABELS.popup}</span>
                        </div>
                        <div className="relative bg-slate-900/10 rounded-2xl p-6 flex items-center justify-center min-h-[200px]">
                          {/* Mini modal */}
                          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden" dir="rtl">
                            {/* Popup header */}
                            <div className="flex items-center justify-between px-5 pt-4 pb-2">
                              <h4 className="text-sm font-black text-slate-800 truncate flex-1">{notification.title}</h4>
                              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mr-2">
                                <X className="w-3.5 h-3.5 text-slate-400" />
                              </div>
                            </div>
                            {/* Popup image */}
                            {notification.imageUrl && (
                              <div className="px-5 pb-2">
                                <div className="rounded-xl overflow-hidden border border-slate-100">
                                  <img src={notification.imageUrl} alt="" className="w-full h-28 object-cover" />
                                </div>
                              </div>
                            )}
                            {/* Popup body */}
                            <div className="px-5 pb-3">
                              <p className="text-xs font-medium text-slate-600 leading-relaxed line-clamp-4 whitespace-pre-wrap">
                                {notification.body}
                              </p>
                            </div>
                            {/* Popup buttons */}
                            <div className="px-5 pb-4 flex items-center gap-2">
                              {notification.ctaButton && (
                                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl text-xs font-bold">
                                  <ExternalLink className="w-3 h-3" />
                                  {notification.ctaButton.label}
                                </span>
                              )}
                              <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold">
                                {notification.channelConfig?.popup?.dismissLabel || 'إغلاق'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Banner Preview */}
                    {notification.channels.includes('banner') && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Flag className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-xs font-bold text-slate-400">{CHANNEL_LABELS.banner}</span>
                        </div>
                        <div
                          className={`bg-gradient-to-r ${notification.channelConfig?.banner?.bgGradient || 'from-sky-400 to-blue-500'} rounded-2xl px-5 py-4 flex items-center gap-3`}
                          dir="rtl"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-white truncate">{notification.title}</p>
                            <p className="text-xs font-medium text-white/80 mt-0.5 truncate">{notification.shortMessage}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {notification.ctaButton && (
                              <span className="px-3.5 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-lg text-xs font-bold border border-white/20">
                                {notification.ctaButton.label}
                              </span>
                            )}
                            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                              <X className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Email Preview */}
                    {notification.channels.includes('email') && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Mail className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-xs font-bold text-slate-400">{CHANNEL_LABELS.email}</span>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" dir="rtl">
                          {/* Email header / school branding */}
                          <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-3 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                              <Mail className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-white">مدارس الخضر الحديثة</p>
                              <p className="text-[10px] font-medium text-white/70">Al-Khadr Modern Schools</p>
                            </div>
                          </div>
                          {/* Email subject */}
                          <div className="px-5 py-3 border-b border-slate-100">
                            <p className="text-xs font-bold text-slate-400">الموضوع</p>
                            <p className="text-sm font-black text-slate-800 mt-0.5">{notification.title}</p>
                          </div>
                          {/* Email body */}
                          <div className="px-5 py-4">
                            <p className="text-xs font-medium text-slate-600 leading-relaxed line-clamp-5 whitespace-pre-wrap">
                              {notification.body}
                            </p>
                          </div>
                          {/* Email CTA */}
                          {notification.ctaButton && (
                            <div className="px-5 pb-4">
                              <span className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl text-xs font-bold">
                                <ExternalLink className="w-3 h-3" />
                                {notification.ctaButton.label}
                              </span>
                            </div>
                          )}
                          {/* Email footer */}
                          <div className="bg-slate-50 px-5 py-3 border-t border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 text-center">
                              مدارس الخضر الحديثة &mdash; جميع الحقوق محفوظة
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Attached Form */}
              {attachedForm && (
                <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-blue-900 truncate">{attachedForm.title}</p>
                    <p className="text-xs font-bold text-blue-500">
                      عرض الردود ({attachedForm.responseCount} رد)
                    </p>
                  </div>
                  <button className="px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-colors">
                    عرض
                  </button>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 py-4 flex items-center gap-3 flex-wrap">
              <button
                onClick={onDuplicate}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-700 transition-colors"
              >
                <Copy className="w-4 h-4" />
                تكرار
              </button>

              {notification.status === 'draft' && (
                <button
                  onClick={onEdit}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-50 hover:bg-sky-100 rounded-xl text-sm font-bold text-sky-700 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  تعديل
                </button>
              )}

              <div className="flex-1" />

              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 rounded-xl text-sm font-bold text-rose-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                حذف
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      {confirmDialog}
    </AnimatePresence>
  );
};
