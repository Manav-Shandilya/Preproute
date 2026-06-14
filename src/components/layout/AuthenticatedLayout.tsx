import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import QuestionSidebarPanel from '../question/QuestionSidebarPanel';
import { TestProvider } from '../../contexts/TestContext';
import { QuestionProvider } from '../../contexts/QuestionContext';
import { SubjectProvider } from '../../contexts/SubjectContext';
import { UIProvider } from '../../contexts/UIContext';
import { useUI } from '../../contexts/UIContext';

const AuthenticatedLayoutInner: React.FC = () => {
  const { state } = useUI();
  const collapsed = state.sidebarCollapsed;
  const location = useLocation();

  // Show question sidebar when on questions or preview page
  const isQuestionsPage = location.pathname.includes('/questions') || location.pathname.includes('/preview');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar
        questionSidebar={isQuestionsPage ? <QuestionSidebarPanel /> : undefined}
      />
      <main
        className={`mt-16 p-4 md:p-6 min-h-[calc(100vh-4rem)] overflow-auto transition-all duration-300 ${
          collapsed ? 'md:ml-16' : 'md:ml-60'
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
};

const AuthenticatedLayout: React.FC = () => {
  return (
    <UIProvider>
      <TestProvider>
        <QuestionProvider>
          <SubjectProvider>
            <AuthenticatedLayoutInner />
          </SubjectProvider>
        </QuestionProvider>
      </TestProvider>
    </UIProvider>
  );
};

export default AuthenticatedLayout;
