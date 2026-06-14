import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { useUI } from '../../contexts/UIContext';
import { useTest } from '../../contexts/TestContext';
import { publishSchema, PublishFormValues } from '../../schemas/publish.schema';
import { PublishOptions, DurationOption } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';

const durationOptions: { value: DurationOption; label: string }[] = [
  { value: 'always', label: 'Always Available' },
  { value: '1_week', label: '1 Week' },
  { value: '2_weeks', label: '2 Weeks' },
  { value: '3_weeks', label: '3 Weeks' },
  { value: '1_month', label: '1 Month' },
  { value: 'custom', label: 'Custom Duration' },
];

const PublishDialog: React.FC = () => {
  const navigate = useNavigate();
  const { state: uiState, closePublishDialog } = useUI();
  const { state: testState, publishTest } = useTest();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { publishDialogOpen } = uiState;
  const { currentTest } = testState;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PublishFormValues>({
    resolver: zodResolver(publishSchema),
    defaultValues: {
      mode: 'now',
      duration: 'always',
      customEndDate: '',
      customEndTime: '',
    },
  });

  const mode = watch('mode');
  const duration = watch('duration');

  if (!publishDialogOpen) {
    return null;
  }

  const handleTabChange = (newMode: 'now' | 'schedule') => {
    setValue('mode', newMode);
  };

  const onSubmit = async (data: PublishFormValues) => {
    if (!currentTest) return;

    setIsSubmitting(true);
    try {
      const options: PublishOptions = {
        mode: data.mode,
        duration: data.duration,
        customEndDate: data.customEndDate || undefined,
        customEndTime: data.customEndTime || undefined,
      };

      if (data.mode === 'schedule') {
        options.scheduledDate = data.scheduledDate;
        options.scheduledTime = data.scheduledTime;
      }

      await publishTest(currentTest.id, options);
      toast.success('Test published successfully!');
      closePublishDialog();
      navigate('/dashboard');
    } catch {
      toast.error('Failed to publish test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    closePublishDialog();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label="Publish Test"
    >
      <div className="relative mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        {/* Close button */}
        <button
          type="button"
          onClick={handleCancel}
          className="absolute right-4 top-4 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Close publish dialog"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <h2 className="mb-4 text-xl font-semibold text-gray-900">Publish Test</h2>

        {/* Tabs */}
        <div className="mb-6 flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => handleTabChange('now')}
            className={`px-4 py-2 text-sm font-medium ${
              mode === 'now'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Publish Now
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('schedule')}
            className={`px-4 py-2 text-sm font-medium ${
              mode === 'schedule'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Schedule Publish
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Schedule fields (only when mode is 'schedule') */}
          {mode === 'schedule' && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Schedule Date & Time</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="scheduledDate" className="block text-xs text-gray-600">
                    Date
                  </label>
                  <Controller
                    name="scheduledDate"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="scheduledDate"
                        type="date"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    )}
                  />
                  {'scheduledDate' in errors && errors.scheduledDate && (
                    <p className="mt-1 text-xs text-red-600">{errors.scheduledDate.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="scheduledTime" className="block text-xs text-gray-600">
                    Time
                  </label>
                  <Controller
                    name="scheduledTime"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="scheduledTime"
                        type="time"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    )}
                  />
                  {'scheduledTime' in errors && errors.scheduledTime && (
                    <p className="mt-1 text-xs text-red-600">{errors.scheduledTime.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Live Until / Duration section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Live Until</h3>
            <Controller
              name="duration"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  {durationOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        value={option.value}
                        checked={field.value === option.value}
                        onChange={() => field.onChange(option.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              )}
            />
          </div>

          {/* Custom duration fields */}
          {duration === 'custom' && (
            <div className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-3">
              <h4 className="text-xs font-medium text-gray-600">Custom End Date & Time</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="customEndDate" className="block text-xs text-gray-600">
                    End Date
                  </label>
                  <Controller
                    name="customEndDate"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="customEndDate"
                        type="date"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    )}
                  />
                </div>
                <div>
                  <label htmlFor="customEndTime" className="block text-xs text-gray-600">
                    End Time
                  </label>
                  <Controller
                    name="customEndTime"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="customEndTime"
                        type="time"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error from context */}
          {testState.error && (
            <p className="text-sm text-red-600">{testState.error}</p>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting && <LoadingSpinner size="sm" />}
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublishDialog;
