/**
 * Sample Textbook Data - Grade 3 Mathematics
 * Based on Common Core State Standards for Mathematics (CCSSM)
 *
 * Hierarchy: Textbook > Unit > Lesson > Page > KnowledgeComponent (KC)
 *
 * 5 Units, 15 Lessons, 45 Pages, 105 KCs
 * All KCs mapped to Bloom's Taxonomy levels and prerequisite chains.
 */

import { BloomLevel } from './skillTaxonomy';

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface KnowledgeComponent {
  id: string;                    // e.g. "kc-3m-001"
  nameEn: string;
  nameAr: string;
  bloomLevel: BloomLevel;
  difficulty: 1 | 2 | 3 | 4 | 5;
  prerequisiteKcIds: string[];
  tags: string[];
  standardCode?: string;         // Common Core code e.g. "3.OA.1"
}

export interface TextbookPage {
  id: string;                    // e.g. "page-3m-01"
  pageNumber: number;
  nameEn: string;
  nameAr: string;
  kcIds: string[];
}

export interface Lesson {
  id: string;                    // e.g. "lesson-3m-01"
  lessonNumber: number;
  nameEn: string;
  nameAr: string;
  pageIds: string[];
}

export interface Unit {
  id: string;                    // e.g. "unit-3m-01"
  unitNumber: number;
  nameEn: string;
  nameAr: string;
  lessonIds: string[];
}

export interface Textbook {
  id: string;                    // e.g. "textbook-g3-math"
  nameEn: string;
  nameAr: string;
  gradeLevel: number;
  subject: string;               // Links to existing subject in SKILL_TAXONOMY
  unitIds: string[];
}

// ─── Knowledge Components (105 KCs) ───────────────────────────────────────────

const ALL_KCS: KnowledgeComponent[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 1: Operations & Algebraic Thinking (3.OA)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Lesson 1: Understanding Multiplication ---
  // Page 1: Equal Groups
  { id: 'kc-3m-001', nameEn: 'Represent multiplication as equal groups', nameAr: 'تمثيل الضرب كمجموعات متساوية', bloomLevel: 1, difficulty: 1, prerequisiteKcIds: [], tags: ['multiplication', 'visual'], standardCode: '3.OA.1' },
  { id: 'kc-3m-002', nameEn: 'Interpret products of whole numbers', nameAr: 'تفسير ناتج ضرب الأعداد الصحيحة', bloomLevel: 2, difficulty: 2, prerequisiteKcIds: ['kc-3m-001'], tags: ['multiplication', 'interpretation'], standardCode: '3.OA.1' },
  { id: 'kc-3m-003', nameEn: 'Write multiplication expressions from models', nameAr: 'كتابة عبارات الضرب من النماذج', bloomLevel: 3, difficulty: 2, prerequisiteKcIds: ['kc-3m-001'], tags: ['multiplication', 'expressions'], standardCode: '3.OA.1' },

  // Page 2: Arrays and Multiplication
  { id: 'kc-3m-004', nameEn: 'Use arrays to model multiplication', nameAr: 'استخدام المصفوفات لنمذجة الضرب', bloomLevel: 2, difficulty: 2, prerequisiteKcIds: ['kc-3m-001'], tags: ['multiplication', 'arrays'], standardCode: '3.OA.1' },
  { id: 'kc-3m-005', nameEn: 'Write multiplication equations from arrays', nameAr: 'كتابة معادلات الضرب من المصفوفات', bloomLevel: 3, difficulty: 2, prerequisiteKcIds: ['kc-3m-004'], tags: ['multiplication', 'arrays', 'equations'], standardCode: '3.OA.1' },

  // Page 3: Commutative Property
  { id: 'kc-3m-006', nameEn: 'Understand the commutative property of multiplication', nameAr: 'فهم خاصية الإبدال في الضرب', bloomLevel: 2, difficulty: 2, prerequisiteKcIds: ['kc-3m-002'], tags: ['multiplication', 'properties'], standardCode: '3.OA.5' },
  { id: 'kc-3m-007', nameEn: 'Apply commutative property to solve problems', nameAr: 'تطبيق خاصية الإبدال لحل المسائل', bloomLevel: 3, difficulty: 3, prerequisiteKcIds: ['kc-3m-006'], tags: ['multiplication', 'properties', 'problem-solving'], standardCode: '3.OA.5' },

  // --- Lesson 2: Multiplication Facts ---
  // Page 4: Multiply by 2, 5, and 10
  { id: 'kc-3m-008', nameEn: 'Multiply by 2 fluently', nameAr: 'الضرب في 2 بطلاقة', bloomLevel: 1, difficulty: 1, prerequisiteKcIds: ['kc-3m-003'], tags: ['multiplication', 'facts'], standardCode: '3.OA.7' },
  { id: 'kc-3m-009', nameEn: 'Multiply by 5 fluently', nameAr: 'الضرب في 5 بطلاقة', bloomLevel: 1, difficulty: 1, prerequisiteKcIds: ['kc-3m-003'], tags: ['multiplication', 'facts'], standardCode: '3.OA.7' },
  { id: 'kc-3m-010', nameEn: 'Multiply by 10 fluently', nameAr: 'الضرب في 10 بطلاقة', bloomLevel: 1, difficulty: 1, prerequisiteKcIds: ['kc-3m-003'], tags: ['multiplication', 'facts'], standardCode: '3.OA.7' },

  // Page 5: Multiply by 3, 4, and 6
  { id: 'kc-3m-011', nameEn: 'Multiply by 3 fluently', nameAr: 'الضرب في 3 بطلاقة', bloomLevel: 1, difficulty: 2, prerequisiteKcIds: ['kc-3m-008'], tags: ['multiplication', 'facts'], standardCode: '3.OA.7' },
  { id: 'kc-3m-012', nameEn: 'Multiply by 4 fluently', nameAr: 'الضرب في 4 بطلاقة', bloomLevel: 1, difficulty: 2, prerequisiteKcIds: ['kc-3m-008'], tags: ['multiplication', 'facts'], standardCode: '3.OA.7' },
  { id: 'kc-3m-013', nameEn: 'Multiply by 6 fluently', nameAr: 'الضرب في 6 بطلاقة', bloomLevel: 1, difficulty: 2, prerequisiteKcIds: ['kc-3m-011'], tags: ['multiplication', 'facts'], standardCode: '3.OA.7' },

  // Page 6: Multiply by 7, 8, and 9
  { id: 'kc-3m-014', nameEn: 'Multiply by 7 fluently', nameAr: 'الضرب في 7 بطلاقة', bloomLevel: 1, difficulty: 3, prerequisiteKcIds: ['kc-3m-011'], tags: ['multiplication', 'facts'], standardCode: '3.OA.7' },
  { id: 'kc-3m-015', nameEn: 'Multiply by 8 fluently', nameAr: 'الضرب في 8 بطلاقة', bloomLevel: 1, difficulty: 3, prerequisiteKcIds: ['kc-3m-012'], tags: ['multiplication', 'facts'], standardCode: '3.OA.7' },
  { id: 'kc-3m-016', nameEn: 'Multiply by 9 fluently', nameAr: 'الضرب في 9 بطلاقة', bloomLevel: 1, difficulty: 3, prerequisiteKcIds: ['kc-3m-011'], tags: ['multiplication', 'facts'], standardCode: '3.OA.7' },

  // --- Lesson 3: Understanding Division ---
  // Page 7: Division as Equal Sharing
  { id: 'kc-3m-017', nameEn: 'Understand division as equal sharing', nameAr: 'فهم القسمة كتوزيع متساوٍ', bloomLevel: 2, difficulty: 2, prerequisiteKcIds: ['kc-3m-002'], tags: ['division', 'sharing'], standardCode: '3.OA.2' },
  { id: 'kc-3m-018', nameEn: 'Interpret whole-number quotients', nameAr: 'تفسير ناتج قسمة الأعداد الصحيحة', bloomLevel: 2, difficulty: 2, prerequisiteKcIds: ['kc-3m-017'], tags: ['division', 'interpretation'], standardCode: '3.OA.2' },

  // Page 8: Division as Equal Grouping
  { id: 'kc-3m-019', nameEn: 'Understand division as equal grouping', nameAr: 'فهم القسمة كتجميع متساوٍ', bloomLevel: 2, difficulty: 2, prerequisiteKcIds: ['kc-3m-017'], tags: ['division', 'grouping'], standardCode: '3.OA.2' },
  { id: 'kc-3m-020', nameEn: 'Write division equations from models', nameAr: 'كتابة معادلات القسمة من النماذج', bloomLevel: 3, difficulty: 3, prerequisiteKcIds: ['kc-3m-019'], tags: ['division', 'equations'], standardCode: '3.OA.2' },

  // Page 9: Relationship Between Multiplication and Division
  { id: 'kc-3m-021', nameEn: 'Understand multiplication-division relationship', nameAr: 'فهم العلاقة بين الضرب والقسمة', bloomLevel: 2, difficulty: 3, prerequisiteKcIds: ['kc-3m-005', 'kc-3m-020'], tags: ['multiplication', 'division', 'relationship'], standardCode: '3.OA.6' },
  { id: 'kc-3m-022', nameEn: 'Use multiplication to check division', nameAr: 'استخدام الضرب للتحقق من القسمة', bloomLevel: 3, difficulty: 3, prerequisiteKcIds: ['kc-3m-021'], tags: ['division', 'verification'], standardCode: '3.OA.6' },

  // --- Lesson 4: Multiplication & Division Word Problems ---
  // Page 10: One-Step Word Problems
  { id: 'kc-3m-023', nameEn: 'Solve one-step multiplication word problems', nameAr: 'حل مسائل كلامية بخطوة واحدة في الضرب', bloomLevel: 3, difficulty: 3, prerequisiteKcIds: ['kc-3m-008', 'kc-3m-005'], tags: ['multiplication', 'word-problems'], standardCode: '3.OA.3' },
  { id: 'kc-3m-024', nameEn: 'Solve one-step division word problems', nameAr: 'حل مسائل كلامية بخطوة واحدة في القسمة', bloomLevel: 3, difficulty: 3, prerequisiteKcIds: ['kc-3m-020', 'kc-3m-021'], tags: ['division', 'word-problems'], standardCode: '3.OA.3' },

  // Page 11: Two-Step Word Problems
  { id: 'kc-3m-025', nameEn: 'Solve two-step word problems with four operations', nameAr: 'حل مسائل كلامية من خطوتين', bloomLevel: 4, difficulty: 4, prerequisiteKcIds: ['kc-3m-023', 'kc-3m-024'], tags: ['word-problems', 'multi-step'], standardCode: '3.OA.8' },
  { id: 'kc-3m-026', nameEn: 'Represent word problems with equations using a letter', nameAr: 'تمثيل المسائل الكلامية بمعادلات تحتوي متغيرًا', bloomLevel: 4, difficulty: 4, prerequisiteKcIds: ['kc-3m-025'], tags: ['equations', 'variables', 'word-problems'], standardCode: '3.OA.8' },

  // Page 12: Arithmetic Patterns
  { id: 'kc-3m-027', nameEn: 'Identify patterns in the addition table', nameAr: 'تحديد الأنماط في جدول الجمع', bloomLevel: 4, difficulty: 3, prerequisiteKcIds: ['kc-3m-002'], tags: ['patterns', 'addition'], standardCode: '3.OA.9' },
  { id: 'kc-3m-028', nameEn: 'Identify patterns in the multiplication table', nameAr: 'تحديد الأنماط في جدول الضرب', bloomLevel: 4, difficulty: 3, prerequisiteKcIds: ['kc-3m-008'], tags: ['patterns', 'multiplication'], standardCode: '3.OA.9' },
  { id: 'kc-3m-029', nameEn: 'Explain arithmetic patterns using properties', nameAr: 'تفسير الأنماط الحسابية باستخدام الخصائص', bloomLevel: 5, difficulty: 4, prerequisiteKcIds: ['kc-3m-027', 'kc-3m-028'], tags: ['patterns', 'properties', 'reasoning'], standardCode: '3.OA.9' },

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 2: Number & Operations in Base Ten (3.NBT)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Lesson 5: Place Value ---
  // Page 13: Understanding Place Value to 1000
  { id: 'kc-3m-030', nameEn: 'Identify ones, tens, and hundreds in a number', nameAr: 'تحديد الآحاد والعشرات والمئات في العدد', bloomLevel: 1, difficulty: 1, prerequisiteKcIds: [], tags: ['place-value', 'number-sense'], standardCode: '3.NBT.1' },
  { id: 'kc-3m-031', nameEn: 'Read and write numbers to 1000 in expanded form', nameAr: 'قراءة وكتابة الأعداد حتى 1000 بالصيغة الموسعة', bloomLevel: 2, difficulty: 2, prerequisiteKcIds: ['kc-3m-030'], tags: ['place-value', 'expanded-form'], standardCode: '3.NBT.1' },

  // Page 14: Comparing Numbers
  { id: 'kc-3m-032', nameEn: 'Compare three-digit numbers using place value', nameAr: 'مقارنة أعداد من ثلاث خانات باستخدام القيمة المكانية', bloomLevel: 2, difficulty: 2, prerequisiteKcIds: ['kc-3m-030'], tags: ['place-value', 'comparing'], standardCode: '3.NBT.1' },
  { id: 'kc-3m-033', nameEn: 'Order numbers to 1000 from least to greatest', nameAr: 'ترتيب الأعداد حتى 1000 تصاعديًا', bloomLevel: 2, difficulty: 2, prerequisiteKcIds: ['kc-3m-032'], tags: ['ordering', 'number-sense'], standardCode: '3.NBT.1' },

  // --- Lesson 6: Rounding Numbers ---
  // Page 15: Rounding to the Nearest 10
  { id: 'kc-3m-034', nameEn: 'Round whole numbers to the nearest 10', nameAr: 'تقريب الأعداد الصحيحة لأقرب 10', bloomLevel: 3, difficulty: 2, prerequisiteKcIds: ['kc-3m-030'], tags: ['rounding', 'estimation'], standardCode: '3.NBT.1' },
  { id: 'kc-3m-035', nameEn: 'Use a number line to round numbers', nameAr: 'استخدام خط الأعداد لتقريب الأعداد', bloomLevel: 2, difficulty: 2, prerequisiteKcIds: ['kc-3m-034'], tags: ['rounding', 'number-line'], standardCode: '3.NBT.1' },

  // Page 16: Rounding to the Nearest 100
  { id: 'kc-3m-036', nameEn: 'Round whole numbers to the nearest 100', nameAr: 'تقريب الأعداد الصحيحة لأقرب 100', bloomLevel: 3, difficulty: 3, prerequisiteKcIds: ['kc-3m-034'], tags: ['rounding', 'estimation'], standardCode: '3.NBT.1' },
  { id: 'kc-3m-037', nameEn: 'Use rounding to estimate sums and differences', nameAr: 'استخدام التقريب لتقدير المجاميع والفروق', bloomLevel: 3, difficulty: 3, prerequisiteKcIds: ['kc-3m-036'], tags: ['rounding', 'estimation', 'addition', 'subtraction'], standardCode: '3.NBT.1' },

  // --- Lesson 7: Addition & Subtraction within 1000 ---
  // Page 17: Addition Strategies
  { id: 'kc-3m-038', nameEn: 'Add within 1000 using place value strategies', nameAr: 'الجمع ضمن 1000 باستخدام استراتيجيات القيمة المكانية', bloomLevel: 3, difficulty: 2, prerequisiteKcIds: ['kc-3m-031'], tags: ['addition', 'strategies'], standardCode: '3.NBT.2' },
  { id: 'kc-3m-039', nameEn: 'Add within 1000 with regrouping', nameAr: 'الجمع ضمن 1000 مع إعادة التجميع', bloomLevel: 3, difficulty: 3, prerequisiteKcIds: ['kc-3m-038'], tags: ['addition', 'regrouping'], standardCode: '3.NBT.2' },

  // Page 18: Subtraction Strategies
  { id: 'kc-3m-040', nameEn: 'Subtract within 1000 using place value strategies', nameAr: 'الطرح ضمن 1000 باستخدام استراتيجيات القيمة المكانية', bloomLevel: 3, difficulty: 2, prerequisiteKcIds: ['kc-3m-031'], tags: ['subtraction', 'strategies'], standardCode: '3.NBT.2' },
  { id: 'kc-3m-041', nameEn: 'Subtract within 1000 with regrouping', nameAr: 'الطرح ضمن 1000 مع إعادة التجميع', bloomLevel: 3, difficulty: 3, prerequisiteKcIds: ['kc-3m-040'], tags: ['subtraction', 'regrouping'], standardCode: '3.NBT.2' },

  // Page 19: Multiply by Multiples of 10
  { id: 'kc-3m-042', nameEn: 'Multiply one-digit numbers by multiples of 10', nameAr: 'ضرب أعداد من خانة واحدة في مضاعفات 10', bloomLevel: 3, difficulty: 3, prerequisiteKcIds: ['kc-3m-010', 'kc-3m-030'], tags: ['multiplication', 'multiples-of-10'], standardCode: '3.NBT.3' },
  { id: 'kc-3m-043', nameEn: 'Explain patterns when multiplying by 10', nameAr: 'تفسير الأنماط عند الضرب في 10', bloomLevel: 4, difficulty: 3, prerequisiteKcIds: ['kc-3m-042'], tags: ['multiplication', 'patterns', 'place-value'], standardCode: '3.NBT.3' },

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 3: Fractions (3.NF)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Lesson 8: Understanding Fractions ---
  // Page 20: What is a Fraction?
  { id: 'kc-3m-044', nameEn: 'Understand a fraction as part of a whole', nameAr: 'فهم الكسر كجزء من الكل', bloomLevel: 2, difficulty: 2, prerequisiteKcIds: [], tags: ['fractions', 'concepts'], standardCode: '3.NF.1' },
  { id: 'kc-3m-045', nameEn: 'Identify numerator and denominator', nameAr: 'تحديد البسط والمقام', bloomLevel: 1, difficulty: 1, prerequisiteKcIds: ['kc-3m-044'], tags: ['fractions', 'vocabulary'], standardCode: '3.NF.1' },
  { id: 'kc-3m-046', nameEn: 'Read and write fractions (halves, thirds, fourths)', nameAr: 'قراءة وكتابة الكسور (أنصاف، أثلاث، أرباع)', bloomLevel: 1, difficulty: 2, prerequisiteKcIds: ['kc-3m-045'], tags: ['fractions', 'notation'], standardCode: '3.NF.1' },

  // Page 21: Unit Fractions
  { id: 'kc-3m-047', nameEn: 'Understand unit fractions (1/b)', nameAr: 'فهم كسور الوحدة (1/ب)', bloomLevel: 2, difficulty: 2, prerequisiteKcIds: ['kc-3m-046'], tags: ['fractions', 'unit-fractions'], standardCode: '3.NF.1' },
  { id: 'kc-3m-048', nameEn: 'Build fractions from unit fractions (a/b = a copies of 1/b)', nameAr: 'بناء الكسور من كسور الوحدة', bloomLevel: 2, difficulty: 3, prerequisiteKcIds: ['kc-3m-047'], tags: ['fractions', 'composition'], standardCode: '3.NF.1' },

  // Page 22: Fractions of a Set
  { id: 'kc-3m-049', nameEn: 'Find a fraction of a set of objects', nameAr: 'إيجاد كسر من مجموعة أشياء', bloomLevel: 3, difficulty: 3, prerequisiteKcIds: ['kc-3m-048'], tags: ['fractions', 'sets'], standardCode: '3.NF.1' },
  { id: 'kc-3m-050', nameEn: 'Represent fractions using visual models', nameAr: 'تمثيل الكسور باستخدام نماذج بصرية', bloomLevel: 2, difficulty: 2, prerequisiteKcIds: ['kc-3m-044'], tags: ['fractions', 'visual-models'], standardCode: '3.NF.1' },

  // --- Lesson 9: Fractions on a Number Line ---
  // Page 23: Placing Unit Fractions on a Number Line
  { id: 'kc-3m-051', nameEn: 'Place unit fractions on a number line', nameAr: 'وضع كسور الوحدة على خط الأعداد', bloomLevel: 2, difficulty: 2, prerequisiteKcIds: ['kc-3m-047'], tags: ['fractions', 'number-line'], standardCode: '3.NF.2' },
  { id: 'kc-3m-052', nameEn: 'Understand a fraction as a point on a number line', nameAr: 'فهم الكسر كنقطة على خط الأعداد', bloomLevel: 2, difficulty: 3, prerequisiteKcIds: ['kc-3m-051'], tags: ['fractions', 'number-line', 'concepts'], standardCode: '3.NF.2' },

  // Page 24: Placing Non-Unit Fractions
  { id: 'kc-3m-053', nameEn: 'Place fractions greater than 1 on a number line', nameAr: 'وضع الكسور الأكبر من 1 على خط الأعداد', bloomLevel: 3, difficulty: 3, prerequisiteKcIds: ['kc-3m-052', 'kc-3m-048'], tags: ['fractions', 'number-line', 'improper'], standardCode: '3.NF.2' },
  { id: 'kc-3m-054', nameEn: 'Identify fractions on a number line diagram', nameAr: 'تحديد الكسور على مخطط خط الأعداد', bloomLevel: 2, difficulty: 2, prerequisiteKcIds: ['kc-3m-052'], tags: ['fractions', 'number-line', 'reading'], standardCode: '3.NF.2' },

  // --- Lesson 10: Comparing Fractions ---
  // Page 25: Equivalent Fractions
  { id: 'kc-3m-055', nameEn: 'Recognize equivalent fractions using visual models', nameAr: 'التعرف على الكسور المتكافئة باستخدام النماذج البصرية', bloomLevel: 2, difficulty: 3, prerequisiteKcIds: ['kc-3m-050'], tags: ['fractions', 'equivalence', 'visual'], standardCode: '3.NF.3' },
  { id: 'kc-3m-056', nameEn: 'Understand whole numbers as fractions (3 = 3/1)', nameAr: 'فهم الأعداد الصحيحة ككسور', bloomLevel: 2, difficulty: 3, prerequisiteKcIds: ['kc-3m-048'], tags: ['fractions', 'whole-numbers'], standardCode: '3.NF.3' },

  // Page 26: Comparing Fractions with Same Denominator
  { id: 'kc-3m-057', nameEn: 'Compare fractions with the same denominator', nameAr: 'مقارنة كسور بنفس المقام', bloomLevel: 3, difficulty: 2, prerequisiteKcIds: ['kc-3m-046'], tags: ['fractions', 'comparing', 'same-denominator'], standardCode: '3.NF.3' },
  { id: 'kc-3m-058', nameEn: 'Use symbols (< > =) to compare fractions', nameAr: 'استخدام الرموز (< > =) لمقارنة الكسور', bloomLevel: 3, difficulty: 2, prerequisiteKcIds: ['kc-3m-057'], tags: ['fractions', 'comparing', 'symbols'], standardCode: '3.NF.3' },

  // Page 27: Comparing Fractions with Same Numerator
  { id: 'kc-3m-059', nameEn: 'Compare fractions with the same numerator', nameAr: 'مقارنة كسور بنفس البسط', bloomLevel: 3, difficulty: 3, prerequisiteKcIds: ['kc-3m-057'], tags: ['fractions', 'comparing', 'same-numerator'], standardCode: '3.NF.3' },
  { id: 'kc-3m-060', nameEn: 'Explain why comparisons are valid only for same whole', nameAr: 'تفسير لماذا المقارنات صالحة فقط لنفس الكل', bloomLevel: 4, difficulty: 4, prerequisiteKcIds: ['kc-3m-059'], tags: ['fractions', 'comparing', 'reasoning'], standardCode: '3.NF.3' },

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 4: Measurement & Data (3.MD)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Lesson 11: Time & Mass ---
  // Page 28: Telling Time
  { id: 'kc-3m-061', nameEn: 'Tell time to the nearest minute', nameAr: 'قراءة الوقت لأقرب دقيقة', bloomLevel: 3, difficulty: 2, prerequisiteKcIds: [], tags: ['time', 'measurement'], standardCode: '3.MD.1' },
  { id: 'kc-3m-062', nameEn: 'Calculate elapsed time in minutes', nameAr: 'حساب الوقت المنقضي بالدقائق', bloomLevel: 3, difficulty: 3, prerequisiteKcIds: ['kc-3m-061'], tags: ['time', 'elapsed-time'], standardCode: '3.MD.1' },

  // Page 29: Measuring Mass
  { id: 'kc-3m-063', nameEn: 'Measure mass in grams and kilograms', nameAr: 'قياس الكتلة بالجرام والكيلوجرام', bloomLevel: 3, difficulty: 2, prerequisiteKcIds: [], tags: ['mass', 'measurement', 'metric'], standardCode: '3.MD.2' },
  { id: 'kc-3m-064', nameEn: 'Solve word problems involving mass', nameAr: 'حل مسائل كلامية تتضمن الكتلة', bloomLevel: 3, difficulty: 3, prerequisiteKcIds: ['kc-3m-063'], tags: ['mass', 'word-problems'], standardCode: '3.MD.2' },

  // Page 30: Measuring Liquid Volume
  { id: 'kc-3m-065', nameEn: 'Measure liquid volume in liters', nameAr: 'قياس حجم السائل باللتر', bloomLevel: 3, difficulty: 2, prerequisiteKcIds: [], tags: ['volume', 'measurement', 'metric'], standardCode: '3.MD.2' },
  { id: 'kc-3m-066', nameEn: 'Solve word problems involving liquid volume', nameAr: 'حل مسائل كلامية تتضمن حجم السائل', bloomLevel: 3, difficulty: 3, prerequisiteKcIds: ['kc-3m-065'], tags: ['volume', 'word-problems'], standardCode: '3.MD.2' },

  // --- Lesson 12: Area ---
  // Page 31: Understanding Area
  { id: 'kc-3m-067', nameEn: 'Understand area as covering a surface', nameAr: 'فهم المساحة كتغطية سطح', bloomLevel: 2, difficulty: 1, prerequisiteKcIds: [], tags: ['area', 'geometry', 'concepts'], standardCode: '3.MD.5' },
  { id: 'kc-3m-068', nameEn: 'Measure area by counting unit squares', nameAr: 'قياس المساحة بعد المربعات الوحدة', bloomLevel: 3, difficulty: 2, prerequisiteKcIds: ['kc-3m-067'], tags: ['area', 'counting', 'measurement'], standardCode: '3.MD.6' },

  // Page 32: Area of Rectangles
  { id: 'kc-3m-069', nameEn: 'Find area of a rectangle by tiling', nameAr: 'إيجاد مساحة المستطيل بالتبليط', bloomLevel: 3, difficulty: 2, prerequisiteKcIds: ['kc-3m-068'], tags: ['area', 'rectangles', 'tiling'], standardCode: '3.MD.7' },
  { id: 'kc-3m-070', nameEn: 'Find area using multiplication (length x width)', nameAr: 'إيجاد المساحة باستخدام الضرب (الطول × العرض)', bloomLevel: 3, difficulty: 3, prerequisiteKcIds: ['kc-3m-069', 'kc-3m-008'], tags: ['area', 'rectangles', 'multiplication'], standardCode: '3.MD.7' },
  { id: 'kc-3m-071', nameEn: 'Connect area to multiplication and addition', nameAr: 'ربط المساحة بالضرب والجمع', bloomLevel: 4, difficulty: 3, prerequisiteKcIds: ['kc-3m-070'], tags: ['area', 'multiplication', 'connection'], standardCode: '3.MD.7' },

  // Page 33: Composite Figures Area
  { id: 'kc-3m-072', nameEn: 'Find area of composite shapes by decomposing', nameAr: 'إيجاد مساحة الأشكال المركبة بالتفكيك', bloomLevel: 4, difficulty: 4, prerequisiteKcIds: ['kc-3m-070'], tags: ['area', 'composite', 'decomposition'], standardCode: '3.MD.7' },
  { id: 'kc-3m-073', nameEn: 'Apply distributive property to area', nameAr: 'تطبيق خاصية التوزيع على المساحة', bloomLevel: 4, difficulty: 4, prerequisiteKcIds: ['kc-3m-072', 'kc-3m-007'], tags: ['area', 'distributive-property'], standardCode: '3.MD.7' },

  // --- Lesson 13: Perimeter ---
  // Page 34: Understanding Perimeter
  { id: 'kc-3m-074', nameEn: 'Understand perimeter as distance around a shape', nameAr: 'فهم المحيط كمسافة حول الشكل', bloomLevel: 2, difficulty: 1, prerequisiteKcIds: [], tags: ['perimeter', 'geometry', 'concepts'], standardCode: '3.MD.8' },
  { id: 'kc-3m-075', nameEn: 'Find perimeter by adding side lengths', nameAr: 'إيجاد المحيط بجمع أطوال الأضلاع', bloomLevel: 3, difficulty: 2, prerequisiteKcIds: ['kc-3m-074'], tags: ['perimeter', 'addition'], standardCode: '3.MD.8' },

  // Page 35: Perimeter of Regular Shapes
  { id: 'kc-3m-076', nameEn: 'Find perimeter of regular polygons using multiplication', nameAr: 'إيجاد محيط المضلعات المنتظمة باستخدام الضرب', bloomLevel: 3, difficulty: 2, prerequisiteKcIds: ['kc-3m-075', 'kc-3m-008'], tags: ['perimeter', 'multiplication', 'regular-polygons'], standardCode: '3.MD.8' },
  { id: 'kc-3m-077', nameEn: 'Find unknown side length given perimeter', nameAr: 'إيجاد طول ضلع مجهول بمعرفة المحيط', bloomLevel: 4, difficulty: 3, prerequisiteKcIds: ['kc-3m-075'], tags: ['perimeter', 'unknown', 'algebra'], standardCode: '3.MD.8' },

  // Page 36: Comparing Area and Perimeter
  { id: 'kc-3m-078', nameEn: 'Distinguish between area and perimeter', nameAr: 'التمييز بين المساحة والمحيط', bloomLevel: 4, difficulty: 3, prerequisiteKcIds: ['kc-3m-070', 'kc-3m-075'], tags: ['area', 'perimeter', 'comparison'], standardCode: '3.MD.8' },
  { id: 'kc-3m-079', nameEn: 'Find rectangles with same perimeter but different areas', nameAr: 'إيجاد مستطيلات بنفس المحيط ومساحات مختلفة', bloomLevel: 5, difficulty: 4, prerequisiteKcIds: ['kc-3m-078'], tags: ['area', 'perimeter', 'exploration'], standardCode: '3.MD.8' },

  // Page 37: Data & Graphs
  { id: 'kc-3m-080', nameEn: 'Read and interpret bar graphs', nameAr: 'قراءة وتفسير الرسوم البيانية العمودية', bloomLevel: 2, difficulty: 2, prerequisiteKcIds: [], tags: ['data', 'bar-graphs', 'interpretation'], standardCode: '3.MD.3' },
  { id: 'kc-3m-081', nameEn: 'Create a bar graph from data', nameAr: 'إنشاء رسم بياني عمودي من البيانات', bloomLevel: 3, difficulty: 3, prerequisiteKcIds: ['kc-3m-080'], tags: ['data', 'bar-graphs', 'creation'], standardCode: '3.MD.3' },
  { id: 'kc-3m-082', nameEn: 'Solve problems using data from graphs', nameAr: 'حل مسائل باستخدام بيانات من الرسوم البيانية', bloomLevel: 4, difficulty: 3, prerequisiteKcIds: ['kc-3m-080'], tags: ['data', 'problem-solving', 'graphs'], standardCode: '3.MD.3' },

  // Page 38: Picture Graphs and Line Plots
  { id: 'kc-3m-083', nameEn: 'Read and interpret picture graphs', nameAr: 'قراءة وتفسير الرسوم التصويرية', bloomLevel: 2, difficulty: 2, prerequisiteKcIds: [], tags: ['data', 'picture-graphs'], standardCode: '3.MD.3' },
  { id: 'kc-3m-084', nameEn: 'Generate measurement data and display on a line plot', nameAr: 'توليد بيانات القياس وعرضها على مخطط النقاط', bloomLevel: 3, difficulty: 3, prerequisiteKcIds: ['kc-3m-083'], tags: ['data', 'line-plots', 'measurement'], standardCode: '3.MD.4' },

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIT 5: Geometry (3.G)
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Lesson 14: Shape Attributes ---
  // Page 39: Classifying Quadrilaterals
  { id: 'kc-3m-085', nameEn: 'Identify and describe quadrilaterals', nameAr: 'تحديد ووصف الأشكال الرباعية', bloomLevel: 1, difficulty: 2, prerequisiteKcIds: [], tags: ['geometry', 'quadrilaterals', 'classification'], standardCode: '3.G.1' },
  { id: 'kc-3m-086', nameEn: 'Classify quadrilaterals by their attributes', nameAr: 'تصنيف الأشكال الرباعية حسب خصائصها', bloomLevel: 4, difficulty: 3, prerequisiteKcIds: ['kc-3m-085'], tags: ['geometry', 'quadrilaterals', 'attributes'], standardCode: '3.G.1' },

  // Page 40: Triangles and Other Polygons
  { id: 'kc-3m-087', nameEn: 'Identify triangles by number of sides and angles', nameAr: 'تحديد المثلثات حسب عدد الأضلاع والزوايا', bloomLevel: 1, difficulty: 2, prerequisiteKcIds: [], tags: ['geometry', 'triangles', 'identification'], standardCode: '3.G.1' },
  { id: 'kc-3m-088', nameEn: 'Classify polygons by number of sides', nameAr: 'تصنيف المضلعات حسب عدد الأضلاع', bloomLevel: 2, difficulty: 2, prerequisiteKcIds: ['kc-3m-085', 'kc-3m-087'], tags: ['geometry', 'polygons', 'classification'], standardCode: '3.G.1' },

  // Page 41: Shared Attributes
  { id: 'kc-3m-089', nameEn: 'Understand that shapes can share attributes', nameAr: 'فهم أن الأشكال يمكن أن تتشارك في الخصائص', bloomLevel: 2, difficulty: 3, prerequisiteKcIds: ['kc-3m-086', 'kc-3m-088'], tags: ['geometry', 'attributes', 'categories'], standardCode: '3.G.1' },
  { id: 'kc-3m-090', nameEn: 'Explain subcategories of shapes (e.g. squares are rectangles)', nameAr: 'تفسير الفئات الفرعية للأشكال (مثل: المربعات مستطيلات)', bloomLevel: 4, difficulty: 4, prerequisiteKcIds: ['kc-3m-089'], tags: ['geometry', 'hierarchy', 'reasoning'], standardCode: '3.G.1' },

  // --- Lesson 15: Partitioning Shapes ---
  // Page 42: Dividing Shapes into Equal Parts
  { id: 'kc-3m-091', nameEn: 'Partition shapes into equal parts', nameAr: 'تقسيم الأشكال إلى أجزاء متساوية', bloomLevel: 3, difficulty: 2, prerequisiteKcIds: ['kc-3m-044'], tags: ['geometry', 'partitioning', 'fractions'], standardCode: '3.G.2' },
  { id: 'kc-3m-092', nameEn: 'Express each part as a unit fraction of the whole', nameAr: 'التعبير عن كل جزء ككسر وحدة من الكل', bloomLevel: 3, difficulty: 3, prerequisiteKcIds: ['kc-3m-091', 'kc-3m-047'], tags: ['geometry', 'fractions', 'unit-fractions'], standardCode: '3.G.2' },

  // Page 43: Partitioning Rectangles
  { id: 'kc-3m-093', nameEn: 'Partition rectangles into rows and columns of same-size squares', nameAr: 'تقسيم المستطيلات إلى صفوف وأعمدة من مربعات متساوية', bloomLevel: 3, difficulty: 2, prerequisiteKcIds: ['kc-3m-091'], tags: ['geometry', 'rectangles', 'arrays'], standardCode: '3.G.2' },
  { id: 'kc-3m-094', nameEn: 'Connect partitioning to area and multiplication', nameAr: 'ربط التقسيم بالمساحة والضرب', bloomLevel: 4, difficulty: 4, prerequisiteKcIds: ['kc-3m-093', 'kc-3m-070'], tags: ['geometry', 'area', 'multiplication', 'connection'], standardCode: '3.G.2' },

  // Page 44: Partitioning Circles and Other Shapes
  { id: 'kc-3m-095', nameEn: 'Partition circles into equal parts', nameAr: 'تقسيم الدوائر إلى أجزاء متساوية', bloomLevel: 3, difficulty: 3, prerequisiteKcIds: ['kc-3m-091'], tags: ['geometry', 'circles', 'partitioning'], standardCode: '3.G.2' },
  { id: 'kc-3m-096', nameEn: 'Identify fractions represented by partitioned shapes', nameAr: 'تحديد الكسور الممثلة بالأشكال المقسمة', bloomLevel: 2, difficulty: 2, prerequisiteKcIds: ['kc-3m-095', 'kc-3m-046'], tags: ['geometry', 'fractions', 'identification'], standardCode: '3.G.2' },

  // Page 45: Problem Solving with Shapes
  { id: 'kc-3m-097', nameEn: 'Solve real-world problems using shape attributes', nameAr: 'حل مسائل حياتية باستخدام خصائص الأشكال', bloomLevel: 3, difficulty: 3, prerequisiteKcIds: ['kc-3m-090'], tags: ['geometry', 'problem-solving', 'real-world'], standardCode: '3.G.1' },
  { id: 'kc-3m-098', nameEn: 'Design shapes given specific attributes', nameAr: 'تصميم أشكال بمعطيات خصائص محددة', bloomLevel: 5, difficulty: 4, prerequisiteKcIds: ['kc-3m-090'], tags: ['geometry', 'design', 'creation'], standardCode: '3.G.1' },
  { id: 'kc-3m-099', nameEn: 'Compare areas of partitioned shapes using fractions', nameAr: 'مقارنة مساحات الأشكال المقسمة باستخدام الكسور', bloomLevel: 4, difficulty: 4, prerequisiteKcIds: ['kc-3m-092', 'kc-3m-070'], tags: ['geometry', 'fractions', 'area', 'comparison'], standardCode: '3.G.2' },

  // --- Cross-cutting KCs (review / synthesis) ---
  { id: 'kc-3m-100', nameEn: 'Apply estimation strategies to check answers', nameAr: 'تطبيق استراتيجيات التقدير للتحقق من الإجابات', bloomLevel: 5, difficulty: 4, prerequisiteKcIds: ['kc-3m-037'], tags: ['estimation', 'verification', 'metacognition'], standardCode: '3.OA.8' },
  { id: 'kc-3m-101', nameEn: 'Justify answers using mathematical reasoning', nameAr: 'تبرير الإجابات باستخدام التفكير الرياضي', bloomLevel: 5, difficulty: 5, prerequisiteKcIds: ['kc-3m-029'], tags: ['reasoning', 'justification', 'metacognition'] },
  { id: 'kc-3m-102', nameEn: 'Choose appropriate operation for a problem', nameAr: 'اختيار العملية المناسبة لمسألة', bloomLevel: 4, difficulty: 3, prerequisiteKcIds: ['kc-3m-023', 'kc-3m-024', 'kc-3m-038', 'kc-3m-040'], tags: ['operations', 'problem-solving', 'selection'] },
  { id: 'kc-3m-103', nameEn: 'Explain mathematical thinking in words', nameAr: 'شرح التفكير الرياضي بالكلمات', bloomLevel: 6, difficulty: 5, prerequisiteKcIds: ['kc-3m-101'], tags: ['communication', 'explanation', 'metacognition'] },
  { id: 'kc-3m-104', nameEn: 'Connect fractions to real-world situations', nameAr: 'ربط الكسور بمواقف حياتية', bloomLevel: 3, difficulty: 3, prerequisiteKcIds: ['kc-3m-049'], tags: ['fractions', 'real-world', 'application'] },
  { id: 'kc-3m-105', nameEn: 'Create a mathematical model for a word problem', nameAr: 'إنشاء نموذج رياضي لمسألة كلامية', bloomLevel: 6, difficulty: 5, prerequisiteKcIds: ['kc-3m-026', 'kc-3m-102'], tags: ['modeling', 'creation', 'word-problems'] },
];

// ─── Pages (45 pages) ──────────────────────────────────────────────────────────

const ALL_PAGES: TextbookPage[] = [
  // Unit 1: Operations & Algebraic Thinking
  { id: 'page-3m-01', pageNumber: 1, nameEn: 'Equal Groups', nameAr: 'المجموعات المتساوية', kcIds: ['kc-3m-001', 'kc-3m-002', 'kc-3m-003'] },
  { id: 'page-3m-02', pageNumber: 2, nameEn: 'Arrays and Multiplication', nameAr: 'المصفوفات والضرب', kcIds: ['kc-3m-004', 'kc-3m-005'] },
  { id: 'page-3m-03', pageNumber: 3, nameEn: 'Commutative Property', nameAr: 'خاصية الإبدال', kcIds: ['kc-3m-006', 'kc-3m-007'] },
  { id: 'page-3m-04', pageNumber: 4, nameEn: 'Multiply by 2, 5, and 10', nameAr: 'الضرب في 2 و5 و10', kcIds: ['kc-3m-008', 'kc-3m-009', 'kc-3m-010'] },
  { id: 'page-3m-05', pageNumber: 5, nameEn: 'Multiply by 3, 4, and 6', nameAr: 'الضرب في 3 و4 و6', kcIds: ['kc-3m-011', 'kc-3m-012', 'kc-3m-013'] },
  { id: 'page-3m-06', pageNumber: 6, nameEn: 'Multiply by 7, 8, and 9', nameAr: 'الضرب في 7 و8 و9', kcIds: ['kc-3m-014', 'kc-3m-015', 'kc-3m-016'] },
  { id: 'page-3m-07', pageNumber: 7, nameEn: 'Division as Equal Sharing', nameAr: 'القسمة كتوزيع متساوٍ', kcIds: ['kc-3m-017', 'kc-3m-018'] },
  { id: 'page-3m-08', pageNumber: 8, nameEn: 'Division as Equal Grouping', nameAr: 'القسمة كتجميع متساوٍ', kcIds: ['kc-3m-019', 'kc-3m-020'] },
  { id: 'page-3m-09', pageNumber: 9, nameEn: 'Multiplication-Division Relationship', nameAr: 'العلاقة بين الضرب والقسمة', kcIds: ['kc-3m-021', 'kc-3m-022'] },
  { id: 'page-3m-10', pageNumber: 10, nameEn: 'One-Step Word Problems', nameAr: 'مسائل كلامية بخطوة واحدة', kcIds: ['kc-3m-023', 'kc-3m-024'] },
  { id: 'page-3m-11', pageNumber: 11, nameEn: 'Two-Step Word Problems', nameAr: 'مسائل كلامية من خطوتين', kcIds: ['kc-3m-025', 'kc-3m-026'] },
  { id: 'page-3m-12', pageNumber: 12, nameEn: 'Arithmetic Patterns', nameAr: 'الأنماط الحسابية', kcIds: ['kc-3m-027', 'kc-3m-028', 'kc-3m-029'] },

  // Unit 2: Number & Operations in Base Ten
  { id: 'page-3m-13', pageNumber: 13, nameEn: 'Understanding Place Value to 1000', nameAr: 'فهم القيمة المكانية حتى 1000', kcIds: ['kc-3m-030', 'kc-3m-031'] },
  { id: 'page-3m-14', pageNumber: 14, nameEn: 'Comparing Numbers', nameAr: 'مقارنة الأعداد', kcIds: ['kc-3m-032', 'kc-3m-033'] },
  { id: 'page-3m-15', pageNumber: 15, nameEn: 'Rounding to the Nearest 10', nameAr: 'التقريب لأقرب 10', kcIds: ['kc-3m-034', 'kc-3m-035'] },
  { id: 'page-3m-16', pageNumber: 16, nameEn: 'Rounding to the Nearest 100', nameAr: 'التقريب لأقرب 100', kcIds: ['kc-3m-036', 'kc-3m-037'] },
  { id: 'page-3m-17', pageNumber: 17, nameEn: 'Addition Strategies', nameAr: 'استراتيجيات الجمع', kcIds: ['kc-3m-038', 'kc-3m-039'] },
  { id: 'page-3m-18', pageNumber: 18, nameEn: 'Subtraction Strategies', nameAr: 'استراتيجيات الطرح', kcIds: ['kc-3m-040', 'kc-3m-041'] },
  { id: 'page-3m-19', pageNumber: 19, nameEn: 'Multiply by Multiples of 10', nameAr: 'الضرب في مضاعفات 10', kcIds: ['kc-3m-042', 'kc-3m-043'] },

  // Unit 3: Fractions
  { id: 'page-3m-20', pageNumber: 20, nameEn: 'What is a Fraction?', nameAr: 'ما هو الكسر؟', kcIds: ['kc-3m-044', 'kc-3m-045', 'kc-3m-046'] },
  { id: 'page-3m-21', pageNumber: 21, nameEn: 'Unit Fractions', nameAr: 'كسور الوحدة', kcIds: ['kc-3m-047', 'kc-3m-048'] },
  { id: 'page-3m-22', pageNumber: 22, nameEn: 'Fractions of a Set', nameAr: 'كسور المجموعة', kcIds: ['kc-3m-049', 'kc-3m-050'] },
  { id: 'page-3m-23', pageNumber: 23, nameEn: 'Placing Unit Fractions on a Number Line', nameAr: 'وضع كسور الوحدة على خط الأعداد', kcIds: ['kc-3m-051', 'kc-3m-052'] },
  { id: 'page-3m-24', pageNumber: 24, nameEn: 'Placing Non-Unit Fractions', nameAr: 'وضع الكسور غير الوحدة', kcIds: ['kc-3m-053', 'kc-3m-054'] },
  { id: 'page-3m-25', pageNumber: 25, nameEn: 'Equivalent Fractions', nameAr: 'الكسور المتكافئة', kcIds: ['kc-3m-055', 'kc-3m-056'] },
  { id: 'page-3m-26', pageNumber: 26, nameEn: 'Comparing Fractions with Same Denominator', nameAr: 'مقارنة الكسور بنفس المقام', kcIds: ['kc-3m-057', 'kc-3m-058'] },
  { id: 'page-3m-27', pageNumber: 27, nameEn: 'Comparing Fractions with Same Numerator', nameAr: 'مقارنة الكسور بنفس البسط', kcIds: ['kc-3m-059', 'kc-3m-060'] },

  // Unit 4: Measurement & Data
  { id: 'page-3m-28', pageNumber: 28, nameEn: 'Telling Time', nameAr: 'قراءة الوقت', kcIds: ['kc-3m-061', 'kc-3m-062'] },
  { id: 'page-3m-29', pageNumber: 29, nameEn: 'Measuring Mass', nameAr: 'قياس الكتلة', kcIds: ['kc-3m-063', 'kc-3m-064'] },
  { id: 'page-3m-30', pageNumber: 30, nameEn: 'Measuring Liquid Volume', nameAr: 'قياس حجم السائل', kcIds: ['kc-3m-065', 'kc-3m-066'] },
  { id: 'page-3m-31', pageNumber: 31, nameEn: 'Understanding Area', nameAr: 'فهم المساحة', kcIds: ['kc-3m-067', 'kc-3m-068'] },
  { id: 'page-3m-32', pageNumber: 32, nameEn: 'Area of Rectangles', nameAr: 'مساحة المستطيلات', kcIds: ['kc-3m-069', 'kc-3m-070', 'kc-3m-071'] },
  { id: 'page-3m-33', pageNumber: 33, nameEn: 'Composite Figures Area', nameAr: 'مساحة الأشكال المركبة', kcIds: ['kc-3m-072', 'kc-3m-073'] },
  { id: 'page-3m-34', pageNumber: 34, nameEn: 'Understanding Perimeter', nameAr: 'فهم المحيط', kcIds: ['kc-3m-074', 'kc-3m-075'] },
  { id: 'page-3m-35', pageNumber: 35, nameEn: 'Perimeter of Regular Shapes', nameAr: 'محيط الأشكال المنتظمة', kcIds: ['kc-3m-076', 'kc-3m-077'] },
  { id: 'page-3m-36', pageNumber: 36, nameEn: 'Comparing Area and Perimeter', nameAr: 'مقارنة المساحة والمحيط', kcIds: ['kc-3m-078', 'kc-3m-079'] },
  { id: 'page-3m-37', pageNumber: 37, nameEn: 'Data & Bar Graphs', nameAr: 'البيانات والرسوم البيانية العمودية', kcIds: ['kc-3m-080', 'kc-3m-081', 'kc-3m-082'] },
  { id: 'page-3m-38', pageNumber: 38, nameEn: 'Picture Graphs and Line Plots', nameAr: 'الرسوم التصويرية ومخططات النقاط', kcIds: ['kc-3m-083', 'kc-3m-084'] },

  // Unit 5: Geometry
  { id: 'page-3m-39', pageNumber: 39, nameEn: 'Classifying Quadrilaterals', nameAr: 'تصنيف الأشكال الرباعية', kcIds: ['kc-3m-085', 'kc-3m-086'] },
  { id: 'page-3m-40', pageNumber: 40, nameEn: 'Triangles and Other Polygons', nameAr: 'المثلثات والمضلعات الأخرى', kcIds: ['kc-3m-087', 'kc-3m-088'] },
  { id: 'page-3m-41', pageNumber: 41, nameEn: 'Shared Attributes', nameAr: 'الخصائص المشتركة', kcIds: ['kc-3m-089', 'kc-3m-090'] },
  { id: 'page-3m-42', pageNumber: 42, nameEn: 'Dividing Shapes into Equal Parts', nameAr: 'تقسيم الأشكال إلى أجزاء متساوية', kcIds: ['kc-3m-091', 'kc-3m-092'] },
  { id: 'page-3m-43', pageNumber: 43, nameEn: 'Partitioning Rectangles', nameAr: 'تقسيم المستطيلات', kcIds: ['kc-3m-093', 'kc-3m-094'] },
  { id: 'page-3m-44', pageNumber: 44, nameEn: 'Partitioning Circles and Other Shapes', nameAr: 'تقسيم الدوائر والأشكال الأخرى', kcIds: ['kc-3m-095', 'kc-3m-096'] },
  { id: 'page-3m-45', pageNumber: 45, nameEn: 'Problem Solving with Shapes', nameAr: 'حل المسائل بالأشكال', kcIds: ['kc-3m-097', 'kc-3m-098', 'kc-3m-099', 'kc-3m-100', 'kc-3m-101', 'kc-3m-102', 'kc-3m-103', 'kc-3m-104', 'kc-3m-105'] },
];

// ─── Lessons (15 lessons) ──────────────────────────────────────────────────────

const ALL_LESSONS: Lesson[] = [
  // Unit 1
  { id: 'lesson-3m-01', lessonNumber: 1, nameEn: 'Understanding Multiplication', nameAr: 'فهم الضرب', pageIds: ['page-3m-01', 'page-3m-02', 'page-3m-03'] },
  { id: 'lesson-3m-02', lessonNumber: 2, nameEn: 'Multiplication Facts', nameAr: 'حقائق الضرب', pageIds: ['page-3m-04', 'page-3m-05', 'page-3m-06'] },
  { id: 'lesson-3m-03', lessonNumber: 3, nameEn: 'Understanding Division', nameAr: 'فهم القسمة', pageIds: ['page-3m-07', 'page-3m-08', 'page-3m-09'] },
  { id: 'lesson-3m-04', lessonNumber: 4, nameEn: 'Multiplication & Division Word Problems', nameAr: 'مسائل كلامية في الضرب والقسمة', pageIds: ['page-3m-10', 'page-3m-11', 'page-3m-12'] },

  // Unit 2
  { id: 'lesson-3m-05', lessonNumber: 5, nameEn: 'Place Value', nameAr: 'القيمة المكانية', pageIds: ['page-3m-13', 'page-3m-14'] },
  { id: 'lesson-3m-06', lessonNumber: 6, nameEn: 'Rounding Numbers', nameAr: 'تقريب الأعداد', pageIds: ['page-3m-15', 'page-3m-16'] },
  { id: 'lesson-3m-07', lessonNumber: 7, nameEn: 'Addition & Subtraction within 1000', nameAr: 'الجمع والطرح ضمن 1000', pageIds: ['page-3m-17', 'page-3m-18', 'page-3m-19'] },

  // Unit 3
  { id: 'lesson-3m-08', lessonNumber: 8, nameEn: 'Understanding Fractions', nameAr: 'فهم الكسور', pageIds: ['page-3m-20', 'page-3m-21', 'page-3m-22'] },
  { id: 'lesson-3m-09', lessonNumber: 9, nameEn: 'Fractions on a Number Line', nameAr: 'الكسور على خط الأعداد', pageIds: ['page-3m-23', 'page-3m-24'] },
  { id: 'lesson-3m-10', lessonNumber: 10, nameEn: 'Comparing Fractions', nameAr: 'مقارنة الكسور', pageIds: ['page-3m-25', 'page-3m-26', 'page-3m-27'] },

  // Unit 4
  { id: 'lesson-3m-11', lessonNumber: 11, nameEn: 'Time & Mass', nameAr: 'الوقت والكتلة', pageIds: ['page-3m-28', 'page-3m-29', 'page-3m-30'] },
  { id: 'lesson-3m-12', lessonNumber: 12, nameEn: 'Area', nameAr: 'المساحة', pageIds: ['page-3m-31', 'page-3m-32', 'page-3m-33'] },
  { id: 'lesson-3m-13', lessonNumber: 13, nameEn: 'Perimeter & Data', nameAr: 'المحيط والبيانات', pageIds: ['page-3m-34', 'page-3m-35', 'page-3m-36', 'page-3m-37', 'page-3m-38'] },

  // Unit 5
  { id: 'lesson-3m-14', lessonNumber: 14, nameEn: 'Shape Attributes', nameAr: 'خصائص الأشكال', pageIds: ['page-3m-39', 'page-3m-40', 'page-3m-41'] },
  { id: 'lesson-3m-15', lessonNumber: 15, nameEn: 'Partitioning Shapes', nameAr: 'تقسيم الأشكال', pageIds: ['page-3m-42', 'page-3m-43', 'page-3m-44', 'page-3m-45'] },
];

// ─── Units (5 units) ───────────────────────────────────────────────────────────

const ALL_UNITS: Unit[] = [
  { id: 'unit-3m-01', unitNumber: 1, nameEn: 'Operations & Algebraic Thinking', nameAr: 'العمليات والتفكير الجبري', lessonIds: ['lesson-3m-01', 'lesson-3m-02', 'lesson-3m-03', 'lesson-3m-04'] },
  { id: 'unit-3m-02', unitNumber: 2, nameEn: 'Number & Operations in Base Ten', nameAr: 'الأعداد والعمليات في النظام العشري', lessonIds: ['lesson-3m-05', 'lesson-3m-06', 'lesson-3m-07'] },
  { id: 'unit-3m-03', unitNumber: 3, nameEn: 'Fractions', nameAr: 'الكسور', lessonIds: ['lesson-3m-08', 'lesson-3m-09', 'lesson-3m-10'] },
  { id: 'unit-3m-04', unitNumber: 4, nameEn: 'Measurement & Data', nameAr: 'القياس والبيانات', lessonIds: ['lesson-3m-11', 'lesson-3m-12', 'lesson-3m-13'] },
  { id: 'unit-3m-05', unitNumber: 5, nameEn: 'Geometry', nameAr: 'الهندسة', lessonIds: ['lesson-3m-14', 'lesson-3m-15'] },
];

// ─── Textbook ──────────────────────────────────────────────────────────────────

export const TEXTBOOK_DATA: Textbook = {
  id: 'textbook-g3-math',
  nameEn: 'Grade 3 Mathematics',
  nameAr: 'الرياضيات للصف الثالث',
  gradeLevel: 3,
  subject: 'رياضيات',
  unitIds: ['unit-3m-01', 'unit-3m-02', 'unit-3m-03', 'unit-3m-04', 'unit-3m-05'],
};

// ─── Flat Lookup Maps ──────────────────────────────────────────────────────────

export const KC_MAP: Record<string, KnowledgeComponent> = {};
for (const kc of ALL_KCS) { KC_MAP[kc.id] = kc; }

export const PAGE_MAP: Record<string, TextbookPage> = {};
for (const page of ALL_PAGES) { PAGE_MAP[page.id] = page; }

export const LESSON_MAP: Record<string, Lesson> = {};
for (const lesson of ALL_LESSONS) { LESSON_MAP[lesson.id] = lesson; }

export const UNIT_MAP: Record<string, Unit> = {};
for (const unit of ALL_UNITS) { UNIT_MAP[unit.id] = unit; }

// ─── Helper Functions ──────────────────────────────────────────────────────────

/** Get all KCs as an array */
export function getAllKCs(): KnowledgeComponent[] {
  return ALL_KCS;
}

/** Get all pages as an array */
export function getAllPages(): TextbookPage[] {
  return ALL_PAGES;
}

/** Get all lessons as an array */
export function getAllLessons(): Lesson[] {
  return ALL_LESSONS;
}

/** Get all units as an array */
export function getAllUnits(): Unit[] {
  return ALL_UNITS;
}

/** Get all KCs for a given page */
export function getKCsForPage(pageId: string): KnowledgeComponent[] {
  const page = PAGE_MAP[pageId];
  if (!page) return [];
  return page.kcIds.map(id => KC_MAP[id]).filter(Boolean);
}

/** Get all KCs for a given lesson (across all its pages) */
export function getKCsForLesson(lessonId: string): KnowledgeComponent[] {
  const lesson = LESSON_MAP[lessonId];
  if (!lesson) return [];
  return lesson.pageIds.flatMap(pid => getKCsForPage(pid));
}

/** Get all KCs for a given unit (across all its lessons) */
export function getKCsForUnit(unitId: string): KnowledgeComponent[] {
  const unit = UNIT_MAP[unitId];
  if (!unit) return [];
  return unit.lessonIds.flatMap(lid => getKCsForLesson(lid));
}

/** Get all prerequisite KCs for a given KC (recursive) */
export function getPrerequisiteChain(kcId: string, visited: Set<string> = new Set()): KnowledgeComponent[] {
  if (visited.has(kcId)) return [];
  visited.add(kcId);

  const kc = KC_MAP[kcId];
  if (!kc) return [];

  const prereqs: KnowledgeComponent[] = [];
  for (const preId of kc.prerequisiteKcIds) {
    const pre = KC_MAP[preId];
    if (pre) {
      prereqs.push(pre);
      prereqs.push(...getPrerequisiteChain(preId, visited));
    }
  }
  return prereqs;
}

/** Get KCs that depend on a given KC (reverse lookup) */
export function getDependentKCs(kcId: string): KnowledgeComponent[] {
  return ALL_KCS.filter(kc => kc.prerequisiteKcIds.includes(kcId));
}

/** Get KCs filtered by Bloom's level */
export function getKCsByBloomLevel(level: BloomLevel): KnowledgeComponent[] {
  return ALL_KCS.filter(kc => kc.bloomLevel === level);
}

/** Get KCs filtered by tag */
export function getKCsByTag(tag: string): KnowledgeComponent[] {
  return ALL_KCS.filter(kc => kc.tags.includes(tag));
}

/** Get the page that contains a given KC */
export function getPageForKC(kcId: string): TextbookPage | undefined {
  return ALL_PAGES.find(p => p.kcIds.includes(kcId));
}

/** Get the lesson that contains a given page */
export function getLessonForPage(pageId: string): Lesson | undefined {
  return ALL_LESSONS.find(l => l.pageIds.includes(pageId));
}

/** Get the unit that contains a given lesson */
export function getUnitForLesson(lessonId: string): Unit | undefined {
  return ALL_UNITS.find(u => u.lessonIds.includes(lessonId));
}
