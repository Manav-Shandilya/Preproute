import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
  id?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  error,
  id,
}) => {
  const increment = () => {
    const newVal = value + step;
    if (max === undefined || newVal <= max) {
      onChange(newVal);
    }
  };

  const decrement = () => {
    const newVal = value - step;
    if (min === undefined || newVal >= min) {
      onChange(newVal);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed)) {
      onChange(parsed);
    } else if (e.target.value === '' || e.target.value === '-') {
      onChange(0);
    }
  };

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        className={`w-full rounded-lg border bg-white px-4 py-2.5 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {/* Up/Down arrows - always visible */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col">
        <button
          type="button"
          onClick={increment}
          className="flex items-center justify-center h-4 w-5 text-gray-400 hover:text-gray-700 transition-colors"
          tabIndex={-1}
          aria-label="Increment"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={decrement}
          className="flex items-center justify-center h-4 w-5 text-gray-400 hover:text-gray-700 transition-colors"
          tabIndex={-1}
          aria-label="Decrement"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};

export default NumberInput;
