// Phone App onboarding — v1 mock data
// Deterministic via a seeded LCG so visuals never shift between renders/loads.

function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const phoneAppRng = createRng(2026_04_27);

export interface PainPoint {
  id: string;
  ar: string;
  en: string;
}

export const PARENT_PAINS: PainPoint[] = [
  {
    id: 'visibility',
    ar: 'لا أعرف ماذا يتعلم طفلي في المدرسة',
    en: "I don't know what my child is learning at school",
  },
  {
    id: 'comprehension',
    ar: 'لا أستطيع التأكد من أن طفلي يفهم المادة',
    en: "I can't tell if my child actually understands the material",
  },
  {
    id: 'time',
    ar: 'ليس لدي وقت لأجلس معه كل ليلة',
    en: "I don't have time to sit with them every night",
  },
  {
    id: 'announcements',
    ar: 'أفوّت إعلانات المدرسة والمواعيد',
    en: 'I miss school announcements and deadlines',
  },
];

export const STUDENT_PAINS: PainPoint[] = [
  {
    id: 'forget',
    ar: 'أنسى ما تعلمته في اليوم التالي',
    en: 'I forget what I learned the next day',
  },
  {
    id: 'focus',
    ar: 'لا أعرف على ماذا أركز للاختبار القادم',
    en: "I don't know what to focus on for my next test",
  },
  {
    id: 'lonely',
    ar: 'أشعر بالملل عندما أدرس وحدي',
    en: 'I get bored studying alone',
  },
  {
    id: 'behind',
    ar: 'أشعر بأنني متأخر عن زملائي',
    en: "I'm falling behind my classmates",
  },
];

export interface MasteryRing {
  subjectAr: string;
  subjectEn: string;
  percent: number;
}

export const WEEKLY_SUMMARY_MOCK = {
  childPlaceholder: { ar: '[طفلك]', en: '[your child]' },
  rings: [
    { subjectAr: 'الرياضيات', subjectEn: 'Math',     percent: 78 },
    { subjectAr: 'العلوم',     subjectEn: 'Science',  percent: 92 },
    { subjectAr: 'العربية',     subjectEn: 'Arabic',   percent: 65 },
    { subjectAr: 'الإنجليزية', subjectEn: 'English',  percent: 84 },
  ] as MasteryRing[],
  topicToAsk:    { ar: 'الكسور المركبة', en: 'Compound fractions' },
  winToCelebrate:{ ar: '15 درس متتالٍ',   en: '15-day streak' },
};
