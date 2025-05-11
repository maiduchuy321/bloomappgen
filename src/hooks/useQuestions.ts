// src/hooks/useQuestions.ts
import { useContext } from 'react';
import { QuestionContext } from '../contexts/QuestionContext';

export const useQuestions = () => {
  const context = useContext(QuestionContext);
  if (context === undefined) {
    throw new Error('useQuestions must be used within a QuestionProvider');
  }
  return context;
};