// parentAppTextbookTreeMock.ts
// ─────────────────────────────────────────────────────────────────────────────
// Seeded, deterministic "Subject Tree" data for the Parent App Skill Map. This
// is the textbook-hierarchy data contract a tree-visualization UI builds
// against:
//
//   trunk   = subject
//   branch  = unit
//   twig    = lesson
//   leaf    = page   (colored by that page's mastery)
//
// The tree's overall health MUST match the subject's existing garden plant, so
// `SubjectTree.masteryPct` is anchored to the *exact* `masteryPct` returned by
// `getChildSkillAreas(childId)` for the same subject (see
// `parentAppSkillMapMock.ts`). Page masteries are distributed so their
// page-count-weighted average lands within ±1 of that anchor, with a gentle
// front-to-back gradient (kids progress earlier units first) plus seeded
// per-page variance so leaves differ. Lesson/unit masteries are *rolled up*
// from their children — never randomized independently.
//
// Pure + deterministic: same (childId, subjectKey) always yields the same tree
// (structure, names, ids, every mastery value). No backend, no localStorage, no
// AI, no network. Mirrors the `createRng` + `hashStringToSeed` PRNG pattern used
// across the sibling mock files (`parentAppMockData.ts`,
// `data/parentAppSchoolMockData.ts`, `parentAppSkillMapMock.ts`).
//
// Naming authenticity follows the existing curriculum model in
// `data/sampleTextbook.ts` + `data/subjectUnits.ts` (Unit → Lesson → Page with
// natural EN-first / complete-AR bilingual topics). Those files are referenced
// for *style only* — nothing is imported from them.
//
// Each blueprint unit carries ≥5 lesson topics and each lesson ≥7 page topics,
// so the seeded structure picker (4-6 units, 3-5 lessons/unit, 4-7 pages/lesson)
// always lands inside range and the trees stay lush (~60-110 pages) without ever
// repeating a topic name.

import {
  getChildSkillAreas,
  statusFromMastery,
  type ParentSkillStatus,
} from './parentAppSkillMapMock';

// ============================================================================
// Seeded PRNG (mirrors parentAppSkillMapMock.ts)
// ============================================================================

import { createRng, hashStringToSeed } from '../../data/mockKit';

// ============================================================================
// Types (exported contract — UI agents build against these)
// ============================================================================

/** A leaf on the tree: a single textbook page, colored by its mastery. */
export interface TreePage {
  /** Stable id, e.g. `child-sara-math-u1-l2-p3`. */
  id: string;
  /** Textbook page number for display (sequential across the whole subject). */
  pageNumber: number;
  /** Short page topic, e.g. "Adding halves". */
  titleAr: string;
  titleEn: string;
  /** 0-100 mastery (0 = not started). */
  masteryPct: number;
  /** Derived via `statusFromMastery(masteryPct)`. */
  status: ParentSkillStatus;
}

/** A twig on the tree: a lesson grouping a handful of pages. */
export interface TreeLesson {
  id: string;
  titleAr: string;
  titleEn: string;
  pages: TreePage[];
  /** Rounded average of its pages' mastery. */
  masteryPct: number;
  status: ParentSkillStatus;
}

/** A branch on the tree: a unit grouping a few lessons. */
export interface TreeUnit {
  id: string;
  titleAr: string;
  titleEn: string;
  lessons: TreeLesson[];
  /** Rounded average of its lessons' mastery, weighted by page count. */
  masteryPct: number;
  status: ParentSkillStatus;
}

/** The whole tree: a subject (trunk) with its units. */
export interface SubjectTree {
  subjectKey: string;
  subjectAr: string;
  subjectEn: string;
  units: TreeUnit[];
  /** Page-count-weighted overall mastery — matches the garden plant (±1). */
  masteryPct: number;
  totalPages: number;
  totalLessons: number;
}

// ============================================================================
// Subject content blueprints
// ============================================================================
// Believable bilingual unit / lesson / page topics per subject. Each unit holds
// ≥5 lesson topics and each lesson ≥7 page topics. The generator slices 4-6
// units, then 3-5 lessons/unit and 4-7 pages/lesson off the *front* of each pool
// (so a unit's opening lessons are its real opening lessons), seeded per (child,
// subject) — yielding a lush, varied-but-stable tree (~60-110 pages).
//
// `subjectAr` / `subjectEn` match the labels in parentAppSkillMapMock.ts so the
// trunk agrees with the garden plant. AR is complete + natural (not
// transliterated); EN-first authoring.

interface PageTopic {
  ar: string;
  en: string;
}

interface LessonBlueprint {
  ar: string;
  en: string;
  /** Page-topic pool for this lesson (≥7; generator slices 4-7). */
  pages: PageTopic[];
}

interface UnitBlueprint {
  ar: string;
  en: string;
  /** Lesson pool for this unit (≥5; generator slices 3-5). */
  lessons: LessonBlueprint[];
}

interface SubjectBlueprint {
  subjectAr: string;
  subjectEn: string;
  /** Unit pool for this subject (≥6; generator slices 4-6). */
  units: UnitBlueprint[];
}

// ----------------------------------------------------------------------------
// MATH
// ----------------------------------------------------------------------------
const MATH_BLUEPRINT: SubjectBlueprint = {
  subjectAr: 'رياضيات',
  subjectEn: 'Math',
  units: [
    {
      ar: 'الأعداد والقيمة المكانية',
      en: 'Numbers & Place Value',
      lessons: [
        {
          ar: 'العدّ والقراءة',
          en: 'Counting & Reading Numbers',
          pages: [
            { ar: 'العدّ حتى 100', en: 'Counting to 100' },
            { ar: 'قراءة الأعداد', en: 'Reading numbers' },
            { ar: 'كتابة الأعداد', en: 'Writing numbers' },
            { ar: 'الأعداد الترتيبية', en: 'Ordinal numbers' },
            { ar: 'العدّ بالقفز', en: 'Skip counting' },
            { ar: 'الأعداد الزوجية والفردية', en: 'Even & odd numbers' },
            { ar: 'العدّ التنازلي', en: 'Counting backwards' },
          ],
        },
        {
          ar: 'القيمة المكانية',
          en: 'Place Value',
          pages: [
            { ar: 'الآحاد والعشرات', en: 'Ones & tens' },
            { ar: 'المئات', en: 'Hundreds' },
            { ar: 'الألوف', en: 'Thousands' },
            { ar: 'الصيغة الموسعة', en: 'Expanded form' },
            { ar: 'تمثيل الأعداد', en: 'Representing numbers' },
            { ar: 'لوحة المنازل', en: 'Place value chart' },
            { ar: 'قيمة الرقم', en: 'Value of a digit' },
          ],
        },
        {
          ar: 'مقارنة الأعداد وترتيبها',
          en: 'Comparing & Ordering',
          pages: [
            { ar: 'أكبر من وأصغر من', en: 'Greater than & less than' },
            { ar: 'ترتيب تصاعدي', en: 'Ordering least to greatest' },
            { ar: 'ترتيب تنازلي', en: 'Ordering greatest to least' },
            { ar: 'استخدام الرموز < > =', en: 'Using < > = symbols' },
            { ar: 'مقارنة على خط الأعداد', en: 'Comparing on a number line' },
            { ar: 'الأكبر والأصغر', en: 'Greatest & smallest' },
            { ar: 'ترتيب أعداد متعددة', en: 'Ordering several numbers' },
          ],
        },
        {
          ar: 'التقريب والتقدير',
          en: 'Rounding & Estimation',
          pages: [
            { ar: 'التقريب لأقرب 10', en: 'Rounding to the nearest 10' },
            { ar: 'التقريب لأقرب 100', en: 'Rounding to the nearest 100' },
            { ar: 'تقدير المجاميع', en: 'Estimating sums' },
            { ar: 'تقدير الفروق', en: 'Estimating differences' },
            { ar: 'خط الأعداد للتقريب', en: 'Number line rounding' },
            { ar: 'التقدير في الحياة', en: 'Estimation in real life' },
            { ar: 'التحقق بالتقدير', en: 'Checking with estimation' },
          ],
        },
        {
          ar: 'أنماط الأعداد',
          en: 'Number Patterns',
          pages: [
            { ar: 'الأنماط المتزايدة', en: 'Growing patterns' },
            { ar: 'الأنماط المتناقصة', en: 'Shrinking patterns' },
            { ar: 'قاعدة النمط', en: 'The pattern rule' },
            { ar: 'إكمال النمط', en: 'Completing patterns' },
            { ar: 'أنماط جدول المئة', en: 'Hundred-chart patterns' },
            { ar: 'إنشاء نمط', en: 'Creating a pattern' },
            { ar: 'أنماط حسابية', en: 'Arithmetic patterns' },
          ],
        },
      ],
    },
    {
      ar: 'الجمع والطرح',
      en: 'Addition & Subtraction',
      lessons: [
        {
          ar: 'استراتيجيات الجمع',
          en: 'Addition Strategies',
          pages: [
            { ar: 'الجمع بدون حمل', en: 'Adding without regrouping' },
            { ar: 'الجمع مع الحمل', en: 'Adding with regrouping' },
            { ar: 'جمع ثلاثة أعداد', en: 'Adding three numbers' },
            { ar: 'الجمع الذهني', en: 'Mental addition' },
            { ar: 'حقائق الجمع', en: 'Addition facts' },
            { ar: 'الجمع بالتعويض', en: 'Adding by making tens' },
            { ar: 'خاصية التجميع', en: 'Associative property' },
          ],
        },
        {
          ar: 'استراتيجيات الطرح',
          en: 'Subtraction Strategies',
          pages: [
            { ar: 'الطرح بدون استلاف', en: 'Subtracting without regrouping' },
            { ar: 'الطرح مع الاستلاف', en: 'Subtracting with regrouping' },
            { ar: 'الطرح من المئات', en: 'Subtracting across hundreds' },
            { ar: 'الطرح الذهني', en: 'Mental subtraction' },
            { ar: 'العدّ للأمام للطرح', en: 'Counting up to subtract' },
            { ar: 'العلاقة بين الجمع والطرح', en: 'Add & subtract relationship' },
            { ar: 'حقائق الطرح', en: 'Subtraction facts' },
          ],
        },
        {
          ar: 'المسائل الكلامية',
          en: 'Word Problems',
          pages: [
            { ar: 'مسائل بخطوة واحدة', en: 'One-step problems' },
            { ar: 'مسائل من خطوتين', en: 'Two-step problems' },
            { ar: 'اختيار العملية المناسبة', en: 'Choosing the operation' },
            { ar: 'كتابة المعادلة', en: 'Writing the equation' },
            { ar: 'مسائل المقارنة', en: 'Comparison problems' },
            { ar: 'الكلمات المفتاحية', en: 'Key words' },
            { ar: 'التحقق من الحل', en: 'Checking the answer' },
          ],
        },
        {
          ar: 'النقود',
          en: 'Money',
          pages: [
            { ar: 'الفلوس والدنانير', en: 'Coins & notes' },
            { ar: 'عدّ النقود', en: 'Counting money' },
            { ar: 'حساب الباقي', en: 'Making change' },
            { ar: 'جمع المبالغ', en: 'Adding amounts' },
            { ar: 'كتابة المبالغ', en: 'Writing amounts' },
            { ar: 'مسائل التسوق', en: 'Shopping problems' },
            { ar: 'مقارنة الأسعار', en: 'Comparing prices' },
          ],
        },
        {
          ar: 'المعادلات المبكرة',
          en: 'Early Equations',
          pages: [
            { ar: 'العدد المجهول', en: 'The missing number' },
            { ar: 'الميزان المتوازن', en: 'The balance scale' },
            { ar: 'إيجاد المجهول', en: 'Finding the unknown' },
            { ar: 'العائلات الحسابية', en: 'Fact families' },
            { ar: 'الجمل العددية الصحيحة', en: 'True number sentences' },
            { ar: 'استخدام رمز للمجهول', en: 'Using a symbol for unknown' },
            { ar: 'حل المعادلات البسيطة', en: 'Solving simple equations' },
          ],
        },
      ],
    },
    {
      ar: 'الضرب والقسمة',
      en: 'Multiplication & Division',
      lessons: [
        {
          ar: 'مفهوم الضرب',
          en: 'Understanding Multiplication',
          pages: [
            { ar: 'المجموعات المتساوية', en: 'Equal groups' },
            { ar: 'المصفوفات', en: 'Arrays' },
            { ar: 'الضرب كجمع متكرر', en: 'Multiplication as repeated addition' },
            { ar: 'خاصية الإبدال', en: 'Commutative property' },
            { ar: 'خط الأعداد للضرب', en: 'Number line for multiplication' },
            { ar: 'كتابة جملة الضرب', en: 'Writing a multiplication sentence' },
            { ar: 'القفز المتساوي', en: 'Equal jumps' },
          ],
        },
        {
          ar: 'حقائق الضرب',
          en: 'Multiplication Facts',
          pages: [
            { ar: 'الضرب في 2 و5 و10', en: 'Multiply by 2, 5, 10' },
            { ar: 'الضرب في 3 و4', en: 'Multiply by 3 and 4' },
            { ar: 'الضرب في 6 و7', en: 'Multiply by 6 and 7' },
            { ar: 'الضرب في 8 و9', en: 'Multiply by 8 and 9' },
            { ar: 'جدول الضرب', en: 'The multiplication table' },
            { ar: 'الضرب في 0 و1', en: 'Multiply by 0 and 1' },
            { ar: 'حفظ الحقائق', en: 'Memorizing facts' },
          ],
        },
        {
          ar: 'مفهوم القسمة',
          en: 'Understanding Division',
          pages: [
            { ar: 'القسمة كتوزيع متساوٍ', en: 'Division as sharing' },
            { ar: 'القسمة كتجميع', en: 'Division as grouping' },
            { ar: 'العلاقة بين الضرب والقسمة', en: 'Multiply & divide relationship' },
            { ar: 'القسمة مع الباقي', en: 'Division with remainders' },
            { ar: 'كتابة جملة القسمة', en: 'Writing a division sentence' },
            { ar: 'القسمة على 2 و5', en: 'Dividing by 2 and 5' },
            { ar: 'القسمة على 10', en: 'Dividing by 10' },
          ],
        },
        {
          ar: 'مسائل الضرب والقسمة',
          en: 'Multiplication & Division Problems',
          pages: [
            { ar: 'مسائل الضرب الكلامية', en: 'Multiplication word problems' },
            { ar: 'مسائل القسمة الكلامية', en: 'Division word problems' },
            { ar: 'مسائل من خطوتين', en: 'Two-step problems' },
            { ar: 'اختيار العملية', en: 'Choosing the operation' },
            { ar: 'الضرب في الحياة', en: 'Multiplication in real life' },
            { ar: 'القسمة العادلة', en: 'Fair sharing' },
            { ar: 'كتابة المعادلة', en: 'Writing the equation' },
          ],
        },
        {
          ar: 'الضرب الموسّع',
          en: 'Extended Multiplication',
          pages: [
            { ar: 'الضرب في مضاعفات 10', en: 'Multiplying by multiples of 10' },
            { ar: 'الضرب في عدد من خانتين', en: 'Multiply by a two-digit number' },
            { ar: 'خاصية التوزيع', en: 'Distributive property' },
            { ar: 'النموذج المساحي', en: 'Area model' },
            { ar: 'التقدير في الضرب', en: 'Estimating products' },
            { ar: 'الأنماط في الضرب', en: 'Patterns in multiplication' },
            { ar: 'التحقق من الناتج', en: 'Checking the product' },
          ],
        },
      ],
    },
    {
      ar: 'الكسور',
      en: 'Fractions',
      lessons: [
        {
          ar: 'مفهوم الكسر',
          en: 'Understanding Fractions',
          pages: [
            { ar: 'الكسر كجزء من الكل', en: 'A fraction as part of a whole' },
            { ar: 'البسط والمقام', en: 'Numerator & denominator' },
            { ar: 'الأنصاف والأرباع', en: 'Halves and quarters' },
            { ar: 'الأثلاث', en: 'Thirds' },
            { ar: 'كسور الوحدة', en: 'Unit fractions' },
            { ar: 'كسر من مجموعة', en: 'Fraction of a set' },
            { ar: 'تمثيل الكسور بالرسم', en: 'Drawing fractions' },
          ],
        },
        {
          ar: 'الكسور على خط الأعداد',
          en: 'Fractions on a Number Line',
          pages: [
            { ar: 'وضع كسور الوحدة', en: 'Placing unit fractions' },
            { ar: 'الكسور كنقاط', en: 'Fractions as points' },
            { ar: 'الكسور الأكبر من 1', en: 'Fractions greater than 1' },
            { ar: 'تقسيم خط الأعداد', en: 'Partitioning the number line' },
            { ar: 'قراءة الكسر على الخط', en: 'Reading a fraction on the line' },
            { ar: 'الكسور والأعداد الكلية', en: 'Fractions & whole numbers' },
            { ar: 'المسافات المتساوية', en: 'Equal distances' },
          ],
        },
        {
          ar: 'مقارنة الكسور',
          en: 'Comparing Fractions',
          pages: [
            { ar: 'كسور بنفس المقام', en: 'Same denominator' },
            { ar: 'كسور بنفس البسط', en: 'Same numerator' },
            { ar: 'الكسور المتكافئة', en: 'Equivalent fractions' },
            { ar: 'جمع نصفين', en: 'Adding halves' },
            { ar: 'ترتيب الكسور', en: 'Ordering fractions' },
            { ar: 'الكسر الأكبر', en: 'The larger fraction' },
            { ar: 'مقارنة بالرسم', en: 'Comparing with models' },
          ],
        },
        {
          ar: 'العمليات على الكسور',
          en: 'Operating with Fractions',
          pages: [
            { ar: 'جمع كسور بنفس المقام', en: 'Adding like fractions' },
            { ar: 'طرح كسور بنفس المقام', en: 'Subtracting like fractions' },
            { ar: 'الكسر من عدد', en: 'A fraction of a number' },
            { ar: 'الأعداد الكسرية', en: 'Mixed numbers' },
            { ar: 'تبسيط الكسور', en: 'Simplifying fractions' },
            { ar: 'الكسور في الحياة', en: 'Fractions in real life' },
            { ar: 'مسائل الكسور', en: 'Fraction word problems' },
          ],
        },
        {
          ar: 'الكسور العشرية',
          en: 'Decimals',
          pages: [
            { ar: 'مفهوم الكسر العشري', en: 'Understanding decimals' },
            { ar: 'الأعشار', en: 'Tenths' },
            { ar: 'الأجزاء من مئة', en: 'Hundredths' },
            { ar: 'الكسور والكسور العشرية', en: 'Fractions & decimals' },
            { ar: 'قراءة الكسور العشرية', en: 'Reading decimals' },
            { ar: 'مقارنة الكسور العشرية', en: 'Comparing decimals' },
            { ar: 'العشري على خط الأعداد', en: 'Decimals on a number line' },
          ],
        },
      ],
    },
    {
      ar: 'القياس والبيانات',
      en: 'Measurement & Data',
      lessons: [
        {
          ar: 'الوقت',
          en: 'Time',
          pages: [
            { ar: 'قراءة الساعة', en: 'Reading the clock' },
            { ar: 'الوقت لأقرب نصف ساعة', en: 'Time to the half hour' },
            { ar: 'الوقت لأقرب دقيقة', en: 'Time to the minute' },
            { ar: 'الوقت المنقضي', en: 'Elapsed time' },
            { ar: 'صباحاً ومساءً', en: 'AM & PM' },
            { ar: 'التقويم', en: 'The calendar' },
            { ar: 'وحدات الزمن', en: 'Units of time' },
          ],
        },
        {
          ar: 'الطول والكتلة والسعة',
          en: 'Length, Mass & Capacity',
          pages: [
            { ar: 'قياس الطول', en: 'Measuring length' },
            { ar: 'السنتيمتر والمتر', en: 'Centimeters & meters' },
            { ar: 'قياس الكتلة', en: 'Measuring mass' },
            { ar: 'الجرام والكيلوجرام', en: 'Grams & kilograms' },
            { ar: 'قياس السعة', en: 'Measuring capacity' },
            { ar: 'اللتر والمليلتر', en: 'Liters & milliliters' },
            { ar: 'اختيار الوحدة المناسبة', en: 'Choosing the right unit' },
          ],
        },
        {
          ar: 'البيانات والرسوم البيانية',
          en: 'Data & Graphs',
          pages: [
            { ar: 'الرسوم البيانية العمودية', en: 'Bar graphs' },
            { ar: 'الرسوم التصويرية', en: 'Picture graphs' },
            { ar: 'مخططات النقاط', en: 'Line plots' },
            { ar: 'جداول الإشارات', en: 'Tally charts' },
            { ar: 'قراءة الجداول', en: 'Reading tables' },
            { ar: 'جمع البيانات', en: 'Collecting data' },
            { ar: 'الإجابة عن أسئلة البيانات', en: 'Answering data questions' },
          ],
        },
        {
          ar: 'المساحة والمحيط',
          en: 'Area & Perimeter',
          pages: [
            { ar: 'مفهوم المساحة', en: 'Understanding area' },
            { ar: 'عدّ المربعات الوحدة', en: 'Counting unit squares' },
            { ar: 'مساحة المستطيل', en: 'Area of a rectangle' },
            { ar: 'مفهوم المحيط', en: 'Understanding perimeter' },
            { ar: 'حساب المحيط', en: 'Finding perimeter' },
            { ar: 'المساحة والمحيط معاً', en: 'Area & perimeter together' },
            { ar: 'مسائل القياس', en: 'Measurement problems' },
          ],
        },
        {
          ar: 'درجة الحرارة',
          en: 'Temperature',
          pages: [
            { ar: 'قراءة الترمومتر', en: 'Reading a thermometer' },
            { ar: 'الدرجة المئوية', en: 'Degrees Celsius' },
            { ar: 'الساخن والبارد', en: 'Hot & cold' },
            { ar: 'تغير الحرارة', en: 'Temperature change' },
            { ar: 'حرارة الطقس', en: 'Weather temperature' },
            { ar: 'مقارنة الحرارة', en: 'Comparing temperatures' },
            { ar: 'تسجيل الحرارة', en: 'Recording temperature' },
          ],
        },
      ],
    },
    {
      ar: 'الهندسة',
      en: 'Geometry',
      lessons: [
        {
          ar: 'الأشكال المستوية',
          en: 'Plane Shapes',
          pages: [
            { ar: 'المثلثات', en: 'Triangles' },
            { ar: 'الأشكال الرباعية', en: 'Quadrilaterals' },
            { ar: 'المضلعات', en: 'Polygons' },
            { ar: 'الدائرة', en: 'The circle' },
            { ar: 'خصائص الأشكال', en: 'Shape attributes' },
            { ar: 'الأضلاع والزوايا', en: 'Sides & corners' },
            { ar: 'تصنيف الأشكال', en: 'Classifying shapes' },
          ],
        },
        {
          ar: 'المجسمات',
          en: 'Solid Shapes',
          pages: [
            { ar: 'المكعب', en: 'The cube' },
            { ar: 'الكرة', en: 'The sphere' },
            { ar: 'الأسطوانة', en: 'The cylinder' },
            { ar: 'المخروط', en: 'The cone' },
            { ar: 'الأوجه والأحرف', en: 'Faces & edges' },
            { ar: 'الرؤوس', en: 'Vertices' },
            { ar: 'الأشكال من حولنا', en: 'Shapes around us' },
          ],
        },
        {
          ar: 'التماثل والحركة',
          en: 'Symmetry & Motion',
          pages: [
            { ar: 'محور التماثل', en: 'Line of symmetry' },
            { ar: 'الأشكال المتماثلة', en: 'Symmetric shapes' },
            { ar: 'الانعكاس', en: 'Reflection' },
            { ar: 'الدوران', en: 'Rotation' },
            { ar: 'الانزلاق', en: 'Translation' },
            { ar: 'الأنماط الزخرفية', en: 'Tessellation patterns' },
            { ar: 'إكمال الشكل المتماثل', en: 'Completing a symmetric shape' },
          ],
        },
        {
          ar: 'الموقع والاتجاه',
          en: 'Position & Direction',
          pages: [
            { ar: 'فوق وتحت ويمين ويسار', en: 'Up, down, left, right' },
            { ar: 'الشبكة الإحداثية', en: 'Coordinate grid' },
            { ar: 'قراءة الإحداثيات', en: 'Reading coordinates' },
            { ar: 'المسارات', en: 'Paths & routes' },
            { ar: 'الخرائط البسيطة', en: 'Simple maps' },
            { ar: 'الاتجاهات', en: 'Directions' },
            { ar: 'وصف الموقع', en: 'Describing position' },
          ],
        },
        {
          ar: 'الزوايا',
          en: 'Angles',
          pages: [
            { ar: 'مفهوم الزاوية', en: 'Understanding angles' },
            { ar: 'الزاوية القائمة', en: 'Right angles' },
            { ar: 'الزاوية الحادة', en: 'Acute angles' },
            { ar: 'الزاوية المنفرجة', en: 'Obtuse angles' },
            { ar: 'مقارنة الزوايا', en: 'Comparing angles' },
            { ar: 'الزوايا في الأشكال', en: 'Angles in shapes' },
            { ar: 'رسم الزوايا', en: 'Drawing angles' },
          ],
        },
      ],
    },
  ],
};

// ----------------------------------------------------------------------------
// ARABIC
// ----------------------------------------------------------------------------
const ARABIC_BLUEPRINT: SubjectBlueprint = {
  subjectAr: 'عربي',
  subjectEn: 'Arabic',
  units: [
    {
      ar: 'الحروف والأصوات',
      en: 'Letters & Sounds',
      lessons: [
        {
          ar: 'الحروف الهجائية',
          en: 'The Alphabet',
          pages: [
            { ar: 'أشكال الحرف', en: 'Letter forms' },
            { ar: 'الحروف الشمسية والقمرية', en: 'Sun & moon letters' },
            { ar: 'ترتيب الحروف', en: 'Letter order' },
            { ar: 'الحروف المتشابهة', en: 'Similar letters' },
            { ar: 'أول الكلمة ووسطها وآخرها', en: 'Start, middle & end of words' },
            { ar: 'الحروف المنقوطة', en: 'Dotted letters' },
            { ar: 'كتابة الحروف', en: 'Writing letters' },
          ],
        },
        {
          ar: 'الحركات والتشكيل',
          en: 'Short Vowels & Diacritics',
          pages: [
            { ar: 'الفتحة والضمة والكسرة', en: 'Fatha, damma, kasra' },
            { ar: 'السكون', en: 'Sukoon' },
            { ar: 'الشدّة', en: 'Shadda' },
            { ar: 'التنوين', en: 'Tanween' },
            { ar: 'قراءة المشكول', en: 'Reading with diacritics' },
            { ar: 'ضبط الكلمات', en: 'Vocalizing words' },
            { ar: 'الحركات الطويلة والقصيرة', en: 'Long & short vowels' },
          ],
        },
        {
          ar: 'المدود',
          en: 'Long Vowels',
          pages: [
            { ar: 'مدّ الألف', en: 'Alif madd' },
            { ar: 'مدّ الواو', en: 'Waw madd' },
            { ar: 'مدّ الياء', en: 'Yaa madd' },
            { ar: 'الكلمات الممدودة', en: 'Words with long vowels' },
            { ar: 'التمييز بين المدود', en: 'Telling long vowels apart' },
            { ar: 'قراءة الكلمات الممدودة', en: 'Reading long-vowel words' },
            { ar: 'كتابة المدود', en: 'Writing long vowels' },
          ],
        },
        {
          ar: 'المقاطع والكلمات',
          en: 'Syllables & Words',
          pages: [
            { ar: 'المقطع المفتوح', en: 'Open syllable' },
            { ar: 'المقطع المغلق', en: 'Closed syllable' },
            { ar: 'تقطيع الكلمات', en: 'Breaking words into syllables' },
            { ar: 'دمج المقاطع', en: 'Blending syllables' },
            { ar: 'الكلمات الثلاثية', en: 'Three-letter words' },
            { ar: 'الكلمات الرباعية', en: 'Four-letter words' },
            { ar: 'بناء الكلمة', en: 'Building a word' },
          ],
        },
        {
          ar: 'الاستماع والنطق',
          en: 'Listening & Speaking',
          pages: [
            { ar: 'الاستماع للقصة', en: 'Listening to a story' },
            { ar: 'النطق السليم', en: 'Correct pronunciation' },
            { ar: 'تمييز الأصوات', en: 'Distinguishing sounds' },
            { ar: 'الإلقاء', en: 'Recitation' },
            { ar: 'الحوار', en: 'Dialogue' },
            { ar: 'وصف المسموع', en: 'Describing what you hear' },
            { ar: 'إعادة الرواية', en: 'Retelling' },
          ],
        },
      ],
    },
    {
      ar: 'القراءة والفهم',
      en: 'Reading & Comprehension',
      lessons: [
        {
          ar: 'قراءة الكلمات',
          en: 'Reading Words',
          pages: [
            { ar: 'الكلمات القصيرة', en: 'Short words' },
            { ar: 'المقاطع الصوتية', en: 'Syllables' },
            { ar: 'الكلمات الجديدة', en: 'New words' },
            { ar: 'القراءة بطلاقة', en: 'Reading fluently' },
            { ar: 'الكلمات البصرية', en: 'Sight words' },
            { ar: 'قراءة الجمل', en: 'Reading sentences' },
            { ar: 'سرعة القراءة', en: 'Reading speed' },
          ],
        },
        {
          ar: 'فهم المقروء',
          en: 'Reading Comprehension',
          pages: [
            { ar: 'الفكرة الرئيسية', en: 'Main idea' },
            { ar: 'التفاصيل المهمة', en: 'Key details' },
            { ar: 'تسلسل الأحداث', en: 'Sequence of events' },
            { ar: 'الاستنتاج', en: 'Making inferences' },
            { ar: 'السبب والنتيجة', en: 'Cause & effect' },
            { ar: 'عنوان النص', en: 'The title' },
            { ar: 'الإجابة عن الأسئلة', en: 'Answering questions' },
          ],
        },
        {
          ar: 'أنواع النصوص',
          en: 'Text Types',
          pages: [
            { ar: 'القصة', en: 'The story' },
            { ar: 'النص المعلوماتي', en: 'Informational text' },
            { ar: 'الشعر', en: 'Poetry' },
            { ar: 'النص الإرشادي', en: 'Instructional text' },
            { ar: 'الرسالة', en: 'The letter' },
            { ar: 'الإعلان', en: 'The advertisement' },
            { ar: 'الحكمة والمثل', en: 'Sayings & proverbs' },
          ],
        },
        {
          ar: 'القصة وعناصرها',
          en: 'Story Elements',
          pages: [
            { ar: 'الشخصيات', en: 'Characters' },
            { ar: 'الزمان والمكان', en: 'Setting' },
            { ar: 'الحبكة', en: 'The plot' },
            { ar: 'المشكلة والحل', en: 'Problem & solution' },
            { ar: 'بداية ووسط ونهاية', en: 'Beginning, middle, end' },
            { ar: 'العبرة من القصة', en: 'The moral' },
            { ar: 'تخيّل نهاية أخرى', en: 'Imagining another ending' },
          ],
        },
        {
          ar: 'استراتيجيات القراءة',
          en: 'Reading Strategies',
          pages: [
            { ar: 'التنبؤ', en: 'Predicting' },
            { ar: 'طرح الأسئلة', en: 'Questioning' },
            { ar: 'التصوّر الذهني', en: 'Visualizing' },
            { ar: 'الربط بالخبرة', en: 'Connecting to experience' },
            { ar: 'التلخيص', en: 'Summarizing' },
            { ar: 'إعادة القراءة', en: 'Rereading' },
            { ar: 'استخلاص المعنى', en: 'Finding meaning' },
          ],
        },
      ],
    },
    {
      ar: 'القواعد والإملاء',
      en: 'Grammar & Spelling',
      lessons: [
        {
          ar: 'أقسام الكلام',
          en: 'Parts of Speech',
          pages: [
            { ar: 'الاسم', en: 'The noun' },
            { ar: 'الفعل', en: 'The verb' },
            { ar: 'الحرف', en: 'The particle' },
            { ar: 'المذكر والمؤنث', en: 'Masculine & feminine' },
            { ar: 'المفرد والمثنى والجمع', en: 'Singular, dual & plural' },
            { ar: 'أدوات الاستفهام', en: 'Question words' },
            { ar: 'الضمائر', en: 'Pronouns' },
          ],
        },
        {
          ar: 'الإملاء',
          en: 'Spelling',
          pages: [
            { ar: 'الهمزة', en: 'The hamza' },
            { ar: 'التاء المربوطة والمفتوحة', en: 'Taa marbuta & open taa' },
            { ar: 'الألف اللينة', en: 'Soft alif' },
            { ar: 'اللام الشمسية والقمرية', en: 'Sun & moon laam' },
            { ar: 'إملاء الكلمات', en: 'Spelling words' },
            { ar: 'التنوين في الكتابة', en: 'Writing tanween' },
            { ar: 'الحروف التي تُلفظ ولا تُكتب', en: 'Silent letters' },
          ],
        },
        {
          ar: 'الجملة',
          en: 'The Sentence',
          pages: [
            { ar: 'الجملة الاسمية', en: 'Nominal sentence' },
            { ar: 'الجملة الفعلية', en: 'Verbal sentence' },
            { ar: 'علامات الترقيم', en: 'Punctuation marks' },
            { ar: 'المبتدأ والخبر', en: 'Subject & predicate' },
            { ar: 'الفعل والفاعل', en: 'Verb & doer' },
            { ar: 'ترتيب الجملة', en: 'Sentence order' },
            { ar: 'الجملة المفيدة', en: 'Complete sentences' },
          ],
        },
        {
          ar: 'الأفعال والأزمنة',
          en: 'Verbs & Tenses',
          pages: [
            { ar: 'الفعل الماضي', en: 'Past tense verb' },
            { ar: 'الفعل المضارع', en: 'Present tense verb' },
            { ar: 'فعل الأمر', en: 'Command verb' },
            { ar: 'تصريف الأفعال', en: 'Conjugating verbs' },
            { ar: 'الفعل مع الضمائر', en: 'Verbs with pronouns' },
            { ar: 'زمن الفعل', en: 'Verb time' },
            { ar: 'استخدام الأفعال', en: 'Using verbs' },
          ],
        },
        {
          ar: 'التراكيب اللغوية',
          en: 'Language Structures',
          pages: [
            { ar: 'المضاف والمضاف إليه', en: 'Possessive structure' },
            { ar: 'النعت والمنعوت', en: 'Adjective & noun' },
            { ar: 'حروف الجر', en: 'Prepositions' },
            { ar: 'حروف العطف', en: 'Conjunctions' },
            { ar: 'أدوات الربط', en: 'Linking words' },
            { ar: 'الجملة الطويلة', en: 'Longer sentences' },
            { ar: 'تركيب الجمل', en: 'Combining sentences' },
          ],
        },
      ],
    },
    {
      ar: 'التعبير والكتابة',
      en: 'Writing & Expression',
      lessons: [
        {
          ar: 'الكتابة',
          en: 'Handwriting',
          pages: [
            { ar: 'نسخ الكلمات', en: 'Copying words' },
            { ar: 'كتابة الجمل', en: 'Writing sentences' },
            { ar: 'خط النسخ', en: 'Naskh script' },
            { ar: 'خط الرقعة', en: 'Ruqaa script' },
            { ar: 'تنسيق الكتابة', en: 'Neat writing' },
            { ar: 'المسافات بين الكلمات', en: 'Spacing between words' },
            { ar: 'الكتابة على السطر', en: 'Writing on the line' },
          ],
        },
        {
          ar: 'التعبير الكتابي',
          en: 'Written Expression',
          pages: [
            { ar: 'وصف صورة', en: 'Describing a picture' },
            { ar: 'كتابة فقرة', en: 'Writing a paragraph' },
            { ar: 'ترتيب الأفكار', en: 'Organizing ideas' },
            { ar: 'كتابة قصة قصيرة', en: 'Writing a short story' },
            { ar: 'كتابة رسالة', en: 'Writing a letter' },
            { ar: 'التعبير عن رأي', en: 'Expressing an opinion' },
            { ar: 'كتابة دعوة', en: 'Writing an invitation' },
          ],
        },
        {
          ar: 'التعبير الشفهي',
          en: 'Oral Expression',
          pages: [
            { ar: 'سرد قصة', en: 'Telling a story' },
            { ar: 'وصف حدث', en: 'Describing an event' },
            { ar: 'التحدث أمام الصف', en: 'Speaking to the class' },
            { ar: 'إجراء حوار', en: 'Holding a dialogue' },
            { ar: 'طرح سؤال والإجابة عنه', en: 'Asking & answering' },
            { ar: 'التعبير عن المشاعر', en: 'Expressing feelings' },
            { ar: 'الإقناع', en: 'Persuading' },
          ],
        },
        {
          ar: 'مراحل الكتابة',
          en: 'The Writing Process',
          pages: [
            { ar: 'التخطيط للكتابة', en: 'Planning to write' },
            { ar: 'المسودة الأولى', en: 'First draft' },
            { ar: 'المراجعة', en: 'Revising' },
            { ar: 'التدقيق الإملائي', en: 'Proofreading' },
            { ar: 'النشر', en: 'Publishing' },
            { ar: 'خريطة الأفكار', en: 'Idea map' },
            { ar: 'الفقرة المنظمة', en: 'A organized paragraph' },
          ],
        },
        {
          ar: 'أنواع الكتابة',
          en: 'Types of Writing',
          pages: [
            { ar: 'الكتابة السردية', en: 'Narrative writing' },
            { ar: 'الكتابة الوصفية', en: 'Descriptive writing' },
            { ar: 'الكتابة المعلوماتية', en: 'Informative writing' },
            { ar: 'الكتابة الإقناعية', en: 'Persuasive writing' },
            { ar: 'كتابة التعليمات', en: 'Writing instructions' },
            { ar: 'كتابة اليوميات', en: 'Journal writing' },
            { ar: 'تلخيص نص', en: 'Summarizing a text' },
          ],
        },
      ],
    },
    {
      ar: 'الثروة اللغوية',
      en: 'Vocabulary',
      lessons: [
        {
          ar: 'المعاني',
          en: 'Word Meanings',
          pages: [
            { ar: 'المترادفات', en: 'Synonyms' },
            { ar: 'الأضداد', en: 'Antonyms' },
            { ar: 'الكلمة وضدها', en: 'Word & opposite' },
            { ar: 'المعنى من السياق', en: 'Meaning from context' },
            { ar: 'الكلمات متعددة المعاني', en: 'Words with many meanings' },
            { ar: 'الكلمة المناسبة', en: 'The right word' },
            { ar: 'إثراء المفردات', en: 'Building vocabulary' },
          ],
        },
        {
          ar: 'استعمال الكلمات',
          en: 'Using Words',
          pages: [
            { ar: 'الكلمة في جملة', en: 'Word in a sentence' },
            { ar: 'العائلة اللغوية', en: 'Word families' },
            { ar: 'المعجم', en: 'The dictionary' },
            { ar: 'الجذر والمشتقات', en: 'Root & derivatives' },
            { ar: 'الكلمات المركبة', en: 'Compound words' },
            { ar: 'الكلمات الجديدة في النص', en: 'New words in a text' },
            { ar: 'توظيف المفردات', en: 'Applying vocabulary' },
          ],
        },
        {
          ar: 'التعابير والأساليب',
          en: 'Expressions & Idioms',
          pages: [
            { ar: 'التعابير الشائعة', en: 'Common expressions' },
            { ar: 'الأمثال الشعبية', en: 'Popular proverbs' },
            { ar: 'التشبيه', en: 'Simile' },
            { ar: 'الأسلوب الجميل', en: 'Beautiful style' },
            { ar: 'العبارات المجازية', en: 'Figurative phrases' },
            { ar: 'الكلمات المعبّرة', en: 'Expressive words' },
            { ar: 'جمال اللغة', en: 'The beauty of language' },
          ],
        },
        {
          ar: 'المجالات الموضوعية',
          en: 'Thematic Vocabulary',
          pages: [
            { ar: 'كلمات الطبيعة', en: 'Nature words' },
            { ar: 'كلمات المدرسة', en: 'School words' },
            { ar: 'كلمات العائلة', en: 'Family words' },
            { ar: 'كلمات المهن', en: 'Job words' },
            { ar: 'كلمات الزمن', en: 'Time words' },
            { ar: 'كلمات المشاعر', en: 'Feeling words' },
            { ar: 'كلمات السفر', en: 'Travel words' },
          ],
        },
        {
          ar: 'الفهم اللغوي',
          en: 'Word Study',
          pages: [
            { ar: 'تحليل الكلمة', en: 'Analyzing a word' },
            { ar: 'البادئة واللاحقة', en: 'Prefix & suffix' },
            { ar: 'تصنيف الكلمات', en: 'Sorting words' },
            { ar: 'الكلمة والصورة', en: 'Word & picture' },
            { ar: 'لعبة الكلمات', en: 'Word games' },
            { ar: 'ربط الكلمات', en: 'Matching words' },
            { ar: 'بناء المعنى', en: 'Building meaning' },
          ],
        },
      ],
    },
    {
      ar: 'الأناشيد والمحفوظات',
      en: 'Songs & Memorization',
      lessons: [
        {
          ar: 'الأناشيد',
          en: 'Songs',
          pages: [
            { ar: 'نشيد الوطن', en: 'Homeland song' },
            { ar: 'نشيد المدرسة', en: 'School song' },
            { ar: 'نشيد الطبيعة', en: 'Nature song' },
            { ar: 'الإيقاع والقافية', en: 'Rhythm & rhyme' },
            { ar: 'حفظ النشيد', en: 'Memorizing a song' },
            { ar: 'إلقاء النشيد', en: 'Reciting a song' },
            { ar: 'معاني النشيد', en: 'Meanings in a song' },
          ],
        },
        {
          ar: 'المحفوظات',
          en: 'Memorized Pieces',
          pages: [
            { ar: 'حفظ الأبيات', en: 'Memorizing verses' },
            { ar: 'الحكمة', en: 'Words of wisdom' },
            { ar: 'الأقوال المأثورة', en: 'Famous sayings' },
            { ar: 'فهم المحفوظ', en: 'Understanding what is memorized' },
            { ar: 'الإلقاء المعبّر', en: 'Expressive recitation' },
            { ar: 'شرح الأبيات', en: 'Explaining the verses' },
            { ar: 'ترتيب الأبيات', en: 'Ordering the verses' },
          ],
        },
        {
          ar: 'الشعر للأطفال',
          en: 'Poetry for Children',
          pages: [
            { ar: 'القصيدة القصيرة', en: 'A short poem' },
            { ar: 'الصورة الشعرية', en: 'Poetic imagery' },
            { ar: 'القافية', en: 'The rhyme' },
            { ar: 'مشاعر الشاعر', en: "The poet's feelings" },
            { ar: 'إلقاء القصيدة', en: 'Reciting the poem' },
            { ar: 'موضوع القصيدة', en: 'The poem theme' },
            { ar: 'الكلمات الجميلة', en: 'Beautiful words' },
          ],
        },
        {
          ar: 'القصص المسموعة',
          en: 'Listened Stories',
          pages: [
            { ar: 'قصة من التراث', en: 'A heritage story' },
            { ar: 'قصة الحيوانات', en: 'An animal story' },
            { ar: 'القصة الخيالية', en: 'A fantasy story' },
            { ar: 'تتبع الأحداث', en: 'Following events' },
            { ar: 'إعادة سرد القصة', en: 'Retelling the story' },
            { ar: 'العبرة من القصة', en: 'The lesson learned' },
            { ar: 'تمثيل القصة', en: 'Acting the story' },
          ],
        },
        {
          ar: 'المسرح المدرسي',
          en: 'School Drama',
          pages: [
            { ar: 'الحوار المسرحي', en: 'Dramatic dialogue' },
            { ar: 'الأدوار', en: 'The roles' },
            { ar: 'تمثيل المشهد', en: 'Acting a scene' },
            { ar: 'تعابير الوجه', en: 'Facial expressions' },
            { ar: 'نبرة الصوت', en: 'Tone of voice' },
            { ar: 'العمل الجماعي', en: 'Working together' },
            { ar: 'العرض أمام الجمهور', en: 'Performing for an audience' },
          ],
        },
      ],
    },
  ],
};

// ----------------------------------------------------------------------------
// SCIENCE
// ----------------------------------------------------------------------------
const SCIENCE_BLUEPRINT: SubjectBlueprint = {
  subjectAr: 'علوم',
  subjectEn: 'Science',
  units: [
    {
      ar: 'الكائنات الحية',
      en: 'Living Things',
      lessons: [
        {
          ar: 'النباتات',
          en: 'Plants',
          pages: [
            { ar: 'أجزاء النبات', en: 'Parts of a plant' },
            { ar: 'ما يحتاجه النبات', en: 'What plants need' },
            { ar: 'دورة حياة النبات', en: 'Plant life cycle' },
            { ar: 'البذور', en: 'Seeds' },
            { ar: 'الجذور والساق', en: 'Roots & stems' },
            { ar: 'الأوراق والأزهار', en: 'Leaves & flowers' },
            { ar: 'كيف ينمو النبات', en: 'How plants grow' },
          ],
        },
        {
          ar: 'الحيوانات',
          en: 'Animals',
          pages: [
            { ar: 'مجموعات الحيوانات', en: 'Animal groups' },
            { ar: 'الموطن', en: 'Habitats' },
            { ar: 'دورة حياة الحيوان', en: 'Animal life cycle' },
            { ar: 'الغذاء والتكيف', en: 'Food & adaptation' },
            { ar: 'الثدييات والطيور', en: 'Mammals & birds' },
            { ar: 'الأسماك والزواحف', en: 'Fish & reptiles' },
            { ar: 'الحركة عند الحيوان', en: 'How animals move' },
          ],
        },
        {
          ar: 'جسم الإنسان',
          en: 'The Human Body',
          pages: [
            { ar: 'الحواس الخمس', en: 'The five senses' },
            { ar: 'الهيكل العظمي', en: 'The skeleton' },
            { ar: 'العضلات', en: 'Muscles' },
            { ar: 'الجهاز الهضمي', en: 'The digestive system' },
            { ar: 'التنفس', en: 'Breathing' },
            { ar: 'الغذاء الصحي', en: 'Healthy food' },
            { ar: 'العناية بالجسم', en: 'Caring for the body' },
          ],
        },
        {
          ar: 'الكائنات الدقيقة',
          en: 'Tiny Living Things',
          pages: [
            { ar: 'الكائنات الصغيرة جداً', en: 'Very small living things' },
            { ar: 'الجراثيم', en: 'Germs' },
            { ar: 'النظافة', en: 'Hygiene' },
            { ar: 'الفطريات', en: 'Fungi' },
            { ar: 'الكائنات النافعة', en: 'Helpful microbes' },
            { ar: 'استخدام المكبّر', en: 'Using a magnifier' },
            { ar: 'حماية أنفسنا', en: 'Protecting ourselves' },
          ],
        },
        {
          ar: 'التصنيف',
          en: 'Classifying Living Things',
          pages: [
            { ar: 'الحي وغير الحي', en: 'Living & non-living' },
            { ar: 'صفات الكائن الحي', en: 'Features of living things' },
            { ar: 'تصنيف النباتات', en: 'Sorting plants' },
            { ar: 'تصنيف الحيوانات', en: 'Sorting animals' },
            { ar: 'أوجه التشابه والاختلاف', en: 'Same & different' },
            { ar: 'مفتاح التصنيف', en: 'Sorting key' },
            { ar: 'مجموعات الكائنات', en: 'Groups of living things' },
          ],
        },
      ],
    },
    {
      ar: 'المادة',
      en: 'Matter',
      lessons: [
        {
          ar: 'حالات المادة',
          en: 'States of Matter',
          pages: [
            { ar: 'الصلب', en: 'Solids' },
            { ar: 'السائل', en: 'Liquids' },
            { ar: 'الغاز', en: 'Gases' },
            { ar: 'تغيرات الحالة', en: 'Changes of state' },
            { ar: 'الانصهار والتجمد', en: 'Melting & freezing' },
            { ar: 'التبخر والتكاثف', en: 'Evaporation & condensation' },
            { ar: 'المادة من حولنا', en: 'Matter around us' },
          ],
        },
        {
          ar: 'خصائص المواد',
          en: 'Properties of Materials',
          pages: [
            { ar: 'الملمس واللون', en: 'Texture & color' },
            { ar: 'الطفو والغرق', en: 'Floating & sinking' },
            { ar: 'المواد الموصلة', en: 'Conductors' },
            { ar: 'الصلابة والمرونة', en: 'Hard & flexible' },
            { ar: 'الشفافية', en: 'Transparency' },
            { ar: 'الجذب المغناطيسي', en: 'Magnetic materials' },
            { ar: 'اختيار المادة المناسبة', en: 'Choosing the right material' },
          ],
        },
        {
          ar: 'التغيرات',
          en: 'Changes in Matter',
          pages: [
            { ar: 'التغير الفيزيائي', en: 'Physical change' },
            { ar: 'التغير الكيميائي', en: 'Chemical change' },
            { ar: 'الخلط والمزج', en: 'Mixing' },
            { ar: 'الذوبان', en: 'Dissolving' },
            { ar: 'الفصل', en: 'Separating' },
            { ar: 'التسخين والتبريد', en: 'Heating & cooling' },
            { ar: 'تغيرات حولنا', en: 'Changes around us' },
          ],
        },
        {
          ar: 'قياس المادة',
          en: 'Measuring Matter',
          pages: [
            { ar: 'الكتلة', en: 'Mass' },
            { ar: 'الحجم', en: 'Volume' },
            { ar: 'استخدام الميزان', en: 'Using a balance' },
            { ar: 'استخدام المخبار', en: 'Using a measuring cylinder' },
            { ar: 'وحدات القياس', en: 'Units of measure' },
            { ar: 'مقارنة المواد', en: 'Comparing materials' },
            { ar: 'تسجيل القياسات', en: 'Recording measurements' },
          ],
        },
        {
          ar: 'المواد والاستدامة',
          en: 'Materials & Sustainability',
          pages: [
            { ar: 'المواد الطبيعية والصناعية', en: 'Natural & man-made materials' },
            { ar: 'إعادة الاستخدام', en: 'Reusing materials' },
            { ar: 'إعادة التدوير', en: 'Recycling materials' },
            { ar: 'تقليل الهدر', en: 'Reducing waste' },
            { ar: 'المواد الصديقة للبيئة', en: 'Eco-friendly materials' },
            { ar: 'دورة حياة المنتج', en: 'A product life cycle' },
            { ar: 'حماية الموارد', en: 'Protecting resources' },
          ],
        },
      ],
    },
    {
      ar: 'الأرض والفضاء',
      en: 'Earth & Space',
      lessons: [
        {
          ar: 'الطقس',
          en: 'Weather',
          pages: [
            { ar: 'حالات الطقس', en: 'Types of weather' },
            { ar: 'الفصول الأربعة', en: 'The four seasons' },
            { ar: 'قياس الطقس', en: 'Measuring weather' },
            { ar: 'الرياح والأمطار', en: 'Wind & rain' },
            { ar: 'السحب', en: 'Clouds' },
            { ar: 'توقع الطقس', en: 'Forecasting weather' },
            { ar: 'الطقس وحياتنا', en: 'Weather & our lives' },
          ],
        },
        {
          ar: 'دورة الماء',
          en: 'The Water Cycle',
          pages: [
            { ar: 'التبخر', en: 'Evaporation' },
            { ar: 'التكاثف', en: 'Condensation' },
            { ar: 'الهطول', en: 'Precipitation' },
            { ar: 'مصادر الماء', en: 'Sources of water' },
            { ar: 'الماء العذب والمالح', en: 'Fresh & salt water' },
            { ar: 'أهمية الماء', en: 'Why water matters' },
            { ar: 'توفير الماء', en: 'Saving water' },
          ],
        },
        {
          ar: 'النظام الشمسي',
          en: 'The Solar System',
          pages: [
            { ar: 'الشمس والأرض', en: 'The Sun & Earth' },
            { ar: 'القمر', en: 'The Moon' },
            { ar: 'الكواكب', en: 'The planets' },
            { ar: 'الليل والنهار', en: 'Day & night' },
            { ar: 'النجوم', en: 'The stars' },
            { ar: 'دوران الأرض', en: 'Earth rotation' },
            { ar: 'استكشاف الفضاء', en: 'Exploring space' },
          ],
        },
        {
          ar: 'صخور الأرض',
          en: "Earth's Rocks",
          pages: [
            { ar: 'أنواع الصخور', en: 'Types of rocks' },
            { ar: 'التربة', en: 'Soil' },
            { ar: 'المعادن', en: 'Minerals' },
            { ar: 'طبقات الأرض', en: 'Layers of the Earth' },
            { ar: 'البراكين', en: 'Volcanoes' },
            { ar: 'الزلازل', en: 'Earthquakes' },
            { ar: 'تشكّل الجبال', en: 'How mountains form' },
          ],
        },
        {
          ar: 'الموارد الطبيعية',
          en: 'Natural Resources',
          pages: [
            { ar: 'الماء والهواء', en: 'Water & air' },
            { ar: 'النفط والغاز', en: 'Oil & gas' },
            { ar: 'الطاقة الشمسية', en: 'Solar energy' },
            { ar: 'طاقة الرياح', en: 'Wind energy' },
            { ar: 'الموارد المتجددة', en: 'Renewable resources' },
            { ar: 'الموارد غير المتجددة', en: 'Non-renewable resources' },
            { ar: 'الحفاظ على الموارد', en: 'Conserving resources' },
          ],
        },
      ],
    },
    {
      ar: 'القوى والطاقة',
      en: 'Forces & Energy',
      lessons: [
        {
          ar: 'القوى والحركة',
          en: 'Forces & Motion',
          pages: [
            { ar: 'الدفع والسحب', en: 'Push & pull' },
            { ar: 'الاحتكاك', en: 'Friction' },
            { ar: 'الجاذبية', en: 'Gravity' },
            { ar: 'السرعة', en: 'Speed' },
            { ar: 'تغيير الاتجاه', en: 'Changing direction' },
            { ar: 'القوة والحركة', en: 'Force & movement' },
            { ar: 'الآلات البسيطة', en: 'Simple machines' },
          ],
        },
        {
          ar: 'أشكال الطاقة',
          en: 'Forms of Energy',
          pages: [
            { ar: 'الضوء', en: 'Light' },
            { ar: 'الصوت', en: 'Sound' },
            { ar: 'الحرارة', en: 'Heat' },
            { ar: 'الكهرباء', en: 'Electricity' },
            { ar: 'الطاقة الحركية', en: 'Movement energy' },
            { ar: 'مصادر الطاقة', en: 'Sources of energy' },
            { ar: 'توفير الطاقة', en: 'Saving energy' },
          ],
        },
        {
          ar: 'الضوء والظل',
          en: 'Light & Shadow',
          pages: [
            { ar: 'مصادر الضوء', en: 'Light sources' },
            { ar: 'كيف نرى', en: 'How we see' },
            { ar: 'الظلال', en: 'Shadows' },
            { ar: 'انعكاس الضوء', en: 'Reflecting light' },
            { ar: 'الألوان والضوء', en: 'Color & light' },
            { ar: 'الشفاف والمعتم', en: 'Clear & opaque' },
            { ar: 'الضوء في حياتنا', en: 'Light in our lives' },
          ],
        },
        {
          ar: 'الصوت',
          en: 'Sound',
          pages: [
            { ar: 'كيف يُصنع الصوت', en: 'How sound is made' },
            { ar: 'الاهتزاز', en: 'Vibration' },
            { ar: 'الصوت العالي والمنخفض', en: 'Loud & soft sounds' },
            { ar: 'كيف نسمع', en: 'How we hear' },
            { ar: 'انتقال الصوت', en: 'How sound travels' },
            { ar: 'الأصوات حولنا', en: 'Sounds around us' },
            { ar: 'الموسيقى', en: 'Music' },
          ],
        },
        {
          ar: 'الكهرباء والمغناطيس',
          en: 'Electricity & Magnets',
          pages: [
            { ar: 'الدائرة الكهربائية', en: 'Electric circuit' },
            { ar: 'الموصلات والعوازل', en: 'Conductors & insulators' },
            { ar: 'الأمان الكهربائي', en: 'Electrical safety' },
            { ar: 'المغناطيس', en: 'Magnets' },
            { ar: 'الأقطاب', en: 'Magnetic poles' },
            { ar: 'الجذب والتنافر', en: 'Attract & repel' },
            { ar: 'استخدامات المغناطيس', en: 'Uses of magnets' },
          ],
        },
      ],
    },
    {
      ar: 'البيئة',
      en: 'The Environment',
      lessons: [
        {
          ar: 'حماية البيئة',
          en: 'Protecting the Environment',
          pages: [
            { ar: 'إعادة التدوير', en: 'Recycling' },
            { ar: 'التلوث', en: 'Pollution' },
            { ar: 'توفير الماء', en: 'Saving water' },
            { ar: 'التشجير', en: 'Planting trees' },
            { ar: 'تقليل النفايات', en: 'Reducing waste' },
            { ar: 'الهواء النظيف', en: 'Clean air' },
            { ar: 'دوري في الحماية', en: 'My role in protecting' },
          ],
        },
        {
          ar: 'السلاسل الغذائية',
          en: 'Food Chains',
          pages: [
            { ar: 'المنتجات والمستهلكات', en: 'Producers & consumers' },
            { ar: 'الشبكة الغذائية', en: 'Food webs' },
            { ar: 'التوازن البيئي', en: 'Ecological balance' },
            { ar: 'المفترس والفريسة', en: 'Predator & prey' },
            { ar: 'المحللات', en: 'Decomposers' },
            { ar: 'تدفق الطاقة', en: 'Energy flow' },
            { ar: 'سلسلة في حديقتي', en: 'A chain in my garden' },
          ],
        },
        {
          ar: 'الأنظمة البيئية',
          en: 'Ecosystems',
          pages: [
            { ar: 'الصحراء', en: 'The desert' },
            { ar: 'الغابة', en: 'The forest' },
            { ar: 'البحر', en: 'The sea' },
            { ar: 'النهر', en: 'The river' },
            { ar: 'التكيف مع البيئة', en: 'Adapting to the environment' },
            { ar: 'الكائنات والموطن', en: 'Living things & habitat' },
            { ar: 'حماية الأنظمة البيئية', en: 'Protecting ecosystems' },
          ],
        },
        {
          ar: 'التغير المناخي',
          en: 'Climate Change',
          pages: [
            { ar: 'الطقس والمناخ', en: 'Weather & climate' },
            { ar: 'الاحترار', en: 'Warming' },
            { ar: 'أثر الإنسان', en: 'Human impact' },
            { ar: 'الطاقة النظيفة', en: 'Clean energy' },
            { ar: 'بصمتنا البيئية', en: 'Our footprint' },
            { ar: 'حلول بسيطة', en: 'Simple solutions' },
            { ar: 'نحو مستقبل أخضر', en: 'Toward a green future' },
          ],
        },
        {
          ar: 'العمل العلمي',
          en: 'Working Like a Scientist',
          pages: [
            { ar: 'الملاحظة', en: 'Observing' },
            { ar: 'طرح سؤال', en: 'Asking a question' },
            { ar: 'التجربة', en: 'The experiment' },
            { ar: 'جمع البيانات', en: 'Collecting data' },
            { ar: 'الاستنتاج', en: 'Drawing conclusions' },
            { ar: 'أدوات العالم', en: "A scientist's tools" },
            { ar: 'السلامة في المختبر', en: 'Lab safety' },
          ],
        },
      ],
    },
    {
      ar: 'التكنولوجيا والاكتشاف',
      en: 'Technology & Discovery',
      lessons: [
        {
          ar: 'الآلات في حياتنا',
          en: 'Machines in Our Lives',
          pages: [
            { ar: 'الآلات البسيطة', en: 'Simple machines' },
            { ar: 'الرافعة', en: 'The lever' },
            { ar: 'البكرة', en: 'The pulley' },
            { ar: 'العجلة والمحور', en: 'Wheel & axle' },
            { ar: 'المستوى المائل', en: 'The inclined plane' },
            { ar: 'الآلات حولنا', en: 'Machines around us' },
            { ar: 'كيف تسهّل العمل', en: 'How they make work easier' },
          ],
        },
        {
          ar: 'الاختراعات',
          en: 'Inventions',
          pages: [
            { ar: 'اختراعات غيّرت العالم', en: 'Inventions that changed the world' },
            { ar: 'المخترعون', en: 'Inventors' },
            { ar: 'فكرة واختراع', en: 'From idea to invention' },
            { ar: 'حلّ مشكلة', en: 'Solving a problem' },
            { ar: 'تصميم نموذج', en: 'Designing a model' },
            { ar: 'اختراعي', en: 'My invention' },
            { ar: 'التكنولوجيا والمستقبل', en: 'Technology & the future' },
          ],
        },
        {
          ar: 'الحاسوب والروبوت',
          en: 'Computers & Robots',
          pages: [
            { ar: 'أجزاء الحاسوب', en: 'Parts of a computer' },
            { ar: 'كيف يعمل الحاسوب', en: 'How a computer works' },
            { ar: 'الروبوت', en: 'Robots' },
            { ar: 'الأوامر والتعليمات', en: 'Commands & instructions' },
            { ar: 'البرمجة المبسطة', en: 'Simple coding' },
            { ar: 'الاستخدام الآمن', en: 'Safe use' },
            { ar: 'التكنولوجيا تساعدنا', en: 'Technology helps us' },
          ],
        },
        {
          ar: 'الاستكشاف العلمي',
          en: 'Scientific Exploration',
          pages: [
            { ar: 'استكشاف الفضاء', en: 'Space exploration' },
            { ar: 'استكشاف البحار', en: 'Ocean exploration' },
            { ar: 'الأدوات العلمية', en: 'Scientific instruments' },
            { ar: 'الاكتشافات الحديثة', en: 'Modern discoveries' },
            { ar: 'العلماء العرب', en: 'Arab scientists' },
            { ar: 'فضول واكتشاف', en: 'Curiosity & discovery' },
            { ar: 'أحلم أن أكتشف', en: 'I dream to discover' },
          ],
        },
        {
          ar: 'التصميم والابتكار',
          en: 'Design & Innovation',
          pages: [
            { ar: 'خطوات التصميم', en: 'The design steps' },
            { ar: 'تحديد المشكلة', en: 'Defining the problem' },
            { ar: 'توليد الأفكار', en: 'Generating ideas' },
            { ar: 'بناء النموذج', en: 'Building a prototype' },
            { ar: 'الاختبار والتحسين', en: 'Test & improve' },
            { ar: 'العمل الجماعي', en: 'Teamwork' },
            { ar: 'عرض الابتكار', en: 'Presenting an innovation' },
          ],
        },
      ],
    },
  ],
};

// ----------------------------------------------------------------------------
// ENGLISH
// ----------------------------------------------------------------------------
const ENGLISH_BLUEPRINT: SubjectBlueprint = {
  subjectAr: 'إنجليزي',
  subjectEn: 'English',
  units: [
    {
      ar: 'الأصوات والقراءة',
      en: 'Phonics & Reading',
      lessons: [
        {
          ar: 'أصوات الحروف',
          en: 'Letter Sounds',
          pages: [
            { ar: 'الحروف الساكنة', en: 'Consonant sounds' },
            { ar: 'الحروف المتحركة', en: 'Vowel sounds' },
            { ar: 'الكلمات المركبة من ثلاثة أصوات', en: 'CVC words' },
            { ar: 'المزج الصوتي', en: 'Blending sounds' },
            { ar: 'الأصوات المركبة', en: 'Digraphs' },
            { ar: 'الأصوات الطويلة', en: 'Long vowel sounds' },
            { ar: 'تجزئة الأصوات', en: 'Segmenting sounds' },
          ],
        },
        {
          ar: 'الكلمات الشائعة',
          en: 'Sight Words',
          pages: [
            { ar: 'الكلمات الأكثر استخداماً', en: 'High-frequency words' },
            { ar: 'القراءة بطلاقة', en: 'Reading fluently' },
            { ar: 'الكلمات والجمل', en: 'Words in sentences' },
            { ar: 'كلمات لا تُلفظ كما تُكتب', en: 'Tricky words' },
            { ar: 'بطاقات الكلمات', en: 'Word cards' },
            { ar: 'القراءة السريعة', en: 'Quick reading' },
            { ar: 'مراجعة الكلمات', en: 'Word review' },
          ],
        },
        {
          ar: 'فهم المقروء',
          en: 'Reading Comprehension',
          pages: [
            { ar: 'الفكرة الرئيسية', en: 'Main idea' },
            { ar: 'الشخصيات والأحداث', en: 'Characters & events' },
            { ar: 'التنبؤ بالأحداث', en: 'Making predictions' },
            { ar: 'الإجابة عن الأسئلة', en: 'Answering questions' },
            { ar: 'تسلسل القصة', en: 'Story sequence' },
            { ar: 'السبب والنتيجة', en: 'Cause & effect' },
            { ar: 'الحقيقة والرأي', en: 'Fact & opinion' },
          ],
        },
        {
          ar: 'القراءة الجهرية',
          en: 'Reading Aloud',
          pages: [
            { ar: 'النطق الواضح', en: 'Clear pronunciation' },
            { ar: 'التنغيم', en: 'Intonation' },
            { ar: 'التوقف عند الترقيم', en: 'Pausing at punctuation' },
            { ar: 'التعبير في القراءة', en: 'Reading with expression' },
            { ar: 'سرعة القراءة', en: 'Reading pace' },
            { ar: 'قراءة الحوار', en: 'Reading dialogue' },
            { ar: 'الثقة في القراءة', en: 'Reading confidently' },
          ],
        },
        {
          ar: 'أنواع النصوص',
          en: 'Text Types',
          pages: [
            { ar: 'القصة', en: 'Stories' },
            { ar: 'النص المعلوماتي', en: 'Information texts' },
            { ar: 'القصائد', en: 'Poems' },
            { ar: 'التعليمات', en: 'Instructions' },
            { ar: 'الرسائل', en: 'Letters' },
            { ar: 'الملصقات', en: 'Posters' },
            { ar: 'القوائم', en: 'Lists' },
          ],
        },
      ],
    },
    {
      ar: 'المفردات',
      en: 'Vocabulary',
      lessons: [
        {
          ar: 'كلمات الحياة اليومية',
          en: 'Everyday Words',
          pages: [
            { ar: 'الألوان', en: 'Colors' },
            { ar: 'الأرقام', en: 'Numbers' },
            { ar: 'العائلة', en: 'Family' },
            { ar: 'الطعام', en: 'Food' },
            { ar: 'أيام الأسبوع', en: 'Days of the week' },
            { ar: 'الطقس', en: 'Weather' },
            { ar: 'الملابس', en: 'Clothes' },
          ],
        },
        {
          ar: 'الأفعال والصفات',
          en: 'Verbs & Adjectives',
          pages: [
            { ar: 'أفعال الحركة', en: 'Action verbs' },
            { ar: 'الصفات الوصفية', en: 'Describing words' },
            { ar: 'الأضداد', en: 'Opposites' },
            { ar: 'صفات المشاعر', en: 'Feeling words' },
            { ar: 'صفات الحجم واللون', en: 'Size & color words' },
            { ar: 'الأفعال اليومية', en: 'Daily verbs' },
            { ar: 'استخدام الصفات', en: 'Using adjectives' },
          ],
        },
        {
          ar: 'الموضوعات',
          en: 'Topic Words',
          pages: [
            { ar: 'المدرسة', en: 'School' },
            { ar: 'الحيوانات', en: 'Animals' },
            { ar: 'المدينة', en: 'The city' },
            { ar: 'المهن', en: 'Jobs' },
            { ar: 'وسائل النقل', en: 'Transport' },
            { ar: 'الأماكن', en: 'Places' },
            { ar: 'الهوايات', en: 'Hobbies' },
          ],
        },
        {
          ar: 'بناء الكلمات',
          en: 'Word Building',
          pages: [
            { ar: 'الجمع بإضافة s', en: 'Plurals with -s' },
            { ar: 'البادئات', en: 'Prefixes' },
            { ar: 'اللواحق', en: 'Suffixes' },
            { ar: 'الكلمات المركبة', en: 'Compound words' },
            { ar: 'عائلات الكلمات', en: 'Word families' },
            { ar: 'المرادفات', en: 'Synonyms' },
            { ar: 'استخدام القاموس', en: 'Using a dictionary' },
          ],
        },
        {
          ar: 'المفردات في السياق',
          en: 'Vocabulary in Context',
          pages: [
            { ar: 'المعنى من الجملة', en: 'Meaning from a sentence' },
            { ar: 'الكلمة المناسبة', en: 'The right word' },
            { ar: 'الكلمات الجديدة في القصة', en: 'New words in a story' },
            { ar: 'الكلمة والصورة', en: 'Word & picture' },
            { ar: 'ربط الكلمات', en: 'Matching words' },
            { ar: 'تصنيف الكلمات', en: 'Sorting words' },
            { ar: 'توظيف المفردات', en: 'Using new words' },
          ],
        },
      ],
    },
    {
      ar: 'القواعد',
      en: 'Grammar',
      lessons: [
        {
          ar: 'الأسماء والضمائر',
          en: 'Nouns & Pronouns',
          pages: [
            { ar: 'الأسماء المفردة والجمع', en: 'Singular & plural nouns' },
            { ar: 'الضمائر', en: 'Pronouns' },
            { ar: 'أدوات التعريف', en: 'Articles a, an, the' },
            { ar: 'أسماء العلم', en: 'Proper nouns' },
            { ar: 'الملكية', en: 'Possessives' },
            { ar: 'هذا وهؤلاء', en: 'This & these' },
            { ar: 'الأسماء المعدودة', en: 'Countable nouns' },
          ],
        },
        {
          ar: 'الأزمنة',
          en: 'Verb Tenses',
          pages: [
            { ar: 'المضارع البسيط', en: 'Present simple' },
            { ar: 'الماضي البسيط', en: 'Past simple' },
            { ar: 'المضارع المستمر', en: 'Present continuous' },
            { ar: 'فعل يكون', en: 'The verb to be' },
            { ar: 'المستقبل بـ going to', en: 'Future with going to' },
            { ar: 'الأفعال الشاذة', en: 'Irregular verbs' },
            { ar: 'استخدام الأزمنة', en: 'Using tenses' },
          ],
        },
        {
          ar: 'بناء الجملة',
          en: 'Sentence Building',
          pages: [
            { ar: 'الجملة البسيطة', en: 'Simple sentences' },
            { ar: 'علامات الترقيم', en: 'Punctuation' },
            { ar: 'الأسئلة', en: 'Asking questions' },
            { ar: 'النفي', en: 'Negatives' },
            { ar: 'الحروف الكبيرة', en: 'Capital letters' },
            { ar: 'وصل الجمل بـ and', en: 'Joining with and' },
            { ar: 'ترتيب الكلمات', en: 'Word order' },
          ],
        },
        {
          ar: 'الصفات والظروف',
          en: 'Adjectives & Adverbs',
          pages: [
            { ar: 'وصف الأشياء', en: 'Describing things' },
            { ar: 'المقارنة', en: 'Comparatives' },
            { ar: 'التفضيل', en: 'Superlatives' },
            { ar: 'ظروف الزمان', en: 'Adverbs of time' },
            { ar: 'ظروف المكان', en: 'Adverbs of place' },
            { ar: 'كيف ومتى وأين', en: 'How, when, where' },
            { ar: 'استخدام الظروف', en: 'Using adverbs' },
          ],
        },
        {
          ar: 'حروف الجر والربط',
          en: 'Prepositions & Connectors',
          pages: [
            { ar: 'حروف المكان', en: 'Prepositions of place' },
            { ar: 'حروف الزمان', en: 'Prepositions of time' },
            { ar: 'in و on و at', en: 'in, on, at' },
            { ar: 'أدوات الربط', en: 'Connectors' },
            { ar: 'because و so', en: 'because & so' },
            { ar: 'but و and', en: 'but & and' },
            { ar: 'الجمل المترابطة', en: 'Linked sentences' },
          ],
        },
      ],
    },
    {
      ar: 'التحدث والكتابة',
      en: 'Speaking & Writing',
      lessons: [
        {
          ar: 'المحادثة',
          en: 'Conversation',
          pages: [
            { ar: 'التحية والتعارف', en: 'Greetings & introductions' },
            { ar: 'طرح الأسئلة', en: 'Asking questions' },
            { ar: 'التعبير عن الرأي', en: 'Expressing opinions' },
            { ar: 'طلب المساعدة', en: 'Asking for help' },
            { ar: 'الحديث عن النفس', en: 'Talking about yourself' },
            { ar: 'وصف يومك', en: 'Describing your day' },
            { ar: 'حوار قصير', en: 'A short dialogue' },
          ],
        },
        {
          ar: 'الكتابة',
          en: 'Writing',
          pages: [
            { ar: 'كتابة الجمل', en: 'Writing sentences' },
            { ar: 'كتابة فقرة', en: 'Writing a paragraph' },
            { ar: 'وصف صورة', en: 'Describing a picture' },
            { ar: 'كتابة قصة قصيرة', en: 'Writing a short story' },
            { ar: 'كتابة رسالة', en: 'Writing a letter' },
            { ar: 'كتابة قائمة', en: 'Writing a list' },
            { ar: 'تنظيم الكتابة', en: 'Organizing writing' },
          ],
        },
        {
          ar: 'العرض والإلقاء',
          en: 'Presenting',
          pages: [
            { ar: 'التحدث أمام الصف', en: 'Speaking to the class' },
            { ar: 'تقديم النفس', en: 'Introducing yourself' },
            { ar: 'وصف شيء محبب', en: 'Describing a favorite thing' },
            { ar: 'لغة الجسد', en: 'Body language' },
            { ar: 'التواصل البصري', en: 'Eye contact' },
            { ar: 'الإجابة عن الأسئلة', en: 'Answering questions' },
            { ar: 'الثقة بالنفس', en: 'Confidence' },
          ],
        },
        {
          ar: 'الكتابة الإبداعية',
          en: 'Creative Writing',
          pages: [
            { ar: 'بداية القصة', en: 'Story openings' },
            { ar: 'وصف الشخصية', en: 'Describing a character' },
            { ar: 'وصف المكان', en: 'Describing a setting' },
            { ar: 'الكلمات المعبّرة', en: 'Powerful words' },
            { ar: 'الحوار في القصة', en: 'Dialogue in a story' },
            { ar: 'نهاية القصة', en: 'Story endings' },
            { ar: 'قصتي', en: 'My own story' },
          ],
        },
        {
          ar: 'الاستماع والفهم',
          en: 'Listening',
          pages: [
            { ar: 'الاستماع للتعليمات', en: 'Listening to instructions' },
            { ar: 'الاستماع لقصة', en: 'Listening to a story' },
            { ar: 'تمييز الأصوات', en: 'Identifying sounds' },
            { ar: 'الإجابة بعد الاستماع', en: 'Answering after listening' },
            { ar: 'تتبع الحوار', en: 'Following a dialogue' },
            { ar: 'الكلمات المفتاحية', en: 'Key words' },
            { ar: 'إعادة ما سمعت', en: 'Repeating what you heard' },
          ],
        },
      ],
    },
  ],
};

// ----------------------------------------------------------------------------
// ART
// ----------------------------------------------------------------------------
const ART_BLUEPRINT: SubjectBlueprint = {
  subjectAr: 'فنون',
  subjectEn: 'Art',
  units: [
    {
      ar: 'عناصر الفن',
      en: 'Elements of Art',
      lessons: [
        {
          ar: 'الخط والشكل',
          en: 'Line & Shape',
          pages: [
            { ar: 'أنواع الخطوط', en: 'Types of lines' },
            { ar: 'الأشكال الأساسية', en: 'Basic shapes' },
            { ar: 'الأشكال الهندسية والعضوية', en: 'Geometric & organic shapes' },
            { ar: 'الخطوط المعبّرة', en: 'Expressive lines' },
            { ar: 'الشكل والفراغ', en: 'Shape & space' },
            { ar: 'تكرار الأشكال', en: 'Repeating shapes' },
            { ar: 'الرسم بالخطوط', en: 'Drawing with lines' },
          ],
        },
        {
          ar: 'اللون',
          en: 'Color',
          pages: [
            { ar: 'الألوان الأساسية', en: 'Primary colors' },
            { ar: 'الألوان الثانوية', en: 'Secondary colors' },
            { ar: 'الألوان الدافئة والباردة', en: 'Warm & cool colors' },
            { ar: 'عجلة الألوان', en: 'The color wheel' },
            { ar: 'درجات اللون', en: 'Shades & tints' },
            { ar: 'الألوان المتكاملة', en: 'Complementary colors' },
            { ar: 'مزاج اللون', en: 'Color moods' },
          ],
        },
        {
          ar: 'الملمس والمساحة',
          en: 'Texture & Space',
          pages: [
            { ar: 'الملمس', en: 'Texture' },
            { ar: 'الفراغ والامتلاء', en: 'Positive & negative space' },
            { ar: 'الملمس الحقيقي والمرئي', en: 'Real & visual texture' },
            { ar: 'العمق', en: 'Depth' },
            { ar: 'القريب والبعيد', en: 'Near & far' },
            { ar: 'الفراغ في اللوحة', en: 'Space in artwork' },
            { ar: 'إحساس الملمس', en: 'Feeling texture' },
          ],
        },
        {
          ar: 'الضوء والظل والقيمة',
          en: 'Light, Shadow & Value',
          pages: [
            { ar: 'الفاتح والغامق', en: 'Light & dark' },
            { ar: 'سلّم القيمة', en: 'The value scale' },
            { ar: 'الظل والنور', en: 'Shadow & highlight' },
            { ar: 'التظليل المتدرج', en: 'Gradual shading' },
            { ar: 'إبراز المجسم', en: 'Showing form' },
            { ar: 'مصدر الضوء', en: 'Light source' },
            { ar: 'القيمة في الرسم', en: 'Value in drawing' },
          ],
        },
        {
          ar: 'التكوين والتوازن',
          en: 'Composition & Balance',
          pages: [
            { ar: 'ترتيب العناصر', en: 'Arranging elements' },
            { ar: 'التوازن', en: 'Balance' },
            { ar: 'التماثل', en: 'Symmetry' },
            { ar: 'النقطة المحورية', en: 'Focal point' },
            { ar: 'الإيقاع', en: 'Rhythm' },
            { ar: 'الوحدة والتنوع', en: 'Unity & variety' },
            { ar: 'تخطيط اللوحة', en: 'Planning artwork' },
          ],
        },
      ],
    },
    {
      ar: 'الرسم والتلوين',
      en: 'Drawing & Painting',
      lessons: [
        {
          ar: 'مهارات الرسم',
          en: 'Drawing Skills',
          pages: [
            { ar: 'الرسم بالقلم', en: 'Pencil drawing' },
            { ar: 'رسم الطبيعة الصامتة', en: 'Still life drawing' },
            { ar: 'رسم الوجوه', en: 'Drawing faces' },
            { ar: 'التظليل', en: 'Shading' },
            { ar: 'رسم المناظر الطبيعية', en: 'Drawing landscapes' },
            { ar: 'الخطوط الخارجية', en: 'Outlines' },
            { ar: 'النسب', en: 'Proportions' },
          ],
        },
        {
          ar: 'التلوين',
          en: 'Painting',
          pages: [
            { ar: 'الألوان المائية', en: 'Watercolors' },
            { ar: 'مزج الألوان', en: 'Mixing colors' },
            { ar: 'الفرشاة والتقنيات', en: 'Brush techniques' },
            { ar: 'الألوان الخشبية', en: 'Colored pencils' },
            { ar: 'الباستيل', en: 'Pastels' },
            { ar: 'التدرج اللوني', en: 'Color blending' },
            { ar: 'لوحتي الملوّنة', en: 'My painting' },
          ],
        },
        {
          ar: 'الطباعة والزخرفة',
          en: 'Printing & Pattern',
          pages: [
            { ar: 'الطباعة بالقوالب', en: 'Stamp printing' },
            { ar: 'الزخارف الإسلامية', en: 'Islamic patterns' },
            { ar: 'الأنماط المتكررة', en: 'Repeating patterns' },
            { ar: 'الطباعة بالأوراق', en: 'Leaf printing' },
            { ar: 'التماثل في الزخرفة', en: 'Symmetry in patterns' },
            { ar: 'الزخرفة الهندسية', en: 'Geometric decoration' },
            { ar: 'تصميم نمط', en: 'Designing a pattern' },
          ],
        },
        {
          ar: 'الرسم الرقمي',
          en: 'Digital Art',
          pages: [
            { ar: 'الرسم على الجهاز', en: 'Drawing on a device' },
            { ar: 'أدوات الرسم الرقمي', en: 'Digital tools' },
            { ar: 'الطبقات', en: 'Layers' },
            { ar: 'الألوان الرقمية', en: 'Digital colors' },
            { ar: 'التراجع والتعديل', en: 'Undo & edit' },
            { ar: 'حفظ العمل', en: 'Saving your work' },
            { ar: 'لوحتي الرقمية', en: 'My digital artwork' },
          ],
        },
        {
          ar: 'الرسم من الخيال',
          en: 'Imaginative Drawing',
          pages: [
            { ar: 'رسم من الخيال', en: 'Drawing from imagination' },
            { ar: 'رسم القصة', en: 'Drawing a story' },
            { ar: 'الشخصيات الكرتونية', en: 'Cartoon characters' },
            { ar: 'عالمي الخاص', en: 'My own world' },
            { ar: 'المخلوقات الخيالية', en: 'Imaginary creatures' },
            { ar: 'الحلم في لوحة', en: 'A dream in a picture' },
            { ar: 'التعبير عن فكرة', en: 'Expressing an idea' },
          ],
        },
      ],
    },
    {
      ar: 'الأشغال اليدوية',
      en: 'Crafts',
      lessons: [
        {
          ar: 'القص واللصق',
          en: 'Cut & Paste',
          pages: [
            { ar: 'الكولاج', en: 'Collage' },
            { ar: 'طي الورق', en: 'Paper folding' },
            { ar: 'الأشكال الورقية', en: 'Paper shapes' },
            { ar: 'القص الآمن', en: 'Safe cutting' },
            { ar: 'التركيب', en: 'Assembling' },
            { ar: 'بطاقة معايدة', en: 'A greeting card' },
            { ar: 'فن الورق', en: 'Paper art' },
          ],
        },
        {
          ar: 'النمذجة',
          en: 'Modeling',
          pages: [
            { ar: 'التشكيل بالصلصال', en: 'Clay modeling' },
            { ar: 'الأشكال المجسمة', en: '3D shapes' },
            { ar: 'العجين الملوّن', en: 'Colored dough' },
            { ar: 'تشكيل حيوان', en: 'Modeling an animal' },
            { ar: 'النحت البسيط', en: 'Simple sculpting' },
            { ar: 'التجفيف والتلوين', en: 'Drying & painting' },
            { ar: 'مجسمي', en: 'My sculpture' },
          ],
        },
        {
          ar: 'إعادة التدوير الفني',
          en: 'Recycled Art',
          pages: [
            { ar: 'الفن من الخردة', en: 'Art from scraps' },
            { ar: 'إعادة استخدام العلب', en: 'Reusing boxes' },
            { ar: 'تحويل القارورة', en: 'Bottle crafts' },
            { ar: 'الفن من الطبيعة', en: 'Art from nature' },
            { ar: 'التركيب الإبداعي', en: 'Creative assembly' },
            { ar: 'فكرة من نفايات', en: 'An idea from waste' },
            { ar: 'مشروعي المعاد تدويره', en: 'My recycled project' },
          ],
        },
        {
          ar: 'الخامات والنسيج',
          en: 'Materials & Weaving',
          pages: [
            { ar: 'الخيوط والقماش', en: 'Threads & fabric' },
            { ar: 'النسيج البسيط', en: 'Simple weaving' },
            { ar: 'الخرز والزينة', en: 'Beads & decoration' },
            { ar: 'الألوان في النسيج', en: 'Colors in weaving' },
            { ar: 'الأنماط النسيجية', en: 'Woven patterns' },
            { ar: 'التطريز المبسط', en: 'Simple stitching' },
            { ar: 'قطعتي المنسوجة', en: 'My woven piece' },
          ],
        },
        {
          ar: 'الزينة والمناسبات',
          en: 'Decorations & Occasions',
          pages: [
            { ar: 'زينة الأعياد', en: 'Holiday decorations' },
            { ar: 'الأقنعة', en: 'Masks' },
            { ar: 'الزينة المعلّقة', en: 'Hanging decorations' },
            { ar: 'بطاقات المناسبات', en: 'Occasion cards' },
            { ar: 'الزخرفة بالورق', en: 'Paper decoration' },
            { ar: 'ألوان الفرح', en: 'Festive colors' },
            { ar: 'زينتي الخاصة', en: 'My own decoration' },
          ],
        },
      ],
    },
    {
      ar: 'تذوق الفن',
      en: 'Art Appreciation',
      lessons: [
        {
          ar: 'قراءة الأعمال الفنية',
          en: 'Reading Artworks',
          pages: [
            { ar: 'وصف اللوحة', en: 'Describing a painting' },
            { ar: 'الفنانون المشهورون', en: 'Famous artists' },
            { ar: 'التعبير عن الرأي', en: 'Sharing opinions' },
            { ar: 'الألوان والمشاعر', en: 'Colors & feelings' },
            { ar: 'موضوع العمل الفني', en: 'The subject of the art' },
            { ar: 'ماذا أرى؟', en: 'What do I see?' },
            { ar: 'لوحتي المفضلة', en: 'My favorite artwork' },
          ],
        },
        {
          ar: 'الفن عبر التاريخ',
          en: 'Art Through History',
          pages: [
            { ar: 'الفن القديم', en: 'Ancient art' },
            { ar: 'الفن الإسلامي', en: 'Islamic art' },
            { ar: 'الفن الشعبي', en: 'Folk art' },
            { ar: 'الفن الحديث', en: 'Modern art' },
            { ar: 'فن بلدي', en: 'Art of my country' },
            { ar: 'تطور الفن', en: 'How art changed' },
            { ar: 'متحف الفن', en: 'The art museum' },
          ],
        },
        {
          ar: 'الفن من حولنا',
          en: 'Art Around Us',
          pages: [
            { ar: 'الفن في المدينة', en: 'Art in the city' },
            { ar: 'العمارة', en: 'Architecture' },
            { ar: 'التصميم في الحياة', en: 'Design in life' },
            { ar: 'فن الشارع', en: 'Street art' },
            { ar: 'الزخرفة في المباني', en: 'Decoration in buildings' },
            { ar: 'الفن والطبيعة', en: 'Art & nature' },
            { ar: 'الجمال حولي', en: 'Beauty around me' },
          ],
        },
        {
          ar: 'النقد الفني المبسّط',
          en: 'Simple Art Critique',
          pages: [
            { ar: 'ماذا أرى وماذا أشعر', en: 'What I see & feel' },
            { ar: 'العناصر في العمل', en: 'Elements in the work' },
            { ar: 'رسالة الفنان', en: "The artist's message" },
            { ar: 'ما الذي يعجبني', en: 'What I like' },
            { ar: 'مقارنة عملين', en: 'Comparing two works' },
            { ar: 'احترام الأذواق', en: 'Respecting tastes' },
            { ar: 'رأيي بالعمل الفني', en: 'My opinion on the art' },
          ],
        },
        {
          ar: 'الفن والثقافات',
          en: 'Art & Cultures',
          pages: [
            { ar: 'فنون الشعوب', en: 'Arts of peoples' },
            { ar: 'الرموز في الفن', en: 'Symbols in art' },
            { ar: 'الألوان في الثقافات', en: 'Colors across cultures' },
            { ar: 'الحرف التقليدية', en: 'Traditional crafts' },
            { ar: 'الموسيقى والفن', en: 'Music & art' },
            { ar: 'احتفالات وفنون', en: 'Celebrations & art' },
            { ar: 'فن أحبه من ثقافة أخرى', en: 'Art I love from another culture' },
          ],
        },
      ],
    },
  ],
};

// ----------------------------------------------------------------------------
// PE
// ----------------------------------------------------------------------------
const PE_BLUEPRINT: SubjectBlueprint = {
  subjectAr: 'تربية رياضية',
  subjectEn: 'PE',
  units: [
    {
      ar: 'المهارات الحركية',
      en: 'Movement Skills',
      lessons: [
        {
          ar: 'الحركات الأساسية',
          en: 'Locomotor Skills',
          pages: [
            { ar: 'المشي والجري', en: 'Walking & running' },
            { ar: 'القفز والوثب', en: 'Jumping & hopping' },
            { ar: 'الحجل والانزلاق', en: 'Skipping & sliding' },
            { ar: 'الزحف والتدحرج', en: 'Crawling & rolling' },
            { ar: 'تغيير السرعة', en: 'Changing speed' },
            { ar: 'تغيير الاتجاه', en: 'Changing direction' },
            { ar: 'الحركة في مساحة', en: 'Moving in space' },
          ],
        },
        {
          ar: 'التوازن والتناسق',
          en: 'Balance & Coordination',
          pages: [
            { ar: 'التوازن على قدم واحدة', en: 'Balancing on one foot' },
            { ar: 'التناسق بين اليد والعين', en: 'Hand-eye coordination' },
            { ar: 'الرشاقة', en: 'Agility' },
            { ar: 'التحكم بالجسم', en: 'Body control' },
            { ar: 'التوازن أثناء الحركة', en: 'Balance while moving' },
            { ar: 'التناسق بين القدم والعين', en: 'Foot-eye coordination' },
            { ar: 'ألعاب التوازن', en: 'Balance games' },
          ],
        },
        {
          ar: 'المهارات غير الانتقالية',
          en: 'Non-Locomotor Skills',
          pages: [
            { ar: 'الثني والمد', en: 'Bending & stretching' },
            { ar: 'اللف والدوران', en: 'Twisting & turning' },
            { ar: 'الدفع والسحب', en: 'Pushing & pulling' },
            { ar: 'الأرجحة', en: 'Swinging' },
            { ar: 'الوقوف والجلوس', en: 'Rising & sinking' },
            { ar: 'التحكم بالوضعية', en: 'Controlling posture' },
            { ar: 'وضعيات الجسم', en: 'Body shapes' },
          ],
        },
        {
          ar: 'الإيقاع والحركة',
          en: 'Rhythm & Movement',
          pages: [
            { ar: 'الحركة مع الإيقاع', en: 'Moving to a beat' },
            { ar: 'التصفيق الإيقاعي', en: 'Rhythmic clapping' },
            { ar: 'الرقص الشعبي', en: 'Folk dance' },
            { ar: 'تتابع الحركات', en: 'Movement sequences' },
            { ar: 'الحركة مع الموسيقى', en: 'Moving with music' },
            { ar: 'تقليد الحركات', en: 'Copying movements' },
            { ar: 'عرض حركي', en: 'A movement show' },
          ],
        },
        {
          ar: 'الألعاب الحركية',
          en: 'Movement Games',
          pages: [
            { ar: 'ألعاب المطاردة', en: 'Chasing games' },
            { ar: 'ألعاب التتابع', en: 'Relay games' },
            { ar: 'ألعاب القفز', en: 'Jumping games' },
            { ar: 'ألعاب جماعية', en: 'Team games' },
            { ar: 'قواعد اللعبة', en: 'Game rules' },
            { ar: 'التعاون في اللعب', en: 'Cooperating in play' },
            { ar: 'لعبتي المفضلة', en: 'My favorite game' },
          ],
        },
      ],
    },
    {
      ar: 'الألعاب بالكرة',
      en: 'Ball Games',
      lessons: [
        {
          ar: 'الرمي والاستقبال',
          en: 'Throwing & Catching',
          pages: [
            { ar: 'رمي الكرة', en: 'Throwing a ball' },
            { ar: 'استقبال الكرة', en: 'Catching a ball' },
            { ar: 'التصويب نحو هدف', en: 'Aiming at a target' },
            { ar: 'الرمي لمسافة', en: 'Throwing for distance' },
            { ar: 'الرمي العالي والمنخفض', en: 'High & low throws' },
            { ar: 'الاستقبال بيدين', en: 'Two-hand catch' },
            { ar: 'ألعاب الرمي', en: 'Throwing games' },
          ],
        },
        {
          ar: 'مهارات كرة القدم',
          en: 'Football Skills',
          pages: [
            { ar: 'الركل والتمرير', en: 'Kicking & passing' },
            { ar: 'المراوغة', en: 'Dribbling' },
            { ar: 'قواعد اللعبة', en: 'Rules of the game' },
            { ar: 'التصويب على المرمى', en: 'Shooting at goal' },
            { ar: 'استقبال الكرة بالقدم', en: 'Trapping the ball' },
            { ar: 'اللعب الجماعي', en: 'Team play' },
            { ar: 'مباراة ودية', en: 'A friendly match' },
          ],
        },
        {
          ar: 'مهارات كرة السلة',
          en: 'Basketball Skills',
          pages: [
            { ar: 'التنطيط', en: 'Bouncing the ball' },
            { ar: 'التمرير', en: 'Passing' },
            { ar: 'التصويب', en: 'Shooting' },
            { ar: 'الجري بالكرة', en: 'Dribbling while moving' },
            { ar: 'الدفاع', en: 'Defending' },
            { ar: 'قواعد السلة', en: 'Basketball rules' },
            { ar: 'لعبة مصغّرة', en: 'A mini game' },
          ],
        },
        {
          ar: 'مهارات الكرة الطائرة',
          en: 'Volleyball Skills',
          pages: [
            { ar: 'الإرسال', en: 'Serving' },
            { ar: 'التمرير من أعلى', en: 'Overhead pass' },
            { ar: 'التمرير من أسفل', en: 'Underhand pass' },
            { ar: 'الوقوف الصحيح', en: 'Ready position' },
            { ar: 'اللعب فوق الشبكة', en: 'Playing over the net' },
            { ar: 'قواعد اللعبة', en: 'Game rules' },
            { ar: 'لعب جماعي', en: 'Team play' },
          ],
        },
        {
          ar: 'الألعاب المضربية',
          en: 'Racket Games',
          pages: [
            { ar: 'الإمساك بالمضرب', en: 'Holding the racket' },
            { ar: 'ضرب الكرة', en: 'Hitting the ball' },
            { ar: 'التحكم بالاتجاه', en: 'Controlling direction' },
            { ar: 'الإرسال البسيط', en: 'Simple serving' },
            { ar: 'تنس الطاولة', en: 'Table tennis' },
            { ar: 'الريشة الطائرة', en: 'Badminton' },
            { ar: 'لعبة زوجية', en: 'A doubles game' },
          ],
        },
      ],
    },
    {
      ar: 'اللياقة البدنية',
      en: 'Fitness',
      lessons: [
        {
          ar: 'القوة والمرونة',
          en: 'Strength & Flexibility',
          pages: [
            { ar: 'تمارين الإحماء', en: 'Warm-up exercises' },
            { ar: 'تمارين الإطالة', en: 'Stretching' },
            { ar: 'بناء القوة', en: 'Building strength' },
            { ar: 'تمارين البطن', en: 'Core exercises' },
            { ar: 'تمارين الذراعين', en: 'Arm exercises' },
            { ar: 'المرونة', en: 'Flexibility' },
            { ar: 'التهدئة', en: 'Cooling down' },
          ],
        },
        {
          ar: 'التحمل',
          en: 'Endurance',
          pages: [
            { ar: 'الجري لمسافات', en: 'Distance running' },
            { ar: 'النشاط المستمر', en: 'Sustained activity' },
            { ar: 'القفز بالحبل', en: 'Jumping rope' },
            { ar: 'التنفس أثناء الجهد', en: 'Breathing during effort' },
            { ar: 'بناء اللياقة', en: 'Building fitness' },
            { ar: 'قياس التقدم', en: 'Tracking progress' },
            { ar: 'تحدي التحمل', en: 'An endurance challenge' },
          ],
        },
        {
          ar: 'السرعة والرشاقة',
          en: 'Speed & Agility',
          pages: [
            { ar: 'الجري السريع', en: 'Sprinting' },
            { ar: 'تغيير الاتجاه بسرعة', en: 'Quick direction changes' },
            { ar: 'تمارين السلّم الحركي', en: 'Ladder drills' },
            { ar: 'ردّ الفعل', en: 'Reaction time' },
            { ar: 'القفز السريع', en: 'Quick jumps' },
            { ar: 'الرشاقة بين العوائق', en: 'Agility through cones' },
            { ar: 'سباق الرشاقة', en: 'An agility race' },
          ],
        },
        {
          ar: 'الجمباز الأساسي',
          en: 'Basic Gymnastics',
          pages: [
            { ar: 'الدحرجة الأمامية', en: 'Forward roll' },
            { ar: 'الوقوف على اليدين', en: 'Handstand' },
            { ar: 'القفز على المهر', en: 'Vaulting' },
            { ar: 'التوازن على العارضة', en: 'Beam balance' },
            { ar: 'الوضعيات', en: 'Body positions' },
            { ar: 'سلسلة حركية', en: 'A movement routine' },
            { ar: 'السلامة في الجمباز', en: 'Gymnastics safety' },
          ],
        },
        {
          ar: 'مكونات اللياقة',
          en: 'Components of Fitness',
          pages: [
            { ar: 'القوة العضلية', en: 'Muscular strength' },
            { ar: 'التحمل القلبي', en: 'Heart endurance' },
            { ar: 'المرونة', en: 'Flexibility' },
            { ar: 'السرعة', en: 'Speed' },
            { ar: 'التوازن', en: 'Balance' },
            { ar: 'قياس اللياقة', en: 'Measuring fitness' },
            { ar: 'خطتي للياقة', en: 'My fitness plan' },
          ],
        },
      ],
    },
    {
      ar: 'الصحة والسلامة',
      en: 'Health & Safety',
      lessons: [
        {
          ar: 'العادات الصحية',
          en: 'Healthy Habits',
          pages: [
            { ar: 'أهمية الرياضة', en: 'Why exercise matters' },
            { ar: 'الغذاء والماء', en: 'Food & water' },
            { ar: 'الراحة والنوم', en: 'Rest & sleep' },
            { ar: 'النظافة الشخصية', en: 'Personal hygiene' },
            { ar: 'العناية بالأسنان', en: 'Dental care' },
            { ar: 'الجلوس الصحيح', en: 'Good posture' },
            { ar: 'يومي الصحي', en: 'My healthy day' },
          ],
        },
        {
          ar: 'اللعب الآمن',
          en: 'Safe Play',
          pages: [
            { ar: 'قواعد السلامة', en: 'Safety rules' },
            { ar: 'الروح الرياضية', en: 'Sportsmanship' },
            { ar: 'الإحماء قبل اللعب', en: 'Warming up first' },
            { ar: 'استخدام المعدات بأمان', en: 'Using equipment safely' },
            { ar: 'احترام الزملاء', en: 'Respecting teammates' },
            { ar: 'ماذا أفعل عند الإصابة', en: 'What to do if hurt' },
            { ar: 'اللعب النظيف', en: 'Fair play' },
          ],
        },
        {
          ar: 'الغذاء والطاقة',
          en: 'Food & Energy',
          pages: [
            { ar: 'مجموعات الغذاء', en: 'Food groups' },
            { ar: 'الطاقة من الطعام', en: 'Energy from food' },
            { ar: 'وجبة متوازنة', en: 'A balanced meal' },
            { ar: 'الماء والرياضة', en: 'Water & sport' },
            { ar: 'الإفطار الصحي', en: 'A healthy breakfast' },
            { ar: 'تجنب السكريات', en: 'Avoiding too much sugar' },
            { ar: 'خياراتي الصحية', en: 'My healthy choices' },
          ],
        },
        {
          ar: 'الجسم والحركة',
          en: 'Body & Movement',
          pages: [
            { ar: 'العضلات والعظام', en: 'Muscles & bones' },
            { ar: 'القلب والتنفس', en: 'Heart & breathing' },
            { ar: 'كيف يتحرك الجسم', en: 'How the body moves' },
            { ar: 'نبض القلب', en: 'Heart rate' },
            { ar: 'الجسم أثناء الرياضة', en: 'The body during exercise' },
            { ar: 'الإصغاء للجسم', en: 'Listening to your body' },
            { ar: 'العناية بجسمي', en: 'Caring for my body' },
          ],
        },
        {
          ar: 'الرياضة والمشاعر',
          en: 'Sport & Wellbeing',
          pages: [
            { ar: 'الرياضة والمزاج', en: 'Sport & mood' },
            { ar: 'الثقة بالنفس', en: 'Self-confidence' },
            { ar: 'العمل ضمن فريق', en: 'Working in a team' },
            { ar: 'التعامل مع الخسارة', en: 'Handling losing' },
            { ar: 'الاحتفال بالفوز', en: 'Celebrating winning' },
            { ar: 'تحديد هدف', en: 'Setting a goal' },
            { ar: 'أشعر بالنشاط', en: 'I feel energetic' },
          ],
        },
      ],
    },
  ],
};

const SUBJECT_BLUEPRINTS: Record<string, SubjectBlueprint> = {
  math: MATH_BLUEPRINT,
  arabic: ARABIC_BLUEPRINT,
  science: SCIENCE_BLUEPRINT,
  english: ENGLISH_BLUEPRINT,
  art: ART_BLUEPRINT,
  pe: PE_BLUEPRINT,
};

// ============================================================================
// Generation helpers
// ============================================================================

/** Inclusive integer in [min, max], seeded. */
function pickInt(rand: () => number, min: number, max: number): number {
  return min + Math.floor(rand() * (max - min + 1));
}

/**
 * Inclusive integer in [min, max], seeded, biased toward the *low* end (the
 * smaller of two uniform draws). Still reaches every value in the range, but
 * leans small — used for the unit and page counts so trees stay lush without
 * the per-node maxima compounding into bloated (>110-page) subjects. Keeps the
 * typical tree centred in the ~60-110-page sweet spot.
 */
function pickLowInt(rand: () => number, min: number, max: number): number {
  return Math.min(pickInt(rand, min, max), pickInt(rand, min, max));
}

function clampPct(n: number): number {
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

function round(n: number): number {
  return Math.round(n);
}

/** Plain average of a numeric list (0 for empty). */
function average(values: number[]): number {
  if (values.length === 0) return 0;
  let sum = 0;
  for (const v of values) sum += v;
  return sum / values.length;
}

/**
 * Decide the shape of the tree for one (child, subject): how many units, and
 * for each unit how many lessons, and for each lesson how many pages — all
 * seeded so the structure is stable. Slices come off the front of each
 * blueprint pool so names stay coherent (a unit's first lessons are its real
 * opening lessons), but the *count* varies per child to keep trees lush and
 * non-identical. Targets ~60-110 total pages. Pools are sized so the min/max
 * are always honored (4-6 units · 3-5 lessons/unit · 4-7 pages/lesson).
 */
interface UnitShape {
  unit: UnitBlueprint;
  lessons: { lesson: LessonBlueprint; pageCount: number }[];
}

function planTreeShape(
  rand: () => number,
  blueprint: SubjectBlueprint
): UnitShape[] {
  // 4-6 units (bounded by however many the blueprint provides — always ≥6).
  // Low-biased so most subjects sit at 4-5 units (keeps totals in ~60-110).
  const unitCount = Math.min(blueprint.units.length, pickLowInt(rand, 4, 6));
  const shapes: UnitShape[] = [];

  for (let u = 0; u < unitCount; u++) {
    const unit = blueprint.units[u];
    // 3-5 lessons per unit (pool is ≥5, so the range is always satisfiable).
    const lessonCount = Math.min(unit.lessons.length, pickInt(rand, 3, 5));
    const lessons: { lesson: LessonBlueprint; pageCount: number }[] = [];

    for (let l = 0; l < lessonCount; l++) {
      const lesson = unit.lessons[l];
      // 4-7 pages per lesson (pool is ≥7, so the range is always satisfiable).
      // Low-biased so the page count leans toward 4-5 and trees stay lean.
      const pageCount = Math.min(lesson.pages.length, pickLowInt(rand, 4, 7));
      lessons.push({ lesson, pageCount });
    }

    shapes.push({ unit, lessons });
  }

  return shapes;
}

/**
 * Build raw (pre-correction) page mastery values that:
 *   • follow a gentle front-to-back downward gradient (earlier units higher),
 *   • carry seeded per-page variance so leaves differ,
 *   • inject some not-started (0) pages into the later units of weak subjects.
 *
 * The values are returned in reading order (unit→lesson→page). A separate pass
 * corrects them so the page-count-weighted average lands within ±1 of target.
 */
function buildRawPageMasteries(
  rand: () => number,
  shapes: UnitShape[],
  target: number
): number[] {
  const unitCount = shapes.length;

  // Gradient span: how far the first unit sits above target vs the last below.
  // Scale the span down for very low or very high targets so we don't blow
  // through the 0/100 clamps and distort the mean. ~16pts at mid, less at edges.
  const headroomUp = 100 - target;
  const headroomDown = target;
  const span = Math.min(16, headroomUp + 4, headroomDown + 4);

  // Weak subjects (low target) should show real "not started" leaves in the
  // back of the book — kids haven't reached those pages yet.
  const allowZeros = target < 45;

  const raw: number[] = [];

  shapes.forEach((unitShape, unitIndex) => {
    // Gradient offset for this unit: +span/2 at the front → -span/2 at the back.
    const t = unitCount > 1 ? unitIndex / (unitCount - 1) : 0; // 0..1
    const unitOffset = span / 2 - t * span;

    // Probability a back-unit page is "not started" ramps up across the book.
    const zeroChance = allowZeros ? Math.max(0, (t - 0.45) * 0.55) : 0;

    for (const { pageCount } of unitShape.lessons) {
      for (let p = 0; p < pageCount; p++) {
        if (zeroChance > 0 && rand() < zeroChance) {
          raw.push(0);
          continue;
        }
        // Per-page variance: ±7 pts around the unit's gradient centre.
        const variance = (rand() - 0.5) * 14;
        raw.push(clampPct(target + unitOffset + variance));
      }
    }
  });

  return raw;
}

/**
 * Shift raw page values by a single offset so their (uniform) average hits the
 * target, then nudge individual non-zero pages by ±1 to absorb the rounding
 * residual. Returns integer page masteries whose plain average is within <1 of
 * target (the page-count-weighted subject average then lands within ±1 after
 * rollup rounding). Zeros are preserved as not-started leaves.
 */
function correctToTarget(
  rand: () => number,
  raw: number[],
  target: number
): number[] {
  if (raw.length === 0) return raw;

  // 1) Bulk offset on the continuous values so the mean matches target.
  const currentMean = average(raw);
  const delta = target - currentMean;
  const shifted = raw.map((v) => (v === 0 ? 0 : clampPct(v + delta)));

  // Clamping during the shift can eat part of the correction; round to ints.
  const ints = shifted.map((v) => round(v));

  // 2) Distribute the integer rounding residual across adjustable (non-0,
  //    non-saturated) pages, ±1 at a time, until the integer sum matches the
  //    target sum as closely as possible. This guarantees the final average is
  //    within <1 of target.
  const n = ints.length;
  const targetSum = Math.round(target * n);

  const adjustableUp = () =>
    ints.map((v, i) => ({ v, i })).filter((x) => x.v > 0 && x.v < 100);
  const adjustableDown = () =>
    ints.map((v, i) => ({ v, i })).filter((x) => x.v > 0);

  let guard = n * 4; // generous bound; loop is monotone toward targetSum
  while (guard-- > 0) {
    const currentSum = ints.reduce((a, b) => a + b, 0);
    const diff = targetSum - currentSum;
    if (diff === 0) break;

    const pool = diff > 0 ? adjustableUp() : adjustableDown();
    if (pool.length === 0) break;

    // Pick a pseudo-random page from the pool so the correction is spread out
    // rather than always biasing the first leaf (keeps the gradient honest).
    const pick = pool[Math.floor(rand() * pool.length)];
    ints[pick.i] = clampPct(ints[pick.i] + (diff > 0 ? 1 : -1));
  }

  return ints;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Build the full Subject Tree for a child + subject. Pure + deterministic:
 * same (childId, subjectKey) always yields the same tree (structure, names,
 * ids, every mastery value).
 *
 * The tree's overall `masteryPct` is anchored to the subject's garden plant:
 * it equals `getChildSkillAreas(childId)[subject].masteryPct` within ±1
 * (rounding of the page-count-weighted rollup).
 *
 * @param childId    e.g. "child-sara"
 * @param subjectKey one of: math | arabic | science | english | art | pe
 */
export function getSubjectTree(childId: string, subjectKey: string): SubjectTree {
  const blueprint = SUBJECT_BLUEPRINTS[subjectKey] ?? MATH_BLUEPRINT;

  // Anchor the overall mastery to the existing garden plant for this subject.
  const areas = getChildSkillAreas(childId);
  const area = areas.find((a) => a.subjectKey === subjectKey);
  const target = area ? area.masteryPct : 50;

  // Seed off both child and subject so trees are stable yet distinct.
  const rand = createRng(hashStringToSeed(`tree:${childId}:${subjectKey}`));

  // 1) Plan structure, 2) build gradient+variance raw page values,
  // 3) correct them to the anchored target.
  const shapes = planTreeShape(rand, blueprint);
  const rawPages = buildRawPageMasteries(rand, shapes, target);
  const pageMasteries = correctToTarget(rand, rawPages, target);

  // 4) Assemble the tree, rolling lesson/unit masteries up from children.
  const units: TreeUnit[] = [];
  let pageCursor = 0; // index into pageMasteries (reading order)
  let pageNumber = 1; // sequential textbook page number across the subject
  let totalPages = 0;
  let totalLessons = 0;

  shapes.forEach((unitShape, unitIndex) => {
    const unitId = `${childId}-${subjectKey}-u${unitIndex + 1}`;
    const lessons: TreeLesson[] = [];

    unitShape.lessons.forEach((lessonShape, lessonIndex) => {
      const lessonId = `${unitId}-l${lessonIndex + 1}`;
      const pages: TreePage[] = [];

      for (let p = 0; p < lessonShape.pageCount; p++) {
        const topic = lessonShape.lesson.pages[p];
        const masteryPct = pageMasteries[pageCursor++];
        pages.push({
          id: `${lessonId}-p${p + 1}`,
          pageNumber: pageNumber++,
          titleAr: topic.ar,
          titleEn: topic.en,
          masteryPct,
          status: statusFromMastery(masteryPct),
        });
      }

      // Lesson mastery = rounded plain average of its pages.
      const lessonMastery = round(average(pages.map((pg) => pg.masteryPct)));
      lessons.push({
        id: lessonId,
        titleAr: lessonShape.lesson.ar,
        titleEn: lessonShape.lesson.en,
        pages,
        masteryPct: lessonMastery,
        status: statusFromMastery(lessonMastery),
      });

      totalPages += pages.length;
      totalLessons += 1;
    });

    // Unit mastery = page-count-weighted average of its lessons, rounded (per
    // the spec contract). Weighting the *already-rounded* lesson values tracks
    // the plain page average to within ±1, so every level of the rollup stays
    // visually consistent.
    let weightedSum = 0;
    let weight = 0;
    for (const lesson of lessons) {
      weightedSum += lesson.masteryPct * lesson.pages.length;
      weight += lesson.pages.length;
    }
    const unitMastery = weight > 0 ? round(weightedSum / weight) : 0;

    units.push({
      id: unitId,
      titleAr: unitShape.unit.ar,
      titleEn: unitShape.unit.en,
      lessons,
      masteryPct: unitMastery,
      status: statusFromMastery(unitMastery),
    });
  });

  // Overall subject mastery = page-count-weighted average of all pages (i.e.
  // the plain average of every leaf). Anchored to the garden plant's
  // `masteryPct` (within ±1 after rounding).
  const allPageMasteries = pageMasteries.slice(0, totalPages);
  const overallMastery = round(average(allPageMasteries));

  return {
    subjectKey,
    subjectAr: blueprint.subjectAr,
    subjectEn: blueprint.subjectEn,
    units,
    masteryPct: overallMastery,
    totalPages,
    totalLessons,
  };
}
