import React from 'react';
import { BarChart3 } from 'lucide-react';
import type { DeliveryStats, NotificationChannel, UserRole } from '../../../types/notification';
import { ChannelIcon } from '../shared/ChannelIcon';

interface DeliveryAnalyticsCardProps {
  stats: DeliveryStats;
}

const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  email: 'البريد الإلكتروني',
  bell: 'إشعار الجرس',
  popup: 'النافذة المنبثقة',
  banner: 'الشريط الإعلاني',
};

const ROLE_LABELS: Record<UserRole, string> = {
  student: 'طلاب',
  teacher: 'معلمون',
  parent: 'أولياء أمور',
  admin: 'مسؤولون',
};

const BAR_LEVELS = [
  { key: 'sent', label: 'أُرسل', color: 'bg-slate-300' },
  { key: 'delivered', label: 'تم التوصيل', color: 'bg-blue-400' },
  { key: 'opened', label: 'تم الفتح', color: 'bg-emerald-400' },
  { key: 'clicked', label: 'تم النقر', color: 'bg-amber-400' },
] as const;

export const DeliveryAnalyticsCard: React.FC<DeliveryAnalyticsCardProps> = ({ stats }) => {
  const channels = Object.entries(stats.channels) as [NotificationChannel, NonNullable<typeof stats.channels[NotificationChannel]>][];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-slate-500" />
        <h3 className="text-base font-black text-slate-800">تحليلات التوصيل</h3>
      </div>

      {/* Per-channel funnel bars */}
      <div className="space-y-5">
        {channels.map(([channel, channelStats]) => {
          if (!channelStats) return null;
          const maxVal = channelStats.sent || 1;

          return (
            <div key={channel} className="space-y-2.5">
              {/* Channel header */}
              <div className="flex items-center gap-2">
                <ChannelIcon channel={channel} size={16} />
                <span className="text-sm font-bold text-slate-700">{CHANNEL_LABELS[channel]}</span>
                <span className="text-xs font-bold text-slate-400 mr-auto">
                  {channelStats.failed > 0 && `${channelStats.failed} فشل`}
                </span>
              </div>

              {/* Funnel bars */}
              <div className="space-y-1.5">
                {BAR_LEVELS.map(({ key, label, color }) => {
                  const value = channelStats[key];
                  const percentage = maxVal > 0 ? Math.round((value / maxVal) * 100) : 0;
                  const widthPercent = maxVal > 0 ? Math.max((value / maxVal) * 100, 2) : 0;

                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-20 text-left shrink-0">{label}</span>
                      <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden relative">
                        <div
                          className={`h-full ${color} rounded-lg transition-all duration-500 ease-out`}
                          style={{ width: `${widthPercent}%` }}
                        />
                        <span className="absolute inset-0 flex items-center px-2 text-xs font-black text-slate-700">
                          {value} ({percentage}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Role breakdown */}
      {stats.byRole && stats.byRole.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-500">معدل الفتح حسب الفئة</h4>
          <div className="flex flex-wrap gap-2">
            {stats.byRole.map((roleData) => {
              const openRatePercent = Math.round(roleData.openRate * 100);
              return (
                <span
                  key={roleData.role}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-bold text-slate-600"
                >
                  <span>{ROLE_LABELS[roleData.role]}:</span>
                  <span className={`font-black ${openRatePercent >= 80 ? 'text-emerald-600' : openRatePercent >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                    {openRatePercent}%
                  </span>
                  <span className="text-slate-400">({roleData.count})</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Total targeted */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs font-bold text-slate-400">إجمالي المستهدفين</span>
        <span className="text-sm font-black text-slate-700">{stats.totalTargeted}</span>
      </div>
    </div>
  );
};
