// src/contexts/question/questionState.ts
// Định nghĩa QuestionState, QuestionAction, createInitialState, và questionReducer.
// File này sẽ chứa logic cốt lõi của state và reducer.

import type { Question, UserConfig } from '../../models/Question';
import { applyFilters } from '../../utils/questionUtils'; // Import từ utils

// --- STATE INTERFACE ---
export interface QuestionState {
  allQuestions: Question[];
  filteredQuestions: Question[];
  currentQuestionIndex: number;
  userConfig: UserConfig;
  isLoading: boolean;
  error: string | null;
  _sourceInfo?: string;
}

// --- ACTION TYPES ---
export type QuestionAction =
  | { type: 'INITIALIZE_QUESTIONS'; payload: { questions: Question[]; source: string } }
  | { type: 'LOAD_QUESTIONS_START'; payload: { source: string } }
  | { type: 'LOAD_QUESTIONS_SUCCESS'; payload: { questions: Question[]; source: string } }
  | { type: 'LOAD_QUESTIONS_ERROR'; payload: { error: string; source: string } }
  | { type: 'ADD_QUESTION'; payload: Question }
  | { type: 'UPDATE_QUESTION'; payload: { id: string; updatedQuestion: Question } }
  | { type: 'DELETE_QUESTION_BY_ID'; payload: string }
  | { type: 'RATE_QUESTION'; payload: { id: string; rating: number } }
  | { type: 'SET_USER_CONFIG'; payload: Partial<UserConfig> }
  | { type: 'GO_TO_QUESTION'; payload: number }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREV_QUESTION' };

// --- INITIAL STATE FACTORY ---
export const createInitialState = (initialQuestionsProp: Question[] = []): QuestionState => {
  // Quan trọng: Đảm bảo initialQuestionsProp được normalize *trước* khi truyền vào đây
  // Hoặc normalize nó ở đây nếu bạn muốn. Để nhất quán, normalize ở QuestionProvider.
  const initialUserConfig: UserConfig = {
    bloomLevel: '',
    questionType: '',
    numQuestions: 10,
  };
  // Giả sử initialQuestionsProp đã được normalize
  const initialFiltered = applyFilters(initialQuestionsProp, initialUserConfig);

  return {
    allQuestions: initialQuestionsProp,
    filteredQuestions: initialFiltered,
    currentQuestionIndex: initialFiltered.length > 0 ? 0 : -1,
    userConfig: initialUserConfig,
    isLoading: false,
    error: null,
    _sourceInfo: initialQuestionsProp.length > 0 ? 'prop' : 'empty-default',
  };
};

// --- REDUCER FUNCTION ---
export const questionReducer = (state: QuestionState, action: QuestionAction): QuestionState => {
  // (Dán toàn bộ code của hàm questionReducer bạn đã có ở đây)
  // ... (Toàn bộ switch case của questionReducer) ...
  switch (action.type) {
    case 'INITIALIZE_QUESTIONS':
    case 'LOAD_QUESTIONS_SUCCESS': {
      const { questions, source } = action.payload;
      const newFiltered = applyFilters(questions, state.userConfig);
      return {
        ...state,
        allQuestions: questions,
        filteredQuestions: newFiltered,
        currentQuestionIndex: newFiltered.length > 0 ? 0 : -1,
        isLoading: false,
        error: null,
        _sourceInfo: source,
      };
    }
    case 'LOAD_QUESTIONS_START':
      return {
        ...state,
        isLoading: true,
        error: null,
        _sourceInfo: action.payload.source,
      };
    case 'LOAD_QUESTIONS_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
        allQuestions: [],
        filteredQuestions: [],
        currentQuestionIndex: -1,
        _sourceInfo: action.payload.source,
      };
    case 'ADD_QUESTION': {
      const newQuestion = action.payload;
      const newAllQuestions = [...state.allQuestions, newQuestion];
      const newFiltered = applyFilters(newAllQuestions, state.userConfig);

      let newIndex = state.currentQuestionIndex;
      const currentQId = state.currentQuestionIndex !== -1 ? state.filteredQuestions[state.currentQuestionIndex]?.id : null;

      if (currentQId && newFiltered.some(q => q.id === currentQId)) {
          newIndex = newFiltered.findIndex(q => q.id === currentQId);
      } else if (newFiltered.length > 0 && state.currentQuestionIndex === -1) {
          newIndex = 0;
      } else if (newFiltered.length === 0) {
          newIndex = -1;
      }
      // Bạn có thể thêm logic nhảy tới câu hỏi mới được thêm nếu muốn
      // const addedQuestionInFilterIndex = newFiltered.findIndex(q => q.id === newQuestion.id);
      // if (addedQuestionInFilterIndex !== -1 && state.filteredQuestions.length === 0) { // Chỉ nhảy nếu trước đó rỗng
      //   newIndex = addedQuestionInFilterIndex;
      // }

      return {
        ...state,
        allQuestions: newAllQuestions,
        filteredQuestions: newFiltered,
        currentQuestionIndex: newIndex,
      };
    }
    case 'UPDATE_QUESTION': {
      const { id, updatedQuestion } = action.payload;
      const newAllQuestions = state.allQuestions.map(q => (q.id === id ? updatedQuestion : q));
      const newFiltered = applyFilters(newAllQuestions, state.userConfig); // applyFilters từ utils

      let newIndex = state.currentQuestionIndex;
      const currentQId = state.currentQuestionIndex !== -1 ? state.filteredQuestions[state.currentQuestionIndex]?.id : null;
        
      // Logic xác định newIndex (giữ nguyên hoặc điều chỉnh nếu cần)
      if (newFiltered.length > 0) {
          if (currentQId && newFiltered.some(q => q.id === currentQId)) {
              newIndex = newFiltered.findIndex(q => q.id === currentQId);
          } else if (id === currentQId && !newFiltered.some(q => q.id === id)) {
              newIndex = 0;
          } else {
              newIndex = 0;
          }
      } else {
          newIndex = -1;
      }

      return {
        ...state,
        allQuestions: newAllQuestions,
        filteredQuestions: newFiltered,
        currentQuestionIndex: newIndex,
      };
    }
    case 'DELETE_QUESTION_BY_ID': {
      const idToDelete = action.payload;
      const originalCurrentIndex = state.currentQuestionIndex;
      const originalFilteredQuestions = [...state.filteredQuestions];

      const newAllQuestions = state.allQuestions.filter(q => q.id !== idToDelete);
      const newFiltered = applyFilters(newAllQuestions, state.userConfig);

      let newIndex = -1;

      if (newFiltered.length === 0) {
        newIndex = -1;
      } else {
        const deletedQuestionWasCurrent = originalCurrentIndex !== -1 && originalFilteredQuestions[originalCurrentIndex]?.id === idToDelete;

        if (deletedQuestionWasCurrent) {
          if (originalCurrentIndex < newFiltered.length) {
            newIndex = originalCurrentIndex;
          } else {
            newIndex = newFiltered.length - 1;
          }
        } else {
          if (originalCurrentIndex !== -1) {
            const currentQuestionId = originalFilteredQuestions[originalCurrentIndex]?.id;
            if (currentQuestionId) {
                const foundIndexInNewFiltered = newFiltered.findIndex(q => q.id === currentQuestionId);
                newIndex = (foundIndexInNewFiltered !== -1) ? foundIndexInNewFiltered : (newFiltered.length > 0 ? 0 : -1);
            } else {
                newIndex = newFiltered.length > 0 ? 0 : -1;
            }
          } else {
            newIndex = 0;
          }
        }
      }

      return {
        ...state,
        allQuestions: newAllQuestions,
        filteredQuestions: newFiltered,
        currentQuestionIndex: newIndex,
      };
    }
    case 'RATE_QUESTION': {
      const { id, rating } = action.payload;
      return {
        ...state,
        allQuestions: state.allQuestions.map(q => (q.id === id ? { ...q, rating } : q)),
        filteredQuestions: state.filteredQuestions.map(q => (q.id === id ? { ...q, rating } : q)),
      };
    }
    case 'SET_USER_CONFIG': {
      const newUserConfig = { ...state.userConfig, ...action.payload };
      const newFiltered = applyFilters(state.allQuestions, newUserConfig);
      return {
        ...state,
        userConfig: newUserConfig,
        filteredQuestions: newFiltered,
        currentQuestionIndex: newFiltered.length > 0 ? 0 : -1,
      };
    }
    case 'GO_TO_QUESTION': {
      const newIndex = action.payload;
      if (newIndex >= 0 && newIndex < state.filteredQuestions.length) {
        return { ...state, currentQuestionIndex: newIndex };
      }
      if (state.filteredQuestions.length === 0 && newIndex !== -1) {
          return { ...state, currentQuestionIndex: -1 };
      }
      return state;
    }
    case 'NEXT_QUESTION':
      if (state.currentQuestionIndex < state.filteredQuestions.length - 1) {
        return { ...state, currentQuestionIndex: state.currentQuestionIndex + 1 };
      }
      return state;
    case 'PREV_QUESTION':
      if (state.currentQuestionIndex > 0) {
        return { ...state, currentQuestionIndex: state.currentQuestionIndex - 1 };
      }
      return state;
    default:
      throw new Error(`Unhandled action type in questionReducer`);
  }
};