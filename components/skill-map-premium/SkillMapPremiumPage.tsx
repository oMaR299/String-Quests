import React, { useState } from 'react';
import { Globe, ArrowRight } from 'lucide-react';
import { SkillMapMain } from './SkillMapMain';
import { UnitDetailSheet } from './UnitDetailSheet';
import { StudyTodayView } from './StudyTodayView';
import { MOCK_SCHOOL_DATA, type StudentProfile } from '../../data/complexLeaderboardData';

interface SkillMapPremiumPageProps {
  onExit?: () => void;
}

export const SkillMapPremiumPage: React.FC<SkillMapPremiumPageProps> = ({ onExit }) => {
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [selectedUnit, setSelectedUnit] = useState<{ subject: string; unit: string } | null>(null);
  const [showStudyToday, setShowStudyToday] = useState(false);

  // Pick a demo student
  const student: StudentProfile = MOCK_SCHOOL_DATA[5] || MOCK_SCHOOL_DATA[0];

  return (
    <div className="min-h-screen bg-slate-50 font-['Cairo']" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onExit && (
              <button onClick={onExit} className="text-slate-400 hover:text-slate-600 transition-colors">
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-lg font-black text-slate-900">
              {locale === 'ar' ? 'خريطة المعرفة الذكية' : 'Smart Knowledge Map'}
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">Premium</span>
          </div>
          <button onClick={() => setLocale(l => l === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">
            <Globe className="w-4 h-4" />
            <span>{locale === 'ar' ? 'EN' : 'عربي'}</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <SkillMapMain
          locale={locale}
          onUnitClick={(subject, unit) => setSelectedUnit({ subject, unit })}
          onStudyToday={() => setShowStudyToday(true)}
        />
      </div>

      {/* Unit Detail Bottom Sheet */}
      <UnitDetailSheet
        subject={selectedUnit?.subject || 'math'}
        unit={selectedUnit?.unit || 'arithmetic'}
        student={student}
        isOpen={!!selectedUnit}
        onClose={() => setSelectedUnit(null)}
        locale={locale}
      />

      {/* Study Today Bottom Sheet */}
      <StudyTodayView
        student={student}
        isOpen={showStudyToday}
        onClose={() => setShowStudyToday(false)}
        locale={locale}
      />
    </div>
  );
};

export default SkillMapPremiumPage;
