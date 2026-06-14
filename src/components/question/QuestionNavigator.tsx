import React from 'react';
import { ChevronLeft, ChevronRight, Plus, FileSpreadsheet } from 'lucide-react';

interface QuestionNavigatorProps {
  current: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  onAddMCQ: () => void;
  onImportCSV: () => void;
}

const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  current,
  total,
  onPrevious,
  onNext,
  onAddMCQ,
  onImportCSV,
}) => {
  const isFirst = current <= 1;
  const isLast = current >= total;

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirst}
          aria-label="Previous question"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="text-sm font-medium text-gray-700">
          Question {current}/{total}
        </span>

        <button
          type="button"
          onClick={onNext}
          disabled={isLast}
          aria-label="Next question"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onAddMCQ}
          className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          MCQ
        </button>

        <button
          type="button"
          onClick={onImportCSV}
          className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
        >
          <FileSpreadsheet className="h-4 w-4" />
          CSV
        </button>
      </div>
    </div>
  );
};

export default QuestionNavigator;
