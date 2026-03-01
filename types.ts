
export type QuestionType = 
  | 'multiple-choice' 
  | 'input' 
  | 'reorder' 
  | 'matching'
  | 'reading-highlight'      // Select text from passage
  | 'reading-word'           // Click specific word
  | 'reading-list-extraction' // Write answers based on rubric
  | 'reading-ai-opinion';     // Write open-ended answer

export interface Paragraph {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  subject: string;
  lesson: string;
  type: QuestionType; 
  questionText: string;
  options?: string[]; 
  correctAnswer: string; 
  pairs?: { left: string; right: string }[];
  points: number;
  hint: string;
  
  // Reading & Advanced Fields
  passage?: Paragraph[]; 
  targetParagraphId?: string;
  
  // For List Extraction & AI Opinion
  rubric?: string[];       // Keywords to look for
  requiredCount?: number;  // How many rubric items needed
  minWords?: number;       // Minimum word count for opinion
}

export type GameState = 'start' | 'topic-select' | 'topic-details' | 'streak' | 'playing' | 'break' | 'pre-review' | 'reviewing' | 'end';

export interface QuizState {
  currentQuestionIndex: number;
  score: number;
  gameState: GameState;
  history: {
    questionId: number;
    isCorrect: boolean;
    pointsAwarded: number;
  }[];
}
