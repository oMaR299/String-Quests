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
  Shield,
  Handshake,
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
        'Learning Management System (LMS) + Student Information System (SIS)',
        'Automatic attendance and integrated gradebook',
        'Detailed performance reports for every student',
      ],
      allPlans: true,
    },
    {
      emoji: '\u2728',
      title: 'String Studio',
      bullets: [
        'Every app becomes part of the lesson — a revolutionary approach to lesson building',
        'Over 100 ready-made interactive educational apps',
        'AI assistant for building lessons quickly',
      ],
      allPlans: true,
    },
    {
      emoji: '\u{1F3C6}',
      title: 'String Quests',
      bullets: [
        'Educational games built directly from the curriculum',
        'XP system that motivates students to learn',
        'Leaderboard and points that ignite competitive spirit',
      ],
      allPlans: false,
    },
    {
      emoji: '\u{1F9EC}',
      title: 'String DNA',
      bullets: [
        '128 learning profiles for each student',
        'Comprehensive psychological and behavioral assessment',
        'Helps teachers deeply understand each student',
      ],
      allPlans: false,
    },
    {
      emoji: '\u{1F916}',
      title: 'String AI',
      bullets: [
        'Unlimited and free artificial intelligence',
        'Assistant for lesson and exam preparation',
        'Smart data analysis and reports',
      ],
      allPlans: false,
    },
    {
      emoji: '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}',
      title: 'String Family',
      bullets: [
        'Dedicated app for parents',
        'Direct monitoring of children\'s performance',
        'Periodic reports and secure communication with the school',
      ],
      allPlans: false,
    },
    {
      emoji: '\u{1F4AC}',
      title: 'String Chat',
      bullets: [
        'Secure communication built on military-grade encryption technology',
        'Encrypted conversations between teachers and students',
        'Organized administrative and educational channels',
      ],
      allPlans: false,
    },
    {
      emoji: '\u{1F4F9}',
      title: 'String Meetings',
      bullets: [
        'Live video classes built on secure open-source technology',
        'Automatic recording for later review',
        'AI-powered smart transcription',
      ],
      allPlans: false,
    },
  ];

  const studioStats = [
    { value: '1,240', label: 'Lessons created' },
    { value: '22+', label: 'Hours weekly' },
    { value: '100+', label: 'Interactive apps' },
  ];

  const additionalFeatures = [
    'Smart assignment system with automatic grading',
    'Unified school calendar',
    'Shared question bank',
    'Performance reports for administration',
    'Centralized control panel',
    'Direct technical support around the clock',
    'Continuous and free updates',
    'Mobile apps (iOS + Android)',
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
          Section 6
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
          String Includes an LMS — Plus{' '}
          <span className="text-sky-600">All of This</span>
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
          className="w-full flex items-center justify-between bg-gradient-to-r from-sky-50 to-white border border-sky-200 rounded-2xl px-6 py-4 hover:shadow-md transition-all duration-200 group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{'\u2728'}</span>
            <span className="font-bold text-gray-900 font-['Cairo']">
              String Studio Details — The Heart of the Platform
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
                  quote="I'm not a classroom teacher — I'm a robotics teacher. I used to pay for a Hello World Kids subscription because no Arabic platform served my specialty. When I used String Studio, I built 10 interactive lessons in the first week without needing any other platform."
                  name="Ruba Srour"
                  role="Robotics Teacher"
                  organization="Al-Khadr Schools"
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
        className="mt-8 bg-gradient-to-r from-sky-600 to-sky-500 rounded-2xl p-6 sm:p-8 text-white"
      >
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6" />
          <h3 className="text-xl font-black font-['Cairo']">
            All of This — In One Subscription
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
// SECTION 6B — Curriculum & AI Content System
// ═══════════════════════════════════════════════════════════════
function Section6BCurriculum() {
  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-['Cairo']">
          Curriculum Ready from <span className="text-sky-600">Day One</span> — Endless Content for Every Student
        </h2>
        <p className="text-gray-500 mt-2 text-sm font-['Cairo']">
          String comes with the complete curriculum — educational games, AI content, and automatic organization
        </p>
      </div>

      {/* Curriculum Auto-Setup */}
      <motion.div variants={staggerItem} className="bg-gradient-to-r from-sky-50 to-white border border-sky-200 rounded-2xl p-6 sm:p-8 mb-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-2xl shadow-lg shrink-0">📚</div>
          <div>
            <h3 className="font-black text-gray-900 text-lg font-['Cairo']">The Official Curriculum — Organized and Activated Automatically</h3>
            <p className="text-sky-700 text-sm font-['Cairo'] mt-1">No need to enter anything manually — every subject, every grade, every lesson is ready</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div className="bg-white rounded-xl border border-sky-100 p-5 text-center">
            <div className="text-3xl mb-2">🎮</div>
            <h4 className="font-bold text-gray-900 text-sm font-['Cairo'] mb-2">Automatic Educational Games</h4>
            <p className="text-gray-600 text-xs font-['Cairo'] leading-relaxed">AI transforms every lesson in the curriculum into interactive challenges — automatically. The teacher doesn't need to do anything.</p>
          </div>
          <div className="bg-white rounded-xl border border-sky-100 p-5 text-center">
            <div className="text-3xl mb-2">🤖</div>
            <h4 className="font-bold text-gray-900 text-sm font-['Cairo'] mb-2">Endless AI Content</h4>
            <p className="text-gray-600 text-xs font-['Cairo'] leading-relaxed">Every student gets content tailored to their level — different questions, different challenges, different learning paths. Unlimited content.</p>
          </div>
          <div className="bg-white rounded-xl border border-sky-100 p-5 text-center">
            <div className="text-3xl mb-2">📋</div>
            <h4 className="font-bold text-gray-900 text-sm font-['Cairo'] mb-2">Automatic Curriculum Organization</h4>
            <p className="text-gray-600 text-xs font-['Cairo'] leading-relaxed">String organizes the curriculum automatically — subjects, units, lessons, pages — everything is arranged and available for teachers and students from day one.</p>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-emerald-800 text-sm font-bold font-['Cairo'] text-center">
            ✨ Edison Schools will receive the complete Jordanian curriculum — for every subject and every grade — ready and activated with games and interactive content from day one
          </p>
        </div>
      </motion.div>

      {/* Skill Map — Per-page mastery */}
      <motion.div variants={staggerItem} className="bg-gradient-to-r from-violet-50 to-white border border-violet-200 rounded-2xl p-6 sm:p-8 mb-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-2xl shadow-lg shrink-0">🗺️</div>
          <div>
            <h3 className="font-black text-gray-900 text-lg font-['Cairo']">Skill Map — Unprecedented Precision in the World</h3>
            <p className="text-violet-700 text-sm font-['Cairo'] mt-1">We know exactly what each student knows — down to every page in every textbook</p>
          </div>
        </div>
        <p className="text-gray-700 text-sm leading-relaxed font-['Cairo'] mb-5">
          The Skill Map in String is not just a general percentage — it is a cognitive tracking system that measures student mastery of every concept and skill on every page of every textbook. This level of precision and depth <strong className="text-violet-700">does not exist in any other system in the world</strong>.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="bg-white rounded-xl border border-violet-100 p-5">
            <h4 className="font-bold text-gray-900 text-sm font-['Cairo'] mb-3">What does the system know about each student?</h4>
            <ul className="space-y-2 text-sm text-gray-700 font-['Cairo']">
              <li className="flex items-start gap-2"><span className="text-violet-500 mt-0.5">•</span> Their mastery of every concept on every page of the textbook</li>
              <li className="flex items-start gap-2"><span className="text-violet-500 mt-0.5">•</span> Which concepts they understand and which they struggle with — by name</li>
              <li className="flex items-start gap-2"><span className="text-violet-500 mt-0.5">•</span> Mastery level in every lesson, every unit, every subject</li>
              <li className="flex items-start gap-2"><span className="text-violet-500 mt-0.5">•</span> Whether knowledge is stable or beginning to fade (forgetting tracking system)</li>
              <li className="flex items-start gap-2"><span className="text-violet-500 mt-0.5">•</span> What they should study today based on their weak points</li>
              <li className="flex items-start gap-2"><span className="text-violet-500 mt-0.5">•</span> Thinking level — are they just memorizing or understanding, analyzing, and creating? (Bloom's levels)</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl border border-violet-100 p-5">
            <h4 className="font-bold text-gray-900 text-sm font-['Cairo'] mb-3">Why does this not exist anywhere else?</h4>
            <ul className="space-y-2 text-sm text-gray-700 font-['Cairo']">
              <li className="flex items-start gap-2"><span className="text-violet-500 mt-0.5">•</span> LMS systems only measure grades — they don't know which concept a student understands</li>
              <li className="flex items-start gap-2"><span className="text-violet-500 mt-0.5">•</span> Even the best platforms measure at the "lesson" level — String measures at the "page" level</li>
              <li className="flex items-start gap-2"><span className="text-violet-500 mt-0.5">•</span> String uses 3 scientific models together: Knowledge Tracing (BKT), Spaced Repetition (FSRS), Item Response Theory (IRT)</li>
              <li className="flex items-start gap-2"><span className="text-violet-500 mt-0.5">•</span> The result: the most accurate model of a student's cognitive state in the world</li>
              <li className="flex items-start gap-2"><span className="text-violet-500 mt-0.5">•</span> The teacher sees exactly where the problem is — not "the student is weak in math" but "the student struggles with decimal fractions on page 41"</li>
            </ul>
          </div>
        </div>
        <div className="bg-violet-100 border border-violet-200 rounded-xl p-4">
          <p className="text-violet-800 text-sm font-bold font-['Cairo'] text-center">
            🎯 All of this happens automatically — the teacher doesn't need to do anything. Every challenge a student solves feeds the map and makes it more accurate.
          </p>
        </div>
      </motion.div>
    </motion.section>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 6C — DNA & Psychological Wellbeing Department
// ═══════════════════════════════════════════════════════════════
function Section6CDNA() {
  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-['Cairo']">
          Psychological Wellbeing & Counseling Department — <span className="text-emerald-600">DNA Serving Counselors</span>
        </h2>
        <p className="text-gray-500 mt-2 text-sm font-['Cairo']">
          What will make Edison Schools known for something no other school in Irbid has
        </p>
      </div>

      {/* The Reputation Angle */}
      <motion.div variants={staggerItem} className="bg-gradient-to-r from-emerald-50 to-white border-2 border-emerald-300 rounded-2xl p-6 sm:p-8 mb-6">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🏆</div>
          <h3 className="text-xl font-black text-emerald-800 font-['Cairo']">
            "The School That Cares About Its Children's Mental Health"
          </h3>
          <p className="text-emerald-700 text-sm font-['Cairo'] mt-2 max-w-2xl mx-auto leading-relaxed">
            This is the most powerful marketing message a school can have in 2026. Parents everywhere worry about their children's mental health — and the school that shows it takes this seriously wins parental loyalty in a way no LMS can offer.
          </p>
        </div>
      </motion.div>

      {/* What DNA Provides */}
      <motion.div variants={staggerItem} className="bg-white border border-emerald-200 rounded-2xl p-6 sm:p-8 mb-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-2xl shadow-lg shrink-0">🧬</div>
          <div>
            <h3 className="font-black text-gray-900 text-lg font-['Cairo']">String DNA — Learning Fingerprint for Every Student</h3>
            <p className="text-emerald-700 text-sm font-['Cairo'] mt-1">Comprehensive psychological assessment of 96 questions — 128 possible unique profiles</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-5">
            <h4 className="font-bold text-emerald-800 text-sm font-['Cairo'] mb-3">DNA doesn't measure intelligence — it measures how a student learns:</h4>
            <ul className="space-y-2 text-sm text-gray-700 font-['Cairo']">
              <li className="flex items-start gap-2"><span className="text-emerald-500">✦</span> Preferred learning style — visual? auditory? hands-on? reading?</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500">✦</span> Academic and personal strengths</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500">✦</span> Challenges and areas that need support</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500">✦</span> Career and academic interests</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500">✦</span> Behavioral patterns in learning</li>
            </ul>
          </div>
          <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-5">
            <h4 className="font-bold text-emerald-800 text-sm font-['Cairo'] mb-3">DNA evolves with the student — it's not a test that gets forgotten:</h4>
            <ul className="space-y-2 text-sm text-gray-700 font-['Cairo']">
              <li className="flex items-start gap-2"><span className="text-emerald-500">✦</span> Every activity on the platform feeds the profile and makes it more accurate</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500">✦</span> Content in Studio adapts to the student's learning style</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500">✦</span> Challenges in Quests adapt to their level</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500">✦</span> Reports show exactly what each student needs</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500">✦</span> 92% of students completed the assessment in full</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Counselor Training — Redesigned */}
      <motion.div variants={staggerItem} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mb-6">
        <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500" />
        <div className="p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20 mx-auto mb-4">🎓</div>
            <h3 className="font-black text-gray-900 text-xl font-['Cairo']">Educational Counselor Training</h3>
            <p className="text-emerald-600 text-sm font-['Cairo'] mt-1">Specialized certifications in using DNA data</p>
          </div>

          {/* Three-step process */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {[
              { num: '1', icon: '📊', title: 'Read & Analyze', desc: 'How the counselor reads each student\'s DNA profile — what the numbers mean and how to translate them into a practical action plan', color: 'sky' },
              { num: '2', icon: '📋', title: 'Build Support Plans', desc: 'Every student gets a support plan built on their real data — not guesses or impressions', color: 'emerald' },
              { num: '3', icon: '📈', title: 'Monitor & Intervene', desc: 'Data evolves in real time — the counselor sees changes immediately and intervenes before it\'s too late', color: 'violet' },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className={`absolute -top-3 left-4 w-8 h-8 rounded-full bg-${item.color}-500 text-white font-black text-sm flex items-center justify-center shadow-lg z-10`}>{item.num}</div>
                <div className={`bg-gradient-to-br from-${item.color}-50/50 to-white rounded-xl border border-${item.color}-100 p-5 pt-7 h-full`}>
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <h5 className="font-black text-gray-900 text-sm font-['Cairo'] mb-2">{item.title}</h5>
                  <p className="text-gray-600 text-xs font-['Cairo'] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Key capabilities row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-rose-50 rounded-xl border border-rose-100 p-4 text-center">
              <div className="text-2xl mb-2">🔔</div>
              <h5 className="font-bold text-gray-900 text-xs font-['Cairo'] mb-1">Automatic Early Detection</h5>
              <p className="text-gray-500 text-[11px] font-['Cairo']">The system alerts the counselor before the problem becomes serious</p>
            </div>
            <div className="bg-sky-50 rounded-xl border border-sky-100 p-4 text-center">
              <div className="text-2xl mb-2">👨‍👩‍👧</div>
              <h5 className="font-bold text-gray-900 text-xs font-['Cairo'] mb-1">Comprehensive Reports for Parents</h5>
              <p className="text-gray-500 text-[11px] font-['Cairo']">Mental health + social + academic — a complete picture</p>
            </div>
            <div className="bg-violet-50 rounded-xl border border-violet-100 p-4 text-center">
              <div className="text-2xl mb-2">📝</div>
              <h5 className="font-bold text-gray-900 text-xs font-['Cairo'] mb-1">Data-Driven Professional Reports</h5>
              <p className="text-gray-500 text-[11px] font-['Cairo']">Real data instead of impressions — a new professional standard</p>
            </div>
          </div>

          {/* Before/After comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-rose-50/50 rounded-xl border border-rose-200 p-5 text-center">
              <span className="text-rose-400 text-xs font-bold font-['Cairo'] uppercase tracking-wider">In the LMS</span>
              <p className="text-rose-600 text-lg font-black font-['Cairo'] mt-2">The counselor guesses 🤔</p>
              <p className="text-rose-500 text-xs font-['Cairo'] mt-1">Personal impressions without data</p>
            </div>
            <div className="bg-emerald-50/50 rounded-xl border border-emerald-200 p-5 text-center">
              <span className="text-emerald-400 text-xs font-bold font-['Cairo'] uppercase tracking-wider">In String</span>
              <p className="text-emerald-600 text-lg font-black font-['Cairo'] mt-2">The counselor knows ✅</p>
              <p className="text-emerald-500 text-xs font-['Cairo'] mt-1">Real data + early detection + customized plans</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edison Prestige Banner */}
      <motion.div variants={staggerItem} className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 sm:p-8 text-center text-white">
        <h3 className="text-xl font-black font-['Cairo'] mb-3">
          Edison Schools will be the first school in Irbid to offer this level of care
        </h3>
        <p className="text-emerald-100 text-sm font-['Cairo'] max-w-2xl mx-auto leading-relaxed">
          When a parent asks "What makes your school different?" — the answer won't be "We have computers" or "We have an LMS". The answer will be: "We know how every child learns, we know their psychological state, and we have a skill map for every page in every textbook. No one in Irbid offers this."
        </p>
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
      day: '1',
      title: 'Foundation',
      tasks: [
        'Create classes and sections',
        'Upload the curriculum',
        'Set up teacher and student accounts',
      ],
    },
    {
      day: '2',
      title: 'Training',
      tasks: [
        'Train teachers on the platform',
        'Activate interactive content',
        'Set up the first assignments',
      ],
    },
    {
      day: '3',
      title: 'Launch',
      tasks: [
        'Students start using the platform',
        'Data starts flowing immediately',
        'Technical support is on-site',
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
          String is Ready in{' '}
          <span className="text-sky-600">3 Days</span> — Not Empty
        </h2>
        <p className="text-gray-500 mt-2 text-sm font-['Cairo']">
          Not 3 empty setup days — but 3 days until real impact
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Connecting line */}
        <div className="hidden sm:block absolute top-16 left-[calc(16.67%)] right-[calc(16.67%)] h-0.5 bg-sky-200 z-0" />

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
            Ready for Impact
          </span>
          <span className="text-2xl">{'\u{1F680}'}</span>
        </div>
        <p className="text-emerald-600 text-sm mt-1 font-['Cairo']">
          On day four, students are learning and data is showing results
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
    { number: '1,200%', subtitle: 'Growth in 4 months', color: 'sky' },
    { number: '90%', subtitle: 'Weekly activity', color: 'emerald' },
    { number: '22+', subtitle: 'Hours weekly', color: 'violet' },
    { number: '48,000+', subtitle: 'Challenges completed', color: 'amber' },
  ];

  const wins = [
    {
      icon: '\u{1F9EA}',
      title: 'Chemistry Competition',
      desc: 'First place at the national level',
    },
    {
      icon: '\u{1F4BB}',
      title: 'Programming Competition',
      desc: '9 students reached the national level',
    },
    {
      icon: '\u{1F916}',
      title: 'Robotics Competition',
      desc: '3 awards at the national level',
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
          How String Transformed{' '}
          <span className="text-sky-600">Al-Khadr Schools</span>
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

      {/* National Wins — with HOW they did it */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="space-y-6 mb-8"
      >
        <h3 className="text-xl font-black text-gray-900 text-center font-['Cairo'] mb-2">
          3 National Victories in One Semester — And How They Did It
        </h3>
        <p className="text-center text-sm text-slate-500 font-['Cairo'] mb-6">
          Our partners don't just participate — they dominate
        </p>

        {/* Win 1: Chemistry */}
        <motion.div variants={staggerItem} className="bg-gradient-to-r from-amber-50 to-white border border-amber-200 rounded-2xl p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg shrink-0">🧪</div>
            <div>
              <h4 className="font-black text-gray-900 text-lg font-['Cairo']">Chemistry Competition — First Place Nationally</h4>
              <div className="flex items-center gap-2 mt-1">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-amber-600 text-sm font-bold font-['Cairo']">First Place Nationally</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-amber-100 p-5">
            <h5 className="font-bold text-slate-800 text-sm mb-3 font-['Cairo']">How was this achievement made?</h5>
            <p className="text-slate-600 text-sm leading-relaxed font-['Cairo']">
              Students used <strong className="text-sky-600">String Quests</strong> to practice — AI-generated chemistry challenges from the official curriculum. Instead of traditional memorization, students measured their real understanding through daily interactive challenges. The AI knows each student's weak points and generates questions tailored to their level — so every student practices what they actually need, not the same questions everyone else gets.
            </p>
          </div>
        </motion.div>

        {/* Win 2: Programming */}
        <motion.div variants={staggerItem} className="bg-gradient-to-r from-sky-50 to-white border border-sky-200 rounded-2xl p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-2xl shadow-lg shrink-0">💻</div>
            <div>
              <h4 className="font-black text-gray-900 text-lg font-['Cairo']">Programming Competition — Unprecedented Achievement in School History</h4>
              <div className="flex items-center gap-2 mt-1">
                <Trophy className="w-4 h-4 text-sky-500" />
                <span className="text-sky-600 text-sm font-bold font-['Cairo']">9 students reached the national level — more than any other school</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-sky-100 p-5">
            <h5 className="font-bold text-slate-800 text-sm mb-3 font-['Cairo']">How was this achievement made?</h5>
            <p className="text-slate-600 text-sm leading-relaxed font-['Cairo']">
              The school created an internal C++ program entirely using <strong className="text-sky-600">String Studio</strong> — with over 120 students participating. All programming tools — code editor, runtime environment, automatic grading — all within a single lesson in Studio. This was impossible without Studio because teachers needed multiple tools unified in one place — and String provided that.
            </p>
          </div>
        </motion.div>

        {/* Win 3: Robotics */}
        <motion.div variants={staggerItem} className="bg-gradient-to-r from-violet-50 to-white border border-violet-200 rounded-2xl p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-2xl shadow-lg shrink-0">🤖</div>
            <div>
              <h4 className="font-black text-gray-900 text-lg font-['Cairo']">Robotics Competition — 3 Awards</h4>
              <div className="flex items-center gap-2 mt-1">
                <Trophy className="w-4 h-4 text-violet-500" />
                <span className="text-violet-600 text-sm font-bold font-['Cairo']">3 awards in the national competition</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-violet-100 p-5">
            <h5 className="font-bold text-slate-800 text-sm mb-3 font-['Cairo']">How was this achievement made?</h5>
            <p className="text-slate-600 text-sm leading-relaxed font-['Cairo']">
              Ruba Srour, the robotics teacher, used <strong className="text-sky-600">String Studio</strong> to combine all training tools — design tools, robot programming, motion simulation — into one interface. She used to pay an annual subscription for Hello World Kids, but within two weeks she built a better alternative on Studio — designed for her students and devices. She cancelled the subscription and said what she built was more interactive and flexible.
            </p>
          </div>
        </motion.div>

        {/* Bottom banner */}
        <motion.div variants={staggerItem} className="bg-gradient-to-r from-sky-50 to-emerald-50 border border-sky-200 rounded-xl p-4 text-center">
          <p className="text-sky-800 text-sm font-bold font-['Cairo']">
            This is the same system that will work in Edison Schools. Same tools. Same capabilities. Same opportunity.
          </p>
        </motion.div>
      </motion.div>

      {/* Testimonial */}
      <TestimonialCard
        quote="I'm not a classroom teacher — I'm a robotics teacher. I used to pay for a Hello World Kids subscription because no Arabic platform served my specialty. When I used String Studio, I built 10 interactive lessons in the first week without needing any other platform."
        name="Ruba Srour"
        role="Robotics Teacher"
        organization="Al-Khadr Schools"
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
        <span className="text-gray-500 font-['Cairo']">For verification:</span>
        <span className="font-bold text-gray-700 font-['Cairo']">
          Dr. Jihad Al-Kaswani
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
      title: 'For Each of the 70 Teachers',
      items: [
        'Complete personal dashboard',
        'Over 100 interactive apps ready to use',
        'AI assistant for lesson preparation',
        'Shared question bank among teachers',
        'Assignment system with automatic grading',
        'Performance reports for every student',
        'Video classes with interactive whiteboard',
        'Secure communication with students and parents',
        'Free training + direct technical support',
      ],
    },
    {
      emoji: '\u{1F468}\u200D\u{1F393}',
      title: 'For Each of the 1,100 Students',
      items: [
        'Personal learning profile (DNA) with 128 dimensions',
        'Educational games from the curriculum (Quests)',
        'Leaderboard and points',
        'Interactive assignments instead of paper',
        'Recorded lessons that can be replayed',
        'AI study assistant',
        'Easy-to-use mobile app',
        'Motivational badges and achievements',
        'Self-assessment and progress tracking',
      ],
    },
    {
      emoji: '\u{1F46A}',
      title: 'For Parents',
      items: [
        'Dedicated String Family app',
        'Direct monitoring of children\'s performance',
        'Automatic periodic reports',
        'Secure communication with teachers',
        'Assignment and exam notifications',
        'Attendance tracking',
        'View strengths and weaknesses',
      ],
    },
    {
      emoji: '\u{1F3DB}\uFE0F',
      title: 'For Administration',
      items: [
        'Centralized dashboard for the entire school',
        'Comprehensive performance reports with data',
        'Monitor every teacher and class activity',
        'Real-time data for decision making',
        'Ministry of Education reports ready',
        'Secure administrative communication system',
        'Fully automated management',
        'Dedicated support from the String team',
      ],
    },
  ];

  const reputationBenefits = [
    'First String school in Irbid',
    'Official "String AI School" badge',
    'Best school website in the kingdom (String design)',
    'Coverage in String marketing campaigns',
    'Priority access to new features',
    'Membership in the String Schools Advisory Council',
    '"Digital Transformation Pioneer School" certificate',
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
          What{' '}
          <span className="text-sky-600">Edison</span> Schools Will Get — In Detail
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
              Reputation & Leadership — Priceless
            </h4>
            <p className="text-amber-700 text-sm font-['Cairo']">
              Exclusive benefits for founding partners
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
      price: '4 JOD',
      priceNote: 'Per student / monthly',
      discountPrice: '2 JOD',
      features: [
        'String Spaces (LMS + SIS)',
        'String Studio (Interactive apps)',
        'Attendance and gradebook system',
        'Basic reports',
        'Email technical support',
      ],
    },
    {
      name: 'Nova',
      price: '7 JOD',
      priceNote: 'Per student / monthly — with free Supernova upgrade for the first year',
      recommended: true,
      discountPrice: '3.5 JOD',
      features: [
        'All Basic features',
        'String Quests (Educational games)',
        'String DNA (128 learning profiles)',
        'String AI (Unlimited artificial intelligence)',
        'String Chat (Secure communication)',
        'String Meetings (Video classes)',
        'Advanced reports',
        'Direct technical support',
      ],
    },
    {
      name: 'Supernova',
      price: '14 JOD',
      priceNote: 'Per student / monthly',
      discountPrice: '7 JOD',
      features: [
        'All Nova features',
        'String Family (Parents app)',
        'Custom reports for administration',
        'Priority technical support',
        'Advanced teacher training',
        'Platform customization with school branding',
      ],
    },
    {
      name: 'Hypernova',
      price: '\u2014',
      priceNote: 'Coming Soon — 2027',
      comingSoon: true,
      features: [
        'All Supernova features',
        'Advanced artificial intelligence',
        'Integration with external systems',
        'Predictive analytics',
        'Dedicated account manager',
      ],
    },
  ];

  const paymentRows = [
    {
      item: 'Setup fees',
      amount: '7,800 JOD',
      date: 'Upon signing',
    },
    {
      item: 'Nova subscription',
      amount: '38,500 JOD',
      date: '3 installments',
    },
    {
      item: 'Supernova upgrade',
      amount: 'Free',
      date: '\u2014',
      highlight: true,
    },
    {
      item: 'Total',
      amount: '46,300 JOD',
      date: '',
      total: true,
    },
  ];

  const competitorPricing = [
    {
      service: 'String DNA',
      competitor: '14 JOD / student / month',
      note: 'Included with Nova',
    },
    {
      service: 'String Family',
      competitor: '7 JOD / month',
      note: 'Free first year',
    },
    {
      service: 'String Quests',
      competitor: '3.5–5.5 JOD / month',
      note: 'Included with Nova',
    },
    {
      service: '100+ interactive apps',
      competitor: '1.5–3.5 JOD / app',
      note: 'All included',
    },
    {
      service: 'String AI',
      competitor: 'AI tools cost schools 14 JOD per teacher monthly',
      note: 'Free and unlimited',
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
          Subscription Plans{' '}
          <span className="text-sky-600">& Investment</span>
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

      {/* Founding Partner Program - What It Is */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <SectionDivider sectionNumber={0} title="Founding Partner Program" />

        {/* Program header */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-8 shadow-sm">
          {/* Top gradient accent */}
          <div className="h-1.5 bg-gradient-to-r from-sky-400 via-blue-500 to-violet-500" />

          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <Handshake className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-xl font-['Cairo']">
                  Founding Partner Program
                </h3>
                <p className="text-sky-600 text-sm font-['Cairo']">
                  A real partnership — not just a discount
                </p>
              </div>
            </div>

            <p className="text-gray-700 text-sm leading-relaxed mb-4 font-['Cairo']">
              We offer Edison Schools the opportunity to join the "Founding Partner" program — this is not an ordinary discount, but a real partnership between String and the school that helps us together build the best educational system in the world.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mb-8 font-['Cairo']">
              <strong className="text-gray-900">This program is entirely optional</strong> — you can subscribe to any plan at the base price without joining the program. But if you choose the partnership, you'll get a 50% discount in exchange for your active participation in developing the platform.
            </p>

            {/* Two columns: What Edison gets / What String gets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* What Edison Gets */}
              <div className="bg-gradient-to-br from-sky-50/50 to-white rounded-xl border border-sky-100 p-5">
                <h4 className="font-black text-sky-700 text-sm mb-4 flex items-center gap-2 font-['Cairo']">
                  <Check className="w-5 h-5 text-sky-500" /> What the School Gets
                </h4>
              <ul className="space-y-2 text-sm text-gray-700 font-['Cairo']">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                  50% discount on the base price throughout the contract period
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                  Free upgrade to Supernova plan for the entire first year
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                  "Founding Partner" title — first String school in Irbid
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                  Early access to new Beta features before any other school
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                  School name and logo on the official String website
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                  Direct line with the String development team
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                  Priority implementation of features requested by the school
                </li>
              </ul>
            </div>

              {/* What String Gets */}
              <div className="bg-gradient-to-br from-slate-50/50 to-white rounded-xl border border-slate-200 p-5">
                <h4 className="font-black text-slate-700 text-sm mb-4 flex items-center gap-2 font-['Cairo']">
                  <Handshake className="w-5 h-5 text-slate-500" /> What We Need from the School
                </h4>
              <ul className="space-y-2 text-sm text-gray-700 font-['Cairo']">
                <li className="flex items-start gap-2">
                  <span className="text-sky-500 mt-0.5">•</span>
                  Participate in testing new features and providing regular feedback
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-500 mt-0.5">•</span>
                  Participate in strategic research and writing white papers about
                  String DNA and String Skill Map
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-500 mt-0.5">•</span>
                  Share aggregated usage data (without any personal data) to improve
                  our systems — with full guarantee of data security and privacy according to the highest
                  international standards
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-500 mt-0.5">•</span>
                  Be a reference school — we recommend you to other schools asking about the String
                  experience
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-500 mt-0.5">•</span>
                  Tell us about the features the school needs to help us improve
                  the platform
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-500 mt-0.5">•</span>
                  A testimonial video after the first year
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-500 mt-0.5">•</span>
                  Allow other schools to visit the platform at Edison
                </li>
              </ul>
            </div>
          </div>

          {/* Data privacy note */}
          <div className="mt-6 bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-sky-600 mt-0.5 shrink-0" />
            <div>
              <h5 className="font-bold text-sky-800 text-sm mb-1 font-['Cairo']">
                Data Security Guarantee
              </h5>
              <p className="text-sky-700 text-xs leading-relaxed font-['Cairo']">
                All shared data is aggregated and non-personal — it does not include
                student names or sensitive data. We comply with the highest international data protection
                standards (GDPR). The school retains full ownership of its data. We do not sell or
                share any data with third parties.
              </p>
            </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* After-School Program */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 border-2 border-violet-300 rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-xl font-['Cairo']">
                After-School Program
              </h3>
              <p className="text-violet-700 text-sm font-['Cairo']">
                Enrichment programs for Edison students after school hours
              </p>
            </div>
          </div>

          <p className="text-gray-700 text-sm leading-relaxed mb-6 font-['Cairo']">
            We propose launching an "After-School" program for Edison students — enrichment
            and training programs offered after school hours using String tools. These
            programs raise student levels and give the school an additional competitive advantage.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Program 1 */}
            <div className="bg-white rounded-xl border border-violet-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">💻</span>
                <h4 className="font-black text-gray-900 text-sm font-['Cairo']">
                  Programming & Robotics Program
                </h4>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed mb-3 font-['Cairo']">
                Teaching programming (Python, Scratch, C++) and robotics using String
                Studio — the same tools that won Al-Khadr Schools 3 national
                awards.
              </p>
              <ul className="space-y-1 text-xs text-gray-600 font-['Cairo']">
                <li>• Twice a week after school</li>
                <li>• Suitable for all levels (grades 1-12)</li>
                <li>• Prepares students for national competitions</li>
                <li>• Built entirely on String Studio</li>
              </ul>
            </div>

            {/* Program 2 */}
            <div className="bg-white rounded-xl border border-violet-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🧠</span>
                <h4 className="font-black text-gray-900 text-sm font-['Cairo']">
                  Academic Excellence Program
                </h4>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed mb-3 font-['Cairo']">
                Smart review and customized challenges based on each student's DNA profile — focuses on
                weaknesses and strengthens strengths. Every student gets a personalized learning path.
              </p>
              <ul className="space-y-1 text-xs text-gray-600 font-['Cairo']">
                <li>• Twice a week after school</li>
                <li>• Built on DNA and Skill Map data</li>
                <li>• Weekly challenges and competitions</li>
                <li>• Progress reports for parents</li>
              </ul>
            </div>
          </div>

          <div className="bg-violet-100 border border-violet-200 rounded-xl p-4 text-center">
            <p className="text-violet-800 text-sm font-bold font-['Cairo']">
              ✨ Schools that implement the after-school program get a 50% discount under the
              Founding Partner Program
            </p>
            <p className="text-violet-600 text-xs mt-1 font-['Cairo']">
              These programs are free for the school — String provides them as part of the partnership
            </p>
          </div>
        </div>
      </motion.div>

      {/* Founder Partner Discount */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-2xl p-6 sm:p-8 mb-8"
      >
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-200 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-lg font-['Cairo']">
                Founding Partner Offer (Optional)
              </h3>
              <p className="text-emerald-700 text-sm font-['Cairo']">
                Exclusive — for a limited time
              </p>
              <p className="text-emerald-600 text-xs font-['Cairo']">
                You can subscribe to any plan at the base price without this offer
              </p>
            </div>
          </div>
          <div className="bg-emerald-500 text-white font-black text-xl px-5 py-2 rounded-xl shadow-lg shadow-emerald-300/40 font-['Cairo']">
            50% Discount
          </div>
        </div>

        {/* Payment Table */}
        <div className="bg-white rounded-xl border border-emerald-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-emerald-100/60">
                <th className="text-left p-3 text-sm font-bold text-gray-700 font-['Cairo']">
                  Item
                </th>
                <th className="text-left p-3 text-sm font-bold text-gray-700 font-['Cairo']">
                  Amount
                </th>
                <th className="text-left p-3 text-sm font-bold text-gray-700 font-['Cairo']">
                  Due Date
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

        {/* Monthly breakdown */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-emerald-200 p-4 text-center">
            <div className="text-2xl font-black text-emerald-600 font-['Cairo']">4,630 JOD</div>
            <div className="text-xs text-gray-500 font-['Cairo']">Monthly</div>
          </div>
          <div className="bg-white rounded-xl border border-emerald-200 p-4 text-center">
            <div className="text-2xl font-black text-emerald-600 font-['Cairo']">4.21 JOD</div>
            <div className="text-xs text-gray-500 font-['Cairo']">Per student monthly — all inclusive</div>
          </div>
          <div className="bg-white rounded-xl border border-emerald-200 p-4 text-center">
            <div className="text-2xl font-black text-emerald-600 font-['Cairo']">Less than 1/3</div>
            <div className="text-xs text-gray-500 font-['Cairo']">The real value — Supernova is worth 154,000 JOD</div>
          </div>
        </div>

        {/* Founder Partner Pricing — Cards (same design as main pricing) */}
        <div className="mt-8 mb-6">
          <h4 className="font-black text-gray-900 text-base mb-2 font-['Cairo'] text-center">
            Founding Partner Prices — 50% Discount Per Student
          </h4>
          <p className="text-emerald-600 text-sm font-['Cairo'] text-center mb-6">
            + Free Supernova upgrade in the first year for all plans
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Basic */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
              <h5 className="font-black text-gray-900 text-lg font-['Cairo'] mb-3">Basic</h5>
              <div className="mb-1">
                <span className="text-gray-400 text-sm line-through font-['Cairo']">4 JOD</span>
              </div>
              <div className="text-4xl font-black text-emerald-600 font-['Cairo'] mb-1" dir="ltr" style={{ unicodeBidi: 'plaintext' }}>2 JOD</div>
              <p className="text-gray-500 text-xs font-['Cairo'] mb-4">Per student / monthly</p>
              <div className="bg-emerald-50 rounded-lg px-3 py-1.5 inline-block">
                <span className="text-emerald-700 text-xs font-bold font-['Cairo']">50% Discount</span>
              </div>
            </div>
            {/* Nova — Recommended */}
            <div className="relative bg-gradient-to-b from-sky-50 to-white border-2 border-sky-400 rounded-2xl p-6 text-center shadow-lg scale-105 hover:shadow-xl transition-shadow">
              <div className="absolute -top-3 left-4 bg-sky-500 text-white text-xs font-black px-3 py-1 rounded-full font-['Cairo']">⭐ Recommended</div>
              <h5 className="font-black text-sky-700 text-lg font-['Cairo'] mb-3">Nova</h5>
              <div className="mb-1">
                <span className="text-gray-400 text-sm line-through font-['Cairo']">7 JOD</span>
              </div>
              <div className="text-4xl font-black text-emerald-600 font-['Cairo'] mb-1" dir="ltr" style={{ unicodeBidi: 'plaintext' }}>3.5 JOD</div>
              <p className="text-gray-500 text-xs font-['Cairo'] mb-3">Per student / monthly</p>
              <div className="bg-emerald-50 rounded-lg px-3 py-1.5 inline-block mb-2">
                <span className="text-emerald-700 text-xs font-bold font-['Cairo']">50% Discount</span>
              </div>
              <div className="bg-sky-100 rounded-lg px-3 py-1.5 mt-2">
                <span className="text-sky-700 text-xs font-bold font-['Cairo']">🚀 + Free Supernova for the first year</span>
              </div>
            </div>
            {/* Supernova */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
              <h5 className="font-black text-gray-900 text-lg font-['Cairo'] mb-3">Supernova</h5>
              <div className="mb-1">
                <span className="text-gray-400 text-sm line-through font-['Cairo']">14 JOD</span>
              </div>
              <div className="text-4xl font-black text-emerald-600 font-['Cairo'] mb-1" dir="ltr" style={{ unicodeBidi: 'plaintext' }}>7 JOD</div>
              <p className="text-gray-500 text-xs font-['Cairo'] mb-4">Per student / monthly</p>
              <div className="bg-emerald-50 rounded-lg px-3 py-1.5 inline-block">
                <span className="text-emerald-700 text-xs font-bold font-['Cairo']">50% Discount</span>
              </div>
            </div>
          </div>
        </div>

        {/* Supernova Free — clear statement */}
        <div className="bg-gradient-to-r from-sky-50 to-emerald-50 border-2 border-sky-300 rounded-2xl p-6 mb-6">
          <div className="text-center">
            <div className="text-4xl mb-3">🚀</div>
            <h4 className="font-black text-gray-900 text-xl font-['Cairo'] mb-3">Supernova Free — For the Entire First Year</h4>
            <p className="text-gray-700 text-sm leading-relaxed font-['Cairo'] max-w-2xl mx-auto mb-4">
              No matter which plan you choose — you'll get a <strong className="text-sky-700">free Supernova upgrade</strong> in the first year. This includes: the parents app, AI-powered smart textbooks, the premium school website, the psychological counseling department, on-site engineers, and all advanced features — at no additional cost.
            </p>
            <div className="bg-white rounded-xl border border-sky-200 p-4 inline-block">
              <p className="text-sky-700 text-sm font-black font-['Cairo']">
                ✨ Choose any plan → Get Supernova free → Pay only the price of the plan you chose
              </p>
            </div>
          </div>
        </div>

        {/* Supernova Year 2 Incentive */}
        <div className="bg-gradient-to-r from-amber-50 to-white border border-amber-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-black text-gray-900 text-base font-['Cairo']">⭐ Supernova Free in Year Two as Well — Subject to Results</h4>
            </div>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed font-['Cairo'] mb-4">
            If Edison Schools achieves tangible positive results in the first year — such as increased student engagement, improved academic performance, or parent satisfaction — you'll get a free Supernova upgrade in the second year as well. We believe in String's results and are willing to tie our investment to your success.
          </p>
          <div className="bg-amber-100 border border-amber-200 rounded-xl p-4">
            <p className="text-amber-800 text-sm font-bold font-['Cairo'] text-center">
              Your success = our success. If you succeed, we continue the partnership on the same premium terms.
            </p>
          </div>
        </div>

        {/* Custom Pricing Note */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h4 className="font-black text-gray-900 text-sm font-['Cairo'] mb-2">Flexible Pricing Options</h4>
              <p className="text-gray-600 text-sm leading-relaxed font-['Cairo']">
                String also offers different and flexible pricing options based on each school's needs — whether in terms of student count, contract duration, or payment method. These options require direct discussion with the school administration to reach the most suitable agreement for both parties. We are ready to sit with you and discuss all the details.
              </p>
              <p className="text-sky-600 text-sm font-bold font-['Cairo'] mt-3">
                📞 To discuss: Contact us to arrange a meeting about custom pricing
              </p>
            </div>
          </div>
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
          The Real Value — What Others Pay
        </h3>
        <p className="text-violet-600 text-sm mb-5 font-['Cairo']">
          If you bought each service separately from the market:
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
        className="bg-gradient-to-r from-sky-600 to-blue-700 rounded-3xl p-8 sm:p-12 text-white text-center overflow-hidden relative"
      >
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white/5 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-2xl sm:text-3xl font-black mb-3 font-['Cairo']">
              Next Step — An Invitation
            </h3>
            <p className="text-sky-200 mb-8 max-w-lg mx-auto font-['Cairo']">
              We are ready to visit Edison Schools and demo the platform live to your team
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
                <span className="text-xl font-bold font-['Cairo']">O</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-lg font-['Cairo']">Omar Abu-Salim</p>
                <p className="text-sky-200 text-sm font-['Cairo']">
                  Founder & CEO
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
              <span>Schedule a Visit</span>
            </a>
            <a
              href="https://youtube.com/@string-education"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-white/20 transition-colors font-['Cairo']"
            >
              <Youtube className="w-5 h-5" />
              <span>Watch the Demo</span>
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
                This proposal is confidential and exclusively directed to Edison Schools. It may not be shared
                with any other party without prior permission from String.
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
export function EdisonProposalPart2En() {
  return (
    <div
      dir="ltr"
      className="font-['Cairo'] bg-white min-h-screen text-gray-900 antialiased"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-0">
        {/* Section 6: Feature Breakdown */}
        <Section6Features />

        {/* LMS vs String Comparison Table */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-['Cairo']">
              String Includes the LMS — <span className="text-sky-600">And Much More</span>
            </h2>
            <p className="text-gray-500 mt-2 text-sm font-['Cairo']">
              One subscription replaces 9+ separate tools
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-['Cairo']" dir="ltr">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left p-4 font-black text-slate-700 min-w-[200px]">Feature</th>
                    <th className="p-4 text-center font-black text-slate-400 min-w-[100px]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-slate-400">Traditional LMS</span>
                      </div>
                    </th>
                    <th className="p-4 text-center font-black text-sky-600 min-w-[100px] bg-sky-50/50">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sky-600">String</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Learning Management System (LMS)', lms: true, string: true, category: 'Basic' },
                    { feature: 'Student Information System (SIS)', lms: 'partial', string: true },
                    { feature: 'Attendance Management', lms: true, string: true },
                    { feature: 'Gradebook and Reports', lms: true, string: true },
                    { feature: 'Teacher-Student Communication', lms: 'partial', string: true },
                    { feature: '', lms: '', string: '', divider: true, label: 'What the LMS Does Not Offer' },
                    { feature: 'Interactive Content Building Studio (100+ apps)', lms: false, string: true },
                    { feature: 'Automatic Educational Games from Curriculum (Quests)', lms: false, string: true },
                    { feature: 'Personal Learning Fingerprint (DNA) — 128 unique profiles', lms: false, string: true },
                    { feature: 'Skill Map for every page in every textbook', lms: false, string: true },
                    { feature: 'Unlimited and free AI', lms: false, string: true },
                    { feature: 'Parents App (Family)', lms: false, string: true },
                    { feature: 'Video Meetings with whiteboard and recording', lms: false, string: true },
                    { feature: 'Encrypted Communication System (Chat)', lms: false, string: true },
                    { feature: 'Data-Driven Psychological Counseling Department', lms: false, string: true },
                    { feature: 'AI-Powered Interactive Textbooks', lms: false, string: true },
                    { feature: 'AI-Powered Premium School Website', lms: false, string: true },
                    { feature: 'Early Warning System for Declining Students', lms: false, string: true },
                    { feature: 'AI-Customized Certificates', lms: false, string: true },
                    { feature: 'Smart Display Apps', lms: false, string: true },
                    { feature: 'Zero-Touch Automatic Preparation', lms: false, string: true },
                    { feature: '', lms: '', string: '', divider: true, label: 'The Result' },
                    { feature: 'Student Platform Usage', lms: '15 min/week', string: '3-5 hours/day', result: true },
                    { feature: 'Manual Data Entry Required', lms: 'Yes — everything', string: 'Zero — fully automatic', result: true },
                    { feature: 'Number of Tools It Replaces', lms: '1 tool', string: '9+ tools in one subscription', result: true },
                  ].map((row, i) => {
                    if (row.divider) {
                      return (
                        <tr key={i} className="bg-slate-100">
                          <td colSpan={3} className="p-3 text-center font-black text-slate-700 text-xs uppercase tracking-wider">
                            {row.label}
                          </td>
                        </tr>
                      );
                    }
                    return (
                      <tr key={i} className={`border-t border-slate-100 ${row.result ? 'bg-sky-50/30' : 'hover:bg-slate-50/50'} transition-colors`}>
                        <td className="p-3 sm:p-4 font-semibold text-slate-800">{row.feature}</td>
                        <td className="p-3 sm:p-4 text-center">
                          {row.result ? (
                            <span className="text-rose-500 font-bold text-xs" dir="ltr">{row.lms}</span>
                          ) : row.lms === true ? (
                            <Check className="w-5 h-5 text-slate-400 mx-auto" />
                          ) : row.lms === 'partial' ? (
                            <span className="text-slate-400 text-xs font-bold">Partial</span>
                          ) : (
                            <span className="text-slate-300 text-lg">✕</span>
                          )}
                        </td>
                        <td className={`p-3 sm:p-4 text-center ${!row.result ? 'bg-sky-50/30' : 'bg-sky-50/50'}`}>
                          {row.result ? (
                            <span className="text-sky-600 font-black text-xs" dir="ltr">{row.string}</span>
                          ) : row.string === true ? (
                            <Check className="w-5 h-5 text-sky-500 mx-auto" />
                          ) : (
                            <span className="text-slate-300 text-lg">✕</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="bg-sky-50 border-t border-sky-200 p-4 text-center">
              <p className="text-sky-800 text-sm font-black font-['Cairo']">
                🎯 String includes everything an LMS offers + 15 additional features not available in any other system — in one subscription
              </p>
            </div>
          </div>
        </motion.section>

        {/* Personalization & Branding Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mb-12"
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-['Cairo']">
              This Isn't a Generic Platform — This Is <span className="text-sky-600">Edison's Platform</span>
            </h2>
            <p className="text-gray-500 mt-2 text-sm font-['Cairo']">
              The school's identity in every screen, every message, every lesson
            </p>
          </div>

          {/* Hero Banner - Edison Branded Platform */}
          <motion.div variants={staggerItem} className="relative bg-gradient-to-r from-sky-600 to-blue-700 rounded-2xl p-8 sm:p-10 mb-6 text-white overflow-hidden">
            <div className="absolute -top-20 -left-20 w-56 h-56 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <img src="/edison-logo.png" alt="Edison" className="w-16 h-16 rounded-2xl bg-white p-1 shadow-lg" />
                <div>
                  <h3 className="text-2xl font-black font-['Cairo']">Edison International Model School</h3>
                  <p className="text-sky-200 text-sm font-['Cairo']">Edison International Model School — Irbid, Jordan</p>
                </div>
              </div>
              <p className="text-sky-100 text-sm leading-relaxed font-['Cairo'] max-w-3xl">
                When anyone — teacher, student, parent — opens the platform, they won't see "String". They'll see <strong className="text-white">Edison Schools</strong>. Edison's logo. Edison's colors. Edison's name. On every screen, every notification, every report, every certificate. As if the school built this platform itself.
              </p>
            </div>
          </motion.div>

          {/* Three Branding Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            <motion.div variants={staggerItem} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-sky-200 transition-all">
              <div className="text-4xl mb-4">🌐</div>
              <h4 className="font-black text-gray-900 text-base font-['Cairo'] mb-2">Custom Domain — School's Own Domain</h4>
              <p className="text-gray-600 text-sm font-['Cairo'] leading-relaxed mb-3">
                The platform runs on the school's custom domain — users log in to <strong className="text-sky-600">edison.string.education</strong> not a generic site. This strengthens the school's identity and makes the experience personal.
              </p>
              <div className="bg-slate-50 rounded-xl px-4 py-3 text-center" dir="ltr">
                <span className="text-sky-600 font-black text-sm font-mono">edison.string.education</span>
              </div>
            </motion.div>

            <motion.div variants={staggerItem} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-sky-200 transition-all">
              <div className="text-4xl mb-4">🎨</div>
              <h4 className="font-black text-gray-900 text-base font-['Cairo'] mb-2">Complete Visual Identity</h4>
              <p className="text-gray-600 text-sm font-['Cairo'] leading-relaxed mb-3">
                Edison's logo and colors everywhere — login page, top bar, reports, certificates, notifications, parents app. There is no trace of any other brand.
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-600" title="Edison Red" />
                <div className="w-8 h-8 rounded-lg bg-green-600" title="Edison Green" />
                <div className="w-8 h-8 rounded-lg bg-white border-2 border-slate-200" title="White" />
                <span className="text-xs text-slate-400 font-bold font-['Cairo']">Edison Colors</span>
              </div>
            </motion.div>

            <motion.div variants={staggerItem} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-sky-200 transition-all">
              <div className="text-4xl mb-4">📱</div>
              <h4 className="font-black text-gray-900 text-base font-['Cairo'] mb-2">In All Apps</h4>
              <p className="text-gray-600 text-sm font-['Cairo'] leading-relaxed mb-3">
                Parents app, students app, smart display app — all carry the Edison identity. A parent opens the app and sees their child's school, not a tech company.
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg font-['Cairo']">iOS</span>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg font-['Cairo']">Android</span>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg font-['Cairo']">Web</span>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg font-['Cairo']">Displays</span>
              </div>
            </motion.div>
          </div>

          {/* Studio Content Marketplace */}
          <motion.div variants={staggerItem} className="bg-gradient-to-r from-amber-50 to-white border-2 border-amber-300 rounded-2xl p-6 sm:p-8 mb-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg shrink-0">💰</div>
              <div>
                <h3 className="font-black text-gray-900 text-lg font-['Cairo']">Edison Teachers Build Content — And Sell It Under the School's Name</h3>
                <p className="text-amber-700 text-sm font-['Cairo'] mt-1">Content built in Studio carries the Edison brand — and can be sold</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white rounded-xl border border-amber-200 p-5">
                <h4 className="font-bold text-gray-900 text-sm font-['Cairo'] mb-3">How does it work?</h4>
                <div className="space-y-3">
                  {[
                    { step: '1', text: 'The teacher builds an interactive lesson in String Studio' },
                    { step: '2', text: 'The lesson automatically carries Edison\'s logo and school identity' },
                    { step: '3', text: 'The teacher chooses to publish the lesson in the public marketplace' },
                    { step: '4', text: 'Other teachers and schools purchase the lesson' },
                    { step: '5', text: 'Edison appears as the content source — reputation + income' },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-black text-xs flex items-center justify-center shrink-0">{item.step}</span>
                      <span className="text-gray-700 text-sm font-['Cairo']">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-amber-200 p-5">
                <h4 className="font-bold text-gray-900 text-sm font-['Cairo'] mb-3">Why is this important for Edison?</h4>
                <ul className="space-y-3 text-sm text-gray-700 font-['Cairo']">
                  <li className="flex items-start gap-2"><span className="text-amber-500">✦</span> <strong>Reputation:</strong> Edison's name appears on every lesson another teacher in Jordan purchases</li>
                  <li className="flex items-start gap-2"><span className="text-amber-500">✦</span> <strong>Income:</strong> Teachers earn additional income — and the school gains fame</li>
                  <li className="flex items-start gap-2"><span className="text-amber-500">✦</span> <strong>Ownership:</strong> All content remains the school's property — even if the teacher leaves</li>
                  <li className="flex items-start gap-2"><span className="text-amber-500">✦</span> <strong>Accumulation:</strong> Over time, the school builds a content library — a digital asset that grows in value</li>
                  <li className="flex items-start gap-2"><span className="text-amber-500">✦</span> <strong>Distinction:</strong> "The school whose teachers publish content for the world" — no one else offers this</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Prestige Summary */}
          <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-red-50 to-white border border-red-200 rounded-2xl p-5 text-center">
              <div className="text-3xl mb-2">🏫</div>
              <h5 className="font-black text-gray-900 text-sm font-['Cairo'] mb-1">Login</h5>
              <p className="text-gray-500 text-xs font-['Cairo']">Users log in to "Edison Schools" — not a generic platform</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-2xl p-5 text-center">
              <div className="text-3xl mb-2">📜</div>
              <h5 className="font-black text-gray-900 text-sm font-['Cairo'] mb-1">Certificates & Reports</h5>
              <p className="text-gray-500 text-xs font-['Cairo']">Every certificate and report carries the Edison logo — printed or sent digitally</p>
            </div>
            <div className="bg-gradient-to-br from-sky-50 to-white border border-sky-200 rounded-2xl p-5 text-center">
              <div className="text-3xl mb-2">🌍</div>
              <h5 className="font-black text-gray-900 text-sm font-['Cairo'] mb-1">AI-Powered School Website</h5>
              <p className="text-gray-500 text-xs font-['Cairo']">The best school website in Irbid — automatically showcases student and teacher achievements</p>
            </div>
          </motion.div>

          {/* NEW: AI-Powered School Website Mockup */}
          <motion.div variants={staggerItem} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mb-6">
            <div className="h-1 bg-gradient-to-r from-red-500 via-green-500 to-red-500" />
            <div className="p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-5">
                <img src="/edison-logo.png" alt="Edison" className="w-14 h-14 rounded-xl shadow-md" />
                <div>
                  <h4 className="font-black text-gray-900 text-lg font-['Cairo']">Edison Schools Premium Website — Powered by AI</h4>
                  <p className="text-sky-600 text-sm font-['Cairo'] mt-1">The best school website in Irbid — updates itself automatically</p>
                </div>
              </div>

              {/* Website Mockup */}
              <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-xl overflow-hidden shadow-xl mb-5">
                {/* Browser Chrome */}
                <div className="bg-slate-700 px-4 py-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 bg-slate-600 rounded-md px-3 py-1 text-xs text-slate-300 text-center font-mono" dir="ltr">
                    edison.string.education
                  </div>
                </div>
                {/* Website Content Mockup */}
                <div className="p-6 text-center">
                  <img src="/edison-logo.png" alt="Edison" className="w-16 h-16 mx-auto mb-3 rounded-xl" />
                  <h5 className="text-white text-xl font-black font-['Cairo'] mb-1">Edison International Model School</h5>
                  <p className="text-slate-400 text-xs font-['Cairo'] mb-4">Edison International Model School — Irbid, Jordan</p>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="bg-sky-500/20 text-sky-400 text-[10px] font-bold px-3 py-1 rounded-full font-['Cairo']">🤖 AI-Powered School</span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full font-['Cairo']">✨ String Founding Partner</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <div className="text-white text-lg font-black">1,100</div>
                      <div className="text-slate-400 text-[10px] font-['Cairo']">Students</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <div className="text-white text-lg font-black">70</div>
                      <div className="text-slate-400 text-[10px] font-['Cairo']">Teachers</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <div className="text-white text-lg font-black">3</div>
                      <div className="text-slate-400 text-[10px] font-['Cairo']">National Awards</div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed font-['Cairo']">
                Edison's website will be the best school website in Irbid — built with AI, automatically showcasing student and teacher achievements, updating itself without any intervention. When a parent searches for a school for their child and finds this website — the decision becomes easy.
              </p>
            </div>
          </motion.div>

          {/* NEW: String AI School Badge */}
          <motion.div variants={staggerItem} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mb-6">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Badge Visual */}
                <div className="shrink-0">
                  <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 flex flex-col items-center justify-center shadow-xl shadow-sky-500/20 p-4">
                    <img src="/edison-logo.png" alt="Edison" className="w-12 h-12 rounded-lg bg-white p-1 mb-2" />
                    <div className="text-white text-[10px] font-black font-['Cairo'] text-center leading-tight">Certified School</div>
                    <div className="text-sky-200 text-[8px] font-bold font-['Cairo'] mt-0.5">String AI Certified</div>
                    <div className="text-white text-lg mt-1">🤖</div>
                  </div>
                </div>
                {/* Description */}
                <div>
                  <h4 className="font-black text-gray-900 text-lg font-['Cairo'] mb-2">String AI School Badge</h4>
                  <p className="text-sky-600 text-sm font-bold font-['Cairo'] mb-3">An official certification that the school operates with the latest AI technologies</p>
                  <p className="text-gray-600 text-sm leading-relaxed font-['Cairo'] mb-4">
                    Edison Schools will receive the "String AI Certified" badge — an official certification announcing that the school uses the latest AI technologies in education. This badge appears on the website, in apps, and in marketing materials — and tells parents that this school is different.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-sky-50 text-sky-700 text-xs font-bold px-3 py-1.5 rounded-lg font-['Cairo']">✓ On the official website</span>
                    <span className="bg-sky-50 text-sky-700 text-xs font-bold px-3 py-1.5 rounded-lg font-['Cairo']">✓ In apps</span>
                    <span className="bg-sky-50 text-sky-700 text-xs font-bold px-3 py-1.5 rounded-lg font-['Cairo']">✓ In marketing materials</span>
                    <span className="bg-sky-50 text-sky-700 text-xs font-bold px-3 py-1.5 rounded-lg font-['Cairo']">✓ On smart displays</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className="bg-gradient-to-r from-sky-600 to-blue-700 rounded-2xl p-5 text-center text-white">
            <p className="text-sm font-black font-['Cairo']">
              When a parent opens the app and sees Edison's logo — they know this school invested in their children. That's loyalty no ad can buy.
            </p>
          </motion.div>
        </motion.section>

        {/* Section 6B: Curriculum & AI Content */}
        <Section6BCurriculum />

        {/* Section 6C: DNA & Psychological Wellbeing */}
        <Section6CDNA />

        <SectionDivider sectionNumber={7} title="Setup & Operations" />

        {/* Section 7: 3-Day Setup */}
        <Section7Setup />
        <SectionDivider sectionNumber={8} title="Case Study" />

        {/* Section 8: Case Study */}
        <Section8CaseStudy />
        <SectionDivider sectionNumber={9} title="What Edison Gets" />

        {/* Section 9: What Edison Gets */}
        <Section9WhatEdisonGets />
        <SectionDivider sectionNumber={10} title="Investment & Next Step" />

        {/* Section 10: Pricing + CTA */}
        <Section10Pricing />
      </div>
    </div>
  );
}
