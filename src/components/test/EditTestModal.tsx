import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUI } from '../../contexts/UIContext';
import { useTest } from '../../contexts/TestContext';
import TestMetadataForm from './TestMetadataForm';
import LoadingSpinner from '../common/LoadingSpinner';
import { TestFormValues, UpdateTestRequest } from '../../types';

const EditTestModal: React.FC = () => {
  const { state: uiState, closeEditModal } = useUI();
  const { state: testState, fetchTestById, updateTest, fetchTests } = useTest();
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { editModalOpen, editingTestId } = uiState;
  const { currentTest } = testState;

  // Fetch test data when modal opens with a test ID
  useEffect(() => {
    if (editModalOpen && editingTestId) {
      setIsFetching(true);
      fetchTestById(editingTestId).finally(() => {
        setIsFetching(false);
      });
    }
  }, [editModalOpen, editingTestId, fetchTestById]);

  if (!editModalOpen || !editingTestId) {
    return null;
  }

  // Map fetched Test object to TestFormValues for the form
  const mapTestToFormValues = (): Partial<TestFormValues> | undefined => {
    if (!currentTest || currentTest.id !== editingTestId) {
      return undefined;
    }

    return {
      name: currentTest.name,
      type: currentTest.type,
      subject: currentTest.subject_id || currentTest.subject,
      topics: currentTest.topic_ids || currentTest.topics || [],
      sub_topics: currentTest.sub_topic_ids || currentTest.sub_topics || [],
      difficulty: currentTest.difficulty,
      correct_marks: currentTest.correct_marks,
      wrong_marks: currentTest.wrong_marks,
      unattempt_marks: currentTest.unattempt_marks,
      total_time: currentTest.total_time,
      total_marks: currentTest.total_marks,
      total_questions: currentTest.total_questions,
    };
  };

  const handleSubmit = async (values: TestFormValues): Promise<void> => {
    if (!editingTestId) return;

    setIsSubmitting(true);
    try {
      const updateData: UpdateTestRequest = {
        name: values.name,
        type: values.type,
        subject: values.subject,
        topics: values.topics,
        sub_topics: values.sub_topics,
        difficulty: values.difficulty,
        correct_marks: values.correct_marks,
        wrong_marks: values.wrong_marks,
        unattempt_marks: values.unattempt_marks,
        total_time: values.total_time,
        total_marks: values.total_marks,
        total_questions: values.total_questions,
      };

      await updateTest(editingTestId, updateData);
      await fetchTests();
      toast.success('Test updated successfully.');
      closeEditModal();
    } catch {
      toast.error('Failed to update test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const initialValues = mapTestToFormValues();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label="Edit Test"
    >
      <div className="relative mx-4 max-h-[100vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        {/* Close button */}
        <button
          type="button"
          onClick={closeEditModal}
          className="absolute right-4 top-4 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Close edit modal"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <h2 className="mb-6 text-xl font-semibold text-gray-900">Edit Test</h2>

        {isFetching ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : initialValues ? (
          <TestMetadataForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            editModal={true}
          />
        ) : (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-gray-500">Unable to load test data.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditTestModal;
