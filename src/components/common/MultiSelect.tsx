import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface MultiSelectProps {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  error?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  isLoading = false,
  disabled = false,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRemove = (valueToRemove: string) => {
    onChange(value.filter((v) => v !== valueToRemove));
  };

  const handleSelect = (selectedValue: string) => {
    if (!value.includes(selectedValue)) {
      onChange([...value, selectedValue]);
    }
    setIsOpen(false);
  };

  const availableOptions = options.filter((opt) => !value.includes(opt.value));

  const getLabel = (val: string): string => {
    const option = options.find((opt) => opt.value === val);
    return option ? option.label : val;
  };

  return (
    <div className="relative" ref={containerRef}>
      <div
        className={`min-h-[38px] w-full rounded-md border px-2 py-1.5 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'cursor-not-allowed bg-gray-100' : 'cursor-pointer bg-white'}`}
        onClick={() => {
          if (!disabled && !isLoading) setIsOpen(!isOpen);
        }}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-disabled={disabled || isLoading}
      >
        <div className="flex flex-wrap items-center gap-1">
          {value.length === 0 && (
            <span className="px-1 text-sm text-gray-400">
              {isLoading ? 'Loading...' : placeholder}
            </span>
          )}
          {value.map((val) => (
            <span
              key={val}
              className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
            >
              {getLabel(val)}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(val);
                }}
                className="rounded-sm hover:bg-blue-200 focus:outline-none"
                aria-label={`Remove ${getLabel(val)}`}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <div className="ml-auto flex items-center">
            {isLoading && (
              <div className="mr-1 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
            )}
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {isOpen && availableOptions.length > 0 && (
        <ul
          className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
          role="listbox"
          aria-multiselectable="true"
        >
          {availableOptions.map((option) => (
            <li
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-blue-50"
              role="option"
              aria-selected={false}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}

      {isOpen && availableOptions.length === 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 shadow-lg">
          No options available
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};

export default MultiSelect;
