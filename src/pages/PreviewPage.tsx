import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTest } from '../contexts/TestContext';
import { useUI } from '../contexts/UIContext';
import TestSummaryCard from '../components/test/TestSummaryCard';
import EditTestModal from '../components/test/EditTestModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import AsyncSelect from '../components/common/AsyncSelect';
import { DurationOption, PublishOptions } from '../types';

const durationOptions: { value: DurationOption; label: string }[] = [
  { value: 'always', label: 'Always Available' },
  { value: '1_week', label: '1 Week' },
  { value: '2_weeks', label: '2 Weeks' },
  { value: '3_weeks', label: '3 Weeks' },
  { value: '1_month', label: '1 Month' },
  { value: 'custom', label: 'Custom Duration' },
];

const PreviewPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { state: testState, fetchTestById, publishTest } = useTest();
  const { openEditModal } = useUI();

  const { currentTest, isLoading: testLoading, error: testError } = testState;

  // Publish form state
  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now');
  const [duration, setDuration] = useState<DurationOption>('always');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [customEndTime, setCustomEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch test on mount
  useEffect(() => {
    if (testId) {
      fetchTestById(testId);
    }
  }, [testId, fetchTestById]);

  const handleRetry = useCallback(() => {
    if (testId) {
      fetchTestById(testId);
    }
  }, [testId, fetchTestById]);

  const handleConfirmPublish = async () => {
    if (!testId || !currentTest) return;

    setIsSubmitting(true);
    try {
      const options: PublishOptions = {
        mode: publishMode,
        duration,
        customEndDate: customEndDate || undefined,
        customEndTime: customEndTime || undefined,
        scheduledDate: publishMode === 'schedule' ? scheduledDate : undefined,
        scheduledTime: publishMode === 'schedule' ? scheduledTime : undefined,
      };

      await publishTest(testId, options);
      toast.success('Test published successfully!');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to publish test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (testLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (testError && !currentTest) {
    return (
      <div className="p-6">
        <ErrorMessage message={testError} onRetry={handleRetry} />
      </div>
    );
  }

  if (!currentTest) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-sm text-gray-500">Test not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500">Test creation</div>

      {/* Test Created Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-gray-900">Test created</h2>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          All {currentTest.total_questions} Questions done
        </span>
      </div>

      {/* Test Summary Card */}
      <TestSummaryCard test={currentTest} onEdit={() => openEditModal(currentTest.id)} />

      {/* Publish Section - Inline (not a modal) */}
      <div className="space-y-6">
        {/* Publish Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-200 pb-0">
          <button
            type="button"
            onClick={() => setPublishMode('now')}
            className={`pb-3 text-sm font-medium transition-colors ${
              publishMode === 'now'
                ? 'border-b-2 border-gray-900 text-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Publish Now
          </button>
          <button
            type="button"
            onClick={() => setPublishMode('schedule')}
            className={`pb-3 text-sm font-medium transition-colors ${
              publishMode === 'schedule'
                ? 'border-b-2 border-gray-900 text-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Schedule Publish
          </button>
        </div>

        {/* Schedule Date and Time (only for schedule mode) */}
        {publishMode === 'schedule' && (
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Select Date and Time</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Select Date"
                />
              </div>
              <div>
                <AsyncSelect
                  options={[
                    { value: '08:00', label: '08:00 AM' },
                    { value: '09:00', label: '09:00 AM' },
                    { value: '10:00', label: '10:00 AM' },
                    { value: '11:00', label: '11:00 AM' },
                    { value: '12:00', label: '12:00 PM' },
                    { value: '13:00', label: '01:00 PM' },
                    { value: '14:00', label: '02:00 PM' },
                    { value: '15:00', label: '03:00 PM' },
                    { value: '16:00', label: '04:00 PM' },
                    { value: '17:00', label: '05:00 PM' },
                    { value: '18:00', label: '06:00 PM' },
                  ]}
                  value={scheduledTime}
                  onChange={(val) => setScheduledTime(val)}
                  placeholder="Select Time"
                />
              </div>
            </div>
          </div>
        )}

        {/* Live Until Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Live Until</h3>
          <p className="text-xs text-gray-500 mb-4">
            Choose how long this test should remain available on the platform.
          </p>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {durationOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name="duration"
                  value={option.value}
                  checked={duration === option.value}
                  onChange={() => setDuration(option.value)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Duration End Date/Time */}
        {duration === 'custom' && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Select End Date"
              />
            </div>
            <div>
              <AsyncSelect
                options={[
                  { value: '08:00', label: '08:00 AM' },
                  { value: '09:00', label: '09:00 AM' },
                  { value: '10:00', label: '10:00 AM' },
                  { value: '11:00', label: '11:00 AM' },
                  { value: '12:00', label: '12:00 PM' },
                  { value: '13:00', label: '01:00 PM' },
                  { value: '14:00', label: '02:00 PM' },
                  { value: '15:00', label: '03:00 PM' },
                  { value: '16:00', label: '04:00 PM' },
                  { value: '17:00', label: '05:00 PM' },
                  { value: '18:00', label: '06:00 PM' },
                ]}
                value={customEndTime}
                onChange={(val) => setCustomEndTime(val)}
                placeholder="Select End Time"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 px-8 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmPublish}
            disabled={isSubmitting}
            className="rounded-lg bg-indigo-500 px-8 py-2.5 text-sm font-medium text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Publishing...' : 'Confirm'}
          </button>
        </div>
      </div>

      {/* Modals */}
      <EditTestModal />
      <ConfirmDialog />
    </div>
  );
};

export default PreviewPage;
