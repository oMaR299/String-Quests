import { motion } from 'framer-motion';
import { ChevronDown, Clock, Pen, BarChart3, Smartphone, Database, Eye, Users, GraduationCap, School } from 'lucide-react';
import { StatCallout, SectionDivider, TestimonialCard } from './ProposalComponents';

// ─────────────────────────────────────────────
// Animation Variants
// ─────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

// ─────────────────────────────────────────────
// Student Stats Data
// ─────────────────────────────────────────────

const studentStats = [
  {
    number: '٢,٠٠٠+',
    description: 'طالبة في الصف السادس أجابت على أكثر من ٢,٠٠٠ سؤال في ٣ مواد',
    color: 'emerald' as const,
    icon: '📚',
  },
  {
    number: '٦٠٠+',
    description: 'طالب في الصف الثاني — عمره ٧ سنوات — أجاب على أكثر من ٦٠٠ سؤال',
    color: 'sky' as const,
    icon: '🧒',
  },
  {
    number: '٥٠٠+',
    description: 'طالبة في الصف العاشر تتدرب على الكيمياء يومياً عبر أكثر من ٥٠٠ سؤال',
    color: 'violet' as const,
    icon: '🧪',
  },
  {
    number: '٤٨,٠٠٠+',
    description: 'تحدي تعليمي أكمله الطلاب في أقل من ٣ أشهر',
    color: 'amber' as const,
    icon: '🏆',
  },
];

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export function EdisonProposalPart1() {
  return (
    <div dir="rtl" className="font-['Cairo'] bg-white text-slate-800 min-h-screen">

      {/* ═══════════════════════════════════════════
          SECTION 1: Hero / Cover
          ═══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Background orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-100/20 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10 text-center max-w-3xl mx-auto"
        >
          {/* Logos */}
          <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="flex items-center justify-center gap-6 mb-10">
            <img src="/string-logo.png" alt="String" className="h-20 w-auto object-contain" />
            <div className="flex flex-col items-center gap-1">
              <div className="w-px h-8 bg-gradient-to-b from-sky-300 to-transparent" />
              <div className="w-2 h-2 rounded-full bg-sky-400" />
              <div className="w-px h-8 bg-gradient-to-t from-sky-300 to-transparent" />
            </div>
            <img src="/edison-logo.png" alt="Edison" className="h-20 w-auto object-contain" />
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl font-black text-slate-900 mb-4 leading-tight"
          >
            عرض أسعار
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-slate-500 mb-2"
          >
            نظام تشغيل التعليم المتكامل
          </motion.p>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-base text-slate-400 mb-8"
          >
            أبريل ٢٠٢٦
          </motion.p>

          {/* Metadata */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6 text-sm text-slate-500 mb-8"
          >
            <div className="flex items-center gap-2">
              <span className="text-sky-500 font-semibold">مُعَد لـ:</span>
              <span>مدارس Edison</span>
            </div>
            <div className="w-px h-5 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="text-sky-500 font-semibold">مُعَد من:</span>
              <span>فريق String</span>
            </div>
          </motion.div>

          {/* Confidentiality badge */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200/60 text-amber-700 text-xs font-semibold px-5 py-2 rounded-full"
          >
            <span>&#128274;</span>
            <span>سري وخاص — للاطلاع المحدود فقط</span>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-6 h-6 text-sky-400" />
        </motion.div>
      </section>

      {/* Container for remaining sections */}
      <div className="max-w-5xl mx-auto px-6">

        {/* ═══════════════════════════════════════════
            SECTION 2: Testimonials
            ═══════════════════════════════════════════ */}
        <SectionDivider sectionNumber={1} title="ماذا يقول عملاؤنا" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
            <TestimonialCard
              quote="String ليس مجرد نظام إدارة تعلم أفضل — إنه فئة جديدة تماماً. سمح لنا بالتوقف عن الدفع لـ ٩ أدوات مختلفة، وأعاد لمعلمينا ١٠ ساعات أسبوعياً، وضاعف تفاعل طلابنا."
              name="د. جهاد الكسواني"
              role="مدير"
              organization="مدارس الخضر"
            />
          </motion.div>
          <motion.div variants={fadeUp} transition={{ duration: 0.6, delay: 0.15 }}>
            <TestimonialCard
              quote="استديو String هو ليس فقط أفضل أداة إنشاء محتوى اليوم — بل هو أفضل أداة إنشاء محتوى في التاريخ!"
              name="Joe Merrill"
              role="CEO"
              organization="OpenTeams"
            />
          </motion.div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            SECTION 3: The Problem
            ═══════════════════════════════════════════ */}
        <SectionDivider sectionNumber={2} title="المشكلة" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="space-y-10"
        >
          {/* Problem title */}
          <motion.h2
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-black text-slate-900 text-center leading-relaxed"
          >
            المشكلة الحقيقية ليست أن مدرستكم تحتاج نظاماً —{' '}
            <span className="text-rose-500">المشكلة أن كل الأنظمة الموجودة فارغة</span>
          </motion.h2>

          {/* 3 Red stat callouts */}
          <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCallout
              number="١٥"
              subtitle="دقيقة/أسبوع استخدام فعلي"
              icon={<Clock className="w-8 h-8" />}
              color="rose"
            />
            <StatCallout
              number="١٠٠٪"
              subtitle="إدخال يدوي من المعلم"
              icon={<Pen className="w-8 h-8" />}
              color="rose"
            />
            <StatCallout
              number="٠٪"
              subtitle="رؤى حقيقية قابلة للتنفيذ"
              icon={<BarChart3 className="w-8 h-8" />}
              color="rose"
            />
          </motion.div>

          {/* Narrative paragraphs */}
          <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="space-y-6 text-lg text-slate-600 leading-relaxed">
            <p>
              تمتلك معظم المدارس اليوم نظام إدارة تعلم (LMS). ولكن اسألوا أي معلم: كم مرة يستخدمه فعلاً؟
              الإجابة في الغالب: لرفع ملف PDF أو وضع رابط فيديو. لا يوجد تفاعل حقيقي. لا توجد بيانات حقيقية.
              لا توجد رؤى قابلة للتنفيذ.
            </p>
            <p>
              السبب بسيط: هذه الأنظمة صُممت كأدوات إدارة وليس كأدوات تعليم.
              هي مستودعات فارغة تنتظر من المعلم أن يملأها يدوياً — في وقت لا يملكه أصلاً.
            </p>
          </motion.div>

          {/* Red dashed border card — filing cabinet analogy */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="border-2 border-dashed border-rose-300 rounded-2xl p-8 bg-rose-50/30"
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl shrink-0">&#128452;</span>
              <div className="space-y-3">
                <p className="text-lg text-slate-700 leading-relaxed">
                  تخيلوا أنكم اشتريتم خزانة ملفات بـ ٥٠,٠٠٠ دينار. خزانة جميلة، قوية، بأدراج كثيرة.
                  لكن بعد سنة، فتحتم الأدراج ووجدتموها... فارغة. لأن لا أحد كان لديه وقت أو سبب حقيقي لملئها.
                </p>
                <p className="text-lg text-slate-700 leading-relaxed">
                  هذا هو حال ٩٥٪ من أنظمة LMS في المدارس اليوم.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Bold quote */}
          <motion.blockquote
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center py-8"
          >
            <p className="text-2xl md:text-3xl font-black text-slate-900 leading-relaxed">
              "شراء نظام LMS في ٢٠٢٦ يشبه شراء خزانة ملفات فارغة —{' '}
              <span className="text-sky-600">String هو المكتبة التي تملأ نفسها.</span>"
            </p>
          </motion.blockquote>
        </motion.div>

        {/* ═══════════════════════════════════════════
            SECTION 4: The Solution
            ═══════════════════════════════════════════ */}
        <SectionDivider sectionNumber={3} title="الحل" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="space-y-12"
        >
          {/* Solution title */}
          <motion.h2
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-black text-slate-900 text-center leading-relaxed"
          >
            String ليس أداة إدارة —{' '}
            <span className="text-sky-600">String هو المكان الذي يحدث فيه التعلم</span>
          </motion.h2>

          {/* Before/After comparison */}
          <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LMS — Before (Red) */}
            <div className="border-2 border-rose-200 rounded-2xl p-6 bg-rose-50/20">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <h3 className="font-bold text-lg text-rose-700">نظام LMS تقليدي</h3>
              </div>
              <div className="space-y-4">
                {[
                  { step: '١', text: 'المعلم يحضّر المحتوى يدوياً', icon: '📝' },
                  { step: '٢', text: 'يرفع الملفات على النظام', icon: '📤' },
                  { step: '٣', text: 'يُدخل الدرجات يدوياً', icon: '✍️' },
                  { step: '٤', text: 'يكتب التقارير يدوياً', icon: '📊' },
                  { step: '٥', text: 'النتيجة: ٣-٥ ساعات عمل إداري يومياً', icon: '😩' },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3 text-sm text-slate-700">
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-['Cairo']">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* String — After (Sky) */}
            <div className="border-2 border-sky-200 rounded-2xl p-6 bg-sky-50/20">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-3 h-3 rounded-full bg-sky-500" />
                <h3 className="font-bold text-lg text-sky-700">نظام String</h3>
              </div>
              <div className="space-y-4">
                {[
                  { step: '١', text: 'المعلم يُدرّس بشكل طبيعي', icon: '👩‍🏫' },
                  { step: '٢', text: 'المحتوى جاهز ومتوافق مع المنهاج', icon: '📚' },
                  { step: '٣', text: 'البيانات تُجمع تلقائياً أثناء التعلم', icon: '🤖' },
                  { step: '٤', text: 'التقارير تظهر فوراً بدون أي جهد', icon: '✨' },
                  { step: '٥', text: 'النتيجة: ١٥ دقيقة أسبوعياً فقط', icon: '🎉' },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3 text-sm text-slate-700">
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-['Cairo']">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Huge comparison stat */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row items-center justify-center gap-6 py-8"
          >
            <div className="text-center">
              <p className="text-5xl font-black text-rose-500">٣-٥ ساعات</p>
              <p className="text-sm text-slate-500 mt-1">يومياً — نظام LMS تقليدي</p>
            </div>
            <div className="text-4xl text-slate-300 font-light">&#x2192;</div>
            <div className="text-center">
              <p className="text-5xl font-black text-sky-600">١٥ دقيقة</p>
              <p className="text-sm text-slate-500 mt-1">أسبوعياً — مع String</p>
            </div>
          </motion.div>

          {/* Student Engagement — Stat Cards */}
          <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 text-center">
              أرقام حقيقية من طلابنا
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {studentStats.map((stat, i) => {
                const colorStyles = {
                  emerald: {
                    border: 'border-emerald-200/60',
                    bg: 'bg-gradient-to-br from-white to-emerald-50/40',
                    numberColor: 'text-emerald-600',
                    iconBg: 'bg-emerald-100',
                  },
                  sky: {
                    border: 'border-sky-200/60',
                    bg: 'bg-gradient-to-br from-white to-sky-50/40',
                    numberColor: 'text-sky-600',
                    iconBg: 'bg-sky-100',
                  },
                  violet: {
                    border: 'border-violet-200/60',
                    bg: 'bg-gradient-to-br from-white to-violet-50/40',
                    numberColor: 'text-violet-600',
                    iconBg: 'bg-violet-100',
                  },
                  amber: {
                    border: 'border-amber-200/60',
                    bg: 'bg-gradient-to-br from-white to-amber-50/40',
                    numberColor: 'text-amber-600',
                    iconBg: 'bg-amber-100',
                  },
                };

                const style = colorStyles[stat.color];

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className={`${style.bg} ${style.border} border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`${style.iconBg} w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0`}>
                        {stat.icon}
                      </div>
                      <div className="space-y-1">
                        <p className={`text-3xl font-black ${style.numberColor} font-['Cairo'] leading-tight`}>
                          {stat.number}
                        </p>
                        <p className="text-sm text-slate-600 font-['Cairo'] leading-relaxed">
                          {stat.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            SECTION 5: Why "Operating System"
            ═══════════════════════════════════════════ */}
        <SectionDivider sectionNumber={4} title="لماذا نظام تشغيل؟" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="space-y-12 pb-20"
        >
          {/* Section title */}
          <motion.h2
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-black text-slate-900 text-center leading-relaxed"
          >
            لماذا نسميه{' '}
            <span className="text-sky-600">"نظام تشغيل"</span>{' '}
            وليس "نظام إدارة تعلم"
          </motion.h2>

          {/* Smartphone analogy — two columns */}
          <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Analogy */}
            <div className="bg-gradient-to-br from-slate-50 to-sky-50/30 border border-slate-200/60 rounded-2xl p-8 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <Smartphone className="w-8 h-8 text-sky-600" />
                <h3 className="text-xl font-bold text-slate-800">تشبيه الهاتف الذكي</h3>
              </div>
              <p className="text-slate-600 leading-relaxed">
                نظام إدارة التعلم التقليدي يشبه هاتفاً قديماً — يقوم بوظيفة واحدة فقط (الاتصال).
                تحتاج تطبيقاً منفصلاً للرسائل، وآخر للكاميرا، وآخر للخرائط.
              </p>
              <p className="text-slate-600 leading-relaxed">
                String يشبه الهاتف الذكي — <strong className="text-slate-800">نظام تشغيل واحد</strong>{' '}
                يجمع كل التطبيقات في مكان واحد، ويجعلها تعمل معاً بسلاسة.
              </p>
              <div className="border-t border-slate-200/60 pt-4">
                <p className="text-sm text-slate-500 italic">
                  "لا تشتري ٩ أدوات منفصلة — اشترِ نظام تشغيل واحد يفعل كل شيء."
                </p>
              </div>
            </div>

            {/* Right: What makes it an OS */}
            <div className="bg-gradient-to-br from-sky-50/30 to-white border border-sky-200/40 rounded-2xl p-8 space-y-5">
              <h3 className="text-xl font-bold text-slate-800 mb-4">ما الذي يجعله "نظام تشغيل"؟</h3>
              <div className="space-y-4">
                {[
                  { icon: '📚', text: 'المحتوى والمنهاج مدمج — لا حاجة لإنشاء شيء من الصفر' },
                  { icon: '🤖', text: 'الذكاء الاصطناعي يعمل في الخلفية — تحليل، توصيات، تقييم' },
                  { icon: '📊', text: 'البيانات تتدفق تلقائياً — لا إدخال يدوي' },
                  { icon: '🔗', text: 'كل الأطراف متصلة — معلم، طالب، ولي أمر، إدارة' },
                  { icon: '🎮', text: 'التحفيز مدمج — نقاط، تحديات، مسابقات' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="text-lg shrink-0">{item.icon}</span>
                    <span className="font-['Cairo'] leading-relaxed">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Context Flow Diagram */}
          <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
            <h3 className="text-xl font-bold text-slate-800 text-center mb-8">
              تدفق البيانات — من مصدر واحد إلى الجميع
            </h3>

            <div className="bg-gradient-to-br from-slate-50 to-sky-50/20 border border-slate-200/60 rounded-2xl p-8 md:p-12">
              {/* Flow nodes */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-3">
                {/* Student */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-16 h-16 rounded-2xl bg-sky-100 border border-sky-200/60 flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-sky-600" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 font-['Cairo']">الطالب يتعلم</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                  className="text-sky-400 text-2xl md:rotate-0 rotate-90"
                >
                  &#x2192;
                </motion.div>

                {/* Central Data Source */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-200/50">
                    <Database className="w-9 h-9 text-white" />
                  </div>
                  <span className="text-xs font-bold text-sky-700 font-['Cairo']">مصدر واحد للبيانات</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.35 }}
                  className="text-sky-400 text-2xl md:rotate-0 rotate-90"
                >
                  &#x2192;
                </motion.div>

                {/* Recipients */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex flex-col md:flex-row items-center gap-4"
                >
                  {[
                    { icon: <Eye className="w-7 h-7 text-emerald-600" />, label: 'المعلم يرى', bg: 'bg-emerald-100 border-emerald-200/60' },
                    { icon: <Users className="w-7 h-7 text-violet-600" />, label: 'ولي الأمر يرى', bg: 'bg-violet-100 border-violet-200/60' },
                    { icon: <School className="w-7 h-7 text-amber-600" />, label: 'الإدارة ترى', bg: 'bg-amber-100 border-amber-200/60' },
                  ].map((node, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className={`w-14 h-14 rounded-2xl ${node.bg} border flex items-center justify-center`}>
                        {node.icon}
                      </div>
                      <span className="text-xs font-bold text-slate-600 font-['Cairo']">{node.label}</span>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Caption */}
              <p className="text-center text-sm text-slate-500 mt-8 font-['Cairo']">
                الطالب يتعلم مرة واحدة &#8594; البيانات تصل للجميع تلقائياً — بدون أي إدخال يدوي
              </p>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
