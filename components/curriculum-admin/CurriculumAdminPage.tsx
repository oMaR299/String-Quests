import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, X } from 'lucide-react';
import { ALL_CURRICULA } from '../../data/curricula';
import type { CurriculumFramework } from '../../data/curricula';
import { GradeSelector } from './GradeSelector';
import { SummaryCards } from './SummaryCards';
import { CurriculumExplorer } from './CurriculumExplorer';
import { CurriculumCharts } from './CurriculumCharts';

const SUBJECT_LABELS: Record<string, { ar: string; en: string; color: string }> = {
  math: { ar: 'الرياضيات', en: 'Math', color: 'bg-blue-600' },
  science: { ar: 'العلوم', en: 'Science', color: 'bg-green-600' },
  computer: { ar: 'الحاسوب', en: 'Computer', color: 'bg-purple-600' },
  english: { ar: 'الإنجليزية', en: 'English', color: 'bg-red-600' },
  arts: { ar: 'الفنون', en: 'Arts', color: 'bg-pink-600' },
  pe: { ar: 'الرياضة', en: 'PE', color: 'bg-amber-600' },
  kindergarten: { ar: 'رياض الأطفال', en: 'KG', color: 'bg-teal-600' },
};

export const CurriculumAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(0);
  const [selectedGradeIndex, setSelectedGradeIndex] = useState(0);

  const currentSubject = ALL_CURRICULA[selectedSubjectIndex];
  const grades = currentSubject.data.grades;
  const currentGrade = grades[selectedGradeIndex];
  const subjectLabel = SUBJECT_LABELS[currentSubject.key] ?? { ar: currentSubject.key, en: currentSubject.key, color: 'bg-slate-600' };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 flex flex-col">
      {/* Dark header bar */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-cyan-400" />
          <div>
            <h1 className="text-lg font-bold leading-tight">
              مستعرض المنهاج
            </h1>
            <p className="text-xs text-slate-400">Curriculum Explorer</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/home')}
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          title="Exit"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Subject selector */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-slate-500">اختر المادة</h2>
          <div className="flex flex-wrap gap-2">
            {ALL_CURRICULA.map((entry, i) => {
              const label = SUBJECT_LABELS[entry.key] ?? { ar: entry.key, en: entry.key, color: 'bg-slate-600' };
              const isSelected = i === selectedSubjectIndex;
              const totalKCs = entry.data.grades.reduce((sum, g) =>
                sum + g.domains.reduce((ds, d) =>
                  ds + d.standards.reduce((ss, s) =>
                    ss + s.learningOutcomes.reduce((os, o) =>
                      os + o.knowledgeComponents.length, 0), 0), 0), 0);
              return (
                <button
                  key={entry.key}
                  onClick={() => { setSelectedSubjectIndex(i); setSelectedGradeIndex(0); }}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-bold transition-all duration-150 flex items-center gap-2
                    ${isSelected
                      ? `${label.color} text-white shadow-md`
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }
                  `}
                >
                  <span>{label.ar}</span>
                  <span className={`text-xs ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                    {entry.data.grades.length} صف · {totalKCs} KC
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <GradeSelector
          grades={grades}
          selectedIndex={selectedGradeIndex}
          onSelect={setSelectedGradeIndex}
          subjectKey={currentSubject.key}
        />

        <SummaryCards grade={currentGrade} />

        <CurriculumExplorer grade={currentGrade} />

        <CurriculumCharts grade={currentGrade} />
      </main>
    </div>
  );
};
