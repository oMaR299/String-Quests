// ProfileTab.tsx
// Teacher profile form. Four section cards: Basic, Contact, Credentials,
// Teaching Preferences. In-memory state (ProfileData) lives in
// useProfileState — this tab is purely controlled presentation.

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  UserCircle2,
  Phone as PhoneIcon,
  GraduationCap,
  Award,
  X,
  Pencil,
  Check,
  Mail,
  Clock,
  Languages,
  CalendarDays,
  Sparkles,
  Users,
} from 'lucide-react';
import type { ProfileData } from './profileTypes';
import {
  LANGUAGE_OPTIONS,
  CLASS_SIZE_OPTIONS,
  TEACHING_STYLE_OPTIONS,
  SUBJECT_LABELS,
  languageLabel,
  classSizeLabel,
  teachingStyleLabel,
  subjectLabel,
  profileSectionBasicLabel,
  profileSectionContactLabel,
  profileSectionCredentialsLabel,
  profileSectionPreferencesLabel,
  profileSectionBasicSubtitle,
  profileSectionContactSubtitle,
  profileSectionCredentialsSubtitle,
  profileSectionPreferencesSubtitle,
  profileFieldPhotoLabel,
  profileFieldChangePhotoLabel,
  profileFieldDisplayNameArLabel,
  profileFieldDisplayNameEnLabel,
  profileFieldExperienceLabel,
  profileFieldUniversityLabel,
  profileFieldMajorLabel,
  profileFieldSubjectsLabel,
  profileFieldBioLabel,
  profileFieldPhoneLabel,
  profileFieldEmailLabel,
  profileFieldOfficeHoursLabel,
  profileFieldCertificationsLabel,
  profileFieldCertificationsHint,
  profileFieldLanguagesLabel,
  profileFieldHireDateLabel,
  profileFieldPreferredPeriodsLabel,
  profileFieldClassSizeLabel,
  profileFieldTeachingStylesLabel,
  profileEditLabel,
  profileDoneLabel,
  profilePlaceholderText,
  periodLabelShort,
  type Locale,
} from './scheduleI18n';
import type { SubjectKey } from './scheduleTypes';

interface ProfileTabProps {
  profile: ProfileData;
  locale: Locale;
  setField: <K extends keyof ProfileData>(field: K, value: ProfileData[K]) => void;
  setPhoto: (dataUrl: string) => void;
}

const SUBJECT_KEYS = Object.keys(SUBJECT_LABELS) as SubjectKey[];

/* ─── Shared UI primitives ──────────────────────────────────────────────── */

function SectionCard({
  title,
  subtitle,
  icon: Icon,
  children,
  editMode,
}: {
  title: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
  children: React.ReactNode;
  editMode: boolean;
}) {
  return (
    <section
      className={`rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-sm p-6 transition-all ${
        editMode ? 'ring-1 ring-duo-purple/20' : ''
      }`}
    >
      <header className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-base font-black text-slate-900 leading-none tracking-tight">
            {title}
          </h2>
          <p className="mt-1 text-[11px] font-bold text-violet-500 uppercase tracking-widest">
            {subtitle}
          </p>
        </div>
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  readOnly,
  dir,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
  dir?: 'ltr' | 'rtl';
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      dir={dir}
      className={`w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-duo-purple/40 focus:border-duo-purple placeholder:text-slate-400 transition ${
        readOnly ? 'bg-slate-50 cursor-default' : ''
      }`}
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  readOnly,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      rows={4}
      className={`w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-duo-purple/40 focus:border-duo-purple placeholder:text-slate-400 transition resize-none ${
        readOnly ? 'bg-slate-50 cursor-default' : ''
      }`}
    />
  );
}

interface PillToggleProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

const PillToggle: React.FC<PillToggleProps> = ({ active, onClick, children, disabled }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all border ${
        active
          ? 'bg-duo-purple-light text-[#8B3FD6] border-duo-purple/30 shadow-sm'
          : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

/* ─── Main component ────────────────────────────────────────────────────── */

export function ProfileTab({ profile, locale, setField, setPhoto }: ProfileTabProps) {
  const [editMode, setEditMode] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [certDraft, setCertDraft] = useState('');

  const isRTL = locale === 'ar';
  const readOnly = !editMode;

  const handlePhotoClick = () => {
    if (!editMode) return;
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
    // Reset the input so selecting the same file twice still fires onChange.
    e.target.value = '';
  };

  /* ─── Toggle helpers ──────────────────────────────────────────────── */

  const toggleSubject = (s: SubjectKey) => {
    const next = profile.subjectsTaught.includes(s)
      ? profile.subjectsTaught.filter(x => x !== s)
      : [...profile.subjectsTaught, s];
    setField('subjectsTaught', next);
  };

  const toggleLanguage = (l: typeof LANGUAGE_OPTIONS[number]) => {
    const next = profile.languages.includes(l)
      ? profile.languages.filter(x => x !== l)
      : [...profile.languages, l];
    setField('languages', next);
  };

  const togglePeriod = (p: number) => {
    const next = profile.preferredPeriods.includes(p)
      ? profile.preferredPeriods.filter(x => x !== p)
      : [...profile.preferredPeriods, p];
    setField('preferredPeriods', next);
  };

  const toggleStyle = (s: typeof TEACHING_STYLE_OPTIONS[number]) => {
    const next = profile.teachingStyles.includes(s)
      ? profile.teachingStyles.filter(x => x !== s)
      : [...profile.teachingStyles, s];
    setField('teachingStyles', next);
  };

  const addCertification = () => {
    const trimmed = certDraft.trim();
    if (!trimmed) return;
    if (profile.certifications.includes(trimmed)) {
      setCertDraft('');
      return;
    }
    setField('certifications', [...profile.certifications, trimmed]);
    setCertDraft('');
  };

  const removeCertification = (tag: string) => {
    setField(
      'certifications',
      profile.certifications.filter(c => c !== tag),
    );
  };

  const handleCertKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addCertification();
    }
  };

  /* ─── Render ──────────────────────────────────────────────────────── */

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="max-w-6xl mx-auto"
    >
      {/* Edit / Done toggle */}
      <div className="flex items-center justify-end mb-4">
        <button
          type="button"
          onClick={() => setEditMode(m => !m)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white/80 backdrop-blur text-xs font-bold text-slate-600 hover:border-duo-purple/40 hover:text-[#8B3FD6] transition"
        >
          {editMode ? (
            <>
              <Check className="w-4 h-4" />
              <span>{profileDoneLabel(locale)}</span>
            </>
          ) : (
            <>
              <Pencil className="w-4 h-4" />
              <span>{profileEditLabel(locale)}</span>
            </>
          )}
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(300px,380px)_1fr]">
        {/* ─── Left column ───────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Avatar card */}
          <section className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-sm p-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <button
                  type="button"
                  onClick={handlePhotoClick}
                  className="relative w-32 h-32 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 ring-4 ring-white shadow-lg flex items-center justify-center overflow-hidden group"
                  aria-label={profileFieldChangePhotoLabel(locale)}
                >
                  {profile.photoDataUrl ? (
                    <img
                      src={profile.photoDataUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircle2 className="w-16 h-16 text-violet-400" />
                  )}
                  {editMode && (
                    <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <Camera className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  )}
                </button>
                {editMode && (
                  <span className="absolute -bottom-1 -end-1 w-9 h-9 rounded-full bg-duo-purple text-white flex items-center justify-center shadow-md shadow-violet-500/30 pointer-events-none">
                    <Camera className="w-4 h-4" />
                  </span>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
              <div>
                <p className="text-lg font-black text-slate-900 tracking-tight">
                  {isRTL
                    ? profile.displayNameAr || '—'
                    : profile.displayNameEn || '—'}
                </p>
                <p className="mt-1 text-[11px] font-bold text-violet-500 uppercase tracking-widest">
                  {profileFieldPhotoLabel(locale)}
                </p>
              </div>
            </div>
          </section>

          {/* Basic section */}
          <SectionCard
            title={profileSectionBasicLabel(locale)}
            subtitle={profileSectionBasicSubtitle(locale)}
            icon={UserCircle2}
            editMode={editMode}
          >
            <div className="grid grid-cols-1 gap-3">
              <div>
                <FieldLabel>{profileFieldDisplayNameArLabel(locale)}</FieldLabel>
                <TextInput
                  value={profile.displayNameAr}
                  onChange={v => setField('displayNameAr', v)}
                  readOnly={readOnly}
                  dir="rtl"
                />
              </div>
              <div>
                <FieldLabel>{profileFieldDisplayNameEnLabel(locale)}</FieldLabel>
                <TextInput
                  value={profile.displayNameEn}
                  onChange={v => setField('displayNameEn', v)}
                  readOnly={readOnly}
                  dir="ltr"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>{profileFieldExperienceLabel(locale)}</FieldLabel>
                  <TextInput
                    value={profile.yearsOfExperience}
                    onChange={v => setField('yearsOfExperience', v.replace(/[^0-9]/g, ''))}
                    readOnly={readOnly}
                    type="number"
                  />
                </div>
                <div>
                  <FieldLabel>{profileFieldHireDateLabel(locale)}</FieldLabel>
                  <TextInput
                    value={profile.hireDate}
                    onChange={v => setField('hireDate', v)}
                    readOnly={readOnly}
                    type="date"
                  />
                </div>
              </div>
              <div>
                <FieldLabel>{profileFieldUniversityLabel(locale)}</FieldLabel>
                <TextInput
                  value={profile.university}
                  onChange={v => setField('university', v)}
                  placeholder={profilePlaceholderText(locale, 'university')}
                  readOnly={readOnly}
                />
              </div>
              <div>
                <FieldLabel>{profileFieldMajorLabel(locale)}</FieldLabel>
                <TextInput
                  value={profile.major}
                  onChange={v => setField('major', v)}
                  placeholder={profilePlaceholderText(locale, 'major')}
                  readOnly={readOnly}
                />
              </div>
              <div>
                <FieldLabel>{profileFieldSubjectsLabel(locale)}</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {SUBJECT_KEYS.map(s => (
                    <PillToggle
                      key={s}
                      active={profile.subjectsTaught.includes(s)}
                      onClick={() => toggleSubject(s)}
                      disabled={readOnly}
                    >
                      {subjectLabel(s, locale)}
                    </PillToggle>
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel>{profileFieldBioLabel(locale)}</FieldLabel>
                <TextArea
                  value={profile.bio}
                  onChange={v => setField('bio', v)}
                  placeholder={profilePlaceholderText(locale, 'bio')}
                  readOnly={readOnly}
                />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ─── Right column ──────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Contact */}
          <SectionCard
            title={profileSectionContactLabel(locale)}
            subtitle={profileSectionContactSubtitle(locale)}
            icon={PhoneIcon}
            editMode={editMode}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <FieldLabel>
                  <span className="inline-flex items-center gap-1.5">
                    <PhoneIcon className="w-3 h-3" />
                    {profileFieldPhoneLabel(locale)}
                  </span>
                </FieldLabel>
                <TextInput
                  value={profile.phone}
                  onChange={v => setField('phone', v)}
                  placeholder={profilePlaceholderText(locale, 'phone')}
                  readOnly={readOnly}
                  type="tel"
                  dir="ltr"
                />
              </div>
              <div>
                <FieldLabel>
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="w-3 h-3" />
                    {profileFieldEmailLabel(locale)}
                  </span>
                </FieldLabel>
                <TextInput
                  value={profile.email}
                  onChange={v => setField('email', v)}
                  placeholder={profilePlaceholderText(locale, 'email')}
                  readOnly={readOnly}
                  type="email"
                  dir="ltr"
                />
              </div>
              <div className="md:col-span-2">
                <FieldLabel>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {profileFieldOfficeHoursLabel(locale)}
                  </span>
                </FieldLabel>
                <TextInput
                  value={profile.officeHours}
                  onChange={v => setField('officeHours', v)}
                  placeholder={profilePlaceholderText(locale, 'officeHours')}
                  readOnly={readOnly}
                />
              </div>
            </div>
          </SectionCard>

          {/* Credentials */}
          <SectionCard
            title={profileSectionCredentialsLabel(locale)}
            subtitle={profileSectionCredentialsSubtitle(locale)}
            icon={GraduationCap}
            editMode={editMode}
          >
            <div className="space-y-4">
              {/* Certifications tag input */}
              <div>
                <FieldLabel>
                  <span className="inline-flex items-center gap-1.5">
                    <Award className="w-3 h-3" />
                    {profileFieldCertificationsLabel(locale)}
                  </span>
                </FieldLabel>
                {profile.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profile.certifications.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 rounded-full bg-duo-purple-light text-[#8B3FD6] border border-duo-purple/30 px-3 py-1 text-xs font-semibold"
                      >
                        <span>{tag}</span>
                        {!readOnly && (
                          <button
                            type="button"
                            onClick={() => removeCertification(tag)}
                            className="rounded-full hover:bg-white/50 p-0.5 transition"
                            aria-label="remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                )}
                {!readOnly && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={certDraft}
                      onChange={e => setCertDraft(e.target.value)}
                      onKeyDown={handleCertKey}
                      placeholder={profilePlaceholderText(locale, 'addCert')}
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-duo-purple/40 focus:border-duo-purple placeholder:text-slate-400 transition"
                    />
                    <button
                      type="button"
                      onClick={addCertification}
                      className="rounded-xl bg-duo-purple text-white px-4 py-2 text-sm font-bold shadow-sm hover:shadow-md hover:brightness-105 transition"
                    >
                      +
                    </button>
                  </div>
                )}
                <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {profileFieldCertificationsHint(locale)}
                </p>
              </div>

              {/* Languages */}
              <div>
                <FieldLabel>
                  <span className="inline-flex items-center gap-1.5">
                    <Languages className="w-3 h-3" />
                    {profileFieldLanguagesLabel(locale)}
                  </span>
                </FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map(l => (
                    <PillToggle
                      key={l}
                      active={profile.languages.includes(l)}
                      onClick={() => toggleLanguage(l)}
                      disabled={readOnly}
                    >
                      {languageLabel(l, locale)}
                    </PillToggle>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Teaching preferences */}
          <SectionCard
            title={profileSectionPreferencesLabel(locale)}
            subtitle={profileSectionPreferencesSubtitle(locale)}
            icon={Sparkles}
            editMode={editMode}
          >
            <div className="space-y-4">
              <div>
                <FieldLabel>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="w-3 h-3" />
                    {profileFieldPreferredPeriodsLabel(locale)}
                  </span>
                </FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {[0, 1, 2, 3, 4, 5, 6].map(p => (
                    <PillToggle
                      key={p}
                      active={profile.preferredPeriods.includes(p)}
                      onClick={() => togglePeriod(p)}
                      disabled={readOnly}
                    >
                      {periodLabelShort(p, locale)}
                    </PillToggle>
                  ))}
                </div>
              </div>

              <div>
                <FieldLabel>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="w-3 h-3" />
                    {profileFieldClassSizeLabel(locale)}
                  </span>
                </FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {CLASS_SIZE_OPTIONS.map(s => (
                    <PillToggle
                      key={s}
                      active={profile.classSizeComfort === s}
                      onClick={() =>
                        setField('classSizeComfort', profile.classSizeComfort === s ? '' : s)
                      }
                      disabled={readOnly}
                    >
                      {classSizeLabel(s, locale)}
                    </PillToggle>
                  ))}
                </div>
              </div>

              <div>
                <FieldLabel>{profileFieldTeachingStylesLabel(locale)}</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {TEACHING_STYLE_OPTIONS.map(s => (
                    <PillToggle
                      key={s}
                      active={profile.teachingStyles.includes(s)}
                      onClick={() => toggleStyle(s)}
                      disabled={readOnly}
                    >
                      {teachingStyleLabel(s, locale)}
                    </PillToggle>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </motion.div>
  );
}

export default ProfileTab;
