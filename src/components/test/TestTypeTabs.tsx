import React from 'react';
import { TestType } from '../../types';

interface TestTypeTabsProps {
  value: TestType;
  onChange: (type: TestType) => void;
}

const tabs: { label: string; value: TestType }[] = [
  { label: 'Chapter Wise', value: 'chapterwise' },
  { label: 'PYQ', value: 'pyq' },
  { label: 'Mock Test', value: 'mock' },
];

const TestTypeTabs: React.FC<TestTypeTabsProps> = ({ value, onChange }) => {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden" role="tablist" aria-label="Test type selection">
      {tabs.map((tab) => {
        const isActive = value === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={`px-5 py-2 text-sm font-medium transition-colors border-r border-gray-200 last:border-r-0 ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default TestTypeTabs;
