import React from 'react';
import { ChevronDown } from 'lucide-react';

interface AsyncSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  error?: string;
}

const AsyncSelect: React.FC<AsyncSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Choose from Drop-down',
  isLoading = false,
  disabled = false,
  error,
}) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || isLoading}
        className={`w-full appearance-none rounded-lg border bg-white px-4 py-2.5 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${!value ? 'text-gray-400' : 'text-gray-700'}`}
        aria-invalid={!!error}
        aria-describedby={error ? 'async-select-error' : undefined}
      >
        <option value="" disabled>
          {isLoading ? 'Loading...' : placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Custom chevron icon */}
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </div>

      {error && (
        <p id="async-select-error" className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default AsyncSelect;
