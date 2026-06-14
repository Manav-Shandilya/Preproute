import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth, authReducer, AuthState, AuthAction } from './AuthContext';

// Mock authService
vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
  },
}));

// Mock parseApiError
vi.mock('../utils/errorHandler', () => ({
  parseApiError: vi.fn(() => ({
    type: 'client',
    message: 'Invalid credentials',
    statusCode: 401,
    retryable: false,
  })),
}));

import { authService } from '../services/authService';
import { parseApiError } from '../utils/errorHandler';

// localStorage mock
function createLocalStorageMock() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
}

describe('authReducer', () => {
  const initialState: AuthState = {
    token: null,
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  it('handles LOGIN_START', () => {
    const result = authReducer(initialState, { type: 'LOGIN_START' });
    expect(result.isLoading).toBe(true);
    expect(result.error).toBeNull();
  });

  it('handles LOGIN_SUCCESS', () => {
    const user = { id: '1', name: 'Test User', role: 'admin' };
    const action: AuthAction = {
      type: 'LOGIN_SUCCESS',
      payload: { token: 'abc123', user },
    };
    const result = authReducer({ ...initialState, isLoading: true }, action);
    expect(result.isLoading).toBe(false);
    expect(result.isAuthenticated).toBe(true);
    expect(result.token).toBe('abc123');
    expect(result.user).toEqual(user);
    expect(result.error).toBeNull();
  });

  it('handles LOGIN_FAILURE', () => {
    const result = authReducer(
      { ...initialState, isLoading: true },
      { type: 'LOGIN_FAILURE', payload: 'Invalid credentials' }
    );
    expect(result.isLoading).toBe(false);
    expect(result.isAuthenticated).toBe(false);
    expect(result.token).toBeNull();
    expect(result.user).toBeNull();
    expect(result.error).toBe('Invalid credentials');
  });

  it('handles LOGOUT', () => {
    const authenticatedState: AuthState = {
      token: 'abc123',
      user: { id: '1', name: 'User', role: 'admin' },
      isAuthenticated: true,
      isLoading: false,
      error: null,
    };
    const result = authReducer(authenticatedState, { type: 'LOGOUT' });
    expect(result).toEqual(initialState);
  });

  it('handles INITIALIZE with valid payload', () => {
    const user = { id: '1', name: 'User', role: 'admin' };
    const result = authReducer(initialState, {
      type: 'INITIALIZE',
      payload: { token: 'stored-token', user },
    });
    expect(result.isAuthenticated).toBe(true);
    expect(result.token).toBe('stored-token');
    expect(result.user).toEqual(user);
  });

  it('handles INITIALIZE with null payload', () => {
    const result = authReducer(initialState, { type: 'INITIALIZE', payload: null });
    expect(result).toEqual(initialState);
  });
});

describe('useAuth hook', () => {
  let mockStorage: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    mockStorage = createLocalStorageMock();
    Object.defineProperty(window, 'localStorage', { value: mockStorage, writable: true });
    vi.clearAllMocks();
  });

  it('throws error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  it('provides initial unauthenticated state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.state.isAuthenticated).toBe(false);
    expect(result.current.state.token).toBeNull();
    expect(result.current.state.user).toBeNull();
  });

  it('login stores token and user in localStorage on success', async () => {
    const mockUser = { id: '1', name: 'Admin', role: 'admin' };
    vi.mocked(authService.login).mockResolvedValueOnce({
      data: { data: { token: 'new-token', user: mockUser } },
    } as never);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.login({ userId: 'admin', password: 'pass' });
    });

    expect(result.current.state.isAuthenticated).toBe(true);
    expect(result.current.state.token).toBe('new-token');
    expect(result.current.state.user).toEqual(mockUser);
    expect(mockStorage.getItem('auth_token')).toBe('new-token');
    expect(mockStorage.getItem('user')).toBe(JSON.stringify(mockUser));
  });

  it('login dispatches LOGIN_FAILURE on error', async () => {
    vi.mocked(authService.login).mockRejectedValueOnce(new Error('fail'));

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      try {
        await result.current.login({ userId: 'admin', password: 'wrong' });
      } catch {
        // expected
      }
    });

    expect(result.current.state.isAuthenticated).toBe(false);
    expect(result.current.state.error).toBe('Invalid credentials');
    expect(parseApiError).toHaveBeenCalled();
  });

  it('logout clears localStorage and resets state', async () => {
    const mockUser = { id: '1', name: 'Admin', role: 'admin' };
    vi.mocked(authService.login).mockResolvedValueOnce({
      data: { data: { token: 'token', user: mockUser } },
    } as never);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.login({ userId: 'admin', password: 'pass' });
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.state.isAuthenticated).toBe(false);
    expect(result.current.state.token).toBeNull();
    expect(mockStorage.getItem('auth_token')).toBeNull();
    expect(mockStorage.getItem('user')).toBeNull();
  });

  it('initialize hydrates state from localStorage', () => {
    const user = { id: '1', name: 'User', role: 'admin' };
    mockStorage.setItem('auth_token', 'stored-token');
    mockStorage.setItem('user', JSON.stringify(user));

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    act(() => {
      result.current.initialize();
    });

    expect(result.current.state.isAuthenticated).toBe(true);
    expect(result.current.state.token).toBe('stored-token');
    expect(result.current.state.user).toEqual(user);
  });

  it('initialize resets state when localStorage is empty', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    act(() => {
      result.current.initialize();
    });

    expect(result.current.state.isAuthenticated).toBe(false);
    expect(result.current.state.token).toBeNull();
  });

  it('initialize handles invalid JSON in localStorage gracefully', () => {
    mockStorage.setItem('auth_token', 'some-token');
    mockStorage.setItem('user', 'not-valid-json');

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    act(() => {
      result.current.initialize();
    });

    expect(result.current.state.isAuthenticated).toBe(false);
    expect(mockStorage.getItem('auth_token')).toBeNull();
    expect(mockStorage.getItem('user')).toBeNull();
  });
});
