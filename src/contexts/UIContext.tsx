import React, { createContext, useContext, useReducer, useCallback } from 'react';

// --- State & Action Types ---

export interface UIState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  editModalOpen: boolean;
  editingTestId: string | null;
  publishDialogOpen: boolean;
  confirmDialog: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null;
}

export type UIAction =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'OPEN_MOBILE_SIDEBAR' }
  | { type: 'CLOSE_MOBILE_SIDEBAR' }
  | { type: 'OPEN_EDIT_MODAL'; payload: string }
  | { type: 'CLOSE_EDIT_MODAL' }
  | { type: 'OPEN_PUBLISH_DIALOG' }
  | { type: 'CLOSE_PUBLISH_DIALOG' }
  | { type: 'SHOW_CONFIRM_DIALOG'; payload: { title: string; message: string; onConfirm: () => void } }
  | { type: 'CLOSE_CONFIRM_DIALOG' };

interface UIContextValue {
  state: UIState;
  dispatch: React.Dispatch<UIAction>;
  toggleSidebar: () => void;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  openEditModal: (testId: string) => void;
  closeEditModal: () => void;
  openPublishDialog: () => void;
  closePublishDialog: () => void;
  showConfirmDialog: (title: string, message: string, onConfirm: () => void) => void;
  closeConfirmDialog: () => void;
}

// --- Initial State ---

const initialState: UIState = {
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  editModalOpen: false,
  editingTestId: null,
  publishDialogOpen: false,
  confirmDialog: null,
};

// --- Reducer ---

export function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'OPEN_MOBILE_SIDEBAR':
      return { ...state, mobileSidebarOpen: true };
    case 'CLOSE_MOBILE_SIDEBAR':
      return { ...state, mobileSidebarOpen: false };
    case 'OPEN_EDIT_MODAL':
      return { ...state, editModalOpen: true, editingTestId: action.payload };
    case 'CLOSE_EDIT_MODAL':
      return { ...state, editModalOpen: false, editingTestId: null };
    case 'OPEN_PUBLISH_DIALOG':
      return { ...state, publishDialogOpen: true };
    case 'CLOSE_PUBLISH_DIALOG':
      return { ...state, publishDialogOpen: false };
    case 'SHOW_CONFIRM_DIALOG':
      return {
        ...state,
        confirmDialog: {
          isOpen: true,
          title: action.payload.title,
          message: action.payload.message,
          onConfirm: action.payload.onConfirm,
        },
      };
    case 'CLOSE_CONFIRM_DIALOG':
      return { ...state, confirmDialog: null };
    default:
      return state;
  }
}

// --- Context ---

const UIContext = createContext<UIContextValue | undefined>(undefined);

// --- Provider ---

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  const toggleSidebar = useCallback((): void => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  const openMobileSidebar = useCallback((): void => {
    dispatch({ type: 'OPEN_MOBILE_SIDEBAR' });
  }, []);

  const closeMobileSidebar = useCallback((): void => {
    dispatch({ type: 'CLOSE_MOBILE_SIDEBAR' });
  }, []);

  const openEditModal = useCallback((testId: string): void => {
    dispatch({ type: 'OPEN_EDIT_MODAL', payload: testId });
  }, []);

  const closeEditModal = useCallback((): void => {
    dispatch({ type: 'CLOSE_EDIT_MODAL' });
  }, []);

  const openPublishDialog = useCallback((): void => {
    dispatch({ type: 'OPEN_PUBLISH_DIALOG' });
  }, []);

  const closePublishDialog = useCallback((): void => {
    dispatch({ type: 'CLOSE_PUBLISH_DIALOG' });
  }, []);

  const showConfirmDialog = useCallback((title: string, message: string, onConfirm: () => void): void => {
    dispatch({ type: 'SHOW_CONFIRM_DIALOG', payload: { title, message, onConfirm } });
  }, []);

  const closeConfirmDialog = useCallback((): void => {
    dispatch({ type: 'CLOSE_CONFIRM_DIALOG' });
  }, []);

  const value: UIContextValue = {
    state,
    dispatch,
    toggleSidebar,
    openMobileSidebar,
    closeMobileSidebar,
    openEditModal,
    closeEditModal,
    openPublishDialog,
    closePublishDialog,
    showConfirmDialog,
    closeConfirmDialog,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

// --- Custom Hook ---

export function useUI(): UIContextValue {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
