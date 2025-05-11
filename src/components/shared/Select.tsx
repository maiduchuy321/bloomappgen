// src/components/shared/Select.tsx
import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  label?: string;
  icon?: React.ReactNode;
  onChange?: (value: string) => void;
  compact?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  options,
  label,
  icon,
  onChange,
  compact = false,
  className = '',
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value);
  };
  
  const selectClass = compact ? 'compact-select' : 'select-control';
  const combinedClasses = [selectClass, className].filter(Boolean).join(' ');
  
  return (
    <div className="select-container">
      {label && (
        <label htmlFor={props.id} className="select-label">
          {icon && <span className="select-icon">{icon}</span>}
          {label}
        </label>
      )}
      <select
        className={combinedClasses}
        onChange={handleChange}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};