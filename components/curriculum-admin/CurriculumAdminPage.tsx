import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, X } from 'lucide-react';
import { MATH_CURRICULUM } from '../../data/curricula';
import { GradeSelector } from './GradeSelector';
import { SummaryCards } from './SummaryCards';
import { CurriculumExplorer } from './CurriculumExplorer';
import { CurriculumCharts } from './CurriculumCharts';

export const CurriculumAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGradeIndex, setSelectedGradeIndex] = useState(0);

  const grades = MATH_CURRICULUM.grades;
  const currentGrade = grades[selectedGradeIndex];

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
        <GradeSelector
          grades={grades}
          selectedIndex={selectedGradeIndex}
          onSelect={setSelectedGradeIndex}
        />

        <SummaryCards grade={currentGrade} />

        <CurriculumExplorer grade={currentGrade} />

        <CurriculumCharts grade={currentGrade} />
      </main>
    </div>
  );
};
