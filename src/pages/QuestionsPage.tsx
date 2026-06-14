import React, { useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, FileSpreadsheet, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTest } from '../contexts/TestContext';
import { useQuestion } from '../contexts/QuestionContext';
import { useUI } from '../contexts/UIContext';
import TestSummaryCard from '../components/test/TestSummaryCard';
import QuestionForm from '../components/question/QuestionForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { parseQuestionsCSV } from '../utils/csvParser';

const QuestionsPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const { state: testState, fetchTestById, updateTest } = useTest();
  const { currentTest, isLoading: isTestLoading } = testState;

  const {
    state: questionState,
    setCurrentIndex,
    updateQuestion,
    addQuestion,
    initializeQuestions,
    loadExistingQuestions,
    importFromCSV,
    deleteCurrentEdits,
    saveAllQuestions,
    isQuestionComplete,
  } = useQuestion();

  const { showConfirmDialog, openEditModal } = useUI();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch test on mount or when testId changes — clear stale state first
  useEffect(() => {
    if (testId) {
      // Clear old question state before loading new test
      initializeQuestions(1); // Reset to 1 empty slot temporarily
      fetchTestById(testId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  const testTotalQuestions = currentTest?.total_questions;
  const currentTestId = currentTest?.id;
  const testQuestionIds = currentTest?.questions;

  // Initialize question slots based on test's total_questions
  useEffect(() => {
    // Only initialize when the fetched test matches the URL testId
    if (currentTestId && currentTestId === testId && testTotalQuestions && testTotalQuestions > 0) {
      // If the test already has saved questions, fetch and load them
      if (testQuestionIds && testQuestionIds.length > 0) {
        loadExistingQuestions(testQuestionIds, testTotalQuestions);
      } else {
        // No existing questions — just create empty slots
        initializeQuestions(testTotalQuestions);
      }
    }
  }, [currentTestId, testTotalQuestions, testQuestionIds, initializeQuestions, loadExistingQuestions]);

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    if (questionState.currentIndex > 0) {
      setCurrentIndex(questionState.currentIndex - 1);
    }
  }, [questionState.currentIndex, setCurrentIndex]);

  const handleNext = useCallback(() => {
    if (questionState.currentIndex < questionState.questions.length - 1) {
      setCurrentIndex(questionState.currentIndex + 1);
    }
  }, [questionState.currentIndex, questionState.questions.length, setCurrentIndex]);

  // Add MCQ handler
  const handleAddMCQ = useCallback(() => {
    addQuestion();
  }, [addQuestion]);

  // CSV import handler
  const handleImportCSV = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const questions = await parseQuestionsCSV(file);
        importFromCSV(questions);
        toast.success(`Imported ${questions.length} questions from CSV`);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to parse CSV file';
        toast.error(message);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [importFromCSV]
  );

  // Delete All Edits handler
  const handleDeleteAllEdits = useCallback(() => {
    showConfirmDialog(
      'Delete All Edits',
      'Are you sure you want to clear all edits for the current question? This action cannot be undone.',
      () => {
        deleteCurrentEdits();
        toast.success('Current question edits cleared');
      }
    );
  }, [showConfirmDialog, deleteCurrentEdits]);

  // Save & Continue handler
  const handleSaveAndContinue = useCallback(async () => {
    if (!testId) return;

    const hasCompleteQuestion = questionState.questions.some((_, index) =>
      isQuestionComplete(index)
    );

    if (!hasCompleteQuestion) {
      toast.error('Please complete at least one question before saving.');
      return;
    }

    try {
      const subjectId = currentTest?.subject_id || currentTest?.subject || '';
      const questionIds = await saveAllQuestions(testId, subjectId);

      const totalMarks = currentTest
        ? questionIds.length * currentTest.correct_marks
        : questionIds.length;

      await updateTest(testId, {
        questions: questionIds,
        total_questions: questionIds.length,
        total_marks: totalMarks,
      });

      toast.success('Questions saved successfully!');
      navigate(`/tests/${testId}/preview`);
    } catch {
      toast.error('Failed to save questions. Your entered questions are retained.');
    }
  }, [
    testId,
    questionState.questions,
    isQuestionComplete,
    saveAllQuestions,
    currentTest,
    updateTest,
    navigate,
  ]);

  // Loading state
  if (isTestLoading && !currentTest) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const currentQuestionData = questionState.questions[questionState.currentIndex];

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          <span>Test Creation</span>
          <span className="mx-2">/</span>
          <span>Create Test</span>
          <span className="mx-2">/</span>
          <span className="text-gray-700">
            {currentTest?.type === 'chapterwise' ? 'Chapter Wise' : currentTest?.type === 'pyq' ? 'PYQ' : 'Mock Test'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            if (testId) openEditModal(testId);
          }}
          className="rounded-lg bg-indigo-500 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-600"
        >
          Publish
        </button>
      </div>

      {/* Test Summary Card */}
      {currentTest && (
        <TestSummaryCard test={currentTest} onEdit={() => { if (testId) openEditModal(testId); }} />
      )}

      {/* Question Header: Question N /total + MCQ + CSV */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-gray-900">
            Question {questionState.currentIndex + 1}
          </h3>
          <span className="text-sm text-gray-400">/{questionState.questions.length}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAddMCQ}
            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            MCQ
          </button>
          <button
            type="button"
            onClick={handleImportCSV}
            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4" />
            CSV
          </button>
        </div>
      </div>

      {/* Delete All Edits */}
      <button
        type="button"
        onClick={handleDeleteAllEdits}
        className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete All Edits
      </button>

      {/* Hidden file input for CSV import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Question Form */}
      {currentQuestionData && (
        <QuestionForm
          questionData={currentQuestionData}
          index={questionState.currentIndex}
          onUpdate={updateQuestion}
          topicOptions={(currentTest?.topics || []).map(t => ({ value: t, label: t }))}
          subTopicOptions={(currentTest?.sub_topics || []).map(st => ({ value: st, label: st }))}
        />
      )}

      {/* Navigation Arrows - centered */}
      <div className="flex items-center justify-center gap-8 py-4">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={questionState.currentIndex === 0}
          className="p-2 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous question"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={questionState.currentIndex >= questionState.questions.length - 1}
          className="p-2 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next question"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => navigate(`/tests/create`)}
          className="rounded-lg border-2 border-red-500 px-5 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          Edit Test Creation
        </button>

        <div className="flex items-center gap-3">
          {/* Show "Save & Submit" only when at least 1 question is complete */}
          {questionState.questions.some((_, i) => isQuestionComplete(i)) && (
            <button
              type="button"
              onClick={handleSaveAndContinue}
              disabled={questionState.isLoading}
              className="rounded-lg border border-indigo-500 px-6 py-2.5 text-sm font-medium text-indigo-500 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {questionState.isLoading ? 'Saving...' : 'Save & Submit'}
            </button>
          )}

          {/* Next button - navigates to next question */}
          <button
            type="button"
            onClick={() => {
              if (questionState.currentIndex < questionState.questions.length - 1) {
                setCurrentIndex(questionState.currentIndex + 1);
              } else {
                // On last question, trigger save
                handleSaveAndContinue();
              }
            }}
            disabled={questionState.isLoading}
            className="rounded-lg bg-indigo-500 px-8 py-2.5 text-sm font-medium text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            {questionState.currentIndex >= questionState.questions.length - 1
              ? (questionState.isLoading ? 'Saving...' : 'Submit All')
              : 'Next'}
          </button>
        </div>
      </div>

      {/* Error display */}
      {questionState.error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{questionState.error}</p>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default QuestionsPage;
