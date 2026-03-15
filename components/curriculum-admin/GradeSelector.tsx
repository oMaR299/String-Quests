import React from 'react';
import { Download } from 'lucide-react';
import type { GradeCurriculum } from '../../data/curricula';

interface GradeSelectorProps {
  grades: GradeCurriculum[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  subjectKey?: string;
}

function getGradeLabel(grade: GradeCurriculum): string {
  const level = grade.gradeLevel;
  if (level === -1) return 'KG1';
  if (level === 0) return 'KG2';
  return `الصف ${level}`;
}

function getDownloadFilename(grade: GradeCurriculum, subjectKey: string): string {
  const level = grade.gradeLevel;
  if (level === -1) return `gradeKG1-${subjectKey}.json`;
  if (level === 0) return `gradeKG2-${subjectKey}.json`;
  return `grade${level}-${subjectKey}.json`;
}

export const GradeSelector: React.FC<GradeSelectorProps> = ({
  grades,
  selectedIndex,
  onSelect,
  subjectKey = 'math',
}) => {
  const handleDownload = () => {
    const grade = grades[selectedIndex];
    const json = JSON.stringify(grade, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getDownloadFilename(grade, subjectKey);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-500">اختر الصف</h2>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          تحميل JSON
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {grades.map((grade, index) => {
          const isSelected = index === selectedIndex;
          return (
            <button
              key={index}
              onClick={() => onSelect(index)}
              className={`
                px-4 py-2 rounded-lg text-sm font-bold transition-all duration-150
                ${isSelected
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }
              `}
            >
              {getGradeLabel(grade)}
            </button>
          );
        })}
      </div>
    </div>
  );
};
