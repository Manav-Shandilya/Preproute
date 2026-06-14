import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Question, QuestionFormValues, CreateQuestionRequest } from '../types';
import { questionService } from '../services/questionService';
import { parseApiError } from '../utils/errorHandler';

// --- State & Action Types ---

export interface QuestionState {
  questions: QuestionFormValues[];
  savedQuestions: Question[];
  currentIndex: number;
  confirmedIndices: Set<number>;
  isLoading: boolean;
  error: string | null;
}

export type QuestionAction =
  | { type: 'SET_CURRENT_INDEX'; payload: number }
  | { type: 'UPDATE_QUESTION'; payload: { index: number; data: Partial<QuestionFormValues> } }
  | { type: 'ADD_QUESTION' }
  | { type: 'INITIALIZE_QUESTIONS'; payload: number }
  | { type: 'LOAD_EXISTING_QUESTIONS'; payload: { questions: QuestionFormValues[]; totalSlots: number } }
  | { type: 'IMPORT_FROM_CSV'; payload: QuestionFormValues[] }
  | { type: 'DELETE_CURRENT_EDITS'; payload: number }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS'; payload: Question[] }
  | { type: 'SAVE_FAILURE'; payload: string }
  | { type: 'FETCH_QUESTIONS_SUCCESS'; payload: Question[] }
  | { type: 'CLEAR_QUESTIONS' };

interface QuestionContextValue {
  state: QuestionState;
  dispatch: React.Dispatch<QuestionAction>;
  setCurrentIndex: (index: number) => void;
  updateQuestion: (index: number, data: Partial<QuestionFormValues>) => void;
  addQuestion: () => void;
  initializeQuestions: (count: number) => void;
  loadExistingQuestions: (questionIds: string[], totalSlots: number) => Promise<void>;
  importFromCSV: (questions: QuestionFormValues[]) => void;
  deleteCurrentEdits: () => void;
  saveAllQuestions: (testId: string, subjectId: string) => Promise<string[]>;
  fetchQuestions: (questionIds: string[]) => Promise<void>;
  isQuestionComplete: (index: number) => boolean;
  clearQuestions: () => void;
}

// --- Empty Question Template ---

const emptyQuestion: QuestionFormValues = {
  question: '',
  option1: '',
  option2: '',
  option3: '',
  option4: '',
  correct_option: 'option1',
};

// --- Initial State ---

const initialState: QuestionState = {
  questions: [{ ...emptyQuestion }],
  savedQuestions: [],
  currentIndex: 0,
  confirmedIndices: new Set<number>(),
  isLoading: false,
  error: null,
};

// --- Reducer ---

export function questionReducer(state: QuestionState, action: QuestionAction): QuestionState {
  switch (action.type) {
    case 'SET_CURRENT_INDEX': {
      // Mark the previous question as confirmed if it has content
      const prevIndex = state.currentIndex;
      const prevQuestion = state.questions[prevIndex];
      const newConfirmed = new Set(state.confirmedIndices);
      if (prevQuestion && prevQuestion.question.trim() !== '' &&
          prevQuestion.option1.trim() !== '' && prevQuestion.option2.trim() !== '' &&
          prevQuestion.option3.trim() !== '' && prevQuestion.option4.trim() !== '') {
        newConfirmed.add(prevIndex);
      }
      return { ...state, currentIndex: action.payload, confirmedIndices: newConfirmed };
    }

    case 'UPDATE_QUESTION':
      return {
        ...state,
        questions: state.questions.map((q, i) =>
          i === action.payload.index ? { ...q, ...action.payload.data } : q
        ),
      };

    case 'ADD_QUESTION':
      return {
        ...state,
        questions: [...state.questions, { ...emptyQuestion }],
        currentIndex: state.questions.length,
      };

    case 'INITIALIZE_QUESTIONS': {
      const count = action.payload;
      // Reset questions array to exactly the requested count
      const questions = Array.from(
        { length: count },
        () => ({ ...emptyQuestion })
      );
      return {
        ...state,
        questions,
        currentIndex: 0,
        confirmedIndices: new Set<number>(),
      };
    }

    case 'LOAD_EXISTING_QUESTIONS': {
      const { questions: existingQuestions, totalSlots } = action.payload;
      // Fill slots: existing questions first, then empty slots for remaining
      const filledQuestions: QuestionFormValues[] = [];
      const loadedConfirmed = new Set<number>();
      for (let i = 0; i < totalSlots; i++) {
        if (i < existingQuestions.length) {
          filledQuestions.push(existingQuestions[i]);
          loadedConfirmed.add(i);
        } else {
          filledQuestions.push({ ...emptyQuestion });
        }
      }
      return {
        ...state,
        questions: filledQuestions,
        currentIndex: 0,
        confirmedIndices: loadedConfirmed,
        isLoading: false,
      };
    }

    case 'IMPORT_FROM_CSV': {
      // Fill slots starting from currentIndex, overwriting empty or current slot
      const updatedQuestions = [...state.questions];
      let insertIndex = state.currentIndex;
      
      for (const csvQuestion of action.payload) {
        if (insertIndex < updatedQuestions.length) {
          updatedQuestions[insertIndex] = csvQuestion;
          insertIndex++;
        } else {
          // No more slots — stop importing
          break;
        }
      }

      // Mark CSV-imported slots as confirmed
      const csvConfirmed = new Set(state.confirmedIndices);
      updatedQuestions.forEach((q, i) => {
        if (q.question.trim() !== '' && q.option1.trim() !== '' &&
            q.option2.trim() !== '' && q.option3.trim() !== '' && q.option4.trim() !== '') {
          csvConfirmed.add(i);
        }
      });

      return {
        ...state,
        questions: updatedQuestions,
        currentIndex: state.currentIndex,
        confirmedIndices: csvConfirmed,
      };
    }

    case 'DELETE_CURRENT_EDITS':
      return {
        ...state,
        questions: state.questions.map((q, i) =>
          i === action.payload ? { ...emptyQuestion } : q
        ),
      };

    case 'SAVE_START':
      return { ...state, isLoading: true, error: null };

    case 'SAVE_SUCCESS':
      return {
        ...state,
        isLoading: false,
        savedQuestions: action.payload,
        error: null,
      };

    case 'SAVE_FAILURE':
      return { ...state, isLoading: false, error: action.payload };

    case 'FETCH_QUESTIONS_SUCCESS':
      return {
        ...state,
        isLoading: false,
        savedQuestions: action.payload,
        error: null,
      };

    case 'CLEAR_QUESTIONS':
      return { ...initialState, questions: [{ ...emptyQuestion }] };

    default:
      return state;
  }
}

// --- Context ---

const QuestionContext = createContext<QuestionContextValue | undefined>(undefined);

// --- Provider ---

export const QuestionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(questionReducer, initialState);

  const setCurrentIndex = useCallback((index: number): void => {
    dispatch({ type: 'SET_CURRENT_INDEX', payload: index });
  }, []);

  const updateQuestion = useCallback((index: number, data: Partial<QuestionFormValues>): void => {
    dispatch({ type: 'UPDATE_QUESTION', payload: { index, data } });
  }, []);

  const addQuestion = useCallback((): void => {
    dispatch({ type: 'ADD_QUESTION' });
  }, []);

  const initializeQuestions = useCallback((count: number): void => {
    dispatch({ type: 'INITIALIZE_QUESTIONS', payload: count });
  }, []);

  const loadExistingQuestions = useCallback(async (questionIds: string[], totalSlots: number): Promise<void> => {
    dispatch({ type: 'SAVE_START' });
    try {
      const response = await questionService.fetchBulk(questionIds);
      const fetchedQuestions = response.data.data;
      // Map Question objects to QuestionFormValues
      const formValues: QuestionFormValues[] = fetchedQuestions.map((q) => ({
        question: q.question || '',
        option1: q.option1 || '',
        option2: q.option2 || '',
        option3: q.option3 || '',
        option4: q.option4 || '',
        correct_option: q.correct_option || 'option1',
        explanation: q.explanation || undefined,
        difficulty: q.difficulty || undefined,
        topic_id: q.topic_id || undefined,
        sub_topic_id: q.sub_topic_id || undefined,
        media_url: q.media_url || undefined,
      }));
      dispatch({ type: 'LOAD_EXISTING_QUESTIONS', payload: { questions: formValues, totalSlots } });
    } catch (error: unknown) {
      const appError = parseApiError(error);
      dispatch({ type: 'SAVE_FAILURE', payload: appError.message });
      // Fallback: just initialize empty slots
      dispatch({ type: 'INITIALIZE_QUESTIONS', payload: totalSlots });
    }
  }, []);

  const importFromCSV = useCallback((questions: QuestionFormValues[]): void => {
    dispatch({ type: 'IMPORT_FROM_CSV', payload: questions });
  }, []);

  const deleteCurrentEdits = useCallback((): void => {
    dispatch({ type: 'DELETE_CURRENT_EDITS', payload: state.currentIndex });
  }, [state.currentIndex]);

  const saveAllQuestions = useCallback(async (testId: string, subjectId: string): Promise<string[]> => {
    dispatch({ type: 'SAVE_START' });
    try {
      const completeQuestions = state.questions.filter((q) => {
        return (
          q.question.trim() !== '' &&
          q.option1.trim() !== '' &&
          q.option2.trim() !== '' &&
          q.option3.trim() !== '' &&
          q.option4.trim() !== ''
        );
      });

      const requests: CreateQuestionRequest[] = completeQuestions.map((q) => ({
        type: 'mcq' as const,
        question: q.question,
        option1: q.option1,
        option2: q.option2,
        option3: q.option3,
        option4: q.option4,
        correct_option: q.correct_option,
        explanation: q.explanation,
        difficulty: q.difficulty,
        media_url: q.media_url,
        test_id: testId,
        subject: subjectId,
      }));

      const response = await questionService.bulkCreate({ questions: requests });
      const savedQuestions = response.data.data;
      dispatch({ type: 'SAVE_SUCCESS', payload: savedQuestions });
      return savedQuestions.map((q) => q.id);
    } catch (error: unknown) {
      const appError = parseApiError(error);
      dispatch({ type: 'SAVE_FAILURE', payload: appError.message });
      throw error;
    }
  }, [state.questions]);

  const fetchQuestions = useCallback(async (questionIds: string[]): Promise<void> => {
    dispatch({ type: 'SAVE_START' });
    try {
      const response = await questionService.fetchBulk(questionIds);
      dispatch({ type: 'FETCH_QUESTIONS_SUCCESS', payload: response.data.data });
    } catch (error: unknown) {
      const appError = parseApiError(error);
      dispatch({ type: 'SAVE_FAILURE', payload: appError.message });
    }
  }, []);

  const isQuestionComplete = useCallback((index: number): boolean => {
    const q = state.questions[index];
    if (!q) return false;
    return (
      q.question.trim() !== '' &&
      q.option1.trim() !== '' &&
      q.option2.trim() !== '' &&
      q.option3.trim() !== '' &&
      q.option4.trim() !== ''
    );
  }, [state.questions]);

  const clearQuestions = useCallback((): void => {
    dispatch({ type: 'CLEAR_QUESTIONS' });
  }, []);

  const value: QuestionContextValue = {
    state,
    dispatch,
    setCurrentIndex,
    updateQuestion,
    addQuestion,
    initializeQuestions,
    loadExistingQuestions,
    importFromCSV,
    deleteCurrentEdits,
    saveAllQuestions,
    fetchQuestions,
    isQuestionComplete,
    clearQuestions,
  };

  return <QuestionContext.Provider value={value}>{children}</QuestionContext.Provider>;
};

// --- Custom Hook ---

export function useQuestion(): QuestionContextValue {
  const context = useContext(QuestionContext);
  if (context === undefined) {
    throw new Error('useQuestion must be used within a QuestionProvider');
  }
  return context;
}
