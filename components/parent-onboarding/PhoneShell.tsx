// PhoneShell.tsx (parent-onboarding)
// ─────────────────────────────────────────────────────────────────────────────
// Re-exports the shared shell from `components/shared/PhoneShell.tsx`. The
// shell was lifted up so both the Parent Onboarding flow AND the post-
// onboarding Parent App can share one recipe. New code should import from
// the shared path; this file remains as a back-compat alias for existing
// onboarding screens that import './PhoneShell'.

export { PhoneShell, default } from '../shared/PhoneShell';
