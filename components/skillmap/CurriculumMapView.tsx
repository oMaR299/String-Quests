import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronLeft, BookOpen, Layers, Target } from 'lucide-react';
import { ALL_CURRICULA } from '../../data/curricula';
import type { CurriculumFramework, Domain, Standard, LearningOutcome, CurriculumKC } from '../../data/curricula';

const SUBJECT_COLORS: Record<string, { bg: string; text: string; light: string; border: string; emoji: string }> = {
  math:         { bg: 'bg-blue-600',   text: 'text-blue-600',   light: 'bg-blue-50',   border: 'border-blue-200',   emoji: '🧮' },
  science:      { bg: 'bg-green-600',  text: 'text-green-600',  light: 'bg-green-50',  border: 'border-green-200',  emoji: '🔬' },
  computer:     { bg: 'bg-purple-600', text: 'text-purple-600', light: 'bg-purple-50', border: 'border-purple-200', emoji: '💻' },
  english:      { bg: 'bg-red-600',    text: 'text-red-600',    light: 'bg-red-50',    border: 'border-red-200',    emoji: '🇬🇧' },
  arts:         { bg: 'bg-pink-600',   text: 'text-pink-600',   light: 'bg-pink-50',   border: 'border-pink-200',   emoji: '🎨' },
  pe:           { bg: 'bg-amber-600',  text: 'text-amber-600',  light: 'bg-amber-50',  border: 'border-amber-200',  emoji: '🏃' },
  kindergarten: { bg: 'bg-teal-600',   text: 'text-teal-600',   light: 'bg-teal-50',   border: 'border-teal-200',   emoji: '🧒' },
};

const SUBJECT_LABELS: Record<string, { ar: string; en: string }> = {
  math:         { ar: 'الرياضيات', en: 'Math' },
  science:      { ar: 'العلوم', en: 'Science' },
  computer:     { ar: 'الحاسوب', en: 'Computer' },
  english:      { ar: 'الإنجليزية', en: 'English' },
  arts:         { ar: 'الفنون', en: 'Arts' },
  pe:           { ar: 'الرياضة', en: 'PE' },
  kindergarten: { ar: 'رياض الأطفال', en: 'KG' },
};

const BLOOM_LABELS: Record<number, { ar: string; en: string; color: string }> = {
  1: { ar: 'تذكّر', en: 'Remember', color: 'bg-slate-400' },
  2: { ar: 'فهم', en: 'Understand', color: 'bg-blue-400' },
  3: { ar: 'تطبيق', en: 'Apply', color: 'bg-green-400' },
  4: { ar: 'تحليل', en: 'Analyze', color: 'bg-yellow-500' },
  5: { ar: 'تقييم', en: 'Evaluate', color: 'bg-orange-500' },
  6: { ar: 'إبداع', en: 'Create', color: 'bg-red-500' },
};

function getGradeLabel(level: number): string {
  if (level === -1) return 'KG1';
  if (level === 0) return 'KG2';
  return `${level}`;
}

interface Props {
  locale: string;
}

export const CurriculumMapView: React.FC<Props> = ({ locale }) => {
  const [selectedSubject, setSelectedSubject] = useState(0);
  const [selectedGrade, setSelectedGrade] = useState(0);
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(() => new Set());

  const currentEntry = ALL_CURRICULA[selectedSubject];
  const subjectKey = currentEntry.key;
  const framework = currentEntry.data;
  const grades = framework.grades;
  const currentGrade = grades[selectedGrade];
  const colors = SUBJECT_COLORS[subjectKey] ?? SUBJECT_COLORS.math;
  const label = SUBJECT_LABELS[subjectKey] ?? { ar: subjectKey, en: subjectKey };

  // Count totals
  const stats = useMemo(() => {
    if (!currentGrade) return { domains: 0, standards: 0, outcomes: 0, kcs: 0 };
    let standards = 0, outcomes = 0, kcs = 0;
    for (const d of currentGrade.domains) {
      for (const s of d.standards) {
        standards++;
        for (const o of s.learningOutcomes) {
          outcomes++;
          kcs += o.knowledgeComponents.length;
        }
      }
    }
    return { domains: currentGrade.domains.length, standards, outcomes, kcs };
  }, [currentGrade]);

  // Auto-expand first domain on grade change
  const toggleDomain = (domainId: string) => {
    setExpandedDomains(prev => {
      const next = new Set(prev);
      if (next.has(domainId)) next.delete(domainId);
      else next.add(domainId);
      return next;
    });
  };

  const handleSubjectChange = (idx: number) => {
    setSelectedSubject(idx);
    setSelectedGrade(0);
    setExpandedDomains(new Set());
  };

  const handleGradeChange = (idx: number) => {
    setSelectedGrade(idx);
    setExpandedDomains(new Set());
  };

  if (!currentGrade) return null;

  return (
    <div className="space-y-4">
      {/* Subject tabs */}
      <div className="flex flex-wrap gap-1.5">
        {ALL_CURRICULA.map((entry, i) => {
          const c = SUBJECT_COLORS[entry.key] ?? SUBJECT_COLORS.math;
          const l = SUBJECT_LABELS[entry.key] ?? { ar: entry.key, en: entry.key };
          const isActive = i === selectedSubject;
          const totalKCs = entry.data.grades.reduce((sum, g) =>
            sum + g.domains.reduce((ds, d) =>
              ds + d.standards.reduce((ss, s) =>
                ss + s.learningOutcomes.reduce((os, o) =>
                  os + o.knowledgeComponents.length, 0), 0), 0), 0);
          return (
            <button
              key={entry.key}
              onClick={() => handleSubjectChange(i)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1.5
                ${isActive
                  ? `${c.bg} text-white shadow-md`
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }
              `}
            >
              <span>{c.emoji}</span>
              <span>{locale === 'ar' ? l.ar : l.en}</span>
              <span className={`text-[10px] ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
                {totalKCs}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grade chips */}
      <div className="flex flex-wrap gap-1.5">
        {grades.map((g, i) => {
          const isActive = i === selectedGrade;
          return (
            <button
              key={i}
              onClick={() => handleGradeChange(i)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150
                ${isActive
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }
              `}
            >
              {getGradeLabel(g.gradeLevel)}
            </button>
          );
        })}
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-3 text-xs">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${colors.light} ${colors.text} font-bold`}>
          <Layers className="w-3.5 h-3.5" />
          <span>{stats.domains} {locale === 'ar' ? 'مجال' : 'domains'}</span>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${colors.light} ${colors.text} font-bold`}>
          <BookOpen className="w-3.5 h-3.5" />
          <span>{stats.standards} {locale === 'ar' ? 'معيار' : 'standards'}</span>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${colors.light} ${colors.text} font-bold`}>
          <Target className="w-3.5 h-3.5" />
          <span>{stats.kcs} {locale === 'ar' ? 'مكون معرفي' : 'KCs'}</span>
        </div>
      </div>

      {/* Domains */}
      <div className="space-y-2">
        {currentGrade.domains.map((domain, dIdx) => {
          const isExpanded = expandedDomains.has(domain.id);
          const domainKCCount = domain.standards.reduce((sum, s) =>
            sum + s.learningOutcomes.reduce((os, o) => os + o.knowledgeComponents.length, 0), 0);

          return (
            <motion.div
              key={domain.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dIdx * 0.05 }}
              className={`rounded-xl border ${colors.border} overflow-hidden`}
            >
              {/* Domain header */}
              <button
                onClick={() => toggleDomain(domain.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 ${colors.light} hover:brightness-95 transition-all`}
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : (locale === 'ar' ? 180 : 0) }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                </motion.div>
                <div className="flex-1 text-right">
                  <span className={`text-sm font-bold ${colors.text}`}>
                    {locale === 'ar' ? domain.nameAr : (domain.nameEn || domain.nameAr)}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-bold">
                  {domainKCCount} KC
                </span>
              </button>

              {/* Domain content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 space-y-3 bg-white">
                      {domain.standards.map((std) => (
                        <StandardSection
                          key={std.id}
                          standard={std}
                          locale={locale}
                          colors={colors}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Standard Section ─────────────────────────────────── */

interface StandardSectionProps {
  standard: Standard;
  locale: string;
  colors: { bg: string; text: string; light: string; border: string; emoji: string };
}

const StandardSection: React.FC<StandardSectionProps> = ({ standard, locale, colors }) => {
  return (
    <div className="space-y-2">
      {/* Standard name */}
      <div className="flex items-start gap-2 px-1">
        <div className={`w-1 h-full min-h-[16px] rounded-full ${colors.bg} opacity-40 shrink-0 mt-1`} />
        <p className="text-xs font-semibold text-slate-600 leading-relaxed">
          {locale === 'ar' ? standard.nameAr : (standard.nameEn || standard.nameAr)}
        </p>
      </div>

      {/* Outcomes & KCs */}
      {standard.learningOutcomes.map((outcome) => (
        <div key={outcome.id} className="space-y-1.5">
          {/* Outcome label */}
          <p className="text-[11px] text-slate-400 font-medium px-3 leading-relaxed">
            {locale === 'ar' ? outcome.outcomeAr : (outcome.outcomeEn || outcome.outcomeAr)}
          </p>

          {/* KC grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 px-1">
            {outcome.knowledgeComponents.map((kc) => (
              <KCCard key={kc.id} kc={kc} locale={locale} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ─── KC Card ──────────────────────────────────────────── */

interface KCCardProps {
  kc: CurriculumKC;
  locale: string;
}

const KCCard: React.FC<KCCardProps> = ({ kc, locale }) => {
  const bloom = BLOOM_LABELS[kc.bloomLevel] ?? BLOOM_LABELS[3];

  return (
    <div className="group relative px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-white transition-all duration-150 cursor-default">
      {/* KC name */}
      <p className="text-[11px] text-slate-600 font-medium leading-snug mb-1.5 line-clamp-2">
        {kc.nameAr || kc.nameEn}
      </p>

      <div className="flex items-center justify-between">
        {/* Bloom badge */}
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold text-white ${bloom.color}`}>
          B{kc.bloomLevel}
        </span>

        {/* Difficulty dots */}
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map(d => (
            <div
              key={d}
              className={`w-1.5 h-1.5 rounded-full ${
                d <= kc.difficulty ? 'bg-amber-400' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Mastery placeholder */}
        <span className="text-[10px] font-bold text-slate-300">--</span>
      </div>
    </div>
  );
};
