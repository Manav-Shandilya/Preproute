import { createBrowserRouter, Navigate } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import AuthenticatedLayout from './components/layout/AuthenticatedLayout';
import ProtectedRoute from './guards/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateTestPage from './pages/CreateTestPage';
import QuestionsPage from './pages/QuestionsPage';
import PreviewPage from './pages/PreviewPage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <PublicLayout />,
    children: [
      { index: true, element: <LoginPage /> },
    ],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AuthenticatedLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'tests/create', element: <CreateTestPage /> },
      { path: 'tests/:testId/questions', element: <QuestionsPage /> },
      { path: 'tests/:testId/preview', element: <PreviewPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);

export default router;
