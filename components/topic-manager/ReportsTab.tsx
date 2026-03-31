import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, FileSpreadsheet, Calendar, Building2,
  GraduationCap, Users, BarChart3, GitCompareArrows, Clock,
  CheckCircle2, ChevronRight, ArrowRight, Target, TrendingUp,
  Layers, BookOpen,
} from 'lucide-react';
import {
  MOCK_SCHOOL_DATA,
  SUBJECT_UNITS,
  type Subject,
} from '../../data/complexLeaderboardData';

/* ═══════════════════════════════════════════════════════════════
   Types & Constants
   ═══════════════════════════════════════════════════════════════ */

interface ReportsTabProps {
  subject: string;
  locale: 'ar' | 'en';
}

const CAMPUSES = [
  { id: 'camp-1', name: 'مبنى النور (بنين)', nameEn: 'Al-Noor (Boys)' },
  { id: 'camp-2', name: 'مبنى النور (بنات)', nameEn: 'Al-Noor (Girls)' },
  { id: 'camp-3', name: 'أكاديمية المستقبل', nameEn: 'Future Academy' },
];

const SUBJECT_NAMES: Record<string, { ar: string; en: string }> = {
  math: { ar: 'الرياضيات', en: 'Mathematics' },
  science: { ar: 'العلوم', en: 'Science' },
  languages: { ar: 'اللغات', en: 'Languages' },
  history: { ar: 'التاريخ', en: 'History' },
  arts: { ar: 'الفنون', en: 'Arts' },
  islamic: { ar: 'التربية الإسلامية', en: 'Islamic Studies' },
  english: { ar: 'اللغة الإنجليزية', en: 'English' },
  computer: { ar: 'الحاسب الآلي', en: 'Computer Science' },
  physics: { ar: 'الفيزياء', en: 'Physics' },
  chemistry: { ar: 'الكيمياء', en: 'Chemistry' },
  biology: { ar: 'الأحياء', en: 'Biology' },
  social: { ar: 'الاجتماعيات', en: 'Social Studies' },
};

interface ReportType {
  id: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  icon: typeof FileText;
  gradient: string;
  filters: ('grade' | 'campus' | 'dateRange')[];
}

const REPORT_TYPES: ReportType[] = [
  {
    id: 'grade',
    nameAr: 'تقرير الصف',
    nameEn: 'Grade Report',
    descAr: 'ملخص شامل لأداء الصف',
    descEn: 'Comprehensive grade performance summary',
    icon: GraduationCap,
    gradient: 'from-blue-500 to-indigo-600',
    filters: ['grade', 'campus'],
  },
  {
    id: 'teacher',
    nameAr: 'تقرير المعلم',
    nameEn: 'Teacher Report',
    descAr: 'تقييم أداء المعلم وطلابه',
    descEn: 'Teacher performance evaluation',
    icon: Users,
    gradient: 'from-emerald-500 to-teal-600',
    filters: ['grade', 'campus'],
  },
  {
    id: 'unit',
    nameAr: 'تقرير الوحدة',
    nameEn: 'Unit Report',
    descAr: 'تحليل مفصل لكل وحدة دراسية',
    descEn: 'Detailed unit analysis',
    icon: BookOpen,
    gradient: 'from-violet-500 to-purple-600',
    filters: ['grade'],
  },
  {
    id: 'campus',
    nameAr: 'تقرير المبنى',
    nameEn: 'Campus Report',
    descAr: 'نظرة شاملة على أداء المبنى',
    descEn: 'Campus-wide performance overview',
    icon: Building2,
    gradient: 'from-amber-500 to-orange-600',
    filters: ['campus'],
  },
  {
    id: 'section',
    nameAr: 'مقارنة الشعب',
    nameEn: 'Section Comparison',
    descAr: 'مقارنة أداء الشعب المختلفة',
    descEn: 'Cross-section performance comparison',
    icon: GitCompareArrows,
    gradient: 'from-rose-500 to-pink-600',
    filters: ['grade', 'campus'],
  },
  {
    id: 'time',
    nameAr: 'المقارنة الزمنية',
    nameEn: 'Time Comparison',
    descAr: 'مقارنة هذا الشهر بالشهر الماضي',
    descEn: 'This month vs last month',
    icon: Clock,
    gradient: 'from-cyan-500 to-sky-600',
    filters: ['grade', 'campus', 'dateRange'],
  },
];

interface RecentReport {
  id: string;
  name: string;
  type: string;
  typeBadge: string;
  date: string;
  size: string;
}

/* ═══════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════ */

export function ReportsTab({ subject, locale }: ReportsTabProps) {
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const isRtl = locale === 'ar';

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [filterGrade, setFilterGrade] = useState<number | 'all'>('all');
  const [filterCampus, setFilterCampus] = useState('all');
  const [isExporting, setIsExporting] = useState<'pdf' | 'excel' | null>(null);

  const subj = subject as Exclude<Subject, 'all'>;
  const subjName = SUBJECT_NAMES[subject]?.[isRtl ? 'ar' : 'en'] || subject;
  const units = SUBJECT_UNITS[subj] || [];

  const currentReportType = REPORT_TYPES.find(r => r.id === selectedType);

  /* ─── Mock recent reports ─── */
  const recentReports = useMemo((): RecentReport[] => {
    const types = ['grade', 'teacher', 'campus', 'section', 'unit'];
    const typeLabels: Record<string, { ar: string; en: string }> = {
      grade: { ar: 'صف', en: 'Grade' },
      teacher: { ar: 'معلم', en: 'Teacher' },
      campus: { ar: 'مبنى', en: 'Campus' },
      section: { ar: 'شعب', en: 'Section' },
      unit: { ar: 'وحدة', en: 'Unit' },
    };
    return [
      { id: 'r1', name: t(`تقرير الصف الخامس - ${subjName}`, `Grade 5 Report - ${subjName}`), type: 'grade', typeBadge: t(typeLabels.grade.ar, typeLabels.grade.en), date: '2026-03-28', size: '245 KB' },
      { id: 'r2', name: t(`تقرير مبنى النور - ${subjName}`, `Al-Noor Campus Report - ${subjName}`), type: 'campus', typeBadge: t(typeLabels.campus.ar, typeLabels.campus.en), date: '2026-03-25', size: '312 KB' },
      { id: 'r3', name: t(`مقارنة الشعب - الصف 3 - ${subjName}`, `Section Comparison - Grade 3 - ${subjName}`), type: 'section', typeBadge: t(typeLabels.section.ar, typeLabels.section.en), date: '2026-03-20', size: '189 KB' },
      { id: 'r4', name: t(`المقارنة الزمنية - مارس - ${subjName}`, `Time Comparison - March - ${subjName}`), type: 'time', typeBadge: t('زمني', 'Time'), date: '2026-03-15', size: '156 KB' },
    ];
  }, [subjName, isRtl]);

  /* ─── Preview summary data ─── */
  const previewStats = useMemo(() => {
    let students = MOCK_SCHOOL_DATA;
    if (filterGrade !== 'all') students = students.filter(s => s.grade === filterGrade);
    if (filterCampus !== 'all') students = students.filter(s => s.campusId === filterCampus);

    const withSubj = students.filter(s => s.subjectDetails[subj]?.accuracy > 0);
    const avgAccuracy = withSubj.length > 0
      ? Math.round(withSubj.reduce((sum, s) => sum + s.subjectDetails[subj].accuracy, 0) / withSubj.length)
      : 0;
    const avgXp = withSubj.length > 0
      ? Math.round(withSubj.reduce((sum, s) => sum + s.subjectDetails[subj].xp, 0) / withSubj.length)
      : 0;
    const totalStudents = withSubj.length;
    const sections = new Set(withSubj.map(s => `${s.grade}-${s.section}`)).size;

    return { avgAccuracy, avgXp, totalStudents, sections };
  }, [filterGrade, filterCampus, subj]);

  /* ─── Export handlers ─── */
  const handleExportCSV = useCallback(() => {
    setIsExporting('excel');
    setTimeout(() => {
      let students = MOCK_SCHOOL_DATA;
      if (filterGrade !== 'all') students = students.filter(s => s.grade === filterGrade);
      if (filterCampus !== 'all') students = students.filter(s => s.campusId === filterCampus);

      const BOM = '\uFEFF';
      const headers = [
        t('الاسم', 'Name'),
        t('الصف', 'Grade'),
        t('الشعبة', 'Section'),
        t('المبنى', 'Campus'),
        t('الدقة %', 'Accuracy %'),
        t('XP', 'XP'),
      ].join(',');

      const rows = students.map(st => {
        const campus = CAMPUSES.find(c => c.id === st.campusId);
        return [
          st.name,
          st.grade,
          st.section,
          campus ? (isRtl ? campus.name : campus.nameEn) : st.campusId,
          st.subjectDetails[subj]?.accuracy || 0,
          st.subjectDetails[subj]?.xp || 0,
        ].join(',');
      });

      const csv = BOM + headers + '\n' + rows.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedType || 'report'}_${subject}_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setIsExporting(null);
    }, 800);
  }, [filterGrade, filterCampus, subj, subject, selectedType, isRtl]);

  const handleExportPDF = useCallback(() => {
    setIsExporting('pdf');
    // Simulate PDF generation
    setTimeout(() => {
      alert(t(
        'سيتم تنزيل ملف PDF (يتطلب مكتبة إنشاء PDF في الإنتاج)',
        'PDF download would trigger here (requires PDF library in production)'
      ));
      setIsExporting(null);
    }, 1000);
  }, []);

  const typeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      grade: 'bg-blue-50 text-blue-700',
      teacher: 'bg-emerald-50 text-emerald-700',
      unit: 'bg-violet-50 text-violet-700',
      campus: 'bg-amber-50 text-amber-700',
      section: 'bg-rose-50 text-rose-700',
      time: 'bg-cyan-50 text-cyan-700',
    };
    return colors[type] || 'bg-slate-50 text-slate-700';
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
      {/* ─── Report Type Selector ─── */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-500" />
          {t('نوع التقرير', 'Report Type')}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {REPORT_TYPES.map((report, idx) => {
            const isActive = selectedType === report.id;
            return (
              <motion.button
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedType(isActive ? null : report.id)}
                className={`p-4 rounded-2xl border text-start transition-all group ${
                  isActive
                    ? 'border-blue-300 bg-blue-50 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
                    : 'border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${report.gradient} flex items-center justify-center mb-3`}>
                  <report.icon className="w-4.5 h-4.5 text-white" />
                </div>
                <h4 className={`text-sm font-bold mb-0.5 transition-colors ${isActive ? 'text-blue-700' : 'text-slate-800 group-hover:text-blue-600'}`}>
                  {isRtl ? report.nameAr : report.nameEn}
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {isRtl ? report.descAr : report.descEn}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ─── Selected Report Panel ─── */}
      <AnimatePresence mode="wait">
        {selectedType && currentReportType && (
          <motion.div
            key={selectedType}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
          >
            {/* Panel header */}
            <div className={`bg-gradient-to-r ${currentReportType.gradient} px-5 py-3`}>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <currentReportType.icon className="w-4 h-4" />
                {isRtl ? currentReportType.nameAr : currentReportType.nameEn} - {subjName}
              </h3>
            </div>

            <div className="p-5 space-y-5">
              {/* Filter Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {currentReportType.filters.includes('grade') && (
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">{t('الصف', 'Grade')}</label>
                    <select
                      value={filterGrade === 'all' ? 'all' : String(filterGrade)}
                      onChange={e => setFilterGrade(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                      className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                      <option value="all">{t('الكل', 'All')}</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(g => (
                        <option key={g} value={g}>{t(`الصف ${g}`, `Grade ${g}`)}</option>
                      ))}
                    </select>
                  </div>
                )}

                {currentReportType.filters.includes('campus') && (
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">{t('المبنى', 'Campus')}</label>
                    <select
                      value={filterCampus}
                      onChange={e => setFilterCampus(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                      <option value="all">{t('الكل', 'All')}</option>
                      {CAMPUSES.map(c => (
                        <option key={c.id} value={c.id}>{isRtl ? c.name : c.nameEn}</option>
                      ))}
                    </select>
                  </div>
                )}

                {currentReportType.filters.includes('dateRange') && (
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">{t('الفترة', 'Period')}</label>
                    <select className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                      <option>{t('مارس 2026', 'March 2026')}</option>
                      <option>{t('فبراير 2026', 'February 2026')}</option>
                      <option>{t('يناير 2026', 'January 2026')}</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Preview Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: t('الطلاب', 'Students'), value: String(previewStats.totalStudents), icon: Users, color: 'text-blue-600 bg-blue-50' },
                  { label: t('متوسط الدقة', 'Avg Accuracy'), value: `${previewStats.avgAccuracy}%`, icon: Target, color: 'text-emerald-600 bg-emerald-50' },
                  { label: t('متوسط XP', 'Avg XP'), value: previewStats.avgXp.toLocaleString(), icon: TrendingUp, color: 'text-violet-600 bg-violet-50' },
                  { label: t('الشعب', 'Sections'), value: String(previewStats.sections), icon: Layers, color: 'text-amber-600 bg-amber-50' },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-slate-50 rounded-xl p-3"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className={`w-6 h-6 rounded-lg ${stat.color} flex items-center justify-center`}>
                        <stat.icon className="w-3 h-3" />
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">{stat.label}</span>
                    </div>
                    <p className="text-base font-bold text-slate-800">{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Export Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleExportPDF}
                  disabled={isExporting !== null}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-bold shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/30 transition-all disabled:opacity-60"
                >
                  {isExporting === 'pdf' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  {t('تحميل كـ PDF', 'Download PDF')}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleExportCSV}
                  disabled={isExporting !== null}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-60"
                >
                  {isExporting === 'excel' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <FileSpreadsheet className="w-4 h-4" />
                  )}
                  {t('تحميل كـ Excel', 'Download Excel')}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Recent Reports ─── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          {t('التقارير الأخيرة', 'Recent Reports')}
        </h3>

        <div className="space-y-2">
          {recentReports.map((report, idx) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate">{report.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${typeBadgeColor(report.type)}`}>
                    {report.typeBadge}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {report.date}
                  </span>
                  <span className="text-[10px] text-slate-400">{report.size}</span>
                </div>
              </div>
              <button className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100">
                <Download className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReportsTab;
