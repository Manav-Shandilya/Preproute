import React from 'react';
import { ChevronsLeft, ChevronRight } from 'lucide-react';
import { useQuestion } from '../../contexts/QuestionContext';
import { useTest } from '../../contexts/TestContext';

const QuestionSidebarPanel: React.FC = () => {
  const { state: questionState, setCurrentIndex, isQuestionComplete } = useQuestion();
  const { state: testState } = useTest();
  const { currentTest } = testState;

  const totalFromTest = currentTest?.total_questions || 0;
  const totalFromState = questionState.questions.length;
  const totalQuestions = Math.max(totalFromTest, totalFromState);

  const savedCount = currentTest?.questions?.length || 0;

  return (
    <div className="px-3 py-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">Question creation</span>
        <ChevronsLeft className="h-4 w-4 text-blue-500 cursor-pointer" />
      </div>

      <p className="text-xs text-gray-500 mb-3">
        Total Questions . {totalQuestions}
      </p>

      <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
        {Array.from({ length: totalQuestions }, (_, index) => {
          const isComplete = index < totalFromState
            ? isQuestionComplete(index)
            : index < savedCount;
          
          const isActive = index === questionState.currentIndex;

          return (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-yellow-100 border border-yellow-300 text-gray-800 font-medium'
                  : isComplete
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-gray-50 border border-gray-200 text-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-3 w-3 rounded-full flex-shrink-0 ${
                    isComplete ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
                <span>Question {index + 1}</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionSidebarPanel;
