import React from 'react';

// Placeholder - will wrap ComplexLeaderboardSystem when it's refactored
const LeaderboardPage: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-white text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🏆</span>
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">المتصدرين</h2>
        <p className="text-slate-500">قريباً - تابع تقدمك مقارنة بزملائك</p>
      </div>
    </div>
  );
};

export default LeaderboardPage;
