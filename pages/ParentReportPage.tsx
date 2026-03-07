import React, { useState } from 'react';
import { ChevronDown, BookOpen } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { MOCK_STUDENTS, MOCK_CLASSES } from '../data/mockSchoolData';
import { ParentReportCard } from '../components/ParentReportCard';

const ParentReportPage: React.FC = () => {
  const { locale, dir } = useI18n();
  const [selectedStudentId, setSelectedStudentId] = useState(MOCK_STUDENTS[0].id);

  const selectedStudent = MOCK_STUDENTS.find(s => s.id === selectedStudentId) ?? MOCK_STUDENTS[0];
  const isRtl = dir === 'rtl';

  return (
    <div className="min-h-screen bg-slate-50 font-['Cairo']" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Selector bar (hidden in print) */}
      <div className="print:hidden bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-500" />
          <span className="font-black text-slate-800">
            {locale === 'ar' ? 'تقرير أداء الطالب' : 'Parent Report Card'}
          </span>
        </div>

        <div className="flex items-center gap-3 ms-auto">
          <label className="text-sm font-bold text-slate-600">
            {locale === 'ar' ? 'اختر الطالب:' : 'Select student:'}
          </label>
          <div className="relative">
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-9 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-400 shadow-sm cursor-pointer"
            >
              {MOCK_CLASSES.map(cls => (
                <optgroup key={cls.id} label={locale === 'ar' ? cls.nameAr : cls.nameEn}>
                  {MOCK_STUDENTS.filter(s => s.classId === cls.id).map(student => (
                    <option key={student.id} value={student.id}>
                      {locale === 'ar' ? student.nameAr : student.nameEn}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Report Card */}
      <ParentReportCard student={selectedStudent} locale={locale} />
    </div>
  );
};

export default ParentReportPage;
