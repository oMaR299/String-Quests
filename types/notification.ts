// ==================== Notification Center Types ====================

// --- Channels & Status ---

export type NotificationChannel = 'email' | 'bell' | 'popup' | 'banner';

export type NotificationStatus = 'draft' | 'scheduled' | 'sent' | 'expired' | 'cancelled';

export type NotificationPriority = 'normal' | 'urgent';

// --- Channel Configs ---

export interface EmailConfig {
  senderName: string;
  headerImageUrl?: string;
  ctaButton?: { label: string; url: string };
  footerText?: string;
}

export interface BellConfig {
  icon?: string; // Lucide icon name
  actionUrl?: string;
}

export interface PopupConfig {
  size: 'sm' | 'md' | 'lg';
  dismissible: boolean;
  imageUrl?: string;
  primaryButton?: { label: string; url: string };
  dismissLabel?: string;
}

export interface BannerConfig {
  bgGradient: string; // Tailwind gradient or hex color
  textColor: string;
  dismissible: boolean;
  actionButton?: { label: string; url: string };
}

// --- Audience Targeting ---

export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';

export interface AudienceTarget {
  roles: UserRole[];
  grades: number[];
  /**
   * Per-grade section selection — keys are grade numbers, values are arrays
   * of section letters targeted *for that grade*. Lets the admin express
   * "Grade 1 → A, B + Grade 2 → C, D" without sections leaking globally.
   *
   * Backward-compat: when the older flat `sections` field is present and
   * `gradeSections` is empty, AudienceBuilder migrates the flat array into
   * every selected grade's bucket on first interaction.
   */
  gradeSections?: Record<number, string[]>;
  /** @deprecated — use `gradeSections` instead. Kept for migration only. */
  sections: string[];
  campusIds: string[];
  individualIds: string[];
  savedAudienceId?: string;
}

export interface SavedAudience {
  id: string;
  name: string;
  nameEn?: string;
  target: AudienceTarget;
  estimatedCount: number;
  createdAt: string;
}

// --- Forms ---

export type FormFieldType =
  | 'short-text'
  | 'long-text'
  | 'single-choice'
  | 'multiple-choice'
  | 'number'
  | 'date'
  | 'file-upload'
  | 'yes-no';

export interface FormFieldOption {
  id: string;
  label: string;
  labelEn?: string;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  labelEn?: string;
  helpText?: string;
  required: boolean;
  options?: FormFieldOption[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  order: number;
}

export interface FormDefinition {
  id: string;
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  fields: FormField[];
  deadline?: string; // ISO timestamp
  isActive: boolean;
  notificationId?: string;
  createdAt: string;
  updatedAt: string;
  responseCount: number;
}

export interface FormResponse {
  id: string;
  formId: string;
  respondentId: string;
  respondentName: string;
  respondentRole: UserRole;
  respondentGrade?: number;
  respondentSection?: string;
  answers: Record<string, string | string[] | number | boolean>;
  submittedAt: string;
}

// --- Templates ---

export type TemplateCategory =
  | 'academic'
  | 'administrative'
  | 'event'
  | 'emergency'
  | 'celebration'
  | 'custom';

export interface NotificationTemplate {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  category: TemplateCategory;
  channels: NotificationChannel[];
  title: string;
  titleEn?: string;
  body: string;
  bodyEn?: string;
  shortMessage?: string;
  shortMessageEn?: string;
  channelConfig: {
    email?: Partial<EmailConfig>;
    bell?: Partial<BellConfig>;
    popup?: Partial<PopupConfig>;
    banner?: Partial<BannerConfig>;
  };
  attachedFormFields?: FormField[];
  isSystem: boolean;
  usageCount: number;
  createdAt: string;
}

// --- Interaction Options (recipient-side defer affordances) ---

export type SnoozeOption = '1h' | '3h' | 'tomorrow' | '3d' | 'custom';
export type DeadlineReminderInterval = '1h' | '1d' | '1w';

export interface NotificationInteraction {
  /** When true, recipient may snooze this notification. */
  allowSnooze: boolean;
  /** Which snooze choices the school enables for the student. */
  snoozeOptions: SnoozeOption[];
  /** When true, surfaces an "add to my to-dos" affordance for the student. */
  allowAddToTasks: boolean;
  /** Optional ISO datetime — when set, "reminder before deadline" is shown. */
  deadlineAt: string | null;
  /** Which "before deadline" reminder intervals the school enables. */
  reminderBeforeDeadline: DeadlineReminderInterval[];
}

export const DEFAULT_INTERACTION: NotificationInteraction = {
  allowSnooze: true,
  snoozeOptions: ['1h', 'tomorrow'],
  allowAddToTasks: true,
  deadlineAt: null,
  reminderBeforeDeadline: ['1d'],
};

// --- Delivery Analytics ---

export interface ChannelStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
  bounced: number;
  dismissed: number;
}

export interface DeliveryStats {
  notificationId: string;
  totalTargeted: number;
  channels: Partial<Record<NotificationChannel, ChannelStats>>;
  hourlyOpens: { hour: string; count: number }[];
  byRole: { role: UserRole; count: number; openRate: number }[];
}

// --- Core Notification ---

export interface Notification {
  id: string;
  title: string;
  titleEn?: string;
  shortMessage: string;
  shortMessageEn?: string;
  body: string;
  bodyEn?: string;
  channels: NotificationChannel[];
  priority: NotificationPriority;
  status: NotificationStatus;

  audience: AudienceTarget;
  estimatedReach: number;

  sendAt: string | null; // null = send immediately
  expiresAt?: string;

  channelConfig: {
    email?: EmailConfig;
    bell?: BellConfig;
    popup?: PopupConfig;
    banner?: BannerConfig;
  };

  imageUrl?: string;
  ctaButton?: { label: string; url: string };
  attachedFormId?: string | null;

  /**
   * Recipient-side interaction options. Sender opts the notification into
   * "do it later" affordances (snooze, add-to-tasks, deadline reminders)
   * so students can defer when they can't act on a request immediately.
   */
  interaction?: NotificationInteraction;

  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  templateId?: string;
  tags: string[];

  deliveryStats?: DeliveryStats;
}

// --- User Directory ---

export interface DirectoryUser {
  id: string;
  name: string;
  nameEn?: string;
  email: string;
  role: UserRole;
  gradeLevel?: number;
  section?: string;
  campusId: string;
}

// --- State ---

export interface NotificationState {
  notifications: Notification[];
  templates: NotificationTemplate[];
  savedAudiences: SavedAudience[];
  forms: FormDefinition[];
  formResponses: FormResponse[];
  activeDraft: Partial<Notification> | null;
}

export type NotificationAction =
  | { type: 'SEND_NOTIFICATION'; payload: Notification }
  | { type: 'SAVE_DRAFT'; payload: Notification }
  | { type: 'UPDATE_DRAFT'; payload: Partial<Notification> & { id: string } }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'DUPLICATE_NOTIFICATION'; payload: string }
  | { type: 'CANCEL_NOTIFICATION'; payload: string }
  | { type: 'SAVE_TEMPLATE'; payload: NotificationTemplate }
  | { type: 'DELETE_TEMPLATE'; payload: string }
  | { type: 'SAVE_AUDIENCE'; payload: SavedAudience }
  | { type: 'DELETE_AUDIENCE'; payload: string }
  | { type: 'SAVE_FORM'; payload: FormDefinition }
  | { type: 'DELETE_FORM'; payload: string }
  | { type: 'ADD_FORM_RESPONSE'; payload: FormResponse }
  | { type: 'SET_ACTIVE_DRAFT'; payload: Partial<Notification> | null }
  | { type: 'LOAD_STATE'; payload: NotificationState };
