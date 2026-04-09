import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  Calendar,
  Youtube,
  Lock,
  Sparkles,
  Trophy,
  Rocket,
  Star,
  Users,
  GraduationCap,
  School,
} from 'lucide-react';
import {
  StatCallout,
  SectionDivider,
  TestimonialCard,
  FeatureCard,
  PricingCard,
} from './ProposalComponents';

// ═══════════════════════════════════════════════════════════════
// Animation variants
// ═══════════════════════════════════════════════════════════════
const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ═══════════════════════════════════════════════════════════════
// SECTION 6 — Feature Breakdown
// ═══════════════════════════════════════════════════════════════
function Section6Features() {
  const [studioExpanded, setStudioExpanded] = useState(false);

  const features: Array<{
    emoji: string;
    title: string;
    bullets: string[];
    allPlans: boolean;
  }> = [
    {
      emoji: '\u{1F3AF}',
      title: 'String Spaces',
      bullets: [
        'نظام إدارة تعلّم (LMS) + نظام معلومات مدرسي (SIS)',
        'حضور تلقائي وسجل درجات متكامل',
        'تقارير أداء مفصّلة لكل طالب',
      ],
      allPlans: true,
    },
    {
      emoji: '\u2728',
      title: 'String Studio',
      bullets: [
        '"التطبيقات كشرائح" — أسلوب ثوري في بناء الدروس',
        'أكثر من 100 تطبيق تعليمي تفاعلي جاهز',
        'مساعد ذكاء اصطناعي لبناء الدروس بسرعة',
      ],
      allPlans: true,
    },
    {
      emoji: '\u{1F3C6}',
      title: 'String Quests',
      bullets: [
        'ألعاب تعليمية مبنية من المنهج مباشرة',
        'نظام XP يحفّز الطلاب على التعلّم',
        'لوحة متصدّرين تشعل روح المنافسة',
      ],
      allPlans: false,
    },
    {
      emoji: '\u{1F9EC}',
      title: 'String DNA',
      bullets: [
        '\u0661\u0662\u0668 ملفاً تعليمياً لكل طالب',
        'تقييم نفسي وسلوكي متكامل',
        'يساعد المعلم على فهم الطالب بعمق',
      ],
      allPlans: false,
    },
    {
      emoji: '\u{1F916}',
      title: 'String AI',
      bullets: [
        'ذكاء اصطناعي غير محدود ومجاني',
        'مساعد لتحضير الدروس والاختبارات',
        'تحليل بيانات وتقارير ذكية',
      ],
      allPlans: false,
    },
    {
      emoji: '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}',
      title: 'String Family',
      bullets: [
        'تطبيق مخصص لأولياء الأمور',
        'متابعة مباشرة لأداء الأبناء',
        'تقارير دورية وتواصل آمن مع المدرسة',
      ],
      allPlans: false,
    },
    {
      emoji: '\u{1F4AC}',
      title: 'String Chat',
      bullets: [
        'تواصل آمن مبني على بروتوكول Matrix',
        'محادثات مشفّرة بين المعلمين والطلاب',
        'قنوات إدارية وتعليمية منظّمة',
      ],
      allPlans: false,
    },
    {
      emoji: '\u{1F4F9}',
      title: 'String Meetings',
      bullets: [
        'حصص فيديو مباشرة + سبورة تفاعلية',
        'تسجيل تلقائي للرجوع إليه لاحقاً',
        'نسخ ذكي بالذكاء الاصطناعي',
      ],
      allPlans: false,
    },
  ];

  const studioStats = [
    { value: '1,240', label: 'درس تم إنشاؤه' },
    { value: '22+', label: 'ساعة أسبوعياً' },
    { value: '100+', label: 'تطبيق تفاعلي' },
  ];

  const additionalFeatures = [
    'نظام واجبات ذكي مع تصحيح تلقائي',
    'تقويم مدرسي موحّد',
    'بنك أسئلة مشترك',
    'تقارير أداء للإدارة',
    'لوحة تحكم مركزية',
    'دعم فني مباشر على مدار الساعة',
    'تحديثات مستمرة ومجانية',
    'تطبيقات الهاتف (iOS + Android)',
  ];

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      {/* Title */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-block bg-sky-100 text-sky-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4"
        >
          القسم ٦
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
          String يحتوي على LMS — وأيضاً{' '}
          <span className="text-sky-600">كل هذا</span>
        </h2>
      </div>

      {/* 2x4 Feature Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"
      >
        {features.map((f, i) => (
          <motion.div key={i} variants={staggerItem}>
            <FeatureCard
              emoji={f.emoji}
              title={f.title}
              bullets={f.bullets}
              allPlans={f.allPlans}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Studio Expandable Details */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-8"
      >
        <button
          onClick={() => setStudioExpanded(!studioExpanded)}
          className="w-full flex items-center justify-between bg-gradient-to-l from-sky-50 to-white border border-sky-200 rounded-2xl px-6 py-4 hover:shadow-md transition-all duration-200 group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{'\u2728'}</span>
            <span className="font-bold text-gray-900 font-['Cairo']">
              تفاصيل String Studio — القلب النابض للمنصة
            </span>
          </div>
          <div className="text-sky-500 group-hover:text-sky-600 transition-colors">
            {studioExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </button>

        <AnimatePresence>
          {studioExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="bg-sky-50/50 border border-t-0 border-sky-200 rounded-b-2xl p-6 space-y-6">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4">
                  {studioStats.map((s, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl border border-sky-100 p-4 text-center"
                    >
                      <p className="text-2xl font-black text-sky-600 font-['Cairo']">
                        {s.value}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 font-['Cairo']">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Testimonial */}
                <TestimonialCard
                  quote="أنا مش معلمة صف — أنا معلمة روبوتيكس. كنت أدفع اشتراك لمنصة Hello World Kids لأن ما في منصة عربية تخدم تخصصي. لمّا استخدمت String Studio، بنيت ١٠ دروس تفاعلية بأول أسبوع بدون ما أحتاج أي منصة ثانية."
                  name="ربا صرور"
                  role="معلمة روبوتيكس"
                  organization="مدارس الخضر"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* "Everything in One Subscription" Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="mt-8 bg-gradient-to-l from-sky-600 to-sky-500 rounded-2xl p-6 sm:p-8 text-white"
      >
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6" />
          <h3 className="text-xl font-black font-['Cairo']">
            كل هذا — باشتراك واحد
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {additionalFeatures.map((feat, i) => (
            <div key={i} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-sky-200 shrink-0" />
              <span className="text-sm text-sky-50 font-['Cairo']">
                {feat}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 7 — 3-Day Setup
// ═══════════════════════════════════════════════════════════════
function Section7Setup() {
  const days = [
    {
      day: '\u0661',
      title: 'التأسيس',
      tasks: [
        'إنشاء الصفوف والشُعب',
        'تحميل المنهج الدراسي',
        'إعداد حسابات المعلمين والطلاب',
      ],
    },
    {
      day: '\u0662',
      title: 'التدريب',
      tasks: [
        'تدريب المعلمين على المنصة',
        'تفعيل المحتوى التفاعلي',
        'إعداد الواجبات الأولى',
      ],
    },
    {
      day: '\u0663',
      title: 'الانطلاق',
      tasks: [
        'الطلاب يبدأون الاستخدام',
        'البيانات تتدفق مباشرة',
        'الدعم الفني متواجد',
      ],
    },
  ];

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-['Cairo']">
          String جاهز في{' '}
          <span className="text-sky-600">٣ أيام</span> — ليس فارغاً
        </h2>
        <p className="text-gray-500 mt-2 text-sm font-['Cairo']">
          ليست ٣ أيام إعداد فارغة — بل ٣ أيام حتى التأثير الفعلي
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Connecting line */}
        <div className="hidden sm:block absolute top-16 start-[calc(16.67%)] end-[calc(16.67%)] h-0.5 bg-sky-200 z-0" />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10"
        >
          {days.map((d, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              className="flex flex-col items-center text-center"
            >
              {/* Circle */}
              <div className="w-14 h-14 rounded-full bg-sky-500 text-white flex items-center justify-center text-xl font-black shadow-lg shadow-sky-300/40 mb-4 ring-4 ring-white font-['Cairo']">
                {d.day}
              </div>

              {/* Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 w-full shadow-sm">
                <h4 className="font-bold text-gray-900 text-lg mb-3 font-['Cairo']">
                  {d.title}
                </h4>
                <ul className="space-y-2">
                  {d.tasks.map((task, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-2 text-sm text-gray-600 justify-center sm:justify-start font-['Cairo']"
                    >
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-emerald-600" />
                      </div>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Ready Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center"
      >
        <div className="flex items-center justify-center gap-2 text-emerald-700">
          <Rocket className="w-5 h-5" />
          <span className="font-bold text-lg font-['Cairo']">
            جاهز للتأثير
          </span>
          <span className="text-2xl">{'\u{1F680}'}</span>
        </div>
        <p className="text-emerald-600 text-sm mt-1 font-['Cairo']">
          في اليوم الرابع، الطلاب يتعلمون والبيانات تُظهر النتائج
        </p>
      </motion.div>
    </motion.section>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 8 — Case Study: Al-Khadr Schools
// ═══════════════════════════════════════════════════════════════
function Section8CaseStudy() {
  const stats: Array<{
    number: string;
    subtitle: string;
    color: 'sky' | 'emerald' | 'violet' | 'amber';
  }> = [
    { number: '1,200%', subtitle: 'نمو في ٤ أشهر', color: 'sky' },
    { number: '90%', subtitle: 'نشاط أسبوعي', color: 'emerald' },
    { number: '22+', subtitle: 'ساعة أسبوعياً', color: 'violet' },
    { number: '48,000+', subtitle: 'تحدي مكتمل', color: 'amber' },
  ];

  const wins = [
    {
      icon: '\u{1F9EA}',
      title: 'مسابقة الكيمياء',
      desc: 'المركز الأول على مستوى المملكة',
    },
    {
      icon: '\u{1F4BB}',
      title: 'مسابقة البرمجة',
      desc: '٩ طلاب وصلوا لمستوى المملكة',
    },
    {
      icon: '\u{1F916}',
      title: 'مسابقة الروبوتيكس',
      desc: '٣ جوائز على مستوى المملكة',
    },
  ];

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-['Cairo']">
          كيف حولت String{' '}
          <span className="text-sky-600">مدارس الخضر</span>
        </h2>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i}>
            <StatCallout
              number={s.number}
              subtitle={s.subtitle}
              color={s.color}
            />
          </div>
        ))}
      </div>

      {/* National Wins */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
      >
        {wins.map((w, i) => (
          <motion.div
            key={i}
            variants={staggerItem}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-4xl mb-3">{w.icon}</div>
            <h4 className="font-bold text-gray-900 mb-1 font-['Cairo']">
              {w.title}
            </h4>
            <p className="text-amber-700 text-sm font-medium font-['Cairo']">
              {w.desc}
            </p>
            <div className="mt-3">
              <Trophy className="w-5 h-5 text-amber-500 mx-auto" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Testimonial */}
      <TestimonialCard
        quote="أنا مش معلمة صف — أنا معلمة روبوتيكس. كنت أدفع اشتراك لمنصة Hello World Kids لأن ما في منصة عربية تخدم تخصصي. لمّا استخدمت String Studio، بنيت ١٠ دروس تفاعلية بأول أسبوع بدون ما أحتاج أي منصة ثانية."
        name="ربا صرور"
        role="معلمة روبوتيكس"
        organization="مدارس الخضر"
      />

      {/* Verification Contact */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-wrap items-center gap-3 text-sm"
      >
        <Phone className="w-4 h-4 text-sky-500 shrink-0" />
        <span className="text-gray-500 font-['Cairo']">للتحقق:</span>
        <span className="font-bold text-gray-700 font-['Cairo']">
          د. جهاد الكسواني
        </span>
        <span className="text-sky-600 font-medium" dir="ltr">
          +962 7 8200 0410
        </span>
      </motion.div>
    </motion.section>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 9 — What Edison Gets (per role)
// ═══════════════════════════════════════════════════════════════
function Section9WhatEdisonGets() {
  const roles = [
    {
      emoji: '\u{1F469}\u200D\u{1F3EB}',
      title: 'لكل واحد من المعلمين الـ ٧٠',
      items: [
        'لوحة تحكم شخصية كاملة',
        'أكثر من ١٠٠ تطبيق تفاعلي جاهز',
        'مساعد ذكاء اصطناعي لتحضير الدروس',
        'بنك أسئلة مشترك بين المعلمين',
        'نظام واجبات مع تصحيح تلقائي',
        'تقارير أداء لكل طالب',
        'حصص فيديو مع سبورة تفاعلية',
        'تواصل آمن مع الطلاب وأولياء الأمور',
        'تدريب مجاني + دعم فني مباشر',
      ],
    },
    {
      emoji: '\u{1F468}\u200D\u{1F393}',
      title: 'لكل واحد من الـ ١,١٠٠ طالب',
      items: [
        'ملف تعليمي شخصي (DNA) بـ ١٢٨ بُعداً',
        'ألعاب تعليمية من المنهج (Quests)',
        'نظام نقاط XP ولوحة متصدرين',
        'واجبات تفاعلية بدل الورقية',
        'دروس مسجّلة يمكن إعادتها',
        'مساعد ذكاء اصطناعي للدراسة',
        'تطبيق هاتف سهل الاستخدام',
        'شارات وإنجازات تحفيزية',
        'تقييم ذاتي ومتابعة التقدم',
      ],
    },
    {
      emoji: '\u{1F46A}',
      title: 'لأولياء الأمور',
      items: [
        'تطبيق String Family مخصص',
        'متابعة مباشرة لأداء الأبناء',
        'تقارير دورية تلقائية',
        'تواصل آمن مع المعلمين',
        'إشعارات الواجبات والاختبارات',
        'متابعة الحضور والغياب',
        'رؤية نقاط القوة والضعف',
      ],
    },
    {
      emoji: '\u{1F3DB}\uFE0F',
      title: 'للإدارة',
      items: [
        'لوحة تحكم مركزية لكل المدرسة',
        'تقارير أداء شاملة بالأرقام',
        'متابعة نشاط كل معلم وصف',
        'بيانات لحظية لاتخاذ القرارات',
        'تقارير لوزارة التربية جاهزة',
        'نظام تواصل إداري آمن',
        'إدارة الحسابات والصلاحيات',
        'دعم مخصص من فريق String',
      ],
    },
  ];

  const reputationBenefits = [
    'أول مدرسة String في إربد',
    'شارة "String AI School" الرسمية',
    'أفضل موقع مدرسي في المملكة (تصميم String)',
    'تغطية في حملات String التسويقية',
    'أولوية في الميزات الجديدة',
    'عضوية في مجلس مدارس String الاستشاري',
    'شهادة "مدرسة رائدة في التحول الرقمي"',
  ];

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-['Cairo']">
          ماذا ستحصل مدارس{' '}
          <span className="text-sky-600">Edison</span> — بالتفصيل
        </h2>
      </div>

      {/* 4 Role Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8"
      >
        {roles.map((role, i) => (
          <motion.div
            key={i}
            variants={staggerItem}
            className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-sky-200 transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{role.emoji}</span>
              <h4 className="font-bold text-gray-900 font-['Cairo']">
                {role.title}
              </h4>
            </div>
            <ul className="space-y-2">
              {role.items.map((item, j) => (
                <li
                  key={j}
                  className="flex items-start gap-2 text-sm text-gray-600 font-['Cairo']"
                >
                  <Check className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>

      {/* Reputation Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 sm:p-8"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center">
            <Star className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-black text-gray-900 text-lg font-['Cairo']">
              سمعة وريادة — لا تُشترى
            </h4>
            <p className="text-amber-700 text-sm font-['Cairo']">
              مزايا حصرية لشركاء التأسيس
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {reputationBenefits.map((b, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-sm text-gray-700 font-['Cairo']"
            >
              <Star className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{b}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 10 — Pricing + CTA
// ═══════════════════════════════════════════════════════════════
function Section10Pricing() {
  const plans: Array<{
    name: string;
    price: string;
    priceNote: string;
    features: string[];
    recommended?: boolean;
    comingSoon?: boolean;
    discountPrice?: string;
  }> = [
    {
      name: 'Basic',
      price: '٢ دينار',
      priceNote: 'لكل طالب / شهرياً',
      features: [
        'String Spaces (LMS + SIS)',
        'String Studio (التطبيقات التفاعلية)',
        'نظام الحضور والدرجات',
        'تقارير أساسية',
        'دعم فني عبر البريد',
      ],
    },
    {
      name: 'Nova',
      price: '٣.٥ دينار',
      priceNote: 'لكل طالب / شهرياً — مع ترقية Supernova مجانية للسنة الأولى',
      recommended: true,
      discountPrice: '١.٧٥ دينار',
      features: [
        'كل ميزات Basic',
        'String Quests (الألعاب التعليمية)',
        'String DNA (١٢٨ ملف تعليمي)',
        'String AI (ذكاء اصطناعي غير محدود)',
        'String Chat (تواصل آمن)',
        'String Meetings (حصص فيديو)',
        'تقارير متقدمة',
        'دعم فني مباشر',
      ],
    },
    {
      name: 'Supernova',
      price: '٧ دنانير',
      priceNote: 'لكل طالب / شهرياً',
      features: [
        'كل ميزات Nova',
        'String Family (تطبيق أولياء الأمور)',
        'تقارير مخصصة للإدارة',
        'أولوية في الدعم الفني',
        'تدريب معلمين متقدم',
        'تخصيص المنصة بهوية المدرسة',
      ],
    },
    {
      name: 'Hypernova',
      price: '\u2014',
      priceNote: 'قريباً',
      comingSoon: true,
      features: [
        'كل ميزات Supernova',
        'ذكاء اصطناعي متقدم',
        'تكامل مع أنظمة خارجية',
        'تحليلات تنبؤية',
        'مدير حساب مخصص',
      ],
    },
  ];

  const paymentRows = [
    {
      item: 'رسوم التأسيس',
      amount: '٧,٨٠٠ دينار',
      date: 'عند التوقيع',
    },
    {
      item: 'اشتراك Nova (١,١٠٠ طالب \u00D7 ٣.٥ \u00D7 ١٠ أشهر \u00D7 ٥٠٪)',
      amount: '١٩,٢٥٠ دينار',
      date: '٣ دفعات',
    },
    {
      item: 'ترقية Supernova',
      amount: 'مجاناً',
      date: '\u2014',
      highlight: true,
    },
    {
      item: 'المجموع',
      amount: '٢٧,٠٥٠ دينار',
      date: '',
      total: true,
    },
  ];

  const competitorPricing = [
    {
      service: 'String DNA',
      competitor: '١٤ دينار / طالب / شهر',
      note: 'مشمول مع Nova',
    },
    {
      service: 'String Family',
      competitor: '٧ دنانير / شهر',
      note: 'مجاني السنة الأولى',
    },
    {
      service: 'String Quests',
      competitor: '٣.٥\u2013٥.٥ دينار / شهر',
      note: 'مشمول مع Nova',
    },
    {
      service: '100+ تطبيق تفاعلي',
      competitor: '١.٥\u2013٣.٥ دينار / تطبيق',
      note: 'كلها مشمولة',
    },
    {
      service: 'String AI',
      competitor: '١٤ دينار / معلم / شهر',
      note: 'مجاني وغير محدود',
    },
  ];

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-['Cairo']">
          خطط الاشتراك{' '}
          <span className="text-sky-600">والاستثمار</span>
        </h2>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {plans.map((plan, i) => (
          <div key={i}>
            <PricingCard
              name={plan.name}
              price={plan.price}
              priceNote={plan.priceNote}
              features={plan.features}
              recommended={plan.recommended}
              comingSoon={plan.comingSoon}
              discountPrice={plan.discountPrice}
            />
          </div>
        ))}
      </div>

      {/* Founder Partner Discount */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-l from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-2xl p-6 sm:p-8 mb-8"
      >
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-200 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-lg font-['Cairo']">
                عرض شريك التأسيس
              </h3>
              <p className="text-emerald-700 text-sm font-['Cairo']">
                حصري — لفترة محدودة
              </p>
            </div>
          </div>
          <div className="bg-emerald-500 text-white font-black text-xl px-5 py-2 rounded-xl shadow-lg shadow-emerald-300/40 font-['Cairo']">
            خصم ٥٠٪
          </div>
        </div>

        {/* Payment Table */}
        <div className="bg-white rounded-xl border border-emerald-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-emerald-100/60">
                <th className="text-start p-3 text-sm font-bold text-gray-700 font-['Cairo']">
                  البند
                </th>
                <th className="text-start p-3 text-sm font-bold text-gray-700 font-['Cairo']">
                  المبلغ
                </th>
                <th className="text-start p-3 text-sm font-bold text-gray-700 font-['Cairo']">
                  الموعد
                </th>
              </tr>
            </thead>
            <tbody>
              {paymentRows.map((row, i) => (
                <tr
                  key={i}
                  className={`border-t border-emerald-100 ${
                    row.total
                      ? 'bg-emerald-50 font-black'
                      : row.highlight
                      ? 'bg-green-50/50'
                      : ''
                  }`}
                >
                  <td className="p-3 text-sm text-gray-700 font-['Cairo']">
                    {row.item}
                  </td>
                  <td
                    className={`p-3 text-sm font-bold font-['Cairo'] ${
                      row.highlight
                        ? 'text-emerald-600'
                        : row.total
                        ? 'text-gray-900 text-base'
                        : 'text-gray-900'
                    }`}
                  >
                    {row.amount}
                  </td>
                  <td className="p-3 text-sm text-gray-500 font-['Cairo']">
                    {row.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Competitor Pricing - "Real Value" */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-violet-50 border border-violet-200 rounded-2xl p-6 sm:p-8 mb-8"
      >
        <h3 className="font-black text-gray-900 text-lg mb-2 font-['Cairo']">
          القيمة الحقيقية — ما يدفعه غيرك
        </h3>
        <p className="text-violet-600 text-sm mb-5 font-['Cairo']">
          لو اشتريت كل خدمة على حدة من السوق:
        </p>

        <div className="space-y-3">
          {competitorPricing.map((cp, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-white rounded-xl border border-violet-100 p-3 sm:p-4 flex-wrap gap-2"
            >
              <span className="font-bold text-gray-800 text-sm font-['Cairo']">
                {cp.service}
              </span>
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-gray-400 text-sm line-through font-['Cairo']">
                  {cp.competitor}
                </span>
                <span className="text-emerald-600 text-sm font-bold bg-emerald-50 px-3 py-1 rounded-lg font-['Cairo']">
                  {cp.note}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-l from-sky-600 to-blue-700 rounded-3xl p-8 sm:p-12 text-white text-center overflow-hidden relative"
      >
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -start-20 w-60 h-60 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -end-20 w-60 h-60 bg-white/5 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-2xl sm:text-3xl font-black mb-3 font-['Cairo']">
              الخطوة التالية — دعوة
            </h3>
            <p className="text-sky-200 mb-8 max-w-lg mx-auto font-['Cairo']">
              نحن مستعدون لزيارة مدارس Edison وعرض المنصة مباشرة أمام فريقكم
            </p>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 max-w-md mx-auto mb-8"
          >
            <div className="flex items-center gap-3 mb-4 justify-center">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-xl font-bold font-['Cairo']">ع</span>
              </div>
              <div className="text-start">
                <p className="font-bold text-lg font-['Cairo']">عمر أبوسليم</p>
                <p className="text-sky-200 text-sm font-['Cairo']">
                  المؤسس والرئيس التنفيذي
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <a
                href="tel:+962786717634"
                className="flex items-center gap-2 text-sm hover:text-white/90 transition-colors justify-center"
                dir="ltr"
              >
                <Phone className="w-4 h-4" />
                <span>(+962) 78 671 7634</span>
              </a>
              <a
                href="mailto:omar@string.education"
                className="flex items-center gap-2 text-sm hover:text-white/90 transition-colors justify-center"
              >
                <Mail className="w-4 h-4" />
                <span>omar@string.education</span>
              </a>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <a
              href="#schedule"
              className="inline-flex items-center gap-2 bg-white text-sky-700 font-bold px-8 py-3.5 rounded-xl hover:bg-sky-50 transition-colors shadow-lg shadow-black/10 font-['Cairo']"
            >
              <Calendar className="w-5 h-5" />
              <span>احجز موعد زيارة</span>
            </a>
            <a
              href="https://youtube.com/@string-education"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-white/20 transition-colors font-['Cairo']"
            >
              <Youtube className="w-5 h-5" />
              <span>شاهد العرض التوضيحي</span>
            </a>
          </motion.div>

          {/* Confidentiality Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-10 pt-6 border-t border-white/15"
          >
            <div className="flex items-center justify-center gap-2 text-sky-300 text-xs font-['Cairo']">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>
                هذا العرض سري وموجّه حصرياً لمدارس Edison. لا يجوز مشاركته
                مع أي جهة أخرى بدون إذن مسبق من String.
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════
export function EdisonProposalPart2() {
  return (
    <div
      dir="rtl"
      className="font-['Cairo'] bg-white min-h-screen text-gray-900 antialiased"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-0">
        {/* Section 6: Feature Breakdown */}
        <Section6Features />
        <SectionDivider sectionNumber={7} title="الإعداد والتشغيل" />

        {/* Section 7: 3-Day Setup */}
        <Section7Setup />
        <SectionDivider sectionNumber={8} title="دراسة حالة" />

        {/* Section 8: Case Study */}
        <Section8CaseStudy />
        <SectionDivider sectionNumber={9} title="ماذا ستحصل Edison" />

        {/* Section 9: What Edison Gets */}
        <Section9WhatEdisonGets />
        <SectionDivider sectionNumber={10} title="الاستثمار والخطوة التالية" />

        {/* Section 10: Pricing + CTA */}
        <Section10Pricing />
      </div>
    </div>
  );
}
