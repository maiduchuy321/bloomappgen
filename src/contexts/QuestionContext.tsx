// src/contexts/QuestionContext.tsx 
import React, { createContext, useState, useEffect, ReactNode, useCallback, useContext } from 'react';
// Import models
import {
  Question,
  QuestionOption,
  UserConfig,
  CourseContext
} from '../models/Question';
import { questionTypesByBloom, QuestionType } from '../models/QuestionType';
import { BloomLevel } from '../models/BloomLevel';

// --- CONSTANTS ---
const EXAMPLE_QUESTIONS_PATH = '../data_example/questions_Exemple_Bloom_Level.json';

// --- INTERFACES FOR CONTEXT ---
interface QuestionContextType {
  allQuestions: Question[];
  filteredQuestions: Question[];
  currentQuestion: Question | null;
  currentQuestionIndex: number;
  userConfig: UserConfig;
  isLoading: boolean;
  error: string | null;
  
  // Base CRUD operations
  addQuestion: (question: Question) => void;
  updateQuestion: (id: string, updatedQuestion: Question) => void;
  deleteQuestion: (id: string) => void;
  deleteQuestionById: (id: string) => boolean;
  
  // Rating functionality
  rateQuestion: (id: string, rating: number) => void;
  
  // File operations
  loadQuestionsFromFile: (file: File) => Promise<number>;
  loadExampleQuestions: () => Promise<number>;
  
  // Navigation and filtering
  setUserConfig: (config: Partial<UserConfig>) => void;
  filterQuestions: (bloomLevel?: BloomLevel | '', questionType?: string) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  
  // Utilities
  getUniqueBloomLevels: () => BloomLevel[];
  getUniqueQTypes: (selectedBloom?: BloomLevel | '') => string[];
  getQuestionById: (id: string) => Question | undefined;
}

export const QuestionContext = createContext<QuestionContextType | undefined>(undefined);

// --- HELPER FUNCTIONS FOR NORMALIZATION ---
function normalizeOptionsArray(optionsData: any, correctAnswerKey?: string): QuestionOption[] {
  const options: QuestionOption[] = [];
  if (typeof optionsData === 'object' && optionsData !== null && !Array.isArray(optionsData)) {
    // Convert from object { A: "text", B: "text" } to QuestionOption[]
    Object.entries(optionsData).forEach(([key, value]) => {
      if (typeof value === 'string') {
        options.push({ id: key, text: value });
      }
    });
  } else if (Array.isArray(optionsData)) {
    // If array of strings ["text A", "text B"]
    optionsData.forEach((optText, i) => {
      if (typeof optText === 'string') {
        const letter = String.fromCharCode(65 + i); // A, B, C...
        options.push({ id: letter, text: optText });
      }
    });
  }
  return options;
}

function normalizeQuestion(rawQ: any, index: number): Question {
  const correctAnswerId = String(rawQ.correct_answer || rawQ.correctAnswer || '');

  const bloomLevel = (rawQ.bloom_level || null) as BloomLevel | null;
  let qTypeName = rawQ.q_type || rawQ.Question_type || rawQ.question_type || '';
  
  if (bloomLevel && qTypeName) {
    const qTypesForBloom = questionTypesByBloom[bloomLevel];
    const foundQType = qTypesForBloom?.find(qt => qt.name === qTypeName || qt.id === qTypeName);
    if (foundQType) {
      qTypeName = foundQType.name; // Normalize to Name
    }
  }

  const normalized: Question = {
    id: String(rawQ.number !== undefined && !isNaN(parseInt(rawQ.number)) ? rawQ.number : (rawQ.id || `gen_${Date.now()}_${index}`)),
    number: parseInt(String(rawQ.id || rawQ.number || index + 1), 10),
    text: rawQ.question || rawQ.text || '[Chưa có nội dung câu hỏi]',
    options: normalizeOptionsArray(rawQ.options, correctAnswerId),
    correctAnswerId: correctAnswerId,
    bloomLevel: bloomLevel || BloomLevel.Remember,
    questionType: qTypeName,
    explanation: rawQ.explanation,
    context: {
      courseTitle: rawQ.course_title || rawQ.courseTitle || 'Chưa có tiêu đề khóa học',
      courseDescription: rawQ.course_descrisption || rawQ.courseDescription || 'Chưa có mô tả khóa học',
      moduleNumber: rawQ.Module || rawQ.moduleNumber || rawQ.module || 'Chưa có module',
    },
    tokensInput: rawQ.tokensIn !== undefined ? parseInt(rawQ.tokensIn) : undefined,
    tokensOutput: rawQ.tokensOut !== undefined ? parseInt(rawQ.tokensOut) : undefined,
    isBookmarked: localStorage.getItem(`bookmark_${String(rawQ.id || rawQ.number)}`) === 'true' || false,
    rating: rawQ.rating !== undefined ? parseInt(rawQ.rating) : 0, // Add rating support
  };
  return normalized;
}

// --- PROVIDER COMPONENT ---
interface QuestionProviderProps {
  children: ReactNode;
  initialQuestions?: Question[];
}

export const QuestionProvider: React.FC<QuestionProviderProps> = ({ 
  children, 
  initialQuestions = [] 
}) => {
  const [allQuestions, setAllQuestions] = useState<Question[]>(initialQuestions);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>(initialQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(initialQuestions.length > 0 ? 0 : -1);
  const [userConfig, setUserConfigState] = useState<UserConfig>({
    bloomLevel: '',
    questionType: '',
    numQuestions: 10,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Process and set questions (internal function)
  const processAndSetQuestionsInternal = useCallback((rawData: any[], source: string) => {
    setIsLoading(true);
    try {
      const normalized = rawData.map((q, i) => normalizeQuestion(q, i));
      setAllQuestions(normalized);
      
      // Apply initial or current filter after loading
      let tempFiltered = [...normalized];
      if (userConfig.bloomLevel) {
        tempFiltered = tempFiltered.filter(q => q.bloomLevel === userConfig.bloomLevel);
      }
      if (userConfig.questionType) {
        tempFiltered = tempFiltered.filter(q => q.questionType === userConfig.questionType);
      }
      
      setFilteredQuestions(tempFiltered);
      setCurrentQuestionIndex(tempFiltered.length > 0 ? 0 : -1);
      setError(null);
      console.log(`[QuestionContext] Đã xử lý ${normalized.length} câu hỏi từ nguồn '${source}'.`);
      return normalized.length;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Lỗi không xác định khi xử lý câu hỏi.";
      setError(`Lỗi xử lý dữ liệu từ '${source}': ${errorMessage}`);
      console.error(`[QuestionContext] Lỗi xử lý dữ liệu từ '${source}':`, e);
      setAllQuestions([]);
      setFilteredQuestions([]);
      setCurrentQuestionIndex(-1);
      return 0;
    } finally {
      setIsLoading(false);
    }
  }, [userConfig.bloomLevel, userConfig.questionType]);

  // CRUD operations
  const addQuestion = (question: Question) => {
    setAllQuestions(prev => [...prev, question]);
    
    // Update filtered questions if the new question matches current filters
    let shouldAdd = true;
    if (userConfig.bloomLevel && question.bloomLevel !== userConfig.bloomLevel) {
      shouldAdd = false;
    }
    if (userConfig.questionType && question.questionType !== userConfig.questionType) {
      shouldAdd = false;
    }
    
    if (shouldAdd) {
      setFilteredQuestions(prev => [...prev, question]);
      // If no question was selected before, select the new one
      if (currentQuestionIndex === -1) {
        setCurrentQuestionIndex(filteredQuestions.length);
      }
    }
  };

  const updateQuestion = (id: string, updatedQuestion: Question) => {
    setAllQuestions(prev => 
      prev.map(q => q.id === id ? updatedQuestion : q)
    );
    
    // Also update in filtered questions if present
    setFilteredQuestions(prev => {
      const isInFiltered = prev.some(q => q.id === id);
      
      // If question is in filtered list, update it
      if (isInFiltered) {
        return prev.map(q => q.id === id ? updatedQuestion : q);
      }
      
      // If question was not in filtered list but now matches filters, add it
      const matchesFilters = (
        (!userConfig.bloomLevel || updatedQuestion.bloomLevel === userConfig.bloomLevel) &&
        (!userConfig.questionType || updatedQuestion.questionType === userConfig.questionType)
      );
      
      if (matchesFilters) {
        return [...prev, updatedQuestion];
      }
      
      return prev;
    });
  };

  const deleteQuestion = (id: string) => {
    setAllQuestions(prev => prev.filter(q => q.id !== id));
    
    // Also delete from filtered questions
    const wasInFiltered = filteredQuestions.some(q => q.id === id);
    if (wasInFiltered) {
      setFilteredQuestions(prev => {
        const newFiltered = prev.filter(q => q.id !== id);
        
        // Adjust current index if needed
        if (currentQuestion && currentQuestion.id === id) {
          setCurrentQuestionIndex(newFiltered.length > 0 ? 
            Math.min(currentQuestionIndex, newFiltered.length - 1) : -1);
        }
        
        return newFiltered;
      });
    }
  };

  const deleteQuestionById = (id: string): boolean => {
    const initialLength = allQuestions.length;
    const newAllQuestions = allQuestions.filter(q => q.id !== id);
    
    if (newAllQuestions.length < initialLength) {
      setAllQuestions(newAllQuestions);
      
      // Update filteredQuestions and currentQuestionIndex too
      const newFiltered = filteredQuestions.filter(q => q.id !== id);
      setFilteredQuestions(newFiltered);
      
      if (currentQuestion && currentQuestion.id === id) { // If currently viewed question is deleted
        setCurrentQuestionIndex(newFiltered.length > 0 ? 
          Math.min(currentQuestionIndex, newFiltered.length - 1) : -1);
      } else {
        // Update index if needed, e.g., if deleted question was before current
        const oldIndexInFiltered = filteredQuestions.findIndex(q => q.id === currentQuestion?.id);
        if (oldIndexInFiltered !== -1) {
          const newCurrentIndex = newFiltered.findIndex(q => q.id === currentQuestion?.id);
          setCurrentQuestionIndex(newCurrentIndex);
        } else {
          setCurrentQuestionIndex(newFiltered.length > 0 ? 0 : -1);
        }
      }
      return true;
    }
    return false;
  };

  // Rating functionality
  const rateQuestion = (id: string, rating: number) => {
    const updateWithRating = (qs: Question[]) =>
      qs.map(q => q.id === id ? { ...q, rating } : q);
    
    setAllQuestions(updateWithRating);
    setFilteredQuestions(updateWithRating);
    
    // Could save rating to localStorage if needed
    // localStorage.setItem(`rating_${id}`, String(rating));
  };

  // Bookmark functionality
  const bookmarkQuestion = (id: string, isBookmarked: boolean) => {
    const updateBookmark = (qs: Question[]) =>
      qs.map(q => (q.id === id ? { ...q, isBookmarked } : q));

    setAllQuestions(updateBookmark);
    setFilteredQuestions(updateBookmark);
    localStorage.setItem(`bookmark_${id}`, String(isBookmarked));
  };

  // File operations
  const loadQuestionsFromFile = async (file: File): Promise<number> => {
    setIsLoading(true);
    setError(null);
    
    return new Promise<number>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const fileContent = event.target?.result as string;
          const jsonData = JSON.parse(fileContent);
          
          if (!Array.isArray(jsonData)) {
            throw new Error("Dữ liệu JSON không phải là một mảng.");
          }
          
          const count = processAndSetQuestionsInternal(jsonData, `file-${file.name}`);
          resolve(count);
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : "Lỗi không xác định.";
          setError(`Lỗi parse file JSON: ${errorMessage}`);
          console.error("[QuestionContext] Lỗi parse file JSON:", e);
          setIsLoading(false);
          reject(e);
        }
      };
      
      reader.onerror = () => {
        setError("Lỗi đọc file.");
        console.error("[QuestionContext] Lỗi đọc file:", reader.error);
        setIsLoading(false);
        reject(new Error("Lỗi đọc file"));
      };
      
      reader.readAsText(file);
    });
  };

  const loadExampleQuestions = useCallback(async (): Promise<number> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(EXAMPLE_QUESTIONS_PATH);
      
      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status} khi tải file ví dụ.`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error("Dữ liệu JSON ví dụ không phải là một mảng.");
      }
      
      return processAndSetQuestionsInternal(data, 'example-on-demand');
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Lỗi không xác định.";
      setError(`Lỗi tải dữ liệu mẫu: ${errorMessage}`);
      console.error("[QuestionContext] Lỗi tải dữ liệu mẫu:", e);
      processAndSetQuestionsInternal([], 'example-error');
      setIsLoading(false);
      throw e;
    }
  }, [processAndSetQuestionsInternal]);

  // Navigation and filtering
  const setUserConfig = (config: Partial<UserConfig>) => {
    setUserConfigState(prev => ({ ...prev, ...config }));
  };

  const filterQuestions = useCallback((bloomLevel?: BloomLevel | '', questionType?: string) => {
    let newFiltered = [...allQuestions];
    
    if (bloomLevel) {
      newFiltered = newFiltered.filter(q => q.bloomLevel === bloomLevel);
    }
    
    if (questionType) {
      newFiltered = newFiltered.filter(q => q.questionType === questionType);
    }
    
    setFilteredQuestions(newFiltered);
    setCurrentQuestionIndex(newFiltered.length > 0 ? 0 : -1);
  }, [allQuestions]);

  useEffect(() => {
    // When userConfig changes, reapply filters
    filterQuestions(userConfig.bloomLevel, userConfig.questionType);
  }, [userConfig, filterQuestions]);

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < filteredQuestions.length) {
      setCurrentQuestionIndex(index);
    } else if (filteredQuestions.length === 0) {
      setCurrentQuestionIndex(-1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Utilities
  const getUniqueBloomLevels = useCallback((): BloomLevel[] => {
    const levels = new Set(allQuestions.map(q => q.bloomLevel).filter(Boolean as any as (level: BloomLevel | null) => level is BloomLevel));
    return Array.from(levels).sort();
  }, [allQuestions]);

  const getUniqueQTypes = useCallback((selectedBloom?: BloomLevel | ''): string[] => {
    let relevantQTypes: QuestionType[] = [];
    
    if (selectedBloom && questionTypesByBloom[selectedBloom]) {
      relevantQTypes = questionTypesByBloom[selectedBloom];
    } else if (!selectedBloom) {
      const allQTypeIdsFromData = new Set(allQuestions.map(q => q.questionType).filter(Boolean));
      return Array.from(allQTypeIdsFromData).sort();
    }
    
    return relevantQTypes.map(qt => qt.id).sort();
  }, [allQuestions]);

  const getQuestionById = useCallback((id: string): Question | undefined => {
    return allQuestions.find(q => q.id === id);
  }, [allQuestions]);

  const currentQuestion = (currentQuestionIndex >= 0 && currentQuestionIndex < filteredQuestions.length)
    ? filteredQuestions[currentQuestionIndex]
    : null;

  return (
    <QuestionContext.Provider value={{
      allQuestions,
      filteredQuestions,
      currentQuestion,
      currentQuestionIndex,
      userConfig,
      isLoading,
      error,
      
      // CRUD operations
      addQuestion,
      updateQuestion,
      deleteQuestion,
      deleteQuestionById,
      
      // Rating functionality
      rateQuestion,
      
      // File operations
      loadQuestionsFromFile,
      loadExampleQuestions,
      
      // Navigation and filtering
      setUserConfig,
      filterQuestions,
      goToQuestion,
      nextQuestion,
      prevQuestion,
      
      // Utilities
      getUniqueBloomLevels,
      getUniqueQTypes,
      getQuestionById,
      
      // Making bookmarkQuestion available too
      bookmarkQuestion
    }}>
      {children}
    </QuestionContext.Provider>
  );
};

// Hook to use QuestionContext
export const useQuestions = () => {
  const context = useContext(QuestionContext);
  if (context === undefined) {
    throw new Error('useQuestions must be used within a QuestionProvider');
  }
  return context;
};