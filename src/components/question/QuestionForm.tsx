import React from 'react';
import { Trash2 } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import AsyncSelect from '../common/AsyncSelect';
import { QuestionFormValues } from '../../types';

interface QuestionFormProps {
  questionData: QuestionFormValues;
  index: number;
  onUpdate: (index: number, data: Partial<QuestionFormValues>) => void;
  topicOptions?: { value: string; label: string }[];
  subTopicOptions?: { value: string; label: string }[];
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  questionData,
  index,
  onUpdate,
  topicOptions = [],
  subTopicOptions = [],
}) => {

  const clearOption = (optionKey: string) => {
    onUpdate(index, { [optionKey]: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <RichTextEditor
          content={questionData.question}
          onChange={(content) => onUpdate(index, { question: content })}
          placeholder="Type here"
        />
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Type the options below</h4>
        <div className="space-y-3">
          {(['option1', 'option2', 'option3', 'option4'] as const).map((optKey, i) => (
            <div key={optKey} className="flex items-center gap-3">
              <input
                type="radio"
                name={`correct_option_${index}`}
                value={optKey}
                checked={questionData.correct_option === optKey}
                onChange={() => onUpdate(index, { correct_option: optKey })}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 flex-shrink-0"
              />
              <input
                type="text"
                value={questionData[optKey]}
                onChange={(e) => onUpdate(index, { [optKey]: e.target.value })}
                className="flex-1 border-b border-gray-300 bg-transparent px-2 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder={`Type Option here`}
              />
              <button
                type="button"
                onClick={() => clearOption(optKey)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                aria-label={`Clear option ${i + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Add Solution</h4>
        <div className="relative">
          <textarea
            value={questionData.explanation || ''}
            onChange={(e) => onUpdate(index, { explanation: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] pr-10"
            placeholder="Type here"
            rows={4}
          />
          <button
            type="button"
            onClick={() => onUpdate(index, { explanation: '' })}
            className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Clear solution"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-4">Question settings</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Level of Difficulty
            </label>
            <AsyncSelect
              options={[
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' },
              ]}
              value={questionData.difficulty || ''}
              onChange={(value) =>
                onUpdate(index, {
                  difficulty: value ? (value as 'easy' | 'medium' | 'hard') : undefined,
                })
              }
              placeholder="Select from Drop-down"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic
            </label>
            <AsyncSelect
              options={topicOptions}
              value={questionData.topic_id || ''}
              onChange={(value) => onUpdate(index, { topic_id: value || undefined })}
              placeholder="Select from Drop-down"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sub-topic
            </label>
            <AsyncSelect
              options={subTopicOptions}
              value={questionData.sub_topic_id || ''}
              onChange={(value) => onUpdate(index, { sub_topic_id: value || undefined })}
              placeholder="Select from Drop-down"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionForm;
