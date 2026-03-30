import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Send, MailOpen, FileEdit, CalendarClock, Plus } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { NotificationHistoryTable } from './history/NotificationHistoryTable';
import type { ChannelStats, NotificationChannel } from '../../types/notification';

interface NotificationDashboardProps {
  onCompose: (id?: string) => void;
}

interface StatCard {
  label: string;
  value: string | number;
  icon: React.FC<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

export const NotificationDashboard: React.FC<NotificationDashboardProps> = ({ onCompose }) => {
  const { state } = useNotifications();

  const stats = useMemo(() => {
    const notifications = state.notifications;

    const sentNotifications = notifications.filter((n) => n.status === 'sent');
    const totalSent = sentNotifications.length;

    // Calculate average open rate from email channel delivery stats
    let avgOpenRate = 0;
    if (sentNotifications.length > 0) {
      let totalRate = 0;
      let rateCount = 0;

      for (const notif of sentNotifications) {
        if (notif.deliveryStats) {
          const channels = notif.deliveryStats.channels;
          // Compute open rate across all channels for this notification
          let notifSent = 0;
          let notifOpened = 0;

          const channelKeys = Object.keys(channels) as NotificationChannel[];
          for (const key of channelKeys) {
            const ch: ChannelStats | undefined = channels[key];
            if (ch) {
              notifSent += ch.sent;
              notifOpened += ch.opened;
            }
          }

          if (notifSent > 0) {
            totalRate += (notifOpened / notifSent) * 100;
            rateCount++;
          }
        }
      }

      if (rateCount > 0) {
        avgOpenRate = Math.round(totalRate / rateCount);
      }
    }

    const drafts = notifications.filter((n) => n.status === 'draft').length;
    const scheduled = notifications.filter((n) => n.status === 'scheduled').length;

    return { totalSent, avgOpenRate, drafts, scheduled };
  }, [state.notifications]);

  const statCards: StatCard[] = [
    {
      label: 'إجمالي المرسل',
      value: stats.totalSent,
      icon: Send,
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-500',
    },
    {
      label: 'معدل الفتح',
      value: `${stats.avgOpenRate}%`,
      icon: MailOpen,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
    },
    {
      label: 'المسودات النشطة',
      value: stats.drafts,
      icon: FileEdit,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
    },
    {
      label: 'مجدول للإرسال',
      value: stats.scheduled,
      icon: CalendarClock,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-500',
    },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">لوحة التحكم</h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            نظرة عامة على جميع الإشعارات والتحليلات
          </p>
        </div>

        <button
          onClick={() => onCompose()}
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-sky-500/20 transition-all active:scale-[0.97]"
        >
          <Plus className="w-4 h-4" />
          إنشاء إشعار جديد
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.06 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-start gap-4 hover:shadow-md hover:border-slate-200 transition-all"
            >
              <div className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-black text-slate-900 leading-tight">
                  {card.value}
                </p>
                <p className="text-sm font-bold text-slate-400 mt-0.5">{card.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* History Section */}
      <div>
        <h2 className="text-lg font-black text-slate-800 mb-4">سجل الإشعارات</h2>
        <NotificationHistoryTable onCompose={onCompose} />
      </div>
    </div>
  );
};
