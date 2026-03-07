#!/usr/bin/env npx tsx
/**
 * build-curriculum.ts
 *
 * Reads all 13 raw JSON files from data/curricula/ and generates
 * data/curricula/mathCurriculum.ts — a fully typed CurriculumFramework
 * export with ~2 000 Knowledge Components.
 *
 * Run:  npx tsx scripts/build-curriculum.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ────────────────────────────────────────────────────────────────
// 1. Types (mirrors data/curricula/types.ts at runtime)
// ────────────────────────────────────────────────────────────────
type BloomLevel = 1 | 2 | 3 | 4 | 5 | 6;
type Difficulty = 1 | 2 | 3 | 4 | 5;

interface RawLearningOutcome {
  outcomeAr: string;
  indicators: string[];
}
interface RawStandard {
  nameAr: string;
  nameEn: string;
  axis?: string;
  learningOutcomes: RawLearningOutcome[];
}
interface RawDomain {
  nameAr: string;
  nameEn: string;
  standards: RawStandard[];
}
interface RawGrade {
  gradeLevel: number;
  subject: string;
  subjectEn: string;
  sourcePages?: string;
  domains: RawDomain[];
}

// ────────────────────────────────────────────────────────────────
// 2. Bloom-level inference from Arabic verb stems
// ────────────────────────────────────────────────────────────────
const BLOOM_VERBS: [RegExp, BloomLevel][] = [
  // 6 – Create
  [/^(يبتكر|يصمم|يصمّم|ينشئ|ينشِئ|يؤلف|يؤلّف)/, 6],
  // 5 – Evaluate
  [/^(يقيم|يقيّم|يحكم|يتحقق|يتحقّق|يبرهن)/, 5],
  // 4 – Analyze
  [/^(يحلل|يحلّل|يبرر|يبرّر|يفسر|يفسّر|يصنف|يصنّف|يستقصي)/, 4],
  // 2 – Understand  (must come before Apply so يتعرف matches Understand)
  [/^(يفهم|يصف|يميز|يميّز|يتعرف|يتعرّف|يدرك|يستكشف|يستنتج)/, 2],
  // 1 – Remember
  [/^(يعرف|يعرّف|يذكر|يسمي|يسمّي)/, 1],
  // 3 – Apply  (broad catch for action verbs)
  [/^(يطبق|يطبّق|يستخدم|يستعمل|يحل|يحلّ|يحسب|يجد|يكتب|يقرأ|يرسم|يمثل|يمثّل|يجمع|يطرح|يضرب|يقسم|يحول|يحوّل|يقرب|يقرّب|يرتب|يرتّب|يقارن|يوظف|يوظّف|يعدّ|يعد|يكمل|يكمّل|يشكل|يشكّل|يحدد|يحدّد|يوسع|يوسّع|يقدر|يقدّر|يكوّن|يكون|يجري|يُجري|ينظم|ينظّم|يوزع|يوزّع|يجزئ|يجزّئ|ينمذج|يشتق|يشتقّ|يكامل)/, 3],
];

function inferBloom(arabicText: string): BloomLevel {
  const trimmed = arabicText.trim();
  for (const [re, level] of BLOOM_VERBS) {
    if (re.test(trimmed)) return level;
  }
  return 3; // default: Apply
}

// ────────────────────────────────────────────────────────────────
// 3. Difficulty estimation
// ────────────────────────────────────────────────────────────────
function estimateDifficulty(gradeLevel: number, bloom: BloomLevel): Difficulty {
  // Base difficulty from grade band
  let base: number;
  if (gradeLevel <= 2) base = 1;
  else if (gradeLevel <= 6) base = 2;
  else if (gradeLevel <= 9) base = 3;
  else base = 4;

  // Adjust by Bloom's depth
  const bloomBoost = bloom >= 5 ? 1 : bloom >= 4 ? 0.5 : 0;
  const raw = Math.round(base + bloomBoost);
  return Math.max(1, Math.min(5, raw)) as Difficulty;
}

// ────────────────────────────────────────────────────────────────
// 4. Arabic tag extraction
// ────────────────────────────────────────────────────────────────
const MATH_KEYWORDS = [
  'جمع', 'طرح', 'ضرب', 'قسمة', 'كسر', 'كسور', 'عدد', 'أعداد',
  'عشرات', 'مئات', 'ألوف', 'منزلة', 'منازل', 'قيمة منزلية',
  'تقريب', 'تقدير', 'نمط', 'أنماط', 'مقارنة', 'ترتيب',
  'هندسي', 'هندسية', 'مثلث', 'مربع', 'مستطيل', 'دائرة',
  'زاوية', 'زوايا', 'مستقيم', 'محيط', 'مساحة', 'حجم',
  'طول', 'كتلة', 'سعة', 'وقت', 'ساعة', 'نقود',
  'بيانات', 'احتمال', 'احتمالات', 'إحصاء',
  'معادلة', 'معادلات', 'متباينة', 'متباينات',
  'اقتران', 'اقترانات', 'دالة', 'خطي', 'تربيعي', 'أسّي', 'لوغاريتمي',
  'مثلثي', 'مثلثية', 'جيب', 'تمام',
  'مشتقة', 'تفاضل', 'تكامل', 'نهاية', 'نهايات', 'اتصال',
  'مصفوفة', 'مصفوفات', 'متجه', 'متجهات', 'فضاء',
  'عدد مركّب', 'عدد مركب', 'تخيلي',
  'توزيع', 'احتمالي', 'تباين', 'انحراف معياري', 'توقّع',
  'عشوائي', 'تبادل', 'توافيق',
  'تحويل', 'تحويلات', 'انسحاب', 'انعكاس', 'تمدد', 'دوران',
  'تناسب', 'نسبة', 'تناظر', 'تماثل',
  'أسّ', 'أُسّ', 'جذر', 'جذور', 'لوغاريتم',
  'متتالية', 'متتاليات', 'متسلسلة',
  'قطع', 'مكافئ', 'ناقص', 'زائد', 'قطوع مخروطية',
  'كثيرات حدود', 'كثير حدود',
  'صفرية', 'محايد', 'تبديلية', 'تجميعية', 'توزيع',
  'خط أعداد', 'شبكة', 'إحداثي', 'محور',
  'عمودي', 'متوازي', 'متعامد',
  'باقي', 'حقائق', 'ذهني', 'ذهنياً',
  'تكافؤ', 'متكافئة', 'بسط', 'مقام',
  'عشري', 'عشرية', 'نسبي', 'نسبية',
  'صحيح', 'سالب', 'موجب',
  'مجسم', 'مجسمات', 'كرة', 'أسطوانة', 'مخروط', 'مكعب', 'هرم',
  'تماثل', 'تناظر', 'شبكة مربعات',
];

function extractTags(arabicText: string): string[] {
  const tags: string[] = [];
  for (const kw of MATH_KEYWORDS) {
    if (arabicText.includes(kw)) tags.push(kw);
  }
  // Deduplicate and limit
  return [...new Set(tags)].slice(0, 8);
}

// ────────────────────────────────────────────────────────────────
// 5. Slug generation
// ────────────────────────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ────────────────────────────────────────────────────────────────
// 6. English translation for indicators
//    (rule-based, concise 5–12 word summaries)
// ────────────────────────────────────────────────────────────────

/**
 * Build a concise English gloss for an Arabic math indicator.
 * We use keyword-pattern matching to produce short phrases.
 */
function translateIndicator(ar: string): string {
  // Common verb translations
  const t = ar.trim();

  // Try pattern-based translations for common constructs
  const translations = applyPatterns(t);
  if (translations) return translations;

  // Fallback: transliterate the verb + key nouns
  return fallbackTranslate(t);
}

function applyPatterns(t: string): string | null {
  // يقرأ ... بالرموز / بالكلمات
  if (/^يقرأ/.test(t)) {
    if (t.includes('بالرموز')) return extractNumberRange(t, 'Read numbers', 'in symbols');
    if (t.includes('بالكلمات')) return extractNumberRange(t, 'Read numbers', 'in words');
    if (t.includes('بيانات')) return 'Read data organized in a table';
    if (t.includes('الوقت') && t.includes('ساعة رقمية')) {
      if (t.includes('نصف')) return 'Read time at half-hour from digital clock';
      return 'Read time at full hour from digital clock';
    }
    if (t.includes('الوقت') && t.includes('عقارب')) {
      if (t.includes('نصف')) return 'Read time at half-hour from analog clock';
      return 'Read time at full hour from analog clock';
    }
    if (t.includes('الوقت')) return 'Read time';
    if (t.includes('هندية')) return 'Read Hindi-Arabic numerals within 100';
    if (t.includes('الكسور')) return 'Read fractions';
    return null;
  }

  // يكتب
  if (/^يكتب/.test(t)) {
    if (t.includes('بالرموز')) return extractNumberRange(t, 'Write numbers', 'in symbols');
    if (t.includes('بالكلمات')) return extractNumberRange(t, 'Write numbers', 'in words');
    if (t.includes('تحليلية')) return 'Write numbers in expanded form';
    if (t.includes('نماذج') || t.includes('ممثلاً')) return 'Write number represented by models';
    if (t.includes('هندية')) return 'Write Hindi-Arabic numerals within 100';
    if (t.includes('الكسر') && t.includes('نصف')) return 'Write fraction for half a shape';
    if (t.includes('الكسر') && t.includes('ربع')) return 'Write fraction for quarter of a shape';
    if (t.includes('الكسر') && t.includes('مجموعة') && t.includes('نصف')) return 'Write fraction for half a set';
    if (t.includes('الكسر') && t.includes('مجموعة') && t.includes('ربع')) return 'Write fraction for quarter of a set';
    if (t.includes('الكسور') && t.includes('مجموعة')) return 'Write fractions representing part of a set';
    if (t.includes('الكسور') && t.includes('كل')) return 'Write fractions representing part of a whole';
    if (t.includes('الكسر') && t.includes('واحد')) return 'Write fraction equal to one';
    if (t.includes('جملة الضرب')) return 'Write multiplication sentence for a model';
    if (t.includes('عائلات حقائق')) return 'Write related multiplication-division fact families';
    if (t.includes('الوقت') && t.includes('نصف')) return 'Write time at half-hour';
    if (t.includes('الوقت')) return 'Write time at full hour';
    if (t.includes('معادلة مركّبة') || t.includes('معادلة مركبة')) return 'Write complex equation in Cartesian form';
    if (t.includes('المعادلة المتجهة')) return 'Write vector equation of a line';
    return null;
  }

  // يجد / يجد ذهنياً
  if (/^يجد/.test(t)) {
    if (t.includes('ضرب') && t.includes('في 2')) return 'Find product of multiplying by 2';
    if (t.includes('ضرب') && t.includes('في 3')) return 'Find product of multiplying by 3';
    if (t.includes('ضرب') && t.includes('في 4')) return 'Find product of multiplying by 4';
    if (t.includes('ضرب') && t.includes('في 5')) return 'Find product of multiplying by 5';
    if (t.includes('ضرب') && t.includes('في 6')) return 'Find product of multiplying by 6';
    if (t.includes('ضرب') && t.includes('في 7')) return 'Find product of multiplying by 7';
    if (t.includes('ضرب') && t.includes('في 8')) return 'Find product of multiplying by 8';
    if (t.includes('ضرب') && t.includes('في 9')) return 'Find product of multiplying by 9';
    if (t.includes('ضرب') && t.includes('في 10')) return 'Find product of multiplying by 10';
    if (t.includes('ضرب') && t.includes('منزلتين') && t.includes('منزلة واحدة')) return 'Find product of 2-digit by 1-digit number';
    if (t.includes('ضرب') && t.includes('مضاعفات')) return 'Mentally multiply by multiples of 10';
    if (t.includes('ناتج ضرب')) return 'Find multiplication product';
    if (t.includes('حاصل ضرب')) return 'Find multiplication product';
    if (t.includes('قسمة') && t.includes('منزلتين') && !t.includes('باق')) return 'Find quotient of 2-digit by 1-digit (no remainder)';
    if (t.includes('قسمة') && t.includes('باق') && t.includes('منزلتين')) return 'Find quotient of 2-digit by 1-digit (with remainder)';
    if (t.includes('قسمة') && t.includes('مضاعفات')) return 'Mentally divide multiple of 10 by 1-digit';
    if (t.includes('ناتج قسمة')) return 'Find division result';
    if (t.includes('ناتج جمع') && t.includes('ثلاثة')) return 'Find sum of three numbers';
    if (t.includes('ناتج جمع') && t.includes('مضاعفات 10')) return 'Mentally add multiples of 10 to 4-digit number';
    if (t.includes('ناتج جمع') && t.includes('مضاعفات 100')) return 'Mentally add multiples of 100 to 4-digit number';
    if (t.includes('ناتج جمع') && t.includes('مضاعفات 1000')) return 'Mentally add multiples of 1000 to 4-digit number';
    if (t.includes('ناتج جمع')) return 'Find addition result';
    if (t.includes('ضعف')) return 'Find double of a number mentally';
    if (t.includes('أزواج') && t.includes('10')) return 'Find number pairs that make 10';
    if (t.includes('العدد المفقود') && t.includes('جمع')) return 'Find missing number in addition';
    if (t.includes('العدد المفقود') && t.includes('طرح')) return 'Find missing number in subtraction';
    if (t.includes('محيط') && t.includes('أضلاع')) return 'Find perimeter given side lengths';
    if (t.includes('محيط') && t.includes('شبكة')) return 'Find perimeter on a grid';
    if (t.includes('القيمة المنزلية')) return 'Find place value of a digit in a number';
    if (t.includes('كسوراً متكافئة') && t.includes('نماذج')) return 'Find equivalent fractions using models';
    if (t.includes('كسوراً متكافئة') && t.includes('خط')) return 'Find equivalent fractions using number line';
    if (t.includes('كسر وحدة')) return 'Find unit fraction value of a number';
    if (t.includes('مشتقة') && t.includes('أسّي')) return 'Find derivative of natural exponential function';
    if (t.includes('مشتقة') && t.includes('لوغاريتمي')) return 'Find derivative of natural logarithmic function';
    if (t.includes('مشتقة') && t.includes('مثلثية')) return 'Find derivatives of trigonometric functions';
    if (t.includes('مشتقة') && t.includes('ضرب اقترانين')) return 'Find derivative of product of two functions';
    if (t.includes('مشتقة') && t.includes('قسمة اقترانين')) return 'Find derivative of quotient of two functions';
    if (t.includes('مشتقة') && t.includes('مقلوب')) return 'Find derivative of reciprocal function';
    if (t.includes('مشتقة') && t.includes('وسيطية')) return 'Find derivative of parametric equation';
    if (t.includes('مشتقة') && t.includes('سلسلة')) return 'Find derivative using chain rule';
    if (t.includes('مشتقات العليا')) return 'Find higher-order derivatives';
    if (t.includes('مشتقة الثانية') && t.includes('ضمنية')) return 'Find second derivative of implicit relation';
    if (t.includes('معادلة مماس') && t.includes('ضمنية')) return 'Find tangent equation of implicit curve';
    if (t.includes('معادلة مماس') && t.includes('وسيطية')) return 'Find tangent equation of parametric curve';
    if (t.includes('المسافة') && t.includes('نقطتين')) return 'Find distance between two points in space';
    if (t.includes('نقطة المنتصف')) return 'Find midpoint coordinates in space';
    if (t.includes('الضرب القياسي')) return 'Find scalar (dot) product of two vectors';
    if (t.includes('الزاوية') && t.includes('متجهين')) return 'Find angle between two vectors';
    if (t.includes('الزاوية') && t.includes('مستقيمين')) return 'Find angle between two lines in space';
    if (t.includes('مساحة مثلث') && t.includes('متجهات')) return 'Find triangle area using vectors';
    if (t.includes('مسقط العمود')) return 'Find perpendicular projection onto a line';
    if (t.includes('البعد') && t.includes('نقطة') && t.includes('مستقيم')) return 'Find distance from point to line using vectors';
    if (t.includes('تقاطع مستقيمين')) return 'Find intersection point of two lines in space';
    if (t.includes('التوزيع الاحتمالي') && t.includes('جدول')) return 'Find probability distribution table';
    if (t.includes('جذري') && t.includes('مركّب')) return 'Find square roots of a complex number';
    if (t.includes('جذور') && t.includes('حقيقية') && t.includes('مركبة')) return 'Find all real and complex roots of polynomial';
    if (t.includes('معادلة كثير') && t.includes('جذور')) return 'Find polynomial given one of its roots';
    if (t.includes('المحل الهندسي') && t.includes('معادلة')) return 'Find geometric locus of a complex equation';
    if (t.includes('تكامل') && t.includes('أسّية')) return 'Find integral of exponential functions';
    if (t.includes('تكامل') && t.includes('مثلثية') && t.includes('مباشرة')) return 'Find integral of trig functions directly';
    if (t.includes('تكامل') && t.includes('مثلثية') && t.includes('ax + b')) return 'Find integral of trig functions with (ax+b)';
    if (t.includes('تكامل') && t.includes('مثلثية') && t.includes('متطابقات')) return 'Find integral using trig identities';
    if (t.includes('تكامل') && t.includes('بسط') && t.includes('مقام')) return 'Find integral where numerator is derivative of denominator';
    if (t.includes('تكامل')) return 'Find integral';
    if (t.includes('قيمة') && t.includes('مركّبة')) return 'Find value using complex number properties';
    return null;
  }

  // يمثل / يمثّل
  if (/^(يمثل|يمثّل)/.test(t)) {
    if (t.includes('خط الأعداد') && t.includes('كسور')) return 'Represent fractions on number line';
    if (t.includes('بيانات') && t.includes('صور')) return 'Represent data using pictures';
    if (t.includes('بيانات') && t.includes('إشارات')) return 'Represent data using tally marks';
    if (t.includes('مسائل حياتية') && t.includes('جمل عددية')) return 'Represent life problems as number sentences';
    if (t.includes('الأعداد') && t.includes('محسوس')) return 'Represent numbers using concrete objects';
    if (t.includes('الأعداد') && t.includes('شبه المحسوس')) return 'Represent numbers using semi-concrete models';
    if (t.includes('عملية الضرب')) return 'Represent multiplication in multiple ways';
    if (t.includes('الثلاثي المرتّب') || t.includes('الثلاثي المرتب')) return 'Represent ordered triple in space';
    if (t.includes('المتجه') && t.includes('فضاء')) return 'Represent vector in 3D space';
    if (t.includes('العدد المركّب') || t.includes('العدد المركب')) return 'Represent complex number graphically';
    if (t.includes('المحل الهندسي') && t.includes('متباينة')) return 'Represent locus of complex inequality';
    if (t.includes('المحل الهندسي') && t.includes('نظام')) return 'Represent locus of system of complex inequalities';
    if (t.includes('المحل الهندسي')) return 'Represent geometric locus in complex plane';
    if (t.includes('منحنى اقتران') && t.includes('انسحاب')) return 'Graph function with horizontal/vertical shift';
    if (t.includes('منحنى اقتران') && t.includes('تمدّد')) return 'Graph function with horizontal/vertical stretch';
    if (t.includes('منحنى اقتران') && t.includes('انعكاس')) return 'Graph function reflected over an axis';
    if (t.includes('منحنى اقتران') && t.includes('أكثر من تحويل')) return 'Graph function with multiple transformations';
    if (t.includes('كسور') && t.includes('شرائط')) return 'Represent fractions using fraction strips';
    return null;
  }

  // يحل
  if (/^(يحل|يحلّ)/.test(t)) {
    if (t.includes('مسائل حياتية') && t.includes('جمع') && t.includes('طرح')) return 'Solve word problems with addition and subtraction';
    if (t.includes('مسائل') && t.includes('جمع') && t.includes('أربع منازل')) return 'Solve problems adding 4-digit numbers';
    if (t.includes('مسائل حياتية') && t.includes('ضرب')) return 'Solve word problems with multiplication';
    if (t.includes('مسائل حياتية') && t.includes('قسمة')) return 'Solve word problems with division';
    if (t.includes('مسائل حياتية') && t.includes('أطوال')) return 'Solve word problems involving lengths';
    if (t.includes('مسائل حياتية') && t.includes('كتل') || t.includes('كُتل')) return 'Solve word problems involving mass';
    if (t.includes('مسائل حياتية') && t.includes('سعات')) return 'Solve word problems involving capacity';
    if (t.includes('مسائل') && t.includes('محيط')) return 'Solve problems on perimeter of rectangles';
    if (t.includes('جمل مفتوحة') && t.includes('جمع')) return 'Solve open sentences with addition';
    if (t.includes('جمل مفتوحة') && t.includes('طرح')) return 'Solve open sentences with subtraction';
    if (t.includes('مسائل حياتية') && t.includes('اختيار العملية')) return 'Solve problems by choosing correct operation';
    if (t.includes('مسائل حياتية') && t.includes('تخمين')) return 'Solve problems using guess-and-check strategy';
    if (t.includes('معادلة مثلثية') && t.includes('أساسية') && t.includes('خاصة')) return 'Solve basic trig equation with special angles';
    if (t.includes('معادلة مثلثية') && t.includes('آلة حاسبة')) return 'Solve trig equation using scientific calculator';
    if (t.includes('معادلة مثلثية') && t.includes('تحليل')) return 'Solve trig equation by factoring';
    if (t.includes('معادلات مثلثية') && t.includes('متطابقات')) return 'Solve trig equations using identities';
    if (t.includes('معادلات مثلثية') && t.includes('تربيع')) return 'Solve trig equations by squaring both sides';
    if (t.includes('معادلات مثلثية') && t.includes('ضعف')) return 'Solve trig equations with double angle';
    if (t.includes('معادلات مثلثية') && t.includes('نصف')) return 'Solve trig equations with half angle';
    if (t.includes('مسائل حياتية') && t.includes('مثلثية')) return 'Solve life problems modeled by trig equations';
    if (t.includes('معادلات') && t.includes('الأصفار النسبية')) return 'Solve polynomial using rational zeros theorem';
    if (t.includes('تكاملات') && t.includes('تعويض') && t.includes('أجزاء')) return 'Solve integrals using substitution and parts';
    if (t.includes('معادلات تفاضلية') && t.includes('فصل')) return 'Solve differential equations by separation of variables';
    if (t.includes('معادلات تفاضلية') || t.includes('معادلة تفاضلية')) return 'Solve differential equations';
    if (t.includes('مسائل') && t.includes('تفاضلية')) return 'Solve applied problems with differential equations';
    return null;
  }

  // يميز / يميّز
  if (/^(يميز|يميّز)/.test(t)) {
    if (t.includes('الأشكال المستوية')) return 'Identify plane shapes (triangle, square, rectangle, circle)';
    if (t.includes('المجسمات')) return 'Identify 3D solids (sphere, cylinder, cone, cube, etc.)';
    if (t.includes('الزاوية') && t.includes('ضلعيها')) return 'Identify angle, its sides, and vertex';
    if (t.includes('المستقيم')) return 'Identify line';
    if (t.includes('القطعة المستقيمة')) return 'Identify line segment';
    if (t.includes('الشعاع')) return 'Identify ray';
    if (t.includes('النقطة')) return 'Identify point';
    if (t.includes('مستقيمات') && t.includes('متوازية')) return 'Identify parallel, intersecting, and perpendicular lines';
    if (t.includes('أنواع الزوايا')) return 'Identify types of angles (acute, right, obtuse)';
    if (t.includes('الزوايا الحادة') && t.includes('أشكال')) return 'Identify acute angles by their shapes';
    if (t.includes('الزوايا المنفرجة') && t.includes('أشكال')) return 'Identify obtuse angles by their shapes';
    if (t.includes('مفهوم الكسر') && t.includes('كل')) return 'Identify fraction as part of a whole';
    if (t.includes('مفهوم الكسر') && t.includes('مجموعة')) return 'Identify fraction as part of a set';
    if (t.includes('الكسور المساوية')) return 'Identify fractions equal to one';
    if (t.includes('العدد الزوجي')) return 'Identify even numbers by pairing objects';
    if (t.includes('العدد الفردي')) return 'Identify odd numbers by pairing objects';
    if (t.includes('مفهوم النمط')) return 'Identify concept of pattern';
    if (t.includes('مفهوم الطول')) return 'Identify concept of length';
    if (t.includes('مفهوم الكتلة')) return 'Identify concept of mass';
    if (t.includes('مفهوم السعة')) return 'Identify concept of capacity';
    if (t.includes('مفهوم المحيط')) return 'Identify concept of perimeter';
    if (t.includes('القسمة') && t.includes('مجموعات متساوية')) return 'Identify division as forming equal groups';
    if (t.includes('القسمة') && t.includes('مشاركة')) return 'Identify division as equal sharing';
    if (t.includes('مفهوم باقي')) return 'Identify concept of remainder in division';
    if (t.includes('الضرب') && t.includes('القسمة')) return 'Identify situations requiring multiplication or division';
    if (t.includes('المتغيّر العشوائي') && t.includes('منفصل')) return 'Identify discrete random variable and its values';
    if (t.includes('المتغيّر العشوائي') && t.includes('حدّين') && t.includes('توزيع')) return 'Identify binomial random variable and its distribution';
    if (t.includes('المتغيّر العشوائي') && t.includes('هندسي') && t.includes('توزيع')) return 'Identify geometric random variable and its distribution';
    if (t.includes('التجربة') && t.includes('حدّين')) return 'Identify binomial probability experiment';
    if (t.includes('التجربة') && t.includes('هندسية')) return 'Identify geometric probability experiment';
    if (t.includes('المتجهات المتساوية')) return 'Identify equal vectors in space';
    if (t.includes('المتجهين المتوازيين')) return 'Identify parallel vectors';
    if (t.includes('المعادلة التفاضلية')) return 'Identify and solve differential equation';
    if (t.includes('خصائص المنحنى الطبيعي')) return 'Identify characteristics of normal curve';
    if (t.includes('منحنى التوزيع الطبيعي') && t.includes('نزعة')) return 'Identify normal curve and central tendency measures';
    if (t.includes('خصائص') && t.includes('طبيعي المعياري')) return 'Identify standard normal distribution properties';
    return null;
  }

  // يتعرف / يتعرّف
  if (/^(يتعرف|يتعرّف)/.test(t)) {
    if (t.includes('العشرات')) return 'Identify tens and read them';
    if (t.includes('النصف')) return 'Identify concept of half';
    if (t.includes('الربع')) return 'Identify concept of quarter';
    if (t.includes('الكسر') && t.includes('مجموعة')) return 'Identify fraction as part of a set';
    if (t.includes('تكافؤ الكسور')) return 'Identify concept of equivalent fractions';
    if (t.includes('التبديلية')) return 'Identify commutative property of multiplication';
    if (t.includes('المحايد') && t.includes('ضرب')) return 'Identify identity property of multiplication';
    if (t.includes('الضرب في صفر') || t.includes('ضرب') && t.includes('صفر')) return 'Identify multiplication by zero property';
    if (t.includes('قسمة عدد على واحد')) return 'Identify division by one property';
    if (t.includes('قسمة عدد') && t.includes('نفسه')) return 'Identify division by self property';
    if (t.includes('قسمة الصفر')) return 'Identify zero divided by number property';
    if (t.includes('وحدت') && t.includes('سنتيمتر') || t.includes('سنتيمتر') && t.includes('متر')) return 'Identify length units: centimeter and meter';
    if (t.includes('كيلومتر')) return 'Identify length unit: kilometer';
    if (t.includes('غرام') && t.includes('كيلوغرام')) return 'Identify mass units: gram and kilogram';
    if (t.includes('لتر') && t.includes('مليلتر')) return 'Identify capacity units: liter and milliliter';
    if (t.includes('المحل الهندسي')) return 'Identify geometric locus';
    if (t.includes('المعادلات المثلثية')) return 'Identify trigonometric equations';
    if (t.includes('نظرية الأصفار')) return 'Identify rational zeros theorem';
    if (t.includes('نظرية الباقي')) return 'Identify remainder theorem';
    if (t.includes('نظرية العامل')) return 'Identify factor theorem';
    if (t.includes('مقياس العدد المركّب') || t.includes('مقياس العدد المركب')) return 'Identify and find modulus of complex number';
    if (t.includes('سعة العدد المركّب') || t.includes('سعة العدد المركب')) return 'Identify and find argument of complex number';
    if (t.includes('الصورة المثلثية')) return 'Identify and write complex number in trigonometric form';
    if (t.includes('العدد المركّب') || t.includes('العدد المركب')) return 'Identify complex number and its real/imaginary parts';
    if (t.includes('المتجه') && t.includes('فضاء')) return 'Identify vector in space';
    if (t.includes('مقدار المتجه')) return 'Identify and find magnitude of vector in space';
    if (t.includes('متجه') && t.includes('موقع') && t.includes('إزاحة')) return 'Identify position and displacement vectors';
    if (t.includes('متجهات الوحدة')) return 'Identify standard unit vectors';
    if (t.includes('الاشتقاق الضمني')) return 'Identify implicit differentiation';
    if (t.includes('قاعدة سلسلة القوّة') || t.includes('قاعدة سلسلة القوة')) return 'Identify power chain rule';
    if (t.includes('الاستعمال المتكرر لقاعدة السلسلة')) return 'Identify repeated chain rule application';
    if (t.includes('الاقتران الرئيس')) return 'Identify parent function in function families';
    if (t.includes('المتغيّر العشوائي') && t.includes('طبيعي')) return 'Identify normal random variable and distribution';
    if (t.includes('التوزيع الاحتمالي') && t.includes('اقتران')) return 'Identify probability distribution as a function';
    if (t.includes('توقّع المتغيّر') || t.includes('توقع المتغير')) return 'Identify and find expected value of random variable';
    if (t.includes('جمع') && t.includes('ترتيب') && t.includes('الناتج')) return 'Identify that addition order does not change result';
    if (t.includes('جمع الصفر')) return 'Identify additive identity property';
    if (t.includes('المفاهيم') && t.includes('اليوم')) return 'Identify concepts: today, tomorrow, yesterday';
    if (t.includes('المفاهيم') && t.includes('الصباح')) return 'Identify concepts: morning, noon, evening';
    return null;
  }

  // يجمع
  if (/^يجمع/.test(t)) {
    if (t.includes('قريباً من مضاعفات')) return 'Add number near multiples of 100 to 4-digit number';
    if (t.includes('ثلاث منازل') && t.includes('إعادة تجميع المئات')) return 'Add two 3-digit numbers with regrouping hundreds';
    if (t.includes('أربع منازل') && t.includes('إعادة')) return 'Add two 4-digit numbers with regrouping';
    if (t.includes('منزلتين') && t.includes('دون إعادة')) return 'Add two 2-digit numbers without regrouping';
    if (t.includes('20') && t.includes('خط الأعداد')) return 'Add two numbers within 20 using number line';
    if (t.includes('20') && t.includes('الضعف')) return 'Add two numbers within 20 using doubles plus 1';
    if (t.includes('20') && t.includes('إكمال')) return 'Add two numbers within 20 by making 10';
    if (t.includes('ذهنياً') && t.includes('منزلة واحدة')) return 'Mentally add 1-digit to 2-digit number';
    if (t.includes('ذهنياً') && t.includes('العشرات')) return 'Mentally add tens to 2-digit number';
    if (t.includes('بيانات')) return 'Collect real data';
    if (t.includes('مصفوفتين')) return 'Add two matrices';
    return null;
  }

  // يطرح
  if (/^يطرح/.test(t)) {
    if (t.includes('20') && t.includes('خط')) return 'Subtract within 20 using number line';
    if (t.includes('20') && t.includes('الضعف')) return 'Subtract within 20 using doubles';
    if (t.includes('20') && t.includes('10')) return 'Subtract within 20 by finding 10';
    if (t.includes('أربع منازل') && t.includes('أصفار')) return 'Subtract 4-digit numbers with zeros';
    if (t.includes('أربع منازل') && t.includes('إعادة')) return 'Subtract two 4-digit numbers with regrouping';
    if (t.includes('ذهنياً') && t.includes('تجسير') || t.includes('مضاعفات 100')) return 'Mentally subtract using bridging strategy';
    if (t.includes('منزلتين') && t.includes('دون إعادة')) return 'Subtract two 2-digit numbers without regrouping';
    if (t.includes('ذهنياً') && t.includes('منزلة واحدة')) return 'Mentally subtract 1-digit from 2-digit';
    if (t.includes('ذهنياً') && t.includes('العشرات')) return 'Mentally subtract tens from 2-digit number';
    if (t.includes('مصفوفتين')) return 'Subtract two matrices';
    return null;
  }

  // يحوّل / يحول
  if (/^(يحوّل|يحول)/.test(t)) {
    if (t.includes('متر') && t.includes('سنتيمتر')) return 'Convert between meters and centimeters';
    if (t.includes('كيلومتر') && t.includes('متر')) return 'Convert between kilometers and meters';
    if (t.includes('غرام') && t.includes('كيلوغرام')) return 'Convert between grams and kilograms';
    if (t.includes('لتر') && t.includes('مليلتر')) return 'Convert between liters and milliliters';
    return null;
  }

  // يقارن
  if (/^يقارن/.test(t)) {
    if (t.includes('كسرين') && t.includes('نماذج')) return 'Compare two fractions using fraction models';
    if (t.includes('كسرين') && t.includes('خط')) return 'Compare two fractions using number line';
    if (t.includes('منزلتين')) return 'Compare two 2-digit numbers';
    if (t.includes('أربع منازل')) return 'Compare two 4-digit numbers';
    if (t.includes('بصرياً')) return 'Visually compare quantities of two groups';
    if (t.includes('كتل') || t.includes('ثقيل')) return 'Compare masses using comparative words';
    if (t.includes('سعات')) return 'Compare capacities of containers';
    return null;
  }

  // يرتب / يرتّب
  if (/^(يرتب|يرتّب)/.test(t)) {
    if (t.includes('كسور') && t.includes('نماذج')) return 'Order three fractions using fraction models';
    if (t.includes('كسور') && t.includes('خط')) return 'Order three fractions using number line';
    if (t.includes('تصاعدياً') && t.includes('99')) return 'Order three numbers within 99 ascending';
    if (t.includes('تنازلياً') && t.includes('99')) return 'Order three numbers within 99 descending';
    if (t.includes('تصاعدياً') && t.includes('أربع')) return 'Order 4-digit numbers ascending';
    if (t.includes('تنازلياً') && t.includes('أربع')) return 'Order 4-digit numbers descending';
    if (t.includes('أطوال')) return 'Order three objects by length';
    if (t.includes('كتل')) return 'Order three objects by mass';
    if (t.includes('سعات') || t.includes('أوعية')) return 'Order three containers by capacity';
    if (t.includes('أيام الأسبوع')) return 'Order days of the week';
    if (t.includes('أحداث')) return 'Order daily events by time of occurrence';
    return null;
  }

  // يقدّر / يقدر
  if (/^(يقدّر|يقدر)/.test(t)) {
    if (t.includes('ضرب') && t.includes('تقريب')) return 'Estimate multiplication product using rounding';
    if (t.includes('قسمة') && t.includes('متناغمة')) return 'Estimate division result using compatible numbers';
    if (t.includes('جمع')) return 'Estimate sum of two 4-digit numbers';
    if (t.includes('طرح')) return 'Estimate difference of two 4-digit numbers';
    if (t.includes('مجموعة')) return 'Estimate a set of objects within 99';
    return null;
  }

  // يوظف / يوظّف
  if (/^(يوظف|يوظّف)/.test(t)) {
    if (t.includes('التقريب') && t.includes('تقدير')) return 'Use rounding to estimate operation results';
    if (t.includes('التقريب') && t.includes('التحقق')) return 'Use rounding to verify answer correctness';
    if (t.includes('التكامل') && t.includes('مساح')) return 'Use definite integral to find bounded areas';
    if (t.includes('التكامل') && t.includes('حجوم') && t.includes('اقتران')) return 'Use definite integral to find volumes of revolution';
    if (t.includes('التكامل') && t.includes('حجوم') && t.includes('منطقة')) return 'Use integral to find volume between two curves';
    if (t.includes('التكامل') && t.includes('إزاحة')) return 'Use integral to find displacement from velocity';
    if (t.includes('التكنولوجيا') && t.includes('مساحة')) return 'Use technology to find area as definite integral';
    if (t.includes('جدول التوزيع') && t.includes('احتمالات تحقّق')) return 'Use standard normal table to compute population probabilities';
    if (t.includes('جدول التوزيع') && t.includes('قيم أصلية')) return 'Use standard normal table to find original values';
    if (t.includes('جدول التوزيع') && t.includes('وسط') || t.includes('انحراف')) return 'Use standard normal table to find mean or std dev';
    if (t.includes('جدول التوزيع') && t.includes('حساب توقّع')) return 'Use probability distribution to compute expected value and variance';
    if (t.includes('جدول التوزيع') && t.includes('حساب احتمالات')) return 'Use standard normal table to compute probabilities';
    if (t.includes('المشتقات') && t.includes('معدّل')) return 'Use derivative to find rate of change at a point';
    return null;
  }

  // يصنّف / يصنف
  if (/^(يصنّف|يصنف)/.test(t)) {
    if (t.includes('لون')) return 'Classify objects by color';
    if (t.includes('شكل')) return 'Classify objects by shape';
    if (t.includes('مقاس')) return 'Classify objects by size';
    if (t.includes('أكثر من خاصية')) return 'Classify objects by more than one attribute';
    if (t.includes('مجسّم') || t.includes('مجسم')) return 'Classify a 3D solid by its shape';
    return null;
  }

  // يستخدم / يستعمل
  if (/^(يستخدم|يستعمل)/.test(t)) {
    if (t.includes('القيمة المنزلية') && t.includes('تحليلية')) return 'Use place value to write in expanded form';
    if (t.includes('حقائق الجمع') && t.includes('العشرات')) return 'Use addition facts to add tens';
    if (t.includes('حقائق الطرح') && t.includes('العشرات')) return 'Use subtraction facts to subtract tens';
    if (t.includes('حقائق الضرب') && t.includes('جمل مفتوحة')) return 'Use multiplication/division facts to solve open sentences';
    if (t.includes('طويل') || t.includes('أطول')) return 'Use long/longer/longest to compare lengths';
    if (t.includes('قصير')) return 'Use short/shorter/shortest to compare lengths';
    if (t.includes('لوحة الأعداد') && t.includes('1')) return 'Use number board to find ±1 from a number';
    if (t.includes('لوحة الأعداد') && t.includes('10')) return 'Use number board to find ±10 from a number';
    if (t.includes('خطة الخطوات الأربع')) return 'Use four-step strategy to solve division problems';
    if (t.includes('المتطابقات المثلثية') && t.includes('إثبات')) return 'Use basic trig identities to prove other identities';
    if (t.includes('متطابقات') && t.includes('مجموع') && t.includes('إيجاد قيمة')) return 'Use sum/difference identities to find trig values';
    if (t.includes('ضعف الزاوية') && t.includes('إيجاد قيمة')) return 'Use double-angle identities to find trig values';
    if (t.includes('ضعف الزاوية') && t.includes('ثلاثة أضعاف')) return 'Use double-angle to find triple-angle trig value';
    if (t.includes('ضعف الزاوية') && t.includes('قوى')) return 'Use double-angle to express powers of sin/cos/tan';
    if (t.includes('نصف الزاوية')) return 'Use half-angle identities to find trig values';
    if (t.includes('الضرب إلى مجموع')) return 'Use product-to-sum identities';
    if (t.includes('المجموع') && t.includes('إلى ضرب')) return 'Use sum-to-product identities';
    if (t.includes('المتطابقات المثلثية') && t.includes('تبسيط')) return 'Use trig identities to simplify and evaluate';
    if (t.includes('المصفوفات') && t.includes('بيانات')) return 'Use matrices to organize and analyze data';
    if (t.includes('التكامل بالتعويض') && t.includes('جذر')) return 'Use substitution to integrate nth-root expressions';
    if (t.includes('التكامل بالتعويض') && t.includes('جيب')) return 'Use substitution to integrate odd-power trig functions';
    if (t.includes('التكامل بالأجزاء') && t.includes('أكثر من مرة')) return 'Use integration by parts multiple times';
    if (t.includes('التكامل بالأجزاء') && t.includes('دورية')) return 'Use integration by parts for cyclic integrals';
    if (t.includes('التكامل بالأجزاء')) return 'Use integration by parts for product of functions';
    if (t.includes('التكامل بالكسور الجزئية') && t.includes('مختلفة')) return 'Integrate using partial fractions (distinct linear factors)';
    if (t.includes('التكامل بالكسور الجزئية') && t.includes('مكرّر')) return 'Integrate using partial fractions (repeated linear factor)';
    if (t.includes('التكامل بالكسور الجزئية') && t.includes('تربيعي')) return 'Integrate using partial fractions (irreducible quadratic)';
    if (t.includes('التكامل بالكسور الجزئية') && t.includes('درجة')) return 'Integrate using partial fractions (degree >= denominator)';
    if (t.includes('القسمة') && t.includes('تكامل') && t.includes('نسبية')) return 'Use division to integrate rational functions';
    if (t.includes('الشرط الأولي') && t.includes('تكامل')) return 'Use initial condition to find function via integration';
    if (t.includes('التكامل المحدود') && t.includes('إزاحة')) return 'Use definite integral to find displacement from velocity';
    if (t.includes('المسافة الكلية') && t.includes('سرعة')) return 'Find total distance from velocity function integral';
    if (t.includes('توازي المتجهات') && t.includes('استقامة')) return 'Use vector parallelism to prove collinearity';
    if (t.includes('توازي المتجهات') && t.includes('أشكال')) return 'Use vector parallelism to prove geometric parallelism';
    if (t.includes('المعادلة المتجهة') && t.includes('التحقق')) return 'Use vector line equation to verify point on line';
    if (t.includes('المعادلة المتجهة') && t.includes('إحداثيات')) return 'Use vector line equation to find point coordinate';
    if (t.includes('المتجهات') && t.includes('أشكال ثلاثية')) return 'Use vectors and dot product in 3D shape problems';
    if (t.includes('التبادل') && t.includes('التوافيق')) return 'Use permutations and combinations for probability';
    if (t.includes('صيغة') && t.includes('حدّين')) return 'Use binomial distribution formula for probability';
    if (t.includes('صيغة') && t.includes('هندسي')) return 'Use geometric distribution formula for probability';
    if (t.includes('القاعدة التجريبية') && t.includes('مساحة')) return 'Use empirical rule for area under normal curve';
    if (t.includes('القاعدة التجريبية') && t.includes('احتمال')) return 'Use empirical rule for normal variable probability';
    if (t.includes('حقيقة') && t.includes('مرافقات')) return 'Use conjugate pair property for polynomial roots';
    if (t.includes('حقيقة') && t.includes('متساويين')) return 'Use equality condition of two complex numbers';
    return null;
  }

  // يضرب
  if (/^يضرب/.test(t)) {
    if (t.includes('ذهنياً') && t.includes('مضاعفات 10')) return 'Mentally multiply single digit by multiples of 10';
    if (t.includes('خاصية التوزيع')) return 'Multiply 2-digit by 1-digit using distributive property';
    if (t.includes('دون إعادة')) return 'Multiply 2-digit by 1-digit without regrouping';
    if (t.includes('مع إعادة')) return 'Multiply 2-digit by 1-digit with regrouping';
    if (t.includes('تخيليين')) return 'Multiply two imaginary numbers';
    if (t.includes('مصفوفة') && t.includes('ثابت')) return 'Multiply matrix by a scalar';
    if (t.includes('مركّبين') && t.includes('مثلثية')) return 'Multiply/divide complex numbers in trigonometric form';
    return null;
  }

  // يقسم
  if (/^يقسم/.test(t)) {
    if (t.includes('حقائق القسمة')) return 'Divide 2-digit by 1-digit within division facts';
    if (t.includes('كثيرات الحدود') && t.includes('جدول')) return 'Divide polynomials using table method';
    if (t.includes('مجموعة') && t.includes('باقي')) return 'Divide objects into equal groups and find remainder';
    if (t.includes('دائرة') || t.includes('مربع')) return 'Divide shape into 2 or 4 equal parts';
    return null;
  }

  // يحسب
  if (/^يحسب/.test(t)) {
    if (t.includes('احتمال') && t.includes('تبادل') && t.includes('توافيق')) return 'Compute probability using permutations and combinations';
    if (t.includes('احتمال') && t.includes('تبادل')) return 'Compute probability using permutations';
    if (t.includes('احتمال') && t.includes('توافيق')) return 'Compute probability using combinations';
    if (t.includes('القيمة المعيارية')) return 'Compute standard z-score from raw value';
    if (t.includes('التوقّع') && t.includes('هندسي')) return 'Compute expected value of geometric random variable';
    if (t.includes('التوقّع') && t.includes('حدّين')) return 'Compute expected value of binomial random variable';
    if (t.includes('التباين') && t.includes('حدّين')) return 'Compute variance of binomial random variable';
    return null;
  }

  // يرسم
  if (/^يرسم/.test(t)) {
    if (t.includes('مثلث')) return 'Draw a triangle on dotted grid';
    if (t.includes('مستطيل') || t.includes('مربع')) return 'Draw a rectangle or square on dotted grid';
    if (t.includes('القطعة المستقيمة') || t.includes('المستقيم') || t.includes('الشعاع')) return 'Draw line segment, line, and ray on dotted grid';
    if (t.includes('عقربي ساعة') && t.includes('نصف')) return 'Draw clock hands to show half-hour time';
    if (t.includes('عقربي ساعة')) return 'Draw clock hands to show full-hour time';
    return null;
  }

  // يكوّن
  if (/^(يكوّن|يكون)/.test(t)) {
    if (t.includes('حقائق') && t.includes('جمع') && t.includes('طرح')) return 'Form related addition-subtraction fact pairs within 20';
    return null;
  }

  // يصف
  if (/^يصف/.test(t)) {
    if (t.includes('الكسر') && t.includes('محسوسات')) return 'Describe fraction as part of whole using objects';
    if (t.includes('الزوايا') && t.includes('هندسية')) return 'Describe acute, right, and obtuse angles in shapes';
    if (t.includes('الشكل') && t.includes('تركيب')) return 'Describe shapes formed by combining plane figures';
    return null;
  }

  // يعطي أمثلة
  if (/^يعطي/.test(t)) {
    if (t.includes('أشكال مستوية')) return 'Give examples of plane shapes from environment';
    if (t.includes('مجسّم') || t.includes('مجسم')) return 'Give examples of 3D solids from environment';
    return null;
  }

  // يحدد / يحدّد
  if (/^(يحدد|يحدّد)/.test(t)) {
    if (t.includes('أضلاع') && t.includes('رؤوس')) return 'Determine number of sides and vertices';
    if (t.includes('رقم') && t.includes('آحاد') && t.includes('عشرات')) return 'Identify digit in ones, tens, hundreds, thousands place';
    if (t.includes('القيمة المنزلية')) return 'Determine place value of digit in a number';
    if (t.includes('وحدة الطول المناسبة')) return 'Determine appropriate length unit for measurement';
    if (t.includes('عناصر خوارزمية القسمة')) return 'Identify elements of division algorithm';
    if (t.includes('المطلوب') && t.includes('دقيق') && t.includes('تقديري')) return 'Determine if exact or estimated answer is needed';
    if (t.includes('عدد المجموعات')) return 'Determine number of equal groups';
    if (t.includes('عدد العناصر')) return 'Determine number of elements in each group';
    if (t.includes('مستقيمات') && t.includes('متخالفة')) return 'Identify parallel, intersecting, skew lines in space';
    if (t.includes('المدى') && t.includes('عشوائية')) return 'Determine range values for random variables';
    if (t.includes('رتبة مصفوفة')) return 'Determine matrix order and element value';
    if (t.includes('عدد العشرات')) return 'State number of tens in a given number';
    if (t.includes('السابق')) return 'Determine the number before a given number';
    if (t.includes('التالي')) return 'Determine the number after a given number';
    if (t.includes('البيني')) return 'Determine number between two given numbers';
    if (t.includes('الأجزاء المتطابقة')) return 'Determine number of congruent parts in a shape';
    if (t.includes('البسط') && t.includes('المقام')) return 'Identify numerator and denominator of a fraction';
    if (t.includes('مسقط') && t.includes('عمود')) return 'Determine perpendicular projection on a line';
    return null;
  }

  // يستكشف
  if (/^يستكشف/.test(t)) {
    if (t.includes('عشرات') && t.includes('واحدات')) return 'Explore that 2-digit numbers = tens + ones < 10';
    return null;
  }

  // يعدّ / يعد
  if (/^(يعدّ|يعد)/.test(t)) {
    if (t.includes('تصاعدياً')) return 'Count up from any number within 99';
    if (t.includes('تنازلياً')) return 'Count down from any number within 99';
    if (t.includes('قفزياً') && t.includes('أربع منازل')) return 'Skip count by 2s, 5s, 10s, 100s, 1000s within 4 digits';
    if (t.includes('قفزياً')) return 'Skip count by 2s, 5s, or 10s within 99';
    return null;
  }

  // يسمّي / يسمي
  if (/^(يسمّي|يسمي)/.test(t)) {
    if (t.includes('أيام الأسبوع')) return 'Name the days of the week';
    return null;
  }

  // يذكر
  if (/^يذكر/.test(t)) {
    if (t.includes('العلاقة') && t.includes('حقائق الضرب')) return 'State relationship between multiplication facts (2,4,8), (5,10), (3,6,9)';
    return null;
  }

  // يقيس
  if (/^يقيس/.test(t)) {
    if (t.includes('أطوال') && t.includes('غير قياسية')) return 'Measure lengths using non-standard units';
    if (t.includes('كتل') && t.includes('غير قياسية')) return 'Measure masses using non-standard units';
    if (t.includes('سعات') && t.includes('غير قياسية')) return 'Measure capacities using non-standard units';
    return null;
  }

  // ينظم / ينظّم
  if (/^(ينظم|ينظّم)/.test(t)) {
    if (t.includes('بيانات') && t.includes('جدول')) return 'Organize data in tables';
    return null;
  }

  // يفسّر / يفسر
  if (/^(يفسّر|يفسر)/.test(t)) {
    if (t.includes('بيانات') && t.includes('صور')) return 'Interpret data represented by pictures';
    if (t.includes('بيانات') && t.includes('جداول')) return 'Interpret data represented by tally charts';
    if (t.includes('باقي') && t.includes('حياتية')) return 'Interpret meaning of remainder in word problems';
    if (t.includes('تمثيلات بصور')) return 'Interpret picture representations (1 picture = 1 unit)';
    return null;
  }

  // يكمل / يكمّل
  if (/^(يكمل|يكمّل)/.test(t)) {
    if (t.includes('حقيقة الضرب') && t.includes('القسمة')) return 'Complete related multiplication and division facts';
    if (t.includes('نمط') && t.includes('هندسي')) return 'Complete a given geometric pattern';
    return null;
  }

  // يوزع / يوزّع
  if (/^(يوزع|يوزّع)/.test(t)) {
    if (t.includes('عدد المجموعات')) return 'Distribute objects into equal groups and count groups';
    if (t.includes('عدد العناصر')) return 'Distribute objects into given groups and count per group';
    return null;
  }

  // يبرهن
  if (/^يبرهن/.test(t)) {
    if (t.includes('مجموع زاويتين')) return 'Prove trig identities using angle-sum identities';
    if (t.includes('الفرق بين زاويتين')) return 'Prove trig identities using angle-difference identities';
    if (t.includes('ضعف الزاوية')) return 'Prove trig identities using double-angle identities';
    if (t.includes('نصف الزاوية')) return 'Prove trig identities using half-angle identities';
    if (t.includes('الضرب إلى مجموع')) return 'Prove trig identities using product-to-sum';
    if (t.includes('المجموع') && t.includes('إلى ضرب')) return 'Prove trig identities using sum-to-product';
    return null;
  }

  // يجزّئ / يجزئ
  if (/^(يجزّئ|يجزئ)/.test(t)) {
    if (t.includes('مختلفة')) return 'Decompose rational expression (distinct linear factors)';
    if (t.includes('مكرّر')) return 'Decompose rational expression (repeated linear factor)';
    if (t.includes('تربيعي')) return 'Decompose rational expression (irreducible quadratic)';
    return null;
  }

  // يُجري
  if (/^(يُجري|يجري)/.test(t)) {
    if (t.includes('مركّبة') && t.includes('إحداثية')) return 'Perform four operations on complex numbers in coordinate form';
    if (t.includes('المصفوفات')) return 'Perform operations on matrices';
    if (t.includes('متجهات') && t.includes('فضاء')) return 'Perform vector operations in space';
    if (t.includes('تحويلات هندسية')) return 'Apply geometric transformations to function curves';
    return null;
  }

  // يقدّر (different from يقدر - estimate)
  // Already handled above

  // يشكّل / يشكل
  if (/^(يشكّل|يشكل)/.test(t)) {
    if (t.includes('منزلتين')) return 'Form 2-digit numbers using concrete and semi-concrete models';
    return null;
  }

  return null;
}

function fallbackTranslate(ar: string): string {
  // Generic verb-based fallback
  const verbMap: [RegExp, string][] = [
    [/^يتعرّف|^يتعرف/, 'Identify'],
    [/^يميّز|^يميز/, 'Distinguish'],
    [/^يجد/, 'Find'],
    [/^يحل|^يحلّ/, 'Solve'],
    [/^يكتب/, 'Write'],
    [/^يقرأ/, 'Read'],
    [/^يرسم/, 'Draw'],
    [/^يمثل|^يمثّل/, 'Represent'],
    [/^يحدد|^يحدّد/, 'Determine'],
    [/^يستخدم|^يستعمل/, 'Use'],
    [/^يوظف|^يوظّف/, 'Apply'],
    [/^يقارن/, 'Compare'],
    [/^يرتب|^يرتّب/, 'Order'],
    [/^يصنف|^يصنّف/, 'Classify'],
    [/^يفسر|^يفسّر/, 'Interpret'],
    [/^يحسب/, 'Compute'],
    [/^يقدر|^يقدّر/, 'Estimate'],
    [/^يحوّل|^يحول/, 'Convert'],
    [/^يجمع/, 'Add'],
    [/^يطرح/, 'Subtract'],
    [/^يضرب/, 'Multiply'],
    [/^يقسم/, 'Divide'],
    [/^يبرهن/, 'Prove'],
    [/^يصف/, 'Describe'],
    [/^يشتق|^يشتقّ/, 'Differentiate'],
    [/^يكامل/, 'Integrate'],
    [/^يعرّف|^يعرف/, 'Define'],
    [/^يذكر/, 'Recall'],
    [/^يسمّي|^يسمي/, 'Name'],
    [/^يعدّ|^يعد/, 'Count'],
    [/^يبني/, 'Build'],
    [/^يستنتج/, 'Deduce'],
    [/^يستقصي/, 'Investigate'],
    [/^يبتكر/, 'Create'],
    [/^يصمم|^يصمّم/, 'Design'],
    [/^ينشئ|^ينشِئ/, 'Construct'],
    [/^يقيم|^يقيّم/, 'Evaluate'],
    [/^يحلل|^يحلّل/, 'Analyze'],
    [/^يبرر|^يبرّر/, 'Justify'],
    [/^يكمل|^يكمّل/, 'Complete'],
    [/^ينظم|^ينظّم/, 'Organize'],
    [/^يوسع|^يوسّع/, 'Extend'],
    [/^يعطي/, 'Give'],
    [/^يوزع|^يوزّع/, 'Distribute'],
    [/^يجزئ|^يجزّئ/, 'Decompose'],
    [/^ينمذج/, 'Model'],
    [/^يُجري|^يجري/, 'Perform'],
  ];

  let verb = '';
  for (const [re, en] of verbMap) {
    if (re.test(ar)) {
      verb = en;
      break;
    }
  }
  if (!verb) verb = 'Apply';

  // Extract key noun phrases
  const nouns: string[] = [];
  const nounMap: [string, string][] = [
    ['الأعداد الكلية', 'whole numbers'],
    ['أعداد كلية', 'whole numbers'],
    ['عدد مركّب', 'complex number'],
    ['عدد مركب', 'complex number'],
    ['أعداد مركّبة', 'complex numbers'],
    ['أعداد مركبة', 'complex numbers'],
    ['كسور متكافئة', 'equivalent fractions'],
    ['كسور', 'fractions'],
    ['كسر', 'fraction'],
    ['القيمة المنزلية', 'place value'],
    ['المقارنة', 'comparison'],
    ['الترتيب', 'ordering'],
    ['الجمع', 'addition'],
    ['الطرح', 'subtraction'],
    ['الضرب', 'multiplication'],
    ['القسمة', 'division'],
    ['تقريب', 'rounding'],
    ['تقدير', 'estimation'],
    ['محيط', 'perimeter'],
    ['مساحة', 'area'],
    ['حجم', 'volume'],
    ['زاوية', 'angle'],
    ['زوايا', 'angles'],
    ['مثلث', 'triangle'],
    ['مستطيل', 'rectangle'],
    ['مربع', 'square'],
    ['دائرة', 'circle'],
    ['متجه', 'vector'],
    ['متجهات', 'vectors'],
    ['مصفوفة', 'matrix'],
    ['مصفوفات', 'matrices'],
    ['اقتران', 'function'],
    ['اقترانات', 'functions'],
    ['مشتقة', 'derivative'],
    ['تكامل', 'integral'],
    ['معادلة', 'equation'],
    ['معادلات', 'equations'],
    ['متباينة', 'inequality'],
    ['احتمال', 'probability'],
    ['بيانات', 'data'],
    ['مستقيم', 'line'],
    ['نمط', 'pattern'],
    ['أنماط', 'patterns'],
    ['نقود', 'money'],
    ['وقت', 'time'],
    ['طول', 'length'],
    ['كتلة', 'mass'],
    ['سعة', 'capacity'],
    ['مثلثية', 'trigonometric'],
    ['لوغاريتمية', 'logarithmic'],
    ['أسّية', 'exponential'],
    ['تفاضلية', 'differential'],
    ['ضمنية', 'implicit'],
    ['فضاء', 'space'],
  ];

  for (const [arNoun, enNoun] of nounMap) {
    if (ar.includes(arNoun)) {
      nouns.push(enNoun);
      if (nouns.length >= 3) break;
    }
  }

  const nounStr = nouns.length > 0 ? ' ' + nouns.join(', ') : ' mathematical concepts';
  // Truncate to keep it concise
  const result = verb + nounStr;
  return result.length > 60 ? result.slice(0, 57) + '...' : result;
}

function extractNumberRange(ar: string, prefix: string, suffix: string): string {
  const m = ar.match(/حتى\s+(\d+)/);
  const range = m ? `up to ${m[1]}` : '';
  return `${prefix} ${range} ${suffix}`.replace(/\s+/g, ' ').trim();
}

// ────────────────────────────────────────────────────────────────
// 7. Outcome-level English translation (reuse same logic)
// ────────────────────────────────────────────────────────────────
function translateOutcome(ar: string): string {
  const t = ar.trim();
  // Try specific translations for common outcomes
  if (t.includes('يقرأ') && t.includes('يكتب') && t.includes('الأعداد الكلية')) return 'Read, write, and represent whole numbers';
  if (t.includes('يعدّ تسلسلياً وقفزياً')) return 'Count sequentially and by skip counting';
  if (t.includes('القيمة المنزلية') && t.includes('يجد')) return 'Find place value of digit in a number';
  if (t.includes('القيمة المنزلية') && t.includes('يتعرف')) return 'Identify place value concepts';
  if (t.includes('القيمة المنزلية') && t.includes('المقارنة')) return 'Use place value for comparison and ordering';
  if (t.includes('الصورة التحليلية') && t.includes('المقارنات')) return 'Write numbers in expanded form and use for comparisons';
  if (t.includes('يقرّب الأعداد الكلية')) return 'Round whole numbers';
  if (t.includes('التقريب لتقدير') && t.includes('التحقق')) return 'Use rounding to estimate results and verify answers';
  if (t.includes('يجمع ويطرح') && t.includes('استراتيجيات')) return 'Add and subtract using various strategies';
  if (t.includes('يحل مسائل') && t.includes('جمع') && t.includes('أربع')) return 'Solve problems with 4-digit addition and subtraction';
  if (t.includes('حقائق الضرب والقسمة')) return 'Learn multiplication and division facts and their relationships';
  if (t.includes('يضرب أعداداً كلية مكوّنة')) return 'Multiply 2-digit by 1-digit whole numbers';
  if (t.includes('يقسم أعداداً كلية مكوّنة')) return 'Divide 2-digit by 1-digit whole numbers';
  if (t.includes('تقدير نواتج العمليات')) return 'Use strategies to estimate operation results';
  if (t.includes('مفهوم الكسر') && t.includes('أجزاء متساوية')) return 'Identify fraction as equal parts of a whole';
  if (t.includes('الكسور المتكافئة') && t.includes('يقارن')) return 'Identify, represent, compare, and order equivalent fractions';
  if (t.includes('مفهوم الأجزاء المتطابقة')) return 'Identify concept of congruent parts';
  if (t.includes('مفهوم الكسر') && t.includes('نماذج')) return 'Identify fraction as part of whole using models';
  // Fallback
  return translateIndicator(ar);
}

// ────────────────────────────────────────────────────────────────
// 8. Main build logic
// ────────────────────────────────────────────────────────────────
const PROJECT_ROOT = path.resolve(__dirname, '..');
const CURRICULA_DIR = path.join(PROJECT_ROOT, 'data', 'curricula');

// Grade files in order
const GRADE_FILES = [
  'grade1-math-raw.json',
  'grade2-math-raw.json',
  'grade3-math-raw.json',
  'grade4-math-raw.json',
  'grade5-math-raw.json',
  'grade6-math-raw.json',
  'grade7-math-raw.json',
  'grade8-math-raw.json',
  'grade9-math-raw.json',
  'grade10-math-raw.json',
  'grade11-math-raw.json',
  'grade12-math-raw.json',
  'grade12b-math-raw.json',
];

function buildCurriculum(): string {
  const grades: string[] = [];
  let totalKCs = 0;

  for (const file of GRADE_FILES) {
    const filePath = path.join(CURRICULA_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`WARNING: ${file} not found, skipping.`);
      continue;
    }
    const raw: RawGrade = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const grade = raw.gradeLevel;
    // grade12b has gradeLevel 12 but is Business Math – use 13 internally
    const gradeKey = file === 'grade12b-math-raw.json' ? 13 : grade;
    const gradeLabel = gradeKey === 13 ? '12B' : String(grade);

    let kcSeq = 0;      // KC counter within grade
    let loSeq = 0;      // LO counter within grade

    const domainBlocks: string[] = [];

    raw.domains.forEach((domain, dIdx) => {
      const domSlug = slugify(domain.nameEn);
      const domainId = `domain-math-g${gradeLabel}-${domSlug}`;

      const stdBlocks: string[] = [];

      domain.standards.forEach((std, sIdx) => {
        const stdSlug = slugify(std.nameEn);
        const stdId = `std-math-g${gradeLabel}-${stdSlug}`;
        const standardCode = `JO.MATH.G${gradeLabel}.${dIdx + 1}.${sIdx + 1}`;

        // Track previous KC id within this standard for prerequisite chaining
        let prevKcId: string | null = null;

        const loBlocks: string[] = [];

        std.learningOutcomes.forEach((lo) => {
          loSeq++;
          const loId = `lo-math-g${gradeLabel}-${loSeq}`;
          const loBloom = inferBloom(lo.outcomeAr);
          const loEn = translateOutcome(lo.outcomeAr);

          const kcBlocks: string[] = [];

          lo.indicators.forEach((indicator) => {
            kcSeq++;
            const kcId = `kc-math-g${gradeLabel}-${String(kcSeq).padStart(3, '0')}`;
            const kcBloom = inferBloom(indicator);
            const kcDifficulty = estimateDifficulty(grade, kcBloom);
            const kcEn = translateIndicator(indicator);
            const tags = extractTags(indicator);
            const prereqs = prevKcId ? [prevKcId] : [];

            kcBlocks.push(`        {
          id: '${kcId}',
          nameAr: ${JSON.stringify(indicator)},
          nameEn: ${JSON.stringify(kcEn)},
          bloomLevel: ${kcBloom} as BloomLevel,
          difficulty: ${kcDifficulty} as Difficulty,
          prerequisiteKcIds: [${prereqs.map(p => `'${p}'`).join(', ')}],
          tags: [${tags.map(t => JSON.stringify(t)).join(', ')}],
          standardCode: '${standardCode}',
        }`);

            prevKcId = kcId;
            totalKCs++;
          });

          loBlocks.push(`      {
        id: '${loId}',
        outcomeAr: ${JSON.stringify(lo.outcomeAr)},
        outcomeEn: ${JSON.stringify(loEn)},
        bloomLevel: ${loBloom} as BloomLevel,
        indicators: ${JSON.stringify(lo.indicators, null, 10).replace(/\n/g, '\n        ')},
        knowledgeComponents: [
${kcBlocks.join(',\n')}
        ],
      }`);
        });

        stdBlocks.push(`    {
      id: '${stdId}',
      nameAr: ${JSON.stringify(std.nameAr)},
      nameEn: ${JSON.stringify(std.nameEn)},
      learningOutcomes: [
${loBlocks.join(',\n')}
      ],
    }`);
      });

      domainBlocks.push(`  {
    id: '${domainId}',
    nameAr: ${JSON.stringify(domain.nameAr)},
    nameEn: ${JSON.stringify(domain.nameEn)},
    standards: [
${stdBlocks.join(',\n')}
    ],
  }`);
    });

    grades.push(`  {
  gradeLevel: ${grade},
  domains: [
${domainBlocks.join(',\n')}
  ],
}`);

    console.log(`  Grade ${gradeLabel}: ${kcSeq} KCs, ${loSeq} LOs`);
  }

  console.log(`\nTotal KCs: ${totalKCs}`);

  // Build TypeScript source
  const tsSource = `// Auto-generated by scripts/build-curriculum.ts — DO NOT EDIT MANUALLY
// Run:  npx tsx scripts/build-curriculum.ts
//
// Total Knowledge Components: ${totalKCs}

import type { BloomLevel } from '../skillTaxonomy';
import type { CurriculumFramework } from './types';

type Difficulty = 1 | 2 | 3 | 4 | 5;

export const MATH_CURRICULUM: CurriculumFramework = {
  id: 'jo-math-k12',
  subject: 'رياضيات',
  subjectEn: 'Mathematics',
  grades: [
${grades.join(',\n')}
  ],
};
`;

  return tsSource;
}

// ────────────────────────────────────────────────────────────────
// 9. Run
// ────────────────────────────────────────────────────────────────
console.log('Building curriculum data...\n');
const output = buildCurriculum();
const outPath = path.join(CURRICULA_DIR, 'mathCurriculum.ts');
fs.writeFileSync(outPath, output, 'utf-8');
console.log(`\nWritten to: ${outPath}`);
console.log(`File size: ${(Buffer.byteLength(output) / 1024).toFixed(1)} KB`);
