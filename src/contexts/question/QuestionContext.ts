// src/contexts/question/QuestionContext.ts
// Định nghĩa QuestionContextType, tạo QuestionContext bằng createContext,
//  và export custom hook useQuestions.
// File này định nghĩa kiểu của context và tạo context.
import { createContext, useContext } from 'react';
import type { Question, UserConfig } from '../../models/Question';
import type { BloomLevel } from '../../models/BloomLevel'; // Chỉ cần type

// --- GIAO DIỆN (INTERFACES) CHO CONTEXT ---
export interface QuestionContextType {
  allQuestions: Question[];
  filteredQuestions: Question[];
  currentQuestion: Question | null;
  currentQuestionIndex: number;
  userConfig: UserConfig;
  isLoading: boolean;
  error: string | null;

  addQuestion: (question: Question) => void;
  updateQuestion: (id: string, updatedQuestion: Question) => void;
  deleteQuestionById: (id: string) => void;
  rateQuestion: (id: string, rating: number) => void;
  loadQuestionsFromFile: (file: File) => Promise<number>;
  loadExampleQuestions: () => Promise<number>;
  setUserConfig: (config: Partial<UserConfig>) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;

  getUniqueBloomLevels: () => BloomLevel[];
  getUniqueQTypes: (selectedBloom?: BloomLevel | '') => string[];
  getQuestionById: (id: string) => Question | undefined;
}

export const QuestionContext = createContext<QuestionContextType | undefined>(undefined);

export const useQuestions = (): QuestionContextType => {
  const context = useContext(QuestionContext);
  if (context === undefined) {
    throw new Error('useQuestions must be used within a QuestionProvider');
  }
  return context;
};