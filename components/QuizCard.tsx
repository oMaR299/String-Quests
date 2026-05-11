
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Lightbulb, CheckCircle, X, Gift, Check, RefreshCw, BookOpen, Highlighter, MousePointerClick, Eraser, Type, BrainCircuit } from 'lucide-react';
import { Question } from '../types';
import { Button } from './Button';
import { useSounds } from '../hooks/useSounds';
import { HighlightableParagraph, ClickableWordParagraph } from './ReadingRenderers';
import { PinkDiamondIcon } from './ui/PinkDiamondIcon';
import { saveAttempt } from '../utils/skillMapStorage';
import { useQuizSession } from '../contexts/QuizSessionContext';

interface QuizCardProps {
  question: Question;
  onAnswer: (points: number) => void;
  totalQuestions: number;
  currentIndex: number;
  isReviewMode?: boolean;
  scoreMultiplier?: number;
  /**
   * Optional ref the parent (`QuizSessionPage`) uses to measure the correct
   * answer's option tile. Spatial in-question power-up effects (RobotCursor)
   * walk to that tile's center.
   *
   * Only set for `multiple-choice` questions — other question types leave the
   * ref null and effects fall back to a viewport-center target.
   */
  correctAnswerRef?: React.MutableRefObject<HTMLElement | null>;
}

interface FeedbackState {
  type: 'success' | 'error' | 'encouragement';
  variant?: 'sure' | 'unsure';
  points: number;
  message: string;
}

interface MatchItem {
  id: string;
  text: string;
  type: 'left' | 'right';
  pairIndex: number;
}

const MATCH_COLORS = [
  'bg-blue-100 border-blue-300 text-blue-700 shadow-blue-100',
  'bg-purple-100 border-purple-300 text-purple-700 shadow-purple-100',
  'bg-pink-100 border-pink-300 text-pink-700 shadow-pink-100',
  'bg-emerald-100 border-emerald-300 text-emerald-700 shadow-emerald-100',
];


const QuizCard: React.FC<QuizCardProps> = ({
  question,
  onAnswer,
  totalQuestions,
  currentIndex,
  isReviewMode = false,
  scoreMultiplier = 1,
  correctAnswerRef,
}) => {
  const [hintUsed, setHintUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  // Type Specific States
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [inputAnswer, setInputAnswer] = useState<string>('');
  const [reorderList, setReorderList] = useState<string[]>([]);
  const [poolList, setPoolList] = useState<string[]>([]);
  const [matchItems, setMatchItems] = useState<MatchItem[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  
  // Reading Specific State
  const [readingAnswer, setReadingAnswer] = useState<string | null>(null);
  const [textAreaAnswer, setTextAreaAnswer] = useState<string>('');

  const {
    playSure,
    playUnsure,
    playHint,
    playTransition,
    playClick,
    playSuccessShort,
    playGentleError,
    playPop
  } = useSounds();

  // Power-ups (Wave C) — read in-question session flags so the card can:
  //   1) grey out 50/50 hidden indices on multi-choice
  //   2) auto-open the hint and bypass the 20% penalty when REVEAL_HINT_FREE
  //      is armed for this question
  //   3) surface the active multiplier visually (XP Doubler / Lucky Dice)
  const { state: quizPowerState } = useQuizSession();
  const hiddenOptionIndices = quizPowerState.hiddenOptionIndices;
  const hintRevealedNoPenalty = quizPowerState.hintRevealedNoPenalty;
  const xpDoublerPending = quizPowerState.xpDoublerPending;
  const luckyDiceActive = quizPowerState.loadout.lucky_dice;
  const luckyDiceLastRoll = quizPowerState.luckyDiceLastRoll;
  const reduceMotion = useReducedMotion();

  const currentMaxPoints = Math.round(question.points * scoreMultiplier);

  // Auto-open the lightbulb hint when the free-hint power-up is active for
  // this question. We DON'T flip `hintUsed` so the existing 20% XP penalty
  // is bypassed (the penalty branch checks `hintUsed`, not `showHint`).
  useEffect(() => {
    if (hintRevealedNoPenalty) {
      setShowHint(true);
    }
  }, [hintRevealedNoPenalty]);

  useEffect(() => {
    setHintUsed(false);
    setShowHint(false);
    setFeedback(null);
    setSelectedOption(null);
    setInputAnswer('');
    setReadingAnswer(null);
    setTextAreaAnswer('');

    // Drop the correct-answer ref — the multi-choice render path will refill
    // it when the new question is itself multi-choice; otherwise the parent's
    // measurement effect sees null and falls back appropriately.
    if (correctAnswerRef) {
      correctAnswerRef.current = null;
    }

    if (question.type === 'reorder' && question.options) {
      const shuffled = [...question.options].sort(() => Math.random() - 0.5);
      setPoolList(shuffled);
      setReorderList([]);
    }

    if (question.type === 'matching' && question.pairs) {
      const items: MatchItem[] = [];
      question.pairs.forEach((pair, index) => {
        items.push({ id: `l-${index}`, text: pair.left, type: 'left', pairIndex: index });
        items.push({ id: `r-${index}`, text: pair.right, type: 'right', pairIndex: index });
      });
      setMatchItems(items.sort(() => Math.random() - 0.5));
      setMatches({});
      setSelectedMatchId(null);
    }
  }, [question]);

  useEffect(() => {
    if (feedback) {
      if (feedback.type === 'success') playSuccessShort();
      else playGentleError();
    }
  }, [feedback, playSuccessShort, playGentleError]);

  const handleHint = () => {
    playHint();
    setHintUsed(true);
    setShowHint(true);
  };

  const handleOptionSelect = (option: string) => {
    playClick();
    setSelectedOption(option);
  };

  const handleReadingInteraction = (val: string) => {
      playClick();
      setReadingAnswer(val);
  };

  const handleAddToSentence = (word: string) => {
    playPop();
    setReorderList([...reorderList, word]);
    setPoolList(poolList.filter(w => w !== word));
  };

  const handleRemoveFromSentence = (word: string) => {
    playClick();
    setPoolList([...poolList, word]);
    setReorderList(reorderList.filter(w => w !== word));
  };

  const handleMatchItemClick = (itemId: string) => {
    playClick();
    if (matches[itemId]) return;

    if (!selectedMatchId) {
      setSelectedMatchId(itemId);
      return;
    }

    if (selectedMatchId === itemId) {
      setSelectedMatchId(null);
      return;
    }

    const item1 = matchItems.find(i => i.id === selectedMatchId);
    const item2 = matchItems.find(i => i.id === itemId);
    
    if (item1?.type === item2?.type) {
        setSelectedMatchId(itemId);
        return;
    }

    const uniqueColorsUsed = new Set(Object.values(matches));
    const availableColor = MATCH_COLORS.find(c => !uniqueColorsUsed.has(c)) || MATCH_COLORS[0];

    const newMatches = { ...matches };
    newMatches[selectedMatchId] = availableColor;
    newMatches[itemId] = availableColor;
    
    setMatches(newMatches);
    setSelectedMatchId(null);
    playPop();
  };

  const handleUnmatch = (itemId: string) => {
      const colorToRemove = matches[itemId];
      if (!colorToRemove) return;
      const newMatches = { ...matches };
      Object.keys(newMatches).forEach(key => {
          if (newMatches[key] === colorToRemove) delete newMatches[key];
      });
      setMatches(newMatches);
  };

  const isAnswerValid = () => {
    switch (question.type) {
      case 'multiple-choice': return !!selectedOption;
      case 'input': return inputAnswer.trim().length > 0;
      case 'reorder': return reorderList.length > 0 && poolList.length === 0;
      case 'matching': return Object.keys(matches).length === (question.pairs?.length || 0) * 2;
      case 'reading-highlight': 
      case 'reading-word': 
         return !!readingAnswer;
      case 'reading-list-extraction':
      case 'reading-ai-opinion':
         return textAreaAnswer.trim().length > 0;
      default: return false;
    }
  };

  const submitAnswer = (confidence: 'sure' | 'unsure') => {
    if (!isAnswerValid()) return;

    let isCorrect = false;
    let pointsFactor = 1; // Used for partial credit
    let customFeedback = "";

    switch (question.type) {
      case 'multiple-choice': isCorrect = selectedOption === question.correctAnswer; break;
      case 'input': isCorrect = inputAnswer.trim() === question.correctAnswer.trim(); break;
      case 'reorder': isCorrect = reorderList.join(' ').trim() === question.correctAnswer.trim(); break;
      case 'matching':
        const pairsByColor: Record<string, string[]> = {};
        Object.keys(matches).forEach((id) => {
           const color = matches[id];
           if (!pairsByColor[color]) pairsByColor[color] = [];
           pairsByColor[color].push(id);
        });
        isCorrect = true;
        Object.values(pairsByColor).forEach(pairIds => {
            if (pairIds.length !== 2) { isCorrect = false; return; }
            const item1 = matchItems.find(i => i.id === pairIds[0]);
            const item2 = matchItems.find(i => i.id === pairIds[1]);
            if (!item1 || !item2 || item1.pairIndex !== item2.pairIndex) isCorrect = false;
        });
        break;
      case 'reading-word':
         isCorrect = readingAnswer?.trim() === question.correctAnswer.trim();
         break;
      case 'reading-highlight':
         // Basic fuzzy match for highlighting (contains correct snippet)
         if (readingAnswer && question.correctAnswer) {
             const userText = readingAnswer.trim();
             const correctText = question.correctAnswer.trim();
             // Correct if user highlighted the exact phrase or a slightly larger sentence containing it
             isCorrect = userText.includes(correctText) || correctText.includes(userText); 
         }
         break;
      
      case 'reading-list-extraction':
        if (question.rubric) {
           const required = question.requiredCount || 1;
           // Check how many rubric items are in the answer
           const matchesFound = question.rubric.filter(keyword => 
              textAreaAnswer.toLowerCase().includes(keyword.toLowerCase())
           );
           
           if (matchesFound.length >= required) {
               isCorrect = true;
               customFeedback = `أحسنت! وجدت ${matchesFound.length} من العناصر المطلوبة.`;
           } else if (matchesFound.length > 0) {
               // Partial credit logic could be implemented here, but for simplicity we'll mark as incorrect/partial
               // or we can award partial points. Let's do partial correctness:
               isCorrect = true; 
               pointsFactor = matchesFound.length / required;
               customFeedback = `وجدت ${matchesFound.length} من ${required}. محاولة جيدة!`;
           } else {
               customFeedback = "لم يتم العثور على العناصر المطلوبة في إجابتك.";
           }
        }
        break;

      case 'reading-ai-opinion':
        const wordCount = textAreaAnswer.trim().split(/\s+/).length;
        const min = question.minWords || 5;
        if (wordCount >= min) {
            isCorrect = true;
            customFeedback = "تقييم الذكاء الاصطناعي: إجابة شاملة وممتازة!";
        } else {
            customFeedback = `الإجابة قصيرة جداً. حاول كتابة ${min} كلمات على الأقل.`;
        }
        break;
    }
    
    let pointsToAward = currentMaxPoints * pointsFactor;
    // Hint penalty — bypassed entirely when REVEAL_HINT_FREE armed this Q.
    if (hintUsed && !hintRevealedNoPenalty) pointsToAward = Math.round(pointsToAward * 0.8);
    
    let finalPoints = 0;
    let feedbackData: FeedbackState;

    // Adjust for Confidence
    if (confidence === 'sure') {
      playSure();
      if (isCorrect && pointsFactor === 1) {
        finalPoints = Math.round(pointsToAward);
        feedbackData = { 
            type: 'success', 
            variant: 'sure', 
            points: finalPoints, 
            message: customFeedback || 'إجابة صحيحة!' 
        };
      } else if (isCorrect && pointsFactor < 1) {
         // Partial credit case handled as "Success" visually but with warning message
         finalPoints = Math.round(pointsToAward);
         feedbackData = { 
            type: 'encouragement', 
            variant: 'sure', 
            points: finalPoints, 
            message: customFeedback || 'إجابة جزئية' 
         };
      } else {
        feedbackData = { 
            type: 'error', 
            variant: 'sure', 
            points: 0, 
            message: customFeedback || 'إجابة خاطئة' 
        };
      }
    } else {
      playUnsure();
      // If correct but unsure, 50% points
      finalPoints = isCorrect ? Math.round(pointsToAward * 0.5) : 0;
      feedbackData = { 
          type: isCorrect ? 'success' : 'encouragement', 
          variant: 'unsure', 
          points: finalPoints, 
          message: isCorrect ? (customFeedback || 'صحيح!') : (customFeedback || 'محاولة جيدة') 
      };
    }

    setFeedback(feedbackData);

    // Record attempt for skill map
    saveAttempt({
      questionId: question.id,
      subject: question.subject,
      lesson: question.lesson,
      questionType: question.type,
      isCorrect,
      pointsAwarded: finalPoints,
      maxPoints: currentMaxPoints,
      confidence,
      hintUsed,
      isReviewMode,
      timestamp: Date.now(),
    });

    setTimeout(() => {
      playTransition();
      onAnswer(finalPoints);
    }, 3500);
  };

  // Render Methods
  const renderMultipleChoice = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {question.options?.map((option, idx) => {
        const isSelected = selectedOption === option;
        // 50/50 power-up — these indices are hidden from interaction but
        // remain in the DOM so layout doesn't collapse mid-question.
        const isHidden = hiddenOptionIndices.includes(idx);
        // Mark the correct-option tile so the parent can measure it for
        // cinematic spatial effects (RobotCursor walk target). We compare by
        // string match because Question.correctAnswer is the option text.
        const isCorrect = option === question.correctAnswer;
        return (
            <motion.button
            key={idx}
            ref={(node) => {
              if (isCorrect && correctAnswerRef) {
                correctAnswerRef.current = node as HTMLElement | null;
              }
            }}
            data-option-index={idx}
            onClick={() => !isHidden && handleOptionSelect(option)}
            animate={{ opacity: isHidden ? 0.3 : 1 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.25 }}
            aria-hidden={isHidden}
            tabIndex={isHidden ? -1 : 0}
            className={`
                group relative p-6 rounded-2xl text-right font-bold text-lg transition-all duration-200 border-2
                flex items-center justify-between overflow-hidden
                ${isHidden ? 'pointer-events-none' : ''}
                ${isSelected
                    ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-md scale-[1.02]'
                    : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-slate-50 hover:shadow-sm'}
            `}
            >
            <span className="flex items-center gap-4 z-10">
                <span className={`
                    w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black transition-colors border-2
                    ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'bg-slate-50 border-slate-200 text-slate-400 group-hover:border-blue-200 group-hover:text-blue-400'}
                `}>
                {String.fromCharCode(65 + idx)}
                </span>
                {option}
            </span>
            {isSelected && (
                <motion.div layoutId="check" className="absolute top-0 left-0 bottom-0 w-1.5 bg-blue-500" />
            )}
            </motion.button>
        )
      })}
    </div>
  );

  const renderInput = () => (
    <div className="w-full max-w-lg mx-auto">
       <div className="relative group">
        <input
            type="text"
            inputMode="numeric"
            value={inputAnswer}
            onChange={(e) => setInputAnswer(e.target.value)}
            placeholder="اكتب إجابتك..."
            className="w-full p-8 text-center text-4xl font-black text-slate-800 bg-white rounded-[2rem] border-2 border-slate-200 focus:border-blue-400 focus:ring-8 focus:ring-blue-400/10 outline-none transition-all shadow-sm placeholder:text-slate-300 placeholder:text-2xl"
        />
        <div className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-blue-400 transition-colors">
            ✍️
        </div>
       </div>
    </div>
  );

  const renderReorder = () => (
    <div className="w-full flex flex-col gap-8">
       {/* Answer Area */}
       <div className="min-h-[100px] p-6 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-300 flex flex-wrap gap-3 items-center justify-center transition-all">
          <AnimatePresence>
          {reorderList.map((word, idx) => (
             <motion.button
               key={`${word}-${idx}`}
               layoutId={word}
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.8, opacity: 0 }}
               onClick={() => handleRemoveFromSentence(word)}
               className="bg-white border-2 border-blue-200 text-blue-700 px-5 py-3 rounded-2xl shadow-sm font-bold text-lg hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
             >
               {word}
             </motion.button>
          ))}
          </AnimatePresence>
          {reorderList.length === 0 && <span className="text-slate-400 font-medium">رتب الكلمات هنا</span>}
       </div>
       {/* Bank */}
       <div className="flex flex-wrap gap-3 justify-center">
          {poolList.map((word, idx) => (
             <motion.button
               key={`${word}-pool-${idx}`}
               layoutId={word} 
               onClick={() => handleAddToSentence(word)}
               className="bg-white border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 text-slate-700 px-6 py-3 rounded-2xl font-bold text-lg shadow-sm hover:bg-slate-50 transition-all"
             >
               {word}
             </motion.button>
          ))}
       </div>
    </div>
  );

  const renderMatching = () => (
    <div className="grid grid-cols-2 gap-6 md:gap-12 w-full max-w-4xl mx-auto">
        {['right', 'left'].map((colType) => (
            <div key={colType} className="flex flex-col gap-4">
                {matchItems.filter(i => i.type === colType).map((item) => {
                    const isSelected = selectedMatchId === item.id;
                    const matchColor = matches[item.id];
                    return (
                        <motion.button
                            key={item.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => matchColor ? handleUnmatch(item.id) : handleMatchItemClick(item.id)}
                            className={`
                                w-full p-5 rounded-2xl text-center font-bold text-base transition-all shadow-sm border-2 relative
                                ${matchColor ? matchColor : isSelected 
                                    ? 'bg-slate-800 text-white border-slate-800 scale-[1.02] shadow-lg' 
                                    : 'bg-white text-slate-600 border-slate-100 hover:border-blue-200 hover:bg-slate-50'}
                            `}
                        >
                            {item.text}
                            {matchColor && <CheckCircle className="w-5 h-5 absolute top-1/2 -translate-y-1/2 left-4 opacity-60" />}
                        </motion.button>
                    )
                })}
            </div>
        ))}
    </div>
  );

  // --- Reading Passage Renderer ---
  const renderReadingPassage = () => {
    if (!question.passage) return null;

    return (
        <div className="w-full flex flex-col md:flex-row gap-6 md:h-[600px]">
            {/* Passage Side */}
            <div className="md:w-1/2 bg-slate-50/80 rounded-[2rem] p-6 border border-slate-200 shadow-inner overflow-y-auto custom-scrollbar relative">
                <div className="flex items-center gap-2 mb-4 text-slate-400 uppercase text-xs font-bold tracking-wider sticky top-0 bg-slate-50/95 p-2 rounded-xl backdrop-blur-sm z-10 border border-slate-100">
                    <BookOpen className="w-4 h-4" />
                    <span>النص المقروء</span>
                </div>
                
                {question.passage.map((para) => {
                    // For word/highlight, we only activate target paragraphs. 
                    // For list/ai opinion, the whole text is readable (active=false means no highlight interaction).
                    const isActive = (question.type === 'reading-highlight' || question.type === 'reading-word') 
                                    ? question.targetParagraphId === para.id 
                                    : false;
                    
                    if (question.type === 'reading-highlight' && isActive) {
                         return (
                            <HighlightableParagraph 
                                key={para.id}
                                paragraph={para}
                                isActive={true}
                                currentSelection={readingAnswer}
                                onHighlight={handleReadingInteraction}
                            />
                         );
                    } else if (question.type === 'reading-word' && isActive) {
                        return (
                            <div key={para.id} className="mb-4">
                                <ClickableWordParagraph 
                                    paragraph={para}
                                    isActive={true}
                                    selectedWord={readingAnswer}
                                    onWordClick={handleReadingInteraction}
                                />
                            </div>
                        );
                    } else {
                        // Plain text paragraphs
                        // Blur only if we are in a strict target mode (word/highlight) and this isn't the target
                        const shouldBlur = (question.type === 'reading-highlight' || question.type === 'reading-word') && !isActive;
                        return (
                             <p key={para.id} className={`leading-relaxed text-lg text-slate-600 mb-4 transition-opacity ${shouldBlur ? 'opacity-40 blur-[0.5px]' : ''}`}>
                                {para.text}
                             </p>
                        );
                    }
                })}
            </div>

            {/* Question Side */}
            <div className="md:w-1/2 flex flex-col justify-center">
                 <div className="mb-8">
                     <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold mb-4">
                         {question.type === 'reading-highlight' && <Highlighter className="w-4 h-4" />}
                         {question.type === 'reading-word' && <MousePointerClick className="w-4 h-4" />}
                         {question.type === 'reading-list-extraction' && <Type className="w-4 h-4" />}
                         {question.type === 'reading-ai-opinion' && <BrainCircuit className="w-4 h-4" />}
                         
                         {question.type === 'reading-highlight' && 'حدد الجملة المطلوبة'}
                         {question.type === 'reading-word' && 'اضغط على الكلمة'}
                         {question.type === 'reading-list-extraction' && 'استخرج من النص'}
                         {question.type === 'reading-ai-opinion' && 'رأيك الشخصي'}
                     </span>
                     <h2 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">
                        {question.questionText}
                     </h2>
                 </div>

                 {/* Interactive Input Area based on Type */}
                 
                 {/* 1. Highlight / Word Click Feedback Area */}
                 {(question.type === 'reading-highlight' || question.type === 'reading-word') && (
                     <div className={`p-6 rounded-2xl border-2 border-dashed transition-all mb-8 flex items-center justify-center min-h-[120px]
                        ${readingAnswer 
                            ? 'bg-purple-50 border-purple-300 text-purple-900' 
                            : 'bg-white border-slate-200 text-slate-400'
                        }`}
                     >
                         {readingAnswer ? (
                             <div className="text-center w-full">
                                <div className="flex justify-between items-center mb-2 px-2">
                                    <span className="text-[10px] uppercase font-bold text-purple-400">اختيارك الحالي</span>
                                    <button onClick={() => setReadingAnswer(null)} className="text-red-400 hover:text-red-500 transition-colors">
                                        <Eraser className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-lg font-bold">"{readingAnswer}"</p>
                             </div>
                         ) : (
                             <div className="flex flex-col items-center gap-2">
                                {question.type === 'reading-highlight' ? <Highlighter className="w-6 h-6 opacity-50" /> : <MousePointerClick className="w-6 h-6 opacity-50" />}
                                <span>{question.type === 'reading-highlight' ? 'ظلل النص للإجابة' : 'اختر كلمة من النص'}</span>
                             </div>
                         )}
                     </div>
                 )}

                 {/* 2. Text Input Area (List Extraction / AI Opinion) */}
                 {(question.type === 'reading-list-extraction' || question.type === 'reading-ai-opinion') && (
                     <div className="mb-8">
                        <textarea 
                          value={textAreaAnswer}
                          onChange={(e) => setTextAreaAnswer(e.target.value)}
                          placeholder="اكتب إجابتك هنا..."
                          className="w-full h-40 p-5 rounded-2xl border-2 border-slate-200 bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-400/10 outline-none transition-all resize-none text-lg text-slate-800 placeholder:text-slate-300"
                        />
                        <div className="flex justify-end mt-2 text-xs font-bold text-slate-400 px-2">
                           {question.type === 'reading-ai-opinion' && (
                              <span>{textAreaAnswer.trim().split(/\s+/).filter(w => w.length > 0).length} كلمة (الحد الأدنى {question.minWords || 5})</span>
                           )}
                        </div>
                     </div>
                 )}
            </div>
        </div>
    );
  };

  const feedbackStyles = {
      success: 'bg-emerald-500 text-white shadow-emerald-200',
      error: 'bg-rose-500 text-white shadow-rose-200',
      encouragement: 'bg-amber-500 text-white shadow-amber-200'
  };

  const isQuestionWritingType = question.type === 'reading-list-extraction' || question.type === 'reading-ai-opinion';

  return (
    <div className="w-full relative z-10 pt-6">
      <AnimatePresence mode="wait">
        {/* --- QUESTION VIEW --- */}
        {!feedback && (
            <motion.div 
                key="question"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative"
            >
                {/* Floating Badges */}
                <div className="absolute -top-6 w-full flex justify-between px-4 md:px-8 pointer-events-none z-20">
                    <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-slate-800 text-white px-5 py-2 rounded-2xl text-sm font-bold shadow-xl shadow-slate-800/20 flex items-center gap-2 border-4 border-white transform rotate-2"
                    >
                        <span>{question.subject}</span>
                        <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span>
                    </motion.div>

                    <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white text-[#DA43D0] px-5 py-2 rounded-2xl text-base font-black shadow-xl shadow-pink-500/10 flex items-center gap-3 border-4 border-white transform -rotate-2"
                    >
                        <PinkDiamondIcon className="w-5 h-5" />
                        <span className="translate-y-[1px]">{currentMaxPoints}</span>
                    </motion.div>
                </div>

                {/* Review Mode Indicator */}
                {isReviewMode && (
                     <div className="absolute -top-10 left-0 right-0 flex justify-center z-10">
                        <div className="bg-orange-500 text-white px-6 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-2 animate-bounce">
                            <RefreshCw className="w-3 h-3" />
                            مراجعة
                        </div>
                    </div>
                )}

                <div className={`bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-white p-6 md:p-10 min-h-[500px] flex flex-col relative overflow-hidden ${question.passage ? 'max-w-6xl mx-auto' : ''}`}>
                    
                    {/* Header Controls */}
                    <div className="flex justify-between items-start w-full mb-6 pl-1 z-10">
                        <button 
                            onClick={handleHint}
                            disabled={hintUsed}
                            className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                                hintUsed ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border border-yellow-200 shadow-sm hover:shadow-md'
                            }`}
                        >
                            <Lightbulb className={`w-4 h-4 ${!hintUsed && 'fill-current'}`} />
                            <span>تلميح</span>
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-grow flex flex-col items-center w-full z-10">
                        <AnimatePresence>
                            {showHint && (
                                <motion.div 
                                initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                                animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
                                className="overflow-hidden w-full max-w-xl"
                                >
                                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-2xl text-yellow-800 text-sm font-medium flex items-center gap-3 shadow-sm">
                                    <div className="bg-yellow-200 p-1.5 rounded-full shrink-0"><Lightbulb className="w-4 h-4 text-yellow-700" /></div>
                                    {question.hint}
                                </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        {/* Render Reading Passage OR Standard Question */}
                        {question.passage ? (
                            renderReadingPassage()
                        ) : (
                            <>
                                <h2 className="text-3xl md:text-4xl font-black text-slate-800 text-center leading-tight mb-12 max-w-4xl drop-shadow-sm">
                                    {question.questionText}
                                </h2>
                                <div className="w-full flex justify-center">
                                    {question.type === 'multiple-choice' && renderMultipleChoice()}
                                    {question.type === 'input' && renderInput()}
                                    {question.type === 'reorder' && renderReorder()}
                                    {question.type === 'matching' && renderMatching()}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col-reverse md:flex-row gap-4 justify-between items-center z-10">
                        <Button 
                            onClick={() => submitAnswer('unsure')}
                            disabled={!isAnswerValid()}
                            variant="ghost"
                            className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 w-full md:w-auto"
                            playSound={false}
                        >
                            لست متأكداً تماماً
                        </Button>
                        
                        <Button 
                            onClick={() => submitAnswer('sure')}
                            disabled={!isAnswerValid()}
                            className="px-12 shadow-blue-500/25 w-full md:w-auto text-lg"
                            playSound={false}
                        >
                            تأكيد الإجابة
                            <Check className="w-6 h-6" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        )}

        {/* --- FEEDBACK VIEW --- */}
        {feedback && (
            <motion.div 
                key="feedback"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-30 flex items-center justify-center"
            >
                <div className="bg-white/95 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] shadow-2xl border-4 border-white w-full max-w-lg text-center relative overflow-hidden">
                     {/* Background Glow */}
                    <div className={`absolute inset-0 opacity-10 ${feedback.type === 'success' ? 'bg-emerald-500' : feedback.type === 'error' ? 'bg-rose-500' : 'bg-amber-500'}`} />

                    <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }} 
                        className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ${feedbackStyles[feedback.type]}`}
                    >
                        {feedback.type === 'success' && <CheckCircle className="w-12 h-12" />}
                        {feedback.type === 'error' && <X className="w-12 h-12" />}
                        {feedback.type === 'encouragement' && <Gift className="w-12 h-12" />}
                    </motion.div>

                    <h3 className="text-3xl font-black text-slate-800 mb-2">{feedback.message}</h3>
                    <div className="relative flex justify-center items-center gap-2 mb-8">
                        <span className="text-5xl font-black text-slate-400 tracking-tight">+{feedback.points}</span>
                        <PinkDiamondIcon className="w-8 h-8" />
                        {/* XP-multiplier burst — shown when xp_double or lucky_dice
                            paid out on this correct answer. The actual score math
                            lives in QuizSessionPage; this is purely the celebrate. */}
                        {feedback.type === 'success' && (xpDoublerPending || (luckyDiceActive && luckyDiceLastRoll && luckyDiceLastRoll > 1)) && (
                            <motion.div
                                initial={reduceMotion ? false : { scale: 0, rotate: -12 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 18, mass: 0.6 }}
                                className="absolute -top-3 -right-2 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-black shadow-lg shadow-amber-500/40 border-2 border-white"
                            >
                                ×{xpDoublerPending && luckyDiceActive && luckyDiceLastRoll
                                    ? Math.min(6, 2 * luckyDiceLastRoll)
                                    : xpDoublerPending
                                        ? 2
                                        : (luckyDiceLastRoll ?? 1)}!
                            </motion.div>
                        )}
                    </div>

                    {feedback.type !== 'success' && !isQuestionWritingType && question.type !== 'matching' && question.type !== 'reading-highlight' && (
                        <div className="bg-slate-50 p-5 rounded-3xl mb-6 border border-slate-100">
                            <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">الإجابة الصحيحة</div>
                            <div className="text-xl font-bold text-emerald-600 dir-rtl">{question.correctAnswer}</div>
                        </div>
                    )}

                    <div className="flex items-center justify-center gap-3 text-slate-400 text-sm font-bold animate-pulse">
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>التالي...</span>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizCard;
