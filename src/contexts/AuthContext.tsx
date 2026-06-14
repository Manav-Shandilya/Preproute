import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { User, LoginRequest } from '../types';
import { authService } from '../services/authService';
import { parseApiError } from '../utils/errorHandler';

// --- State & Action Types ---

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { token: string; user: User } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'INITIALIZE'; payload: { token: string; user: User } | null };

interface AuthContextValue {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  initialize: () => void;
}

// --- Initial State (hydrate from localStorage synchronously) ---

function getInitialState(): AuthState {
  const token = localStorage.getItem('auth_token');
  const userJson = localStorage.getItem('user');

  if (token && userJson) {
    try {
      const user: User = JSON.parse(userJson);
      return {
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    } catch {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }

  return {
    token: null,
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };
}

const initialState: AuthState = getInitialState();

// --- Reducer ---

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        token: action.payload.token,
        user: action.payload.user,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        token: null,
        user: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return { ...initialState };
    case 'INITIALIZE':
      if (action.payload) {
        return {
          ...state,
          isAuthenticated: true,
          token: action.payload.token,
          user: action.payload.user,
          isLoading: false,
          error: null,
        };
      }
      return { ...initialState };
    default:
      return state;
  }
}

// --- Context ---

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// --- Provider ---

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.login(credentials);
      const { token, user } = response.data.data;

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } });
    } catch (error: unknown) {
      const appError = parseApiError(error);
      dispatch({ type: 'LOGIN_FAILURE', payload: appError.message });
      throw error;
    }
  }, []);

  const logout = useCallback((): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  }, []);

  const initialize = useCallback((): void => {
    const token = localStorage.getItem('auth_token');
    const userJson = localStorage.getItem('user');

    if (token && userJson) {
      try {
        const user: User = JSON.parse(userJson);
        dispatch({ type: 'INITIALIZE', payload: { token, user } });
      } catch {
        // Invalid stored data — clear and reset
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        dispatch({ type: 'INITIALIZE', payload: null });
      }
    } else {
      dispatch({ type: 'INITIALIZE', payload: null });
    }
  }, []);

  const value: AuthContextValue = { state, dispatch, login, logout, initialize };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- Custom Hook ---

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
