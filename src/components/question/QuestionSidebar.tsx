import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { QuestionSummary } from '../../types';

interface QuestionSidebarProps {
  questions: QuestionSummary[];
  activeIndex: number;
  onQuestionClick: (index: number) => void;
}

const QuestionSidebar: React.FC<QuestionSidebarProps> = ({
  questions,
  activeIndex,
  onQuestionClick,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = (): void => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div className="px-3 py-4">
      <button
        onClick={toggleCollapse}
        className="flex items-center justify-between w-full text-left"
        aria-expanded={!isCollapsed}
        aria-controls="question-sidebar-list"
      >
        <span className="text-sm font-semibold text-gray-700">
          Question creation
        </span>
        {isCollapsed ? (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        )}
      </button>

      <p className="text-xs text-gray-500 mt-1">
        Total Questions: {questions.length}
      </p>

      {!isCollapsed && (
        <ul
          id="question-sidebar-list"
          className="mt-3 space-y-1"
          role="list"
          aria-label="Question list"
        >
          {questions.map((q) => (
            <li key={q.index}>
              <button
                onClick={() => onQuestionClick(q.index)}
                className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-left text-sm transition-colors ${
                  q.index === activeIndex
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                aria-current={q.index === activeIndex ? 'true' : undefined}
              >
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                    q.isComplete ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                  aria-label={q.isComplete ? 'Complete' : 'Incomplete'}
                />
                <span>Question {q.index + 1}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuestionSidebar;
