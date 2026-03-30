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
  attachedFormId?: string;

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
