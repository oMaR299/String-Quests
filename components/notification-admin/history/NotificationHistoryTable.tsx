import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter, ChevronDown, ArrowUpDown, Copy, Trash2, Pencil,
  Calendar, Search, X,
} from 'lucide-react';
import { useNotifications } from '../../../contexts/NotificationContext';
import { StatusBadge } from '../shared/StatusBadge';
import { ChannelIcon } from '../shared/ChannelIcon';
import { NotificationDetailView } from './NotificationDetailView';
import type {
  Notification,
  NotificationStatus,
  NotificationChannel,
  UserRole,
} from '../../../types/notification';

interface NotificationHistoryTableProps {
  onCompose?: (id?: string) => void;
}

const STATUS_OPTIONS: { value: NotificationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'جميع الحالات' },
  { value: 'sent', label: 'تم الإرسال' },
  { value: 'draft', label: 'مسودة' },
  { value: 'scheduled', label: 'مجدول' },
  { value: 'expired', label: 'منتهي' },
  { value: 'cancelled', label: 'ملغي' },
];

const CHANNEL_OPTIONS: { value: NotificationChannel | 'all'; label: string }[] = [
  { value: 'all', label: 'جميع القنوات' },
  { value: 'email', label: 'بريد إلكتروني' },
  { value: 'bell', label: 'إشعار الجرس' },
  { value: 'popup', label: 'نافذة منبثقة' },
  { value: 'banner', label: 'شريط إعلاني' },
];

const ROLE_LABELS: Record<UserRole, string> = {
  student: 'الطلاب',
  teacher: 'المعلمون',
  parent: 'أولياء الأمور',
  admin: 'المسؤولون',
};

function formatDateShort(dateStr: string | undefined | null): string {
  if (!dateStr) return '---';
  try {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '---';
  }
}

function getAudienceSummary(notification: Notification): string {
  const { audience, estimatedReach } = notification;

  // Check if targeting all main roles
  const allRoles: UserRole[] = ['student', 'teacher', 'parent', 'admin'];
  const hasAllRoles = allRoles.every((r) => audience.roles.includes(r));

  if (hasAllRoles && audience.grades.length === 0 && audience.sections.length === 0) {
    return 'الجميع';
  }

  if (audience.roles.length === 1) {
    const roleLabel = ROLE_LABELS[audience.roles[0]];
    if (audience.grades.length > 0) {
      return `${roleLabel} - الصف ${audience.grades.join(', ')}`;
    }
    return `جميع ${roleLabel}`;
  }

  if (audience.roles.length > 0) {
    const labels = audience.roles.map((r) => ROLE_LABELS[r]).join(' و ');
    if (audience.grades.length > 0) {
      return `${labels} - الصف ${audience.grades.join(', ')}`;
    }
    return labels;
  }

  return `${estimatedReach} مستخدم`;
}

function getDeliveryQuickStats(notification: Notification): string | null {
  if (!notification.deliveryStats) return null;
  const stats = notification.deliveryStats;

  // Get the first available channel stats for a simple summary
  const channelKeys = Object.keys(stats.channels) as NotificationChannel[];
  if (channelKeys.length === 0) return null;

  const firstChannel = stats.channels[channelKeys[0]];
  if (!firstChannel) return null;

  return `أُرسل إلى ${firstChannel.sent} · فتح ${firstChannel.opened}`;
}

type SortField = 'date' | 'title';
type SortDir = 'asc' | 'desc';

export const NotificationHistoryTable: React.FC<NotificationHistoryTableProps> = ({ onCompose }) => {
  const { state, dispatch } = useNotifications();

  // Filters
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | 'all'>('all');
  const [channelFilter, setChannelFilter] = useState<NotificationChannel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Sort
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Detail modal
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);

  // Filter + Sort
  const filteredNotifications = useMemo(() => {
    let items = [...state.notifications];

    // Status filter
    if (statusFilter !== 'all') {
      items = items.filter((n) => n.status === statusFilter);
    }

    // Channel filter
    if (channelFilter !== 'all') {
      items = items.filter((n) => n.channels.includes(channelFilter));
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      items = items.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          (n.titleEn && n.titleEn.toLowerCase().includes(q)) ||
          n.shortMessage.toLowerCase().includes(q)
      );
    }

    // Date range
    if (dateFrom) {
      const from = new Date(dateFrom);
      items = items.filter((n) => new Date(n.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      items = items.filter((n) => new Date(n.createdAt) <= to);
    }

    // Sort
    items.sort((a, b) => {
      if (sortField === 'date') {
        const aDate = new Date(a.sentAt || a.sendAt || a.createdAt).getTime();
        const bDate = new Date(b.sentAt || b.sendAt || b.createdAt).getTime();
        return sortDir === 'desc' ? bDate - aDate : aDate - bDate;
      }
      if (sortField === 'title') {
        const compare = a.title.localeCompare(b.title, 'ar');
        return sortDir === 'desc' ? -compare : compare;
      }
      return 0;
    });

    return items;
  }, [state.notifications, statusFilter, channelFilter, searchQuery, dateFrom, dateTo, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleDuplicate = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    dispatch({ type: 'DUPLICATE_NOTIFICATION', payload: id });
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    dispatch({ type: 'DELETE_NOTIFICATION', payload: id });
    if (selectedNotificationId === id) {
      setSelectedNotificationId(null);
    }
  };

  const hasActiveFilters = statusFilter !== 'all' || channelFilter !== 'all' || searchQuery.trim() || dateFrom || dateTo;

  const clearFilters = () => {
    setStatusFilter('all');
    setChannelFilter('all');
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-bold text-slate-500">تصفية</span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mr-auto inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-500 transition-colors"
            >
              <X className="w-3 h-3" />
              مسح الكل
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="بحث بالعنوان..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-10 pl-3 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300 transition-all"
            />
          </div>

          {/* Status dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as NotificationStatus | 'all')}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-4 pl-9 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300 cursor-pointer transition-all"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Channel dropdown */}
          <div className="relative">
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value as NotificationChannel | 'all')}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-4 pl-9 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300 cursor-pointer transition-all"
            >
              {CHANNEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-10 pl-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300 transition-all"
                placeholder="من"
              />
            </div>
            <span className="text-xs font-bold text-slate-400">إلى</span>
            <div className="relative">
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-10 pl-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300 transition-all"
                placeholder="إلى"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_100px_140px_120px_100px_140px_80px] gap-2 px-5 py-3.5 bg-slate-50/80 border-b border-slate-100 text-xs font-black text-slate-500 items-center">
          <button
            onClick={() => toggleSort('title')}
            className="flex items-center gap-1 hover:text-slate-700 transition-colors"
          >
            العنوان
            <ArrowUpDown className="w-3 h-3" />
          </button>
          <span>القنوات</span>
          <span>الجمهور</span>
          <button
            onClick={() => toggleSort('date')}
            className="flex items-center gap-1 hover:text-slate-700 transition-colors"
          >
            التاريخ
            <ArrowUpDown className="w-3 h-3" />
          </button>
          <span>الحالة</span>
          <span>التوصيل</span>
          <span>إجراءات</span>
        </div>

        {/* Table Body */}
        <div>
          <AnimatePresence>
            {filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-16 text-center"
              >
                <p className="text-sm font-bold text-slate-400">لا توجد إشعارات مطابقة</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-2 text-sm font-bold text-sky-500 hover:text-sky-600 transition-colors"
                  >
                    مسح جميع التصفيات
                  </button>
                )}
              </motion.div>
            ) : (
              filteredNotifications.map((notif, idx) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15, delay: idx * 0.02 }}
                  onClick={() => setSelectedNotificationId(notif.id)}
                  className="grid grid-cols-[1fr_100px_140px_120px_100px_140px_80px] gap-2 px-5 py-3.5 border-b border-slate-50 hover:bg-sky-50/40 cursor-pointer transition-colors items-center group"
                >
                  {/* Title */}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate group-hover:text-sky-700 transition-colors">
                      {notif.title}
                    </p>
                    <p className="text-xs font-medium text-slate-400 truncate mt-0.5">
                      {notif.shortMessage}
                    </p>
                  </div>

                  {/* Channels */}
                  <div className="flex items-center gap-1">
                    {notif.channels.map((ch) => (
                      <ChannelIcon key={ch} channel={ch} size={15} />
                    ))}
                  </div>

                  {/* Audience */}
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-600 truncate block">
                      {getAudienceSummary(notif)}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="min-w-0">
                    {notif.status === 'scheduled' && notif.sendAt ? (
                      <span className="text-xs font-bold text-amber-600">
                        مجدول: {formatDateShort(notif.sendAt)}
                      </span>
                    ) : notif.sentAt ? (
                      <span className="text-xs font-bold text-slate-500">
                        {formatDateShort(notif.sentAt)}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">
                        {formatDateShort(notif.createdAt)}
                      </span>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <StatusBadge status={notif.status} />
                  </div>

                  {/* Delivery quick stats */}
                  <div className="min-w-0">
                    {notif.deliveryStats ? (
                      <span className="text-xs font-bold text-slate-500 block truncate">
                        {getDeliveryQuickStats(notif) || '---'}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-300">---</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleDuplicate(notif.id, e)}
                      title="تكرار"
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {notif.status === 'draft' && onCompose && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onCompose(notif.id); }}
                        title="تعديل"
                        className="p-1.5 rounded-lg hover:bg-sky-50 text-slate-400 hover:text-sky-600 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(notif.id, e)}
                      title="حذف"
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Table Footer */}
        {filteredNotifications.length > 0 && (
          <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">
              {filteredNotifications.length} إشعار
              {hasActiveFilters && ` (من أصل ${state.notifications.length})`}
            </span>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedNotificationId && (
        <NotificationDetailView
          notificationId={selectedNotificationId}
          isOpen={!!selectedNotificationId}
          onClose={() => setSelectedNotificationId(null)}
          onDuplicate={() => {
            handleDuplicate(selectedNotificationId);
            setSelectedNotificationId(null);
          }}
          onEdit={() => {
            if (onCompose) {
              onCompose(selectedNotificationId);
            }
            setSelectedNotificationId(null);
          }}
        />
      )}
    </div>
  );
};
