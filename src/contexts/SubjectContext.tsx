import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Subject, Topic, SubTopic } from '../types';
import { subjectService } from '../services/subjectService';
import { parseApiError } from '../utils/errorHandler';

// --- State & Action Types ---

export interface SubjectState {
  subjects: Subject[];
  topics: Topic[];
  subTopics: SubTopic[];
  isLoadingSubjects: boolean;
  isLoadingTopics: boolean;
  isLoadingSubTopics: boolean;
}

export type SubjectAction =
  | { type: 'FETCH_SUBJECTS_START' }
  | { type: 'FETCH_SUBJECTS_SUCCESS'; payload: Subject[] }
  | { type: 'FETCH_SUBJECTS_FAILURE' }
  | { type: 'FETCH_TOPICS_START' }
  | { type: 'FETCH_TOPICS_SUCCESS'; payload: Topic[] }
  | { type: 'FETCH_TOPICS_FAILURE' }
  | { type: 'FETCH_SUBTOPICS_START' }
  | { type: 'FETCH_SUBTOPICS_SUCCESS'; payload: SubTopic[] }
  | { type: 'FETCH_SUBTOPICS_FAILURE' }
  | { type: 'CLEAR_TOPICS' }
  | { type: 'CLEAR_SUBTOPICS' };

interface SubjectContextValue {
  state: SubjectState;
  dispatch: React.Dispatch<SubjectAction>;
  fetchSubjects: () => Promise<void>;
  fetchTopicsBySubject: (subjectId: string) => Promise<void>;
  fetchSubTopicsByTopics: (topicIds: string[]) => Promise<void>;
  clearTopics: () => void;
  clearSubTopics: () => void;
}

// --- Initial State ---

const initialState: SubjectState = {
  subjects: [],
  topics: [],
  subTopics: [],
  isLoadingSubjects: false,
  isLoadingTopics: false,
  isLoadingSubTopics: false,
};

// --- Reducer ---

export function subjectReducer(state: SubjectState, action: SubjectAction): SubjectState {
  switch (action.type) {
    case 'FETCH_SUBJECTS_START':
      return { ...state, isLoadingSubjects: true };
    case 'FETCH_SUBJECTS_SUCCESS':
      return { ...state, isLoadingSubjects: false, subjects: action.payload };
    case 'FETCH_SUBJECTS_FAILURE':
      return { ...state, isLoadingSubjects: false };
    case 'FETCH_TOPICS_START':
      return { ...state, isLoadingTopics: true };
    case 'FETCH_TOPICS_SUCCESS':
      return { ...state, isLoadingTopics: false, topics: action.payload };
    case 'FETCH_TOPICS_FAILURE':
      return { ...state, isLoadingTopics: false };
    case 'FETCH_SUBTOPICS_START':
      return { ...state, isLoadingSubTopics: true };
    case 'FETCH_SUBTOPICS_SUCCESS':
      return { ...state, isLoadingSubTopics: false, subTopics: action.payload };
    case 'FETCH_SUBTOPICS_FAILURE':
      return { ...state, isLoadingSubTopics: false };
    case 'CLEAR_TOPICS':
      return { ...state, topics: [], subTopics: [] };
    case 'CLEAR_SUBTOPICS':
      return { ...state, subTopics: [] };
    default:
      return state;
  }
}

// --- Context ---

const SubjectContext = createContext<SubjectContextValue | undefined>(undefined);

// --- Provider ---

export const SubjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(subjectReducer, initialState);

  const fetchSubjects = useCallback(async (): Promise<void> => {
    dispatch({ type: 'FETCH_SUBJECTS_START' });
    try {
      const response = await subjectService.getAll();
      dispatch({ type: 'FETCH_SUBJECTS_SUCCESS', payload: response.data.data });
    } catch (error: unknown) {
      parseApiError(error);
      dispatch({ type: 'FETCH_SUBJECTS_FAILURE' });
    }
  }, []);

  const fetchTopicsBySubject = useCallback(async (subjectId: string): Promise<void> => {
    dispatch({ type: 'FETCH_TOPICS_START' });
    try {
      const response = await subjectService.getTopicsBySubject(subjectId);
      dispatch({ type: 'FETCH_TOPICS_SUCCESS', payload: response.data.data });
    } catch (error: unknown) {
      parseApiError(error);
      dispatch({ type: 'FETCH_TOPICS_FAILURE' });
    }
  }, []);

  const fetchSubTopicsByTopics = useCallback(async (topicIds: string[]): Promise<void> => {
    dispatch({ type: 'FETCH_SUBTOPICS_START' });
    try {
      const response = await subjectService.getSubTopicsByTopics(topicIds);
      dispatch({ type: 'FETCH_SUBTOPICS_SUCCESS', payload: response.data.data });
    } catch (error: unknown) {
      parseApiError(error);
      dispatch({ type: 'FETCH_SUBTOPICS_FAILURE' });
    }
  }, []);

  const clearTopics = useCallback((): void => {
    dispatch({ type: 'CLEAR_TOPICS' });
  }, []);

  const clearSubTopics = useCallback((): void => {
    dispatch({ type: 'CLEAR_SUBTOPICS' });
  }, []);

  const value: SubjectContextValue = {
    state,
    dispatch,
    fetchSubjects,
    fetchTopicsBySubject,
    fetchSubTopicsByTopics,
    clearTopics,
    clearSubTopics,
  };

  return <SubjectContext.Provider value={value}>{children}</SubjectContext.Provider>;
};

// --- Custom Hook ---

export function useSubject(): SubjectContextValue {
  const context = useContext(SubjectContext);
  if (context === undefined) {
    throw new Error('useSubject must be used within a SubjectProvider');
  }
  return context;
}
