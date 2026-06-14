import React from 'react';
import { Pencil, Clock, FileText, BarChart3 } from 'lucide-react';
import { Test } from '../../types';

interface TestSummaryCardProps {
  test: Test;
  onEdit?: () => void;
}

const testTypeLabels: Record<string, string> = {
  chapterwise: 'Chapter Wise',
  pyq: 'PYQ',
  mock: 'Mock Test',
};

const difficultyConfig: Record<string, { label: string; className: string }> = {
  easy: { label: 'Easy', className: 'bg-green-500 text-white' },
  medium: { label: 'Medium', className: 'bg-yellow-500 text-white' },
  hard: { label: 'Difficult', className: 'bg-red-500 text-white' },
};

const TestSummaryCard: React.FC<TestSummaryCardProps> = ({ test, onEdit }) => {
  const difficulty = difficultyConfig[test.difficulty] || difficultyConfig.easy;

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
      {/* Row 1: Type Badge + Edit Icon */}
      <div className="flex items-start justify-between">
        <span className="inline-flex items-center rounded-md bg-gray-900 px-3 py-1 text-xs font-semibold text-yellow-300 tracking-wide">
          {testTypeLabels[test.type] || test.type}
        </span>

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit test"
            className="flex h-8 w-8 items-center justify-center rounded-md text-blue-500 transition-colors hover:bg-blue-50 hover:text-blue-700"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Row 2: Test Name + Difficulty Badge */}
      <div className="mt-3 flex items-center gap-3">
        <span className="text-lg">📝</span>
        <h3 className="text-base font-bold text-gray-900">{test.name}</h3>
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-semibold ${difficulty.className}`}>
          <span className="text-[10px]">◉</span>
          {difficulty.label}
        </span>
      </div>

      {/* Row 3: Details grid + Stats */}
      <div className="mt-4 flex items-end justify-between">
        {/* Left: Subject, Topic, Sub Topic */}
        <div className="space-y-2">
          {/* Subject */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 w-20">Subject</span>
            <span className="text-sm text-gray-500">:</span>
            <span className="text-sm font-medium text-gray-900">{test.subject}</span>
          </div>

          {/* Topics */}
          {test.topics && test.topics.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-20">Topic</span>
              <span className="text-sm text-gray-500">:</span>
              <div className="flex flex-wrap gap-2">
                {test.topics.map((topic, idx) => (
                  <span
                    key={`topic-${idx}`}
                    className="inline-flex items-center rounded-md border border-teal-300 bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sub-topics */}
          {test.sub_topics && test.sub_topics.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-20">Sub Topic</span>
              <span className="text-sm text-gray-500">:</span>
              <div className="flex flex-wrap gap-2">
                {test.sub_topics.map((subTopic, idx) => (
                  <span
                    key={`subtopic-${idx}`}
                    className="inline-flex items-center rounded-md border border-orange-300 bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700"
                  >
                    {subTopic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5">
            <Clock className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">{test.total_time} Min</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5">
            <FileText className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">{test.total_questions} Q's</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">{test.total_marks} Marks</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSummaryCard;
