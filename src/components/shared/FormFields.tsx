import React from 'react';
import { theme } from '../../theme';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required = false,
  description,
  children,
  className,
}) => {
  return (
    <div className={`space-y-2 ${className || ''}`}>
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}
      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
};

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
  description?: string;
  containerClassName?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  required = false,
  description,
  containerClassName,
  className,
  ...props
}) => {
  const inputElement = (
    <input
      className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
        error ? 'border-red-500 focus:ring-red-500' : ''
      } ${className || ''}`}
      {...props}
    />
  );

  if (label) {
    return (
      <FormField
        label={label}
        error={error}
        required={required}
        description={description}
        className={containerClassName}
      >
        {inputElement}
      </FormField>
    );
  }

  return inputElement;
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
  description?: string;
  containerClassName?: string;
}

export const TextareaInput: React.FC<TextareaProps> = ({
  label,
  error,
  required = false,
  description,
  containerClassName,
  className,
  ...props
}) => {
  const textareaElement = (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
        error ? 'border-red-500 focus:ring-red-500' : ''
      } ${className || ''}`}
      {...props}
    />
  );

  if (label) {
    return (
      <FormField
        label={label}
        error={error}
        required={required}
        description={description}
        className={containerClassName}
      >
        {textareaElement}
      </FormField>
    );
  }

  return textareaElement;
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  required?: boolean;
  description?: string;
  containerClassName?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const SelectInput: React.FC<SelectProps> = ({
  label,
  error,
  required = false,
  description,
  containerClassName,
  className,
  options,
  placeholder = 'Select an option',
  ...props
}) => {
  const selectElement = (
    <select
      className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
        error ? 'border-red-500 focus:ring-red-500' : ''
      } ${className || ''}`}
      {...props}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  if (label) {
    return (
      <FormField
        label={label}
        error={error}
        required={required}
        description={description}
        className={containerClassName}
      >
        {selectElement}
      </FormField>
    );
  }

  return selectElement;
};
