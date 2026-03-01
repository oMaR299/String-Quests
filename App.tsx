
import React, { useState, useMemo } from 'react';
import Background from './components/Background';
import StartScreen from './components/StartScreen';
import QuizCard from './components/QuizCard';
import EndScreen from './components/EndScreen';
import ProgressBar from './components/ProgressBar';
import EncouragementScreen from './components/EncouragementScreen';
import TopicSelectionScreen from './components/TopicSelectionScreen';
import TopicDetailsScreen from './components/TopicDetailsScreen';
import StreakScreen from './components/StreakScreen';
import { QUESTIONS } from './constants';
import { GameState } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './components/Button';
import { Eye, GraduationCap, Settings2, Building2 } from 'lucide-react';
import { TeacherLayout } from './components/teacher/TeacherLayout';
import { EduMatrixAllocation } from './components/admin/EduMatrixAllocation';
import { PrincipalLayout } from './components/principal/PrincipalLayout';

const App: React.FC = () => {
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isPrincipalMode, setIsPrincipalMode] = useState(false); // New Mode
  
  const [gameState, setGameState] = useState<GameState>('start');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [incorrectQuestionIds, setIncorrectQuestionIds] = useState<number[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  
  // Global User Stats
  const [userXP, setUserXP] = useState(1250); 
  const [userStats, setUserStats] = useState({ correct: 42, total: 50 }); 
  const [totalBoosts, setTotalBoosts] = useState(5); 
  
  // Streak & Daily Progress
  const [dailyCorrectAnswers, setDailyCorrectAnswers] = useState(0); 
  const [currentStreak, setCurrentStreak] = useState(3); 
  
  // Global History: Record<QuestionId, BestScore>
  const [globalHistory, setGlobalHistory] = useState<Record<number, number>>({});

  // Filter questions based on selected subject, lesson or special mode
  const activeQuestions = useMemo(() => {
    if (!selectedSubject) return QUESTIONS;

    let filtered = QUESTIONS;

    // 1. Subject Filtering
    if (selectedSubject === 'mix') {
        filtered = QUESTIONS;
    } else if (selectedSubject === 'daily') {
        return QUESTIONS.slice(0, 5);
    } else if (selectedSubject === 'weekly') {
        return QUESTIONS.slice(0, 12);
    } else if (selectedSubject === 'practice') {
        filtered = QUESTIONS;
    } else {
        filtered = QUESTIONS.filter(q => q.subject === selectedSubject);
    }

    // 2. Lesson Filtering (if a specific lesson is selected)
    if (selectedLesson) {
        filtered = filtered.filter(q => q.lesson === selectedLesson);
    }

    return filtered;
  }, [selectedSubject, selectedLesson]);

  const handleStartClick = () => {
    setGameState('topic-select');
  };

  // View Lessons List (Small Button)
  const handleViewLessons = (topic: string | null) => {
    setSelectedSubject(topic);
    setSelectedLesson(null); // Clear any specific lesson
    setGameState('topic-details');
  };

  // Quick Start Topic (Big Button)
  const handleQuickStartTopic = (topic: string | null) => {
    setSelectedSubject(topic);
    setSelectedLesson(null); // Play all lessons in topic
    handleStartGame();
  };
  
  // Start Specific Lesson (From Details Screen)
  const handleStartLesson = (lesson: string) => {
    setSelectedLesson(lesson);
    handleStartGame();
  };

  // Open Streak Dashboard
  const handleOpenStreak = () => {
    setGameState('streak');
  };

  // Common Start Logic
  const handleStartGame = () => {
    setScore(0);
    setCurrentQuestionIndex(0);
    setIncorrectQuestionIds([]);
    setCurrentReviewIndex(0);
    setGameState('playing');
  };

  const handleBackToTopics = () => {
    setGameState('topic-select');
    setSelectedSubject(null);
    setSelectedLesson(null);
  };

  const handleBackToStart = () => {
      setGameState('start');
  };

  const handleAnswer = (pointsAwarded: number) => {
    const currentQ = activeQuestions[currentQuestionIndex];
    
    // Update Global History (Save best score)
    setGlobalHistory(prev => {
        const oldScore = prev[currentQ.id] || 0;
        return {
            ...prev,
            [currentQ.id]: Math.max(oldScore, pointsAwarded)
        };
    });

    // Update User Stats (XP & Accuracy)
    if (pointsAwarded > 0) {
        setDailyCorrectAnswers(prev => prev + 1);
        setUserXP(prev => prev + pointsAwarded);
        
        // Check for Boost unlock (25 daily)
        if (dailyCorrectAnswers + 1 === 25) {
            setTotalBoosts(prev => prev + 1);
        }
    }

    setUserStats(prev => ({
        correct: pointsAwarded > 0 ? prev.correct + 1 : prev.correct,
        total: prev.total + 1
    }));

    if (pointsAwarded === 0) {
        setIncorrectQuestionIds(prev => [...prev, currentQ.id]);
    }

    setScore(prev => prev + pointsAwarded);
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < activeQuestions.length) {
      if (nextIndex % 4 === 0) {
        setCurrentQuestionIndex(nextIndex);
        setGameState('break');
      } else {
        setCurrentQuestionIndex(nextIndex);
      }
    } else {
      const currentId = currentQ.id;
      const isCurrentWrong = pointsAwarded === 0;
      const allIncorrectIds = isCurrentWrong ? [...incorrectQuestionIds, currentId] : incorrectQuestionIds;
      
      if (allIncorrectIds.length > 0) {
         setGameState('pre-review');
      } else {
         setGameState('end');
      }
    }
  };

  const handleContinueBreak = () => {
    setGameState('playing');
  };

  const startReview = () => {
    setGameState('reviewing');
    setCurrentReviewIndex(0);
  };

  const handleReviewAnswer = (pointsAwarded: number) => {
    const currentQ = getCurrentQuestion(); 
    if (pointsAwarded > 0 && currentQ) {
        setGlobalHistory(prev => ({
            ...prev,
            [currentQ.id]: Math.max(prev[currentQ.id] || 0, pointsAwarded)
        }));
        setDailyCorrectAnswers(prev => prev + 1);
        setUserXP(prev => prev + pointsAwarded);
    }

    setScore(prev => prev + pointsAwarded);
    if (currentReviewIndex < incorrectQuestionIds.length - 1) {
      setCurrentReviewIndex(prev => prev + 1);
    } else {
      setGameState('end');
    }
  };

  const handleRestart = () => {
    // Restart whatever mode we were in (Lesson or Topic)
    handleStartGame();
  };

  const maxScore = activeQuestions.reduce((acc, q) => acc + q.points, 0);

  const getCurrentQuestion = () => {
     if (gameState === 'playing') return activeQuestions[currentQuestionIndex];
     if (gameState === 'reviewing') {
        const id = incorrectQuestionIds[currentReviewIndex];
        return QUESTIONS.find(q => q.id === id) || QUESTIONS[0];
     }
     return QUESTIONS[0];
  };

  // Calculate Accuracy Percentage
  const accuracy = userStats.total > 0 
      ? Math.round((userStats.correct / userStats.total) * 100) 
      : 0;

  // Matching Diamond Icon for Header
  const HeaderDiamond = () => (
    <div className="relative w-6 h-6 flex items-center justify-center">
        <div className="absolute w-full h-full bg-[#DA43D0] rotate-45 rounded-[3px] shadow-sm" />
        <div className="absolute w-[65%] h-[65%] bg-[#F499EB] rotate-45 rounded-[1px]" />
        <div className="absolute w-[35%] h-[35%] bg-[#FFD9FB] rotate-45" />
    </div>
  );

  // --- MODES RENDER ---
  
  if (isPrincipalMode) {
      return <PrincipalLayout onLogout={() => setIsPrincipalMode(false)} />;
  }

  if (isAdminMode) {
      return <EduMatrixAllocation onExit={() => setIsAdminMode(false)} />;
  }

  if (isTeacherMode) {
      return <TeacherLayout onLogout={() => setIsTeacherMode(false)} />;
  }

  // --- STUDENT APP RENDER ---
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-slate-800 font-['Cairo']">
      <Background />

      {/* Secret Dev Buttons */}
      <div className="fixed bottom-4 left-4 z-50 opacity-20 hover:opacity-100 transition-opacity flex flex-col gap-2">
          <button 
             onClick={() => setIsTeacherMode(true)}
             className="bg-slate-800 text-white p-2 rounded-full shadow-lg border border-slate-600 flex items-center gap-2 pr-4"
          >
              <div className="bg-slate-700 p-1 rounded-full"><GraduationCap className="w-4 h-4" /></div>
              <span className="text-xs font-bold">المعلم</span>
          </button>
          <button 
             onClick={() => setIsAdminMode(true)}
             className="bg-indigo-800 text-white p-2 rounded-full shadow-lg border border-indigo-600 flex items-center gap-2 pr-4"
          >
              <div className="bg-indigo-700 p-1 rounded-full"><Settings2 className="w-4 h-4" /></div>
              <span className="text-xs font-bold">EduMatrix</span>
          </button>
          <button 
             onClick={() => setIsPrincipalMode(true)}
             className="bg-emerald-800 text-white p-2 rounded-full shadow-lg border border-emerald-600 flex items-center gap-2 pr-4"
          >
              <div className="bg-emerald-700 p-1 rounded-full"><Building2 className="w-4 h-4" /></div>
              <span className="text-xs font-bold">المدير</span>
          </button>
      </div>

      <main className="relative z-10 container mx-auto px-4 py-6 min-h-screen flex flex-col items-center justify-center max-w-5xl">
        <AnimatePresence mode='wait'>
          {gameState === 'start' && (
            <motion.div 
              key="start"
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex justify-center"
            >
              <StartScreen 
                  onStart={handleStartClick}
                  totalXP={userXP}
                  accuracy={accuracy}
                  streak={currentStreak}
                  totalBoosts={totalBoosts}
              />
            </motion.div>
          )}

          {gameState === 'topic-select' && (
            <motion.div
                key="topic-select"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="w-full flex justify-center"
            >
                <TopicSelectionScreen 
                    availableQuestions={QUESTIONS}
                    onSelectTopic={handleViewLessons}
                    onQuickStart={handleQuickStartTopic}
                    onBack={handleBackToStart}
                    onOpenStreak={handleOpenStreak}
                />
            </motion.div>
          )}
          
          {gameState === 'streak' && (
              <StreakScreen 
                 dailyCount={dailyCorrectAnswers}
                 currentStreak={currentStreak}
                 totalXP={userXP}
                 totalBoosts={totalBoosts}
                 onClose={handleBackToTopics}
              />
          )}

          {gameState === 'topic-details' && selectedSubject && (
             <motion.div
                key="topic-details"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="w-full flex justify-center"
             >
                 <TopicDetailsScreen 
                    topic={selectedSubject}
                    questions={activeQuestions} 
                    history={globalHistory}
                    onPlayLesson={handleStartLesson}
                    onBack={handleBackToTopics}
                 />
             </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center"
            >
              {/* Floating Island Header */}
              <div className="w-full max-w-3xl mb-8 z-30">
                 <div className="bg-white/60 backdrop-blur-md rounded-[2rem] p-2 pr-6 flex items-center shadow-lg shadow-slate-200/50 border border-white">
                     <div className="flex-1 ml-6">
                        <ProgressBar current={currentQuestionIndex} total={activeQuestions.length} />
                     </div>
                     <div className="bg-white px-5 py-3 rounded-[1.5rem] shadow-sm border border-slate-100 flex items-center gap-3">
                         <div className="flex flex-col items-end leading-none">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">النقاط</span>
                             <span className="text-xl font-black text-slate-800">{Math.round(score)}</span>
                         </div>
                         <HeaderDiamond />
                     </div>
                 </div>
              </div>
              
              <QuizCard
                currentIndex={currentQuestionIndex}
                totalQuestions={activeQuestions.length}
                question={activeQuestions[currentQuestionIndex]}
                onAnswer={handleAnswer}
              />
            </motion.div>
          )}

          {gameState === 'break' && (
            <motion.div
              key="break"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <EncouragementScreen 
                 currentCount={currentQuestionIndex}
                 onContinue={handleContinueBreak}
              />
            </motion.div>
          )}

          {gameState === 'pre-review' && (
             <motion.div
                key="pre-review"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex justify-center"
             >
                <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border border-white max-w-md w-full text-center">
                    <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-500 shadow-inner">
                        <Eye className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-3">فرصة ثانية!</h2>
                    <p className="text-slate-500 mb-10 text-lg font-medium leading-relaxed">
                        لديك بعض الإجابات التي تحتاج إلى مراجعة. هل أنت مستعد لتحسين نتيجتك؟
                    </p>
                    <Button onClick={startReview} size="lg" fullWidth className="shadow-orange-500/20">
                        ابدأ المراجعة
                    </Button>
                </div>
             </motion.div>
          )}

          {gameState === 'reviewing' && (
            <motion.div
              key="reviewing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center"
            >
               <div className="w-full max-w-3xl mb-8 z-30 flex justify-center">
                  <div className="bg-orange-50 border border-orange-100 text-orange-700 px-8 py-3 rounded-full text-sm font-bold shadow-lg shadow-orange-500/10 flex items-center gap-3">
                      <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                      وضع المراجعة المكثفة ({currentReviewIndex + 1} / {incorrectQuestionIds.length})
                  </div>
               </div>
              
              <QuizCard
                currentIndex={currentReviewIndex}
                totalQuestions={incorrectQuestionIds.length}
                question={getCurrentQuestion()}
                onAnswer={handleReviewAnswer} 
                isReviewMode={true}
                scoreMultiplier={0.4}
              />
            </motion.div>
          )}

          {gameState === 'end' && (
            <motion.div 
              key="end"
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <EndScreen 
                score={score} 
                maxScore={maxScore} 
                onRestart={handleRestart} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
