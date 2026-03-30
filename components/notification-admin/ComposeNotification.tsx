import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Save, FileText, Eye, X, ClipboardList, AlertCircle, RotateCcw,
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { estimateAudienceCount } from '../../data/mockUserDirectory';
import { ChannelSelector } from './compose/ChannelSelector';
import { ContentEditor } from './compose/ContentEditor';
import { BannerColorPicker } from './compose/BannerColorPicker';
import { AudienceBuilder } from './compose/AudienceBuilder';
import { AudiencePreview } from './compose/AudiencePreview';
import { SchedulePicker } from './compose/SchedulePicker';
import { PrioritySelector } from './compose/PrioritySelector';
import { NotificationPreview } from './compose/NotificationPreview';
import type {
  Notification,
  NotificationChannel,
  NotificationPriority,
  NotificationTemplate,
  AudienceTarget,
} from '../../types/notification';

interface ComposeNotificationProps {
  editingId?: string | null;
  onDone: () => void;
}

const EMPTY_AUDIENCE: AudienceTarget = {
  roles: [],
  grades: [],
  sections: [],
  campusIds: [],
  individualIds: [],
};

export const ComposeNotification: React.FC<ComposeNotificationProps> = ({
  editingId,
  onDone,
}) => {
  const { state, dispatch } = useNotifications();

  // ---- Form State ----
  const [channels, setChannels] = useState<NotificationChannel[]>(['bell']);
  const [title, setTitle] = useState('');
  const [shortMessage, setShortMessage] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [ctaButton, setCtaButton] = useState<{ label: string; url: string } | null>(null);
  const [bannerGradient, setBannerGradient] = useState('from-sky-400 to-blue-500');
  const [audience, setAudience] = useState<AudienceTarget>(EMPTY_AUDIENCE);
  const [sendAt, setSendAt] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | undefined>(undefined);
  const [priority, setPriority] = useState<NotificationPriority>('normal');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderInterval, setReminderInterval] = useState<'1day' | '3days' | '1week'>('1day');
  const [attachForm, setAttachForm] = useState(false);

  // ---- UI State ----
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const [showTemplateNameModal, setShowTemplateNameModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  // ---- Load existing notification for editing ----
  useEffect(() => {
    if (editingId) {
      const existing = state.notifications.find((n) => n.id === editingId);
      if (existing) {
        setChannels(existing.channels);
        setTitle(existing.title);
        setShortMessage(existing.shortMessage);
        setBody(existing.body);
        setImageUrl(existing.imageUrl || '');
        setCtaButton(existing.ctaButton || null);
        setAudience(existing.audience);
        setSendAt(existing.sendAt);
        setExpiresAt(existing.expiresAt);
        setPriority(existing.priority);

        if (existing.channelConfig?.banner?.bgGradient) {
          setBannerGradient(existing.channelConfig.banner.bgGradient);
        }
        if (existing.attachedFormId) {
          setAttachForm(true);
        }

        // Load reminder config from tags
        const reminderTag = existing.tags.find((t) => t.startsWith('reminder:'));
        if (reminderTag) {
          setReminderEnabled(true);
          const interval = reminderTag.split(':')[1] as '1day' | '3days' | '1week';
          if (['1day', '3days', '1week'].includes(interval)) {
            setReminderInterval(interval);
          }
        }
      }
    }
  }, [editingId, state.notifications]);

  // ---- Helpers ----
  const estimatedReach = useMemo(() => {
    const hasFilter = audience.roles.length > 0 || audience.individualIds.length > 0;
    if (!hasFilter) return 0;
    return estimateAudienceCount({
      roles: audience.roles,
      grades: audience.grades,
      sections: audience.sections,
      campusIds: audience.campusIds,
      individualIds: audience.individualIds,
    });
  }, [audience]);

  const handleContentChange = (field: string, value: any) => {
    switch (field) {
      case 'title':
        setTitle(value);
        break;
      case 'shortMessage':
        setShortMessage(value);
        break;
      case 'body':
        setBody(value);
        break;
      case 'imageUrl':
        setImageUrl(value);
        break;
      case 'ctaButton':
        setCtaButton(value);
        break;
    }
  };

  const handleScheduleChange = (newSendAt: string | null, newExpiresAt?: string) => {
    setSendAt(newSendAt);
    setExpiresAt(newExpiresAt);
  };

  const buildNotification = (): Notification => {
    const now = new Date().toISOString();
    const id = editingId || `notif-${Date.now()}`;

    return {
      id,
      title,
      shortMessage,
      body,
      channels,
      priority,
      status: 'draft',
      audience,
      estimatedReach,
      sendAt,
      expiresAt,
      channelConfig: {
        ...(channels.includes('email')
          ? {
              email: {
                senderName: 'مدارس الخضر الحديثة',
                ctaButton: ctaButton || undefined,
              },
            }
          : {}),
        ...(channels.includes('bell')
          ? {
              bell: {
                icon: 'Bell',
              },
            }
          : {}),
        ...(channels.includes('popup')
          ? {
              popup: {
                size: 'md' as const,
                dismissible: true,
                imageUrl: imageUrl || undefined,
                primaryButton: ctaButton || undefined,
                dismissLabel: 'إغلاق',
              },
            }
          : {}),
        ...(channels.includes('banner')
          ? {
              banner: {
                bgGradient: bannerGradient,
                textColor: 'white',
                dismissible: true,
                actionButton: ctaButton || undefined,
              },
            }
          : {}),
      },
      imageUrl: imageUrl || undefined,
      ctaButton: ctaButton || undefined,
      attachedFormId: attachForm ? 'pending' : undefined,
      createdAt: editingId
        ? state.notifications.find((n) => n.id === editingId)?.createdAt || now
        : now,
      updatedAt: now,
      tags: [...(reminderEnabled ? [`reminder:${reminderInterval}`] : [])],
    };
  };

  const validate = (): string[] => {
    const errors: string[] = [];
    if (channels.length === 0) errors.push('يجب اختيار قناة إرسال واحدة على الأقل');
    if (!title.trim()) errors.push('عنوان الإشعار مطلوب');
    if (!shortMessage.trim()) errors.push('الرسالة المختصرة مطلوبة');
    if (audience.roles.length === 0 && audience.individualIds.length === 0) {
      errors.push('يجب تحديد الجمهور المستهدف');
    }
    return errors;
  };

  const handleSend = () => {
    const errors = validate();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    setIsSending(true);

    // Simulate brief send delay
    setTimeout(() => {
      const notification = buildNotification();
      dispatch({ type: 'SEND_NOTIFICATION', payload: notification });
      setIsSending(false);
      onDone();
    }, 600);
  };

  const handleSaveDraft = () => {
    const notification = buildNotification();
    dispatch({ type: 'SAVE_DRAFT', payload: notification });
    onDone();
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;

    const template: NotificationTemplate = {
      id: `tmpl-${Date.now()}`,
      name: templateName.trim(),
      category: 'custom',
      channels,
      title,
      body,
      shortMessage,
      channelConfig: {
        ...(channels.includes('banner')
          ? { banner: { bgGradient: bannerGradient, textColor: 'white', dismissible: true } }
          : {}),
      },
      isSystem: false,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'SAVE_TEMPLATE', payload: template });
    setShowTemplateNameModal(false);
    setTemplateName('');
  };

  return (
    <div className="h-full flex flex-col" dir="rtl">
      {/* Top bar */}
      <div className="px-6 lg:px-8 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {editingId ? 'تعديل الإشعار' : 'إنشاء إشعار جديد'}
            </h2>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              {editingId ? 'قم بتعديل الإشعار وإعادة إرساله' : 'قم بإنشاء إشعار وإرساله للجمهور المستهدف'}
            </p>
          </div>

          {/* Mobile preview toggle */}
          <button
            type="button"
            onClick={() => setShowPreviewMobile(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-sky-50 text-sky-600 rounded-xl text-xs font-bold hover:bg-sky-100 transition-colors"
          >
            <Eye className="w-4 h-4" />
            معاينة
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Compose Form (scrollable) */}
        <div className="flex-1 lg:w-[60%] overflow-y-auto">
          <div className="p-6 lg:p-8 space-y-6 max-w-3xl">

            {/* Validation Errors */}
            <AnimatePresence>
              {validationErrors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-1"
                >
                  <div className="flex items-center gap-2 text-red-600 font-bold text-sm mb-1">
                    <AlertCircle className="w-4 h-4" />
                    يرجى تصحيح الأخطاء التالية
                  </div>
                  {validationErrors.map((err, i) => (
                    <p key={i} className="text-xs font-bold text-red-500 pr-6">
                      &bull; {err}
                    </p>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 1. Channel Selector */}
            <ChannelSelector selected={channels} onChange={setChannels} />

            {/* 2. Content Editor */}
            <ContentEditor
              title={title}
              shortMessage={shortMessage}
              body={body}
              imageUrl={imageUrl}
              ctaButton={ctaButton}
              onChange={handleContentChange}
            />

            {/* 3. Banner Color Picker */}
            <AnimatePresence>
              {channels.includes('banner') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <BannerColorPicker value={bannerGradient} onChange={setBannerGradient} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* 4. Audience Builder + Preview */}
            <AudienceBuilder audience={audience} onChange={setAudience} />
            <AudiencePreview audience={audience} />

            {/* 5. Schedule Picker */}
            <SchedulePicker
              sendAt={sendAt}
              expiresAt={expiresAt}
              channels={channels}
              onChange={handleScheduleChange}
            />

            {/* 5.5 Reminders */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-800">التذكيرات</h3>
              <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => setReminderEnabled(!reminderEnabled)}
                  className="flex items-center gap-2 text-sm font-bold text-slate-700"
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                      ${reminderEnabled ? 'border-sky-400 bg-sky-500' : 'border-slate-300 bg-white'}
                    `}
                  >
                    {reminderEnabled && (
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
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  إرسال تذكير تلقائي
                </button>

                <AnimatePresence>
                  {reminderEnabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 pt-2">
                        {/* Interval Radio Group */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500">فترة التذكير</label>
                          <div className="grid grid-cols-3 gap-2">
                            {([
                              { id: '1day' as const, label: 'بعد يوم واحد' },
                              { id: '3days' as const, label: 'بعد ٣ أيام' },
                              { id: '1week' as const, label: 'بعد أسبوع' },
                            ]).map((option) => {
                              const isSelected = reminderInterval === option.id;
                              return (
                                <button
                                  key={option.id}
                                  type="button"
                                  onClick={() => setReminderInterval(option.id)}
                                  className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 text-xs font-bold transition-all duration-200
                                    ${
                                      isSelected
                                        ? 'border-sky-400 bg-sky-50 text-sky-700 shadow-sm'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                    }
                                  `}
                                >
                                  <div
                                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                                      ${isSelected ? 'border-sky-400' : 'border-slate-300'}
                                    `}
                                  >
                                    {isSelected && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-2 h-2 rounded-full bg-sky-500"
                                      />
                                    )}
                                  </div>
                                  <span>{option.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Info Note */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs font-bold text-amber-700 flex items-center gap-2">
                          <RotateCcw className="w-4 h-4 shrink-0" />
                          سيتم إرسال التذكير للمستخدمين الذين لم يفتحوا الإشعار
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* 6. Priority Selector */}
            <PrioritySelector value={priority} onChange={setPriority} />

            {/* 7. Attach Form */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
              <button
                type="button"
                onClick={() => setAttachForm(!attachForm)}
                className="flex items-center gap-2 text-sm font-bold text-slate-700"
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                    ${attachForm ? 'border-sky-400 bg-sky-500' : 'border-slate-300 bg-white'}
                  `}
                >
                  {attachForm && (
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
                <ClipboardList className="w-4 h-4 text-slate-400" />
                إرفاق نموذج
              </button>
              <AnimatePresence>
                {attachForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs font-bold text-amber-700 flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 shrink-0" />
                      يمكنك إنشاء النموذج من قسم النماذج
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 pb-8 border-t border-slate-100">
              {/* Send */}
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-sky-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {sendAt ? 'جدولة الإرسال' : 'إرسال الآن'}
              </button>

              {/* Save Draft */}
              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
              >
                <Save className="w-4 h-4" />
                حفظ كمسودة
              </button>

              {/* Save Template */}
              <button
                type="button"
                onClick={() => setShowTemplateNameModal(true)}
                className="flex items-center gap-2 px-5 py-3 text-slate-500 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors"
              >
                <FileText className="w-4 h-4" />
                حفظ كقالب
              </button>
            </div>
          </div>
        </div>

        {/* Right: Preview Panel (desktop) */}
        <div className="hidden lg:block lg:w-[40%] border-r border-slate-200 bg-slate-50/50 overflow-y-auto">
          <div className="p-6 sticky top-0">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-600">معاينة مباشرة</h3>
            </div>
            <NotificationPreview
              title={title}
              shortMessage={shortMessage}
              body={body}
              imageUrl={imageUrl}
              ctaButton={ctaButton}
              channels={channels}
              priority={priority}
              bannerGradient={bannerGradient}
            />
          </div>
        </div>
      </div>

      {/* Mobile Preview Bottom Sheet */}
      <AnimatePresence>
        {showPreviewMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-slate-900/40 backdrop-blur-sm lg:hidden"
              onClick={() => setShowPreviewMobile(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[91] bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto lg:hidden"
            >
              <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-sky-500" />
                  معاينة مباشرة
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPreviewMobile(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-6">
                <NotificationPreview
                  title={title}
                  shortMessage={shortMessage}
                  body={body}
                  imageUrl={imageUrl}
                  ctaButton={ctaButton}
                  channels={channels}
                  priority={priority}
                  bannerGradient={bannerGradient}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Template Name Modal */}
      <AnimatePresence>
        {showTemplateNameModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowTemplateNameModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            >
              <div
                className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-sky-500" />
                    حفظ كقالب
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowTemplateNameModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">اسم القالب</label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTemplate()}
                    placeholder="مثال: إشعار الاختبارات"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
                    dir="rtl"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleSaveTemplate}
                    disabled={!templateName.trim()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-sky-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    حفظ القالب
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTemplateNameModal(false);
                      setTemplateName('');
                    }}
                    className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
