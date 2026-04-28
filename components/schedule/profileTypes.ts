// profileTypes.ts
// Types for the new Profile + To-Do tabs of the Schedule module.
// In-memory only — nothing here is persisted.

import type { SubjectKey } from './scheduleTypes';

export type LanguageOption = 'ar' | 'en' | 'fr' | 'es' | 'de';

export type ClassSizeComfort = 'small' | 'medium' | 'large';

export type TeachingStyleTag =
  | 'collaborative'
  | 'lecture'
  | 'project'
  | 'flipped'
  | 'inquiry';

/**
 * Full profile payload for a single teacher. All fields are optional from a UX
 * standpoint (teacher can leave them blank) but always present on the object
 * to keep the controlled-input model clean.
 */
export interface ProfileData {
  // Basic
  photoDataUrl: string;          // empty string = no photo
  displayNameAr: string;
  displayNameEn: string;
  yearsOfExperience: string;     // kept as string so <input type="number"> clears cleanly
  university: string;
  major: string;
  subjectsTaught: SubjectKey[];
  bio: string;

  // Contact
  phone: string;
  email: string;
  officeHours: string;

  // Credentials
  certifications: string[];      // tag list
  languages: LanguageOption[];
  hireDate: string;              // ISO yyyy-mm-dd

  // Teaching preferences
  preferredPeriods: number[];    // 0..6 (slot indices)
  classSizeComfort: ClassSizeComfort | '';
  teachingStyles: TeachingStyleTag[];
}

/** Empty/default profile — used when a teacher is first selected. */
export function emptyProfile(displayNameAr = '', displayNameEn = ''): ProfileData {
  return {
    photoDataUrl: '',
    displayNameAr,
    displayNameEn,
    yearsOfExperience: '',
    university: '',
    major: '',
    subjectsTaught: [],
    bio: '',
    phone: '',
    email: '',
    officeHours: '',
    certifications: [],
    languages: [],
    hireDate: '',
    preferredPeriods: [],
    classSizeComfort: '',
    teachingStyles: [],
  };
}

/**
 * Dirty check for the teacher-switch confirm: returns true if ANY field
 * diverges from the default for the given teacher's pre-filled names.
 */
export function isProfileDirty(
  profile: ProfileData,
  baselineNameAr: string,
  baselineNameEn: string,
): boolean {
  if (profile.photoDataUrl) return true;
  if (profile.displayNameAr !== baselineNameAr) return true;
  if (profile.displayNameEn !== baselineNameEn) return true;
  if (profile.yearsOfExperience) return true;
  if (profile.university) return true;
  if (profile.major) return true;
  if (profile.subjectsTaught.length > 0) return true;
  if (profile.bio) return true;
  if (profile.phone) return true;
  if (profile.email) return true;
  if (profile.officeHours) return true;
  if (profile.certifications.length > 0) return true;
  if (profile.languages.length > 0) return true;
  if (profile.hireDate) return true;
  if (profile.preferredPeriods.length > 0) return true;
  if (profile.classSizeComfort) return true;
  if (profile.teachingStyles.length > 0) return true;
  return false;
}

// ─── To-Do ──────────────────────────────────────────────────────────────────

export type TodoSource = 'auto' | 'manual';

export interface TodoItem {
  id: string;
  label: string;
  done: boolean;
  source: TodoSource;
}
