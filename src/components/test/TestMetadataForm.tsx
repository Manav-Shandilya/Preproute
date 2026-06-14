import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { testFormSchema } from '../../schemas/test.schema';
import { TestFormValues } from '../../types';
import { useSubject } from '../../contexts/SubjectContext';
import TestTypeTabs from './TestTypeTabs';
import AsyncSelect from '../common/AsyncSelect';
import MultiSelect from '../common/MultiSelect';
import NumberInput from '../common/NumberInput';

interface TestMetadataFormProps {
  initialValues?: Partial<TestFormValues>;
  onSubmit: (values: TestFormValues) => Promise<void>;
  onSaveDraft?: (values: TestFormValues) => Promise<void>;
  isLoading?: boolean;
  editModal?: boolean
}

const testTypeLabels: Record<string, string> = {
  'chapterwise': 'Chapter Wise',
  'pyq': 'PYQ',
  'mock': 'Mock Test',
};

const TestMetadataForm: React.FC<TestMetadataFormProps> = ({
  initialValues,
  onSubmit,
  onSaveDraft,
  isLoading = false,
  editModal = false
}) => {
  const {
    state: { subjects, topics, subTopics, isLoadingSubjects, isLoadingTopics, isLoadingSubTopics },
    fetchSubjects,
    fetchTopicsBySubject,
    fetchSubTopicsByTopics,
  } = useSubject();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TestFormValues>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      name: '',
      type: 'chapterwise',
      subject: '',
      topics: [],
      sub_topics: [],
      difficulty: 'easy',
      correct_marks: 5,
      wrong_marks: -1,
      unattempt_marks: 0,
      total_time: 60,
      total_marks: 250,
      total_questions: 50,
      ...initialValues,
    },
  });

  const selectedSubject = watch('subject');
  const selectedTopics = watch('topics');
  const selectedType = watch('type');

  // Fetch subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // After subjects load, resolve initialValues.subject name to UUID if needed
  useEffect(() => {
    if (initialValues?.subject && subjects.length > 0) {
      const currentSubjectValue = watch('subject');
      // Check if the current value is a name (not a UUID)
      const isUUID = subjects.some((s) => s.id === currentSubjectValue);
      if (!isUUID) {
        // Try to find by name
        const matched = subjects.find((s) => s.name === currentSubjectValue);
        if (matched) {
          setValue('subject', matched.id);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects]);

  // After topics load, resolve initialValues.topics names to UUIDs if needed
  useEffect(() => {
    if (initialValues?.topics && initialValues.topics.length > 0 && topics.length > 0) {
      const currentTopics = watch('topics');
      // Check if values are names (not UUIDs)
      const hasNonUUID = currentTopics.some((t) => !topics.some((opt) => opt.id === t));
      if (hasNonUUID) {
        const resolved = currentTopics
          .map((t) => {
            const matched = topics.find((opt) => opt.name === t);
            return matched ? matched.id : t;
          })
          .filter((t) => topics.some((opt) => opt.id === t));
        if (resolved.length > 0) {
          setValue('topics', resolved);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topics]);

  // After sub-topics load, resolve initialValues.sub_topics names to UUIDs if needed
  useEffect(() => {
    if (initialValues?.sub_topics && initialValues.sub_topics.length > 0 && subTopics.length > 0) {
      const currentSubTopics = watch('sub_topics');
      const hasNonUUID = currentSubTopics.some((st) => !subTopics.some((opt) => opt.id === st));
      if (hasNonUUID) {
        const resolved = currentSubTopics
          .map((st) => {
            const matched = subTopics.find((opt) => opt.name === st);
            return matched ? matched.id : st;
          })
          .filter((st) => subTopics.some((opt) => opt.id === st));
        if (resolved.length > 0) {
          setValue('sub_topics', resolved);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subTopics]);

  // When subject changes, fetch topics and clear downstream selections
  useEffect(() => {
    if (selectedSubject) {
      // Only clear if user actually changed the subject (not initial load)
      const isValidSubjectId = subjects.some((s) => s.id === selectedSubject);
      if (isValidSubjectId) {
        fetchTopicsBySubject(selectedSubject);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject]);

  // When topics change, fetch sub-topics
  useEffect(() => {
    if (selectedTopics && selectedTopics.length > 0) {
      const allAreIds = selectedTopics.every((t) => topics.some((opt) => opt.id === t));
      if (allAreIds) {
        fetchSubTopicsByTopics(selectedTopics);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(selectedTopics)]);

  const subjectOptions = subjects.map((s) => ({ value: s.id, label: s.name }));
  const topicOptions = topics.map((t) => ({ value: t.id, label: t.name }));
  const subTopicOptions = subTopics.map((st) => ({ value: st.id, label: st.name }));

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data);
  });

  const handleCancel = () => {
    if (onSaveDraft) {
      const data = watch() as TestFormValues;
      onSaveDraft(data);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-8">
      {!editModal && <div className="text-sm text-gray-500">
        <span>Test Creation</span>
        <span className="mx-2">/</span>
        <span>Create Test</span>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{testTypeLabels[selectedType]}</span>
      </div>}

      {/* Test Type Tabs */}
      <div>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <TestTypeTabs value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.type && (
          <p className="mt-1 text-xs text-red-500">{errors.type.message}</p>
        )}
      </div>

      {/* Row 1: Subject | Name of Test */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Subject</label>
          <Controller
            name="subject"
            control={control}
            render={({ field }) => (
              <AsyncSelect
                options={subjectOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder="Choose from Drop-down"
                isLoading={isLoadingSubjects}
                error={errors.subject?.message}
              />
            )}
          />
        </div>

        <div>
          <label htmlFor="test-name" className="mb-2 block text-sm font-medium text-gray-700">
            Name of Test
          </label>
          <input
            id="test-name"
            type="text"
            {...register('name')}
            placeholder="Enter name of Test"
            className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>
      </div>

      {/* Row 2: Topic | Sub Topic */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Topic</label>
          <Controller
            name="topics"
            control={control}
            render={({ field }) => (
              <MultiSelect
                options={topicOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder="Choose from Drop-down"
                isLoading={isLoadingTopics}
                disabled={!selectedSubject}
                error={errors.topics?.message}
              />
            )}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Sub Topic</label>
          <Controller
            name="sub_topics"
            control={control}
            render={({ field }) => (
              <MultiSelect
                options={subTopicOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder="Choose from Drop-down"
                isLoading={isLoadingSubTopics}
                disabled={!selectedTopics || selectedTopics.length === 0}
                error={errors.sub_topics?.message}
              />
            )}
          />
        </div>
      </div>

      {/* Row 3: Duration (Minutes) | Test Difficulty Level */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="total-time" className="mb-2 block text-sm font-medium text-gray-700">
            Duration (Minutes)
          </label>
          <input
            id="total-time"
            type="number"
            {...register('total_time', { valueAsNumber: true })}
            placeholder="Enter the time"
            className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.total_time ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.total_time && (
            <p className="mt-1 text-xs text-red-500">{errors.total_time.message}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Test Difficulty Level
          </label>
          <div className="flex items-center gap-8 pt-2">
            {(['easy', 'medium', 'hard'] as const).map((level) => (
              <label key={level} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={level}
                  {...register('difficulty')}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 capitalize">
                  {level === 'hard' ? 'Difficult' : level === 'medium' ? 'Medium' : 'Easy'}
                </span>
              </label>
            ))}
          </div>
          {errors.difficulty && (
            <p className="mt-1 text-xs text-red-500">{errors.difficulty.message}</p>
          )}
        </div>
      </div>

      {/* Marking Scheme Section */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Marking Scheme:</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {/* Wrong Answer */}
          <div>
            <label htmlFor="wrong-marks" className="mb-2 block text-xs font-medium text-gray-500">
              Wrong Answer
            </label>
            <Controller
              name="wrong_marks"
              control={control}
              render={({ field }) => (
                <NumberInput
                  id="wrong-marks"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.wrong_marks?.message}
                />
              )}
            />
          </div>

          {/* Unattempted */}
          <div>
            <label htmlFor="unattempt-marks" className="mb-2 block text-xs font-medium text-gray-500">
              Unattempted
            </label>
            <Controller
              name="unattempt_marks"
              control={control}
              render={({ field }) => (
                <NumberInput
                  id="unattempt-marks"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.unattempt_marks?.message}
                />
              )}
            />
          </div>

          {/* Correct Answer */}
          <div>
            <label htmlFor="correct-marks" className="mb-2 block text-xs font-medium text-gray-500">
              Correct Answer
            </label>
            <Controller
              name="correct_marks"
              control={control}
              render={({ field }) => (
                <NumberInput
                  id="correct-marks"
                  value={field.value}
                  onChange={field.onChange}
                  min={0}
                  error={errors.correct_marks?.message}
                />
              )}
            />
          </div>

          {/* No of Questions */}
          <div>
            <label htmlFor="total-questions" className="mb-2 block text-xs font-medium text-gray-500">
              No of Questions
            </label>
            <input
              id="total-questions"
              type="number"
              {...register('total_questions', { valueAsNumber: true })}
              placeholder="Ex:250 Marks"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.total_questions ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.total_questions && (
              <p className="mt-1 text-xs text-red-500">{errors.total_questions.message}</p>
            )}
          </div>

          {/* Total Marks */}
          <div>
            <label htmlFor="total-marks" className="mb-2 block text-xs font-medium text-gray-500">
              Total Marks
            </label>
            <input
              id="total-marks"
              type="number"
              {...register('total_marks', { valueAsNumber: true })}
              placeholder="Ex:250 Marks"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.total_marks ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.total_marks && (
              <p className="mt-1 text-xs text-red-500">{errors.total_marks.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isLoading}
          className="rounded-lg border border-gray-300 px-12 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-indigo-500 px-14 py-3 text-sm font-medium text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Next'}
        </button>
      </div>
    </form>
  );
};

export default TestMetadataForm;
