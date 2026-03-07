import React from 'react';
import { BrainCircuit } from 'lucide-react';

const PrincipalSkillMapPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-slate-400">
      <BrainCircuit className="w-20 h-20 mb-6 opacity-20" />
      <h2 className="text-2xl font-black text-slate-300 mb-2">خريطة المهارات المدرسية</h2>
      <p className="font-medium opacity-50">نظرة شاملة على مستوى إتقان الطلاب في المدرسة — قيد التطوير</p>
    </div>
  );
};

export default PrincipalSkillMapPage;
