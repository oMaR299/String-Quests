import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Save, FileText, Eye, X, ClipboardList, AlertCircle, RotateCcw,
  MessageSquareText, Radio, Sparkles, Users, Clock, FormInput, Link2, Unlink,
  Wand2, Hand,
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
import { SectionCard } from './compose/SectionCard';
import { FormPicker } from './compose/FormPicker';
import { InteractionOptions } from './compose/InteractionOptions';
import type { FocusField } from './compose/previewFocus';
import { AnchoringRail, type AnchoringRailSection } from './compose/AnchoringRail';
import { getSectionToneTokens } from './compose/sectionTones';
import {
  buildFormDeepLink,
  isFormDeepLink,
  extractFormIdFromDeepLink,
  getMockFormById,
} from '../../data/mockNotificationForms';
import type {
  Notification,
  NotificationChannel,
  NotificationPriority,
  NotificationTemplate,
  AudienceTarget,
  NotificationInteraction,
} from '../../types/notification';
import { DEFAULT_INTERACTION } from '../../types/notification';

interface ComposeNotificationProps {
  editingId?: string | null;
  onDone: () => void;
}

const EMPTY_AUDIENCE: AudienceTarget = {
  roles: [],
  grades: [],
  sections: [],
  gradeSections: {},
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
  const [attachedFormId, setAttachedFormId] = useState<string | null>(null);
  const [interaction, setInteraction] = useState<NotificationInteraction>(DEFAULT_INTERACTION);
  // Tracks the previously-selected form id so the auto-wire logic can decide
  // whether to overwrite an existing CTA URL (we only overwrite when the URL
  // matches the previous form's deep link — i.e. nothing custom was typed).
  const previousFormIdRef = useRef<string | null>(null);

  // ---- UI State ----
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const [showTemplateNameModal, setShowTemplateNameModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  // ---- Live-preview focus channel ----
  // Tracks which content field the admin is currently editing so the live
  // preview can pulse the matching element + show a mirrored caret.
  const [focusedField, setFocusedField] = useState<FocusField>(null);

  // ---- Anchoring Rail state ----
  // The form column scrolls inside this container, so the rail observes
  // it (rather than the window) for accurate scroll-spy.
  const formScrollRef = useRef<HTMLDivElement | null>(null);
  // When a rail item is clicked we briefly mark the destination section
  // as "flashing" so its card pulses a soft violet ring on landing.
  const [flashingSectionId, setFlashingSectionId] = useState<string | null>(null);
  const flashTimeoutRef = useRef<number | null>(null);

  const triggerSectionFlash = useCallback((id: string) => {
    if (flashTimeoutRef.current) {
      window.clearTimeout(flashTimeoutRef.current);
    }
    setFlashingSectionId(id);
    flashTimeoutRef.current = window.setTimeout(() => {
      setFlashingSectionId(null);
      flashTimeoutRef.current = null;
    }, 700);
  }, []);

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) window.clearTimeout(flashTimeoutRef.current);
    };
  }, []);

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
          setAttachedFormId(existing.attachedFormId);
          previousFormIdRef.current = existing.attachedFormId;
        }
        if (existing.interaction) {
          setInteraction(existing.interaction);
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
    const gradeSections: Record<number, string[]> = audience.gradeSections ?? {};
    const hasPerGrade = Object.values(gradeSections).some(
      (arr: string[]) => arr.length > 0
    );
    const hasFilter =
      audience.roles.length > 0 ||
      audience.individualIds.length > 0 ||
      hasPerGrade ||
      audience.campusIds.length > 0;
    if (!hasFilter) return 0;
    return estimateAudienceCount({
      roles: audience.roles,
      grades: audience.grades,
      sections: audience.sections,
      gradeSections,
      campusIds: audience.campusIds,
      individualIds: audience.individualIds,
    });
  }, [audience]);

  // ---- Form deep-link helpers ----
  const ctaIsLinkedToCurrentForm = useMemo(() => {
    if (!attachedFormId) return false;
    if (!ctaButton?.url) return false;
    return ctaButton.url === buildFormDeepLink(attachedFormId);
  }, [attachedFormId, ctaButton]);

  // Auto-wire CTA when a form is selected. Rules:
  //   - If the CTA URL is empty OR matches the *previous* form's deep link
  //     (i.e. nothing custom was typed), fill it with the new form's link.
  //   - Always leave a custom-typed label alone; only fill the label if it's
  //     blank.
  useEffect(() => {
    const prev = previousFormIdRef.current;
    if (attachedFormId) {
      const newUrl = buildFormDeepLink(attachedFormId);
      const prevUrl = prev ? buildFormDeepLink(prev) : null;
      const currentUrl = ctaButton?.url ?? '';
      const urlIsEmptyOrPrev = !currentUrl || (prevUrl && currentUrl === prevUrl);
      if (urlIsEmptyOrPrev && currentUrl !== newUrl) {
        const newLabel =
          ctaButton?.label && ctaButton.label.trim().length > 0
            ? ctaButton.label
            : 'فتح النموذج';
        setCtaButton({ label: newLabel, url: newUrl });
      }
    }
    previousFormIdRef.current = attachedFormId;
    // We intentionally only react to attachedFormId changes — typing into
    // the CTA fields shouldn't re-trigger this branch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachedFormId]);

  const handleAutoFillCta = useCallback(() => {
    if (!attachedFormId) return;
    setCtaButton({
      label: ctaButton?.label?.trim() ? ctaButton.label : 'فتح النموذج',
      url: buildFormDeepLink(attachedFormId),
    });
  }, [attachedFormId, ctaButton]);

  const handleUnlinkCta = useCallback(() => {
    if (!ctaIsLinkedToCurrentForm) return;
    // Clear the URL so the admin can type a different one — keep the label
    // they (or the auto-fill) chose so they don't lose copy.
    setCtaButton(ctaButton ? { label: ctaButton.label, url: '' } : null);
  }, [ctaIsLinkedToCurrentForm, ctaButton]);

  // ---- Section completion (sourced from existing form state) ----
  // Completion semantics — kept aligned with `validate()` so the rail
  // never disagrees with the inline validation banner.
  const sectionCompletion = useMemo(() => {
    const gradeSections: Record<number, string[]> = audience.gradeSections ?? {};
    // A grade with at least one selected section counts; grades with empty
    // buckets do NOT count (matches the new validation rule).
    const hasAnyGradeWithSections = Object.values(gradeSections).some(
      (arr: string[]) => arr.length > 0
    );
    const audienceSelected =
      audience.roles.length > 0 ||
      audience.individualIds.length > 0 ||
      audience.campusIds.length > 0 ||
      hasAnyGradeWithSections;
    // Form section is complete only when both: a form is selected AND a
    // CTA is configured to open it.
    const ctaConfigured =
      !!ctaButton?.label?.trim() && !!ctaButton?.url?.trim();
    return {
      content: title.trim().length > 0 && shortMessage.trim().length > 0,
      channels: channels.length > 0,
      // Priority always has a value (defaults to 'normal'); we surface
      // it as "optional" rather than auto-checking it green so the
      // checks feel earned.
      priority: 'optional' as const,
      audience: audienceSelected,
      // "Send now" (sendAt === null) is a valid, complete choice; so is
      // any scheduled timestamp.
      schedule: sendAt !== undefined,
      form: attachForm && !!attachedFormId && ctaConfigured,
    };
  }, [
    title,
    shortMessage,
    channels,
    audience,
    sendAt,
    attachForm,
    attachedFormId,
    ctaButton,
  ]);

  const railSections = useMemo<AnchoringRailSection[]>(() => {
    const base: AnchoringRailSection[] = [
      {
        id: 'section-content',
        labelAr: 'المحتوى',
        labelEn: 'Content',
        icon: MessageSquareText,
        complete: sectionCompletion.content,
      },
      {
        id: 'section-channels',
        labelAr: 'القنوات',
        labelEn: 'Channels',
        icon: Radio,
        complete: sectionCompletion.channels,
      },
      {
        id: 'section-priority',
        labelAr: 'الأولوية',
        labelEn: 'Priority',
        icon: Sparkles,
        complete: sectionCompletion.priority,
      },
      {
        id: 'section-audience',
        labelAr: 'الجمهور',
        labelEn: 'Audience',
        icon: Users,
        complete: sectionCompletion.audience,
      },
      {
        id: 'section-schedule',
        labelAr: 'الجدولة',
        labelEn: 'Schedule',
        icon: Clock,
        complete: sectionCompletion.schedule,
      },
    ];
    if (attachForm) {
      base.push({
        id: 'section-form',
        labelAr: 'النموذج',
        labelEn: 'Form',
        icon: FormInput,
        complete: sectionCompletion.form,
      });
    }
    return base;
  }, [sectionCompletion, attachForm]);

  // Helper to compose the card-flash classes for a given section id.
  // Uses Tailwind ring utilities; the transition is CSS-driven.
  // Per the integration polish pass, the flash adopts the section's own
  // tone (violet/blue/amber/emerald/rose/slate) so the landing pulse
  // reads as "you've arrived at *this* section" in its own colour.
  const flashClass = (id: string) => {
    if (flashingSectionId !== id) return 'transition-shadow duration-300';
    const tokens = getSectionToneTokens(id);
    return `${tokens.flashRing} transition-shadow duration-300`;
  };

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
      attachedFormId: attachForm ? attachedFormId : null,
      interaction,
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

    // New audience validation — accepts: any role, any individual, any
    // campus, OR at least one grade with at least one selected section.
    const gradeSections: Record<number, string[]> = audience.gradeSections ?? {};
    const hasAnyGradeWithSections = Object.values(gradeSections).some(
      (arr: string[]) => arr.length > 0
    );
    const audienceOK =
      audience.roles.length > 0 ||
      audience.individualIds.length > 0 ||
      audience.campusIds.length > 0 ||
      hasAnyGradeWithSections;
    if (!audienceOK) {
      errors.push('يجب تحديد الجمهور المستهدف');
    }
    // Audience can have grades selected but with empty buckets — flag those
    // explicitly so the admin sees why they're "not done yet".
    const incompleteGrades = audience.grades.filter(
      (g) => (gradeSections[g] ?? []).length === 0
    );
    if (incompleteGrades.length > 0) {
      errors.push(
        `اختر شعبة واحدة على الأقل للصفوف: ${incompleteGrades.join('، ')}`
      );
    }

    if (attachForm) {
      if (!attachedFormId) {
        errors.push('اختر نموذجًا من المعرض أو ألغِ إرفاق النموذج');
      }
      const ctaConfigured =
        !!ctaButton?.label?.trim() && !!ctaButton?.url?.trim();
      if (attachedFormId && !ctaConfigured) {
        errors.push('النموذج مرفق ولكن زر الإجراء غير مكتمل');
      }
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
    <div
      className="h-full flex flex-col font-cairo relative bg-slate-100"
      dir="rtl"
      style={{
        backgroundImage:
          'radial-gradient(1100px 480px at 80% -120px, rgba(139, 92, 246, 0.10), transparent 60%), radial-gradient(900px 420px at 0% 110%, rgba(244, 114, 182, 0.08), transparent 55%)',
      }}
    >
      {/* Sticky top bar */}
      <div className="sticky top-0 z-30 px-6 md:px-10 lg:px-12 py-4 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              {editingId ? 'تعديل الإشعار' : 'إنشاء إشعار جديد'}
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              {editingId
                ? 'قم بتعديل الإشعار وإعادة إرساله'
                : 'قم بإنشاء إشعار وإرساله للجمهور المستهدف'}
            </p>
          </div>

          {/* Mobile preview toggle */}
          <button
            type="button"
            onClick={() => setShowPreviewMobile(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-violet-50 text-duo-purple rounded-xl text-xs font-bold hover:bg-violet-100 transition-colors"
          >
            <Eye className="w-4 h-4" />
            معاينة
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Compose Form (scrollable) */}
        <div ref={formScrollRef} className="flex-1 lg:w-[60%] overflow-y-auto">
          {/* Mobile horizontal pill bar (sticky at top of scroll container). */}
          <AnchoringRail
            variant="horizontal"
            sections={railSections}
            locale="ar"
            containerRef={formScrollRef}
            onJump={triggerSectionFlash}
          />

          <div className="px-6 md:px-10 lg:px-12 py-8 max-w-3xl">
            {/* Desktop: vertical rail on the start edge, form column beside it. */}
            <div className="flex items-start gap-6 lg:gap-8">
              <AnchoringRail
                variant="vertical"
                sections={railSections}
                locale="ar"
                containerRef={formScrollRef}
                onJump={triggerSectionFlash}
              />

              {/* Form sections column. */}
              <div className="flex-1 min-w-0 space-y-6">

            {/* Validation Errors */}
            <AnimatePresence>
              {validationErrors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-1"
                >
                  <div className="flex items-center gap-2 text-rose-600 font-bold text-sm mb-1">
                    <AlertCircle className="w-4 h-4" />
                    يرجى تصحيح الأخطاء التالية
                  </div>
                  {validationErrors.map((err, i) => (
                    <p key={i} className="text-xs font-bold text-rose-500 ps-6">
                      &bull; {err}
                    </p>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 1. Content */}
            <div
              id="section-content"
              className={`scroll-mt-24 rounded-3xl ${flashClass('section-content')}`}
            >
              <SectionCard
                icon={MessageSquareText}
                tone="violet"
                titleAr="محتوى الإشعار"
                titleEn="Content"
                subtitleAr="اكتب عنوانًا ورسالة قصيرة وأضف صورة أو زر إجراء"
                subtitleEn="Write a title and short message, add an image or CTA button"
                status={sectionCompletion.content ? 'complete' : 'incomplete'}
                locale="ar"
              >
                <ContentEditor
                  title={title}
                  shortMessage={shortMessage}
                  body={body}
                  imageUrl={imageUrl}
                  ctaButton={ctaButton}
                  onChange={handleContentChange}
                  onFocusField={setFocusedField}
                />
              </SectionCard>
            </div>

            {/* 2. Channels */}
            <div
              id="section-channels"
              className={`scroll-mt-24 rounded-3xl ${flashClass('section-channels')}`}
            >
              <SectionCard
                icon={Send}
                tone="blue"
                titleAr="قنوات التوصيل"
                titleEn="Channels"
                subtitleAr="اختر كيف يصل الإشعار للمستخدمين — يمكنك تفعيل أكثر من قناة"
                subtitleEn="Choose how the notification reaches users — multiple channels allowed"
                status={sectionCompletion.channels ? 'complete' : 'incomplete'}
                locale="ar"
              >
                <ChannelSelector selected={channels} onChange={setChannels} />
              </SectionCard>
            </div>

            {/* 3. Priority + Style */}
            <div
              id="section-priority"
              className={`scroll-mt-24 rounded-3xl ${flashClass('section-priority')}`}
            >
              <SectionCard
                icon={Sparkles}
                tone="amber"
                titleAr="الأولوية والتصميم"
                titleEn="Priority & Style"
                subtitleAr="حدّد إلحاح الإشعار، ولوّن الشريط الإعلاني عند تفعيله"
                subtitleEn="Set urgency and pick a banner color when banner is on"
                locale="ar"
              >
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-700">أولوية الإرسال</h4>
                    <p className="text-xs text-slate-400">
                      الإشعارات العاجلة تتخطّى قائمة الانتظار وتظهر فورًا
                    </p>
                    <div className="pt-1">
                      <PrioritySelector value={priority} onChange={setPriority} />
                    </div>
                  </div>
                  <AnimatePresence>
                    {channels.includes('banner') && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-5 border-t border-slate-200/70 space-y-2">
                          <h4 className="text-sm font-bold text-slate-700">
                            لون الشريط الإعلاني
                          </h4>
                          <p className="text-xs text-slate-400">
                            اختر تدرّجًا لونيًا يعكس طبيعة الرسالة
                          </p>
                          <div className="pt-1">
                            <BannerColorPicker
                              value={bannerGradient}
                              onChange={setBannerGradient}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </SectionCard>
            </div>

            {/* 4. Audience */}
            <div
              id="section-audience"
              className={`scroll-mt-24 rounded-3xl ${flashClass('section-audience')}`}
            >
              <SectionCard
                icon={Users}
                tone="emerald"
                titleAr="الجمهور المستهدف"
                titleEn="Audience"
                subtitleAr="حدّد من سيستلم هذا الإشعار حسب الدور أو الصف أو المدرسة"
                subtitleEn="Pick who receives this — by role, grade, or school"
                status={sectionCompletion.audience ? 'complete' : 'incomplete'}
                locale="ar"
              >
                <div className="space-y-5">
                  <AudienceBuilder audience={audience} onChange={setAudience} />
                  <AudiencePreview audience={audience} />
                </div>
              </SectionCard>
            </div>

            {/* 5. Schedule + Reminders */}
            <div
              id="section-schedule"
              className={`scroll-mt-24 rounded-3xl ${flashClass('section-schedule')}`}
            >
              <SectionCard
                icon={Clock}
                tone="rose"
                titleAr="الجدولة والتذكيرات"
                titleEn="Schedule & Reminders"
                subtitleAr="أرسل الآن أو اختر موعدًا، وفعّل تذكيرًا تلقائيًا لمن لم يفتح الإشعار"
                subtitleEn="Send now or pick a time, and auto-remind those who missed it"
                locale="ar"
              >
                <div className="space-y-6">
                  <SchedulePicker
                    sendAt={sendAt}
                    expiresAt={expiresAt}
                    channels={channels}
                    onChange={handleScheduleChange}
                  />

                  {/* Reminders subsection */}
                  <div className="pt-5 border-t border-slate-200/70 space-y-2">
                    <h4 className="text-sm font-bold text-slate-700">التذكيرات</h4>
                    <p className="text-xs text-slate-400">
                      أرسل تذكيرًا تلقائيًا للمستخدمين الذين لم يفتحوا الإشعار
                    </p>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-4 mt-3">
                      <button
                        type="button"
                        onClick={() => setReminderEnabled(!reminderEnabled)}
                        className="flex items-center gap-2 text-sm font-bold text-slate-700"
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                            ${reminderEnabled ? 'border-duo-purple bg-duo-purple' : 'border-slate-300 bg-white'}
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
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500">
                                  فترة التذكير
                                </label>
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
                                              ? 'border-rose-400 bg-rose-50 text-rose-700 shadow-sm'
                                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                          }
                                        `}
                                      >
                                        <div
                                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                                            ${isSelected ? 'border-rose-400' : 'border-slate-300'}
                                          `}
                                        >
                                          {isSelected && (
                                            <motion.div
                                              initial={{ scale: 0 }}
                                              animate={{ scale: 1 }}
                                              className="w-2 h-2 rounded-full bg-rose-500"
                                            />
                                          )}
                                        </div>
                                        <span>{option.label}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

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

                  {/* Interaction Options — recipient-side defer affordances */}
                  <div className="pt-5 border-t border-slate-200/70 space-y-2">
                    <h4 className="text-sm font-bold text-slate-700">
                      خيارات التفاعل
                      <span className="mx-1.5 text-slate-300">·</span>
                      <span className="text-[10px] font-medium not-italic text-slate-400">
                        Interaction Options
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      أعطِ المستلم خيارات لتأجيل الإجراء أو حفظه لمهامه عندما لا
                      يستطيع التنفيذ الآن
                    </p>
                    <div className="pt-2">
                      <InteractionOptions
                        value={interaction}
                        onChange={setInteraction}
                      />
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* 6. Form Attachment */}
            <div
              id="section-form"
              className={`scroll-mt-24 rounded-3xl ${flashClass('section-form')}`}
            >
              <SectionCard
                icon={FormInput}
                tone="slate"
                titleAr="نموذج مرفق"
                titleEn="Form Attachment"
                subtitleAr="ربط نموذج لتلقّي ردود من المستخدمين عند فتح الإشعار"
                subtitleEn="Attach a form to collect replies from users"
                status={attachForm ? (sectionCompletion.form ? 'complete' : 'incomplete') : undefined}
                statusLabel={
                  attachForm
                    ? sectionCompletion.form
                      ? { ar: 'مرفق ومرتبط', en: 'Attached & linked' }
                      : { ar: 'يحتاج زر إجراء', en: 'Needs action button' }
                    : undefined
                }
                locale="ar"
              >
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => {
                      const next = !attachForm;
                      setAttachForm(next);
                      if (!next) {
                        // Detaching — drop the form id and unlink the CTA if
                        // it was wired to the form's deep link.
                        if (
                          attachedFormId &&
                          ctaButton?.url === buildFormDeepLink(attachedFormId)
                        ) {
                          setCtaButton(
                            ctaButton ? { label: ctaButton.label, url: '' } : null
                          );
                        }
                        setAttachedFormId(null);
                        previousFormIdRef.current = null;
                      }
                    }}
                    className="flex items-center gap-2 text-sm font-bold text-slate-700"
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                        ${attachForm ? 'border-duo-purple bg-duo-purple' : 'border-slate-300 bg-white'}
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
                        <div className="space-y-4">
                          <FormPicker
                            selectedFormId={attachedFormId}
                            onChange={setAttachedFormId}
                            ctaLinked={ctaIsLinkedToCurrentForm}
                          />

                          {/* CTA link / unlink affordance */}
                          {attachedFormId && (
                            <div
                              className={`rounded-xl border p-3 flex items-center gap-2 transition-colors ${
                                ctaIsLinkedToCurrentForm
                                  ? 'border-violet-200 bg-violet-50/60'
                                  : 'border-slate-200 bg-slate-50/60'
                              }`}
                            >
                              {ctaIsLinkedToCurrentForm ? (
                                <Link2 className="w-4 h-4 text-violet-500 shrink-0" />
                              ) : (
                                <Unlink className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                              <p
                                className={`text-[11px] font-bold flex-1 ${
                                  ctaIsLinkedToCurrentForm
                                    ? 'text-violet-700'
                                    : 'text-slate-500'
                                }`}
                              >
                                {ctaIsLinkedToCurrentForm
                                  ? 'زر الإجراء مرتبط بهذا النموذج'
                                  : 'زر الإجراء غير مرتبط بهذا النموذج'}
                              </p>
                              {ctaIsLinkedToCurrentForm ? (
                                <button
                                  type="button"
                                  onClick={handleUnlinkCta}
                                  className="text-[11px] font-bold text-violet-600 hover:text-violet-800 bg-white hover:bg-violet-100 border border-violet-200 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1"
                                >
                                  <Unlink className="w-3 h-3" />
                                  فك الربط
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleAutoFillCta}
                                  className="text-[11px] font-bold text-violet-700 hover:text-white bg-white hover:bg-violet-500 border border-violet-300 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1"
                                >
                                  <Wand2 className="w-3 h-3" />
                                  ربط الزر تلقائيًا
                                </button>
                              )}
                            </div>
                          )}

                          {/* Form-attached-but-no-CTA warning */}
                          <AnimatePresence>
                            {attachForm &&
                              attachedFormId &&
                              !sectionCompletion.form && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 space-y-2 shadow-sm shadow-amber-500/10">
                                    <div className="flex items-start gap-2">
                                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                      <p className="text-xs font-bold text-amber-800 leading-relaxed flex-1">
                                        النموذج مرفق ولكن لا يوجد زر يفتحه — أضف زر
                                        إجراء أو سيصعب على المستلم الوصول للنموذج.
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={handleAutoFillCta}
                                      className="ms-6 inline-flex items-center gap-1.5 text-xs font-black text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg transition-colors shadow-sm shadow-amber-500/20"
                                    >
                                      <Wand2 className="w-3 h-3" />
                                      أضف زر تلقائيًا · Auto-add button
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                          </AnimatePresence>

                          {/* No form selected hint */}
                          {!attachedFormId && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-500 flex items-center gap-2">
                              <Hand className="w-4 h-4 shrink-0 text-slate-400" />
                              اختر نموذجًا من المعرض في الأعلى لإكمال الإرفاق
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </SectionCard>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-6 pb-8">
              {/* Send */}
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-bold text-sm shadow-md shadow-violet-500/25 hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
                className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                حفظ كمسودة
              </button>

              {/* Save Template */}
              <button
                type="button"
                onClick={() => setShowTemplateNameModal(true)}
                className="flex items-center gap-2 px-5 py-3 text-slate-500 rounded-xl font-bold text-sm hover:bg-white/60 transition-colors"
              >
                <FileText className="w-4 h-4" />
                حفظ كقالب
              </button>
            </div>
              </div>
              {/* /form sections column */}
            </div>
            {/* /rail + form flex row */}
          </div>
        </div>

        {/* Right: Preview Panel (desktop) — thin divider, transparent so the
            page wash from the parent flows through and the form column +
            preview pane read as one continuous canvas. Logical padding
            (ps-8 pe-6 py-8) keeps the device frame off the divider in
            both LTR and RTL. */}
        <div className="hidden lg:block lg:w-[40%] border-s border-slate-200 overflow-y-auto">
          <div className="ps-8 pe-6 py-8 sticky top-0">
            <div className="flex items-center gap-2 mb-5">
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
              focusedField={focusedField}
              attachedFormId={attachForm ? attachedFormId : null}
              interaction={interaction}
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
                  <Eye className="w-4 h-4 text-duo-purple" />
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
                  focusedField={focusedField}
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
                    <FileText className="w-5 h-5 text-duo-purple" />
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
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-duo-purple/30 focus:border-duo-purple transition"
                    dir="rtl"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleSaveTemplate}
                    disabled={!templateName.trim()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-bold text-sm shadow-md shadow-violet-500/25 hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
