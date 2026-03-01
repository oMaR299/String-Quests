
import React from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle, ChevronRight, Trophy, BookOpen, Star } from 'lucide-react';
import { Question } from '../types';
import { Button } from './Button';
import { TOPIC_META } from '../constants';

interface TopicDetailsScreenProps {
  topic: string;
  questions: Question[]; // These are all questions for the topic
  history: Record<number, number>; // questionId -> bestScore
  onPlayLesson: (lessonName: string) => void;
  onBack: () => void;
}

const PinkDiamondIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center relative`}>
      <div className="absolute w-full h-full bg-[#DA43D0] rotate-45 rounded-[3px] shadow-sm" />
      <div className="absolute w-[65%] h-[65%] bg-[#F499EB] rotate-45 rounded-[1px]" />
      <div className="absolute w-[35%] h-[35%] bg-[#FFD9FB] rotate-45" />
  </div>
);

const TopicDetailsScreen: React.FC<TopicDetailsScreenProps> = ({ 
  topic, 
  questions, 
  history, 
  onPlayLesson, 
  onBack 
}) => {
  // Group Questions by Lesson
  const lessonsMap: Record<string, Question[]> = {};
  questions.forEach(q => {
      if (!lessonsMap[q.lesson]) {
          lessonsMap[q.lesson] = [];
      }
      lessonsMap[q.lesson].push(q);
  });
  const lessonNames = Object.keys(lessonsMap);

  // Calculate Total Topic Stats
  const totalQuestions = questions.length;
  const playedCount = questions.filter(q => history[q.id] !== undefined).length;
  const totalScore = questions.reduce((acc, q) => acc + (history[q.id] || 0), 0);
  const topicProgress = Math.round((playedCount / totalQuestions) * 100) || 0;

  // Get visual config
  const meta = TOPIC_META[topic] || TOPIC_META['mix'];
  const topicTitle = topic === 'daily' ? 'التحدي اليومي' : topic === 'weekly' ? 'بطل الأسبوع' : topic === 'practice' ? 'تدريب' : topic;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full relative z-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className={`bg-${meta.bg.split('-')[1]}-50 p-6 pb-8 relative`}>
           <div className="absolute top-4 right-4">
              <button onClick={onBack} className="p-2 bg-white/50 hover:bg-white rounded-full transition-colors">
                  <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
           </div>
           
           <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 ${meta.bg} rounded-2xl flex items-center justify-center mb-3 shadow-sm`}>
                  <Trophy className={`w-8 h-8 ${meta.color}`} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-1">{topicTitle}</h2>
              <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
                  <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> {playedCount}/{totalQuestions} منجز
                  </span>
                  <span className="flex items-center gap-1 text-[#DA43D0]">
                      <PinkDiamondIcon className="w-3 h-3" /> {totalScore}
                  </span>
              </div>
           </div>

           {/* Progress Bar */}
           <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-200/50">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${topicProgress}%` }}
                 className={`h-full ${meta.color.replace('text', 'bg')}`}
               />
           </div>
        </div>

        {/* Lessons List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50">
            <div className="px-2 py-2">
                <h3 className="text-lg font-black text-slate-700 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-slate-400" />
                    الدروس المتاحة
                </h3>
            </div>

            {lessonNames.map((lesson, index) => {
                const lessonQuestions = lessonsMap[lesson];
                const lessonTotalQ = lessonQuestions.length;
                const lessonPlayedQ = lessonQuestions.filter(q => history[q.id] !== undefined).length;
                const lessonScore = lessonQuestions.reduce((acc, q) => acc + (history[q.id] || 0), 0);
                const isCompleted = lessonPlayedQ === lessonTotalQ && lessonTotalQ > 0;
                
                return (
                  <motion.div 
                    key={lesson}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group"
                  >
                      <div className="flex justify-between items-start mb-4 relative z-10">
                          <div>
                              <h4 className="text-lg font-bold text-slate-800 mb-1">{lesson}</h4>
                              <p className="text-xs text-slate-400 font-medium">{lessonTotalQ} أسئلة</p>
                          </div>
                          {isCompleted ? (
                             <div className="bg-emerald-100 text-emerald-600 p-2 rounded-full">
                                 <CheckCircle className="w-5 h-5" />
                             </div>
                          ) : (
                             <div className="bg-slate-100 text-slate-400 p-2 rounded-full">
                                 <Star className="w-5 h-5" />
                             </div>
                          )}
                      </div>

                      {/* Lesson Stats */}
                      <div className="flex items-center gap-3 mb-4 relative z-10">
                           <div className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                <PinkDiamondIcon className="w-3.5 h-3.5" />
                                <span className="text-sm font-bold text-slate-600">{lessonScore}</span>
                           </div>
                           <div className="text-xs font-bold text-slate-400">
                               {Math.round((lessonPlayedQ / lessonTotalQ) * 100)}% مكتمل
                           </div>
                      </div>

                      <Button 
                        onClick={() => onPlayLesson(lesson)}
                        fullWidth 
                        size="md"
                        className="relative z-10 shadow-md"
                      >
                        <span className="flex items-center gap-2">
                           <Play className="w-4 h-4 fill-current" />
                           ابدأ الدرس
                        </span>
                      </Button>

                      {/* Background Decoration */}
                      <div className={`absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-5 ${meta.bg.replace('bg-', 'bg-')}`} />
                  </motion.div>
                );
            })}
        </div>
      </motion.div>
    </div>
  );
};

export default TopicDetailsScreen;
