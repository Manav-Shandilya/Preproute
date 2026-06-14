import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Test, CreateTestRequest, UpdateTestRequest, PublishOptions } from '../types';
import { testService } from '../services/testService';
import { parseApiError } from '../utils/errorHandler';

// --- State & Action Types ---

export interface TestState {
  tests: Test[];
  currentTest: Test | null;
  isLoading: boolean;
  error: string | null;
}

export type TestAction =
  | { type: 'FETCH_TESTS_START' }
  | { type: 'FETCH_TESTS_SUCCESS'; payload: Test[] }
  | { type: 'FETCH_TESTS_FAILURE'; payload: string }
  | { type: 'FETCH_TEST_SUCCESS'; payload: Test }
  | { type: 'CREATE_TEST_SUCCESS'; payload: Test }
  | { type: 'UPDATE_TEST_SUCCESS'; payload: Test }
  | { type: 'DELETE_TEST_SUCCESS'; payload: string }
  | { type: 'PUBLISH_TEST_SUCCESS'; payload: Test }
  | { type: 'CLEAR_ERROR' };

interface TestContextValue {
  state: TestState;
  dispatch: React.Dispatch<TestAction>;
  fetchTests: () => Promise<void>;
  fetchTestById: (id: string) => Promise<void>;
  createTest: (data: CreateTestRequest) => Promise<Test>;
  updateTest: (id: string, data: UpdateTestRequest) => Promise<void>;
  deleteTest: (id: string) => Promise<void>;
  publishTest: (id: string, options: PublishOptions) => Promise<void>;
  clearError: () => void;
}

// --- Initial State ---

const initialState: TestState = {
  tests: [],
  currentTest: null,
  isLoading: false,
  error: null,
};

// --- Reducer ---

export function testReducer(state: TestState, action: TestAction): TestState {
  switch (action.type) {
    case 'FETCH_TESTS_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_TESTS_SUCCESS':
      return { ...state, isLoading: false, tests: action.payload, error: null };
    case 'FETCH_TESTS_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    case 'FETCH_TEST_SUCCESS':
      return { ...state, isLoading: false, currentTest: action.payload, error: null };
    case 'CREATE_TEST_SUCCESS':
      return {
        ...state,
        isLoading: false,
        tests: [...state.tests, action.payload],
        error: null,
      };
    case 'UPDATE_TEST_SUCCESS':
      return {
        ...state,
        isLoading: false,
        tests: state.tests.map((t) => (t.id === action.payload.id ? action.payload : t)),
        currentTest: state.currentTest?.id === action.payload.id ? action.payload : state.currentTest,
        error: null,
      };
    case 'DELETE_TEST_SUCCESS':
      return {
        ...state,
        isLoading: false,
        tests: state.tests.filter((t) => t.id !== action.payload),
        currentTest: state.currentTest?.id === action.payload ? null : state.currentTest,
        error: null,
      };
    case 'PUBLISH_TEST_SUCCESS':
      return {
        ...state,
        isLoading: false,
        tests: state.tests.map((t) => (t.id === action.payload.id ? action.payload : t)),
        currentTest: state.currentTest?.id === action.payload.id ? action.payload : state.currentTest,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// --- Context ---

const TestContext = createContext<TestContextValue | undefined>(undefined);

// --- Provider ---

export const TestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(testReducer, initialState);

  const fetchTests = useCallback(async (): Promise<void> => {
    dispatch({ type: 'FETCH_TESTS_START' });
    try {
      const response = await testService.getAll();
      dispatch({ type: 'FETCH_TESTS_SUCCESS', payload: response.data.data });
    } catch (error: unknown) {
      const appError = parseApiError(error);
      dispatch({ type: 'FETCH_TESTS_FAILURE', payload: appError.message });
    }
  }, []);

  const fetchTestById = useCallback(async (id: string): Promise<void> => {
    dispatch({ type: 'FETCH_TESTS_START' });
    try {
      const response = await testService.getById(id);
      dispatch({ type: 'FETCH_TEST_SUCCESS', payload: response.data.data });
    } catch (error: unknown) {
      const appError = parseApiError(error);
      dispatch({ type: 'FETCH_TESTS_FAILURE', payload: appError.message });
    }
  }, []);

  const createTest = useCallback(async (data: CreateTestRequest): Promise<Test> => {
    dispatch({ type: 'FETCH_TESTS_START' });
    try {
      const response = await testService.create(data);
      const newTest = response.data.data;
      dispatch({ type: 'CREATE_TEST_SUCCESS', payload: newTest });
      return newTest;
    } catch (error: unknown) {
      const appError = parseApiError(error);
      dispatch({ type: 'FETCH_TESTS_FAILURE', payload: appError.message });
      throw error;
    }
  }, []);

  const updateTest = useCallback(async (id: string, data: UpdateTestRequest): Promise<void> => {
    dispatch({ type: 'FETCH_TESTS_START' });
    try {
      const response = await testService.update(id, data);
      dispatch({ type: 'UPDATE_TEST_SUCCESS', payload: response.data.data });
    } catch (error: unknown) {
      const appError = parseApiError(error);
      dispatch({ type: 'FETCH_TESTS_FAILURE', payload: appError.message });
      throw error;
    }
  }, []);

  const deleteTest = useCallback(async (id: string): Promise<void> => {
    dispatch({ type: 'FETCH_TESTS_START' });
    try {
      await testService.delete(id);
      dispatch({ type: 'DELETE_TEST_SUCCESS', payload: id });
    } catch (error: unknown) {
      const appError = parseApiError(error);
      dispatch({ type: 'FETCH_TESTS_FAILURE', payload: appError.message });
      throw error;
    }
  }, []);

  const publishTest = useCallback(async (id: string, options: PublishOptions): Promise<void> => {
    dispatch({ type: 'FETCH_TESTS_START' });
    try {
      const updateData: UpdateTestRequest = {
        status: options.mode === 'now' ? 'live' : 'scheduled',
      };
      const response = await testService.update(id, updateData);
      dispatch({ type: 'PUBLISH_TEST_SUCCESS', payload: response.data.data });
    } catch (error: unknown) {
      const appError = parseApiError(error);
      dispatch({ type: 'FETCH_TESTS_FAILURE', payload: appError.message });
      throw error;
    }
  }, []);

  const clearError = useCallback((): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value: TestContextValue = {
    state,
    dispatch,
    fetchTests,
    fetchTestById,
    createTest,
    updateTest,
    deleteTest,
    publishTest,
    clearError,
  };

  return <TestContext.Provider value={value}>{children}</TestContext.Provider>;
};

// --- Custom Hook ---

export function useTest(): TestContextValue {
  const context = useContext(TestContext);
  if (context === undefined) {
    throw new Error('useTest must be used within a TestProvider');
  }
  return context;
}
