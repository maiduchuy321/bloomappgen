// src/contexts/question/QuestionProvider.tsx
// Component QuestionProvider chính, sử dụng useReducer từ questionState.ts 
// và cung cấp value cho QuestionContext.

import React, { useReducer, useCallback, type ReactNode } from 'react';
import { QuestionContext, type QuestionContextType } from './QuestionContext';
import { questionReducer, createInitialState } from './questionState';
import { normalizeQuestion } from '../../utils/questionUtils'; // Để normalize dữ liệu
import type { Question, UserConfig } from '../../models/Question';
import { BloomLevel } from '../../models/BloomLevel';
import { questionTypesByBloom } from '../../models/QuestionType'; // Cần cho getUniqueQTypes


// --- HẰNG SỐ (CONSTANTS) ---
const EXAMPLE_QUESTIONS_PATH = '../../data_example/questions_Exemple_Bloom_Level.json'; // Điều chỉnh đường dẫn nếu cần

interface QuestionProviderProps {
  children: ReactNode;
  initialQuestions?: any[]; // Nhận raw questions
}

export const QuestionProvider: React.FC<QuestionProviderProps> = ({
  children,
  initialQuestions: initialRawQuestions = [],
}) => {
  // Normalize initial questions trước khi đưa vào reducer
  const normalizedInitialQuestions = initialRawQuestions.map((q, i) => normalizeQuestion(q, i));
  const [state, dispatch] = useReducer(questionReducer, createInitialState(normalizedInitialQuestions));

  // Các hàm dispatch actions
  const addQuestion = useCallback((rawQuestion: any) => { // Nhận raw question từ UI
    const question = normalizeQuestion(rawQuestion, state.allQuestions.length); // Normalize trước khi dispatch
    dispatch({ type: 'ADD_QUESTION', payload: question });
  }, [state.allQuestions.length]); // dispatch là stable

  const updateQuestion = useCallback((id: string, updatedQuestion: any) => { // Nhận raw
    console.log('[QuestionProvider] updatedQuestion for dispatch:', JSON.parse(JSON.stringify(updatedQuestion)));
    dispatch({ type: 'UPDATE_QUESTION', payload: { id, updatedQuestion } });
  }, []);

  const deleteQuestion = useCallback((id: string) => {
    dispatch({ type: 'DELETE_QUESTION', payload: id });
  }, []);

  const rateQuestion = useCallback((id: string, rating: number) => {
    console.log('[QuestionProvider] rateQuestion for dispatch:', {
        id,
        rating: JSON.parse(JSON.stringify(rating))
    });
    dispatch({ type: 'RATE_QUESTION', payload: { id, rating } });
  }, []);

  const setUserConfig = useCallback((config: Partial<UserConfig>) => {
    dispatch({ type: 'SET_USER_CONFIG', payload: config });
  }, []);

  const goToQuestion = useCallback((index: number) => {
    dispatch({ type: 'GO_TO_QUESTION', payload: index });
  }, []);

  const nextQuestion = useCallback(() => {
    dispatch({ type: 'NEXT_QUESTION' });
  }, []);

  const prevQuestion = useCallback(() => {
    dispatch({ type: 'PREV_QUESTION' });
  }, []);

  const loadQuestionsFromFile = useCallback(async (file: File): Promise<number> => {
    const source = `file-${file.name}`;
    dispatch({ type: 'LOAD_QUESTIONS_START', payload: { source } });
    return new Promise<number>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const fileContent = event.target?.result as string;
          const jsonData = JSON.parse(fileContent);
          if (!Array.isArray(jsonData)) throw new Error('Dữ liệu JSON không phải là một mảng.');
          const normalized = jsonData.map((q, i) => normalizeQuestion(q, i));
          dispatch({ type: 'LOAD_QUESTIONS_SUCCESS', payload: { questions: normalized, source } });
          resolve(normalized.length);
        } catch (e) {
          const errorMsg = e instanceof Error ? e.message : 'Lỗi không xác định khi parse file.';
          dispatch({ type: 'LOAD_QUESTIONS_ERROR', payload: { error: errorMsg, source } });
          reject(e);
        }
      };
      reader.onerror = () => {
        const errorMsg = 'Lỗi đọc file.';
        dispatch({ type: 'LOAD_QUESTIONS_ERROR', payload: { error: errorMsg, source } });
        reject(new Error(errorMsg));
      };
      reader.readAsText(file);
    });
  }, []);

  const loadExampleQuestions = useCallback(async (): Promise<number> => {
    const source = 'example-questions';
    dispatch({ type: 'LOAD_QUESTIONS_START', payload: { source } });
    try {
      const response = await fetch(EXAMPLE_QUESTIONS_PATH);
      if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status} khi tải file ví dụ.`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Dữ liệu JSON ví dụ không phải là một mảng.');
      const normalized = data.map((q, i) => normalizeQuestion(q, i));
      dispatch({ type: 'LOAD_QUESTIONS_SUCCESS', payload: { questions: normalized, source } });
      return normalized.length;
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Lỗi không xác định khi tải ví dụ.';
      dispatch({ type: 'LOAD_QUESTIONS_ERROR', payload: { error: errorMsg, source } });
      throw e;
    }
  }, []);

  // Các hàm tiện ích
  const getUniqueBloomLevels = useCallback((): BloomLevel[] => {
    const levels = new Set(state.allQuestions.map(q => q.bloomLevel).filter(Boolean as any as (level: BloomLevel | null) => level is BloomLevel));
    return Array.from(levels).sort();
  }, [state.allQuestions]);

  const getUniqueQTypes = useCallback((selectedBloom?: BloomLevel | ''): string[] => {
    if (selectedBloom && questionTypesByBloom[selectedBloom]) {
      return questionTypesByBloom[selectedBloom].map(qt => qt.id).sort();
    }
    const allQTypeNames = new Set(state.allQuestions.map(q => q.questionType).filter(Boolean));
    return Array.from(allQTypeNames as Set<string>).sort();
  }, [state.allQuestions]);

  const getQuestionById = useCallback((id: string): Question | undefined => {
    return state.allQuestions.find(q => q.id === id);
  }, [state.allQuestions]);

  const currentQuestion = (state.currentQuestionIndex >= 0 && state.currentQuestionIndex < state.filteredQuestions.length)
    ? state.filteredQuestions[state.currentQuestionIndex]
    : null;

  const contextValue: QuestionContextType = {
    allQuestions: state.allQuestions,
    filteredQuestions: state.filteredQuestions,
    currentQuestion,
    currentQuestionIndex: state.currentQuestionIndex,
    userConfig: state.userConfig,
    isLoading: state.isLoading,
    error: state.error,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    rateQuestion,
    loadQuestionsFromFile,
    loadExampleQuestions,
    setUserConfig,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    getUniqueBloomLevels,
    getUniqueQTypes,
    getQuestionById,
  };

  return (
    <QuestionContext.Provider value={contextValue}>
      {children}
    </QuestionContext.Provider>
  );
};