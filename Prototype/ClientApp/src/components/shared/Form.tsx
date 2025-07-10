import React from 'react';
import { AlertCircle } from 'lucide-react';

type Option = {
  value: string;
  label: string;
};

type FormFieldProps = {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'select'; // add more as needed
  value: string;
  error?: string;
  placeholder?: string;
  colClass?: string;
  options?: Option[];
  onChange: (name: string, value: string) => void;
};

const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = 'text',
  value,
  error,
  onChange,
  placeholder = '',
  options = [],
  colClass = 'col-12',
}) => {
  const isInvalid = !!error;
  const inputProps = {
    name,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange(name, e.target.value),
    placeholder,
    className: `form-control rounded-3 ${isInvalid ? 'is-invalid' : ''}`,
  };

  return (
    <div className={colClass}>
      <label className="form-label fw-semibold">{label}</label>
      {type === 'select' ? (
        <select {...inputProps} className={`form-select rounded-3 ${isInvalid ? 'is-invalid' : ''}`}>
          <option value="">Select</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input type={type} {...(inputProps as React.InputHTMLAttributes<HTMLInputElement>)} />
      )}
      {isInvalid && (
        <div className="invalid-feedback d-flex align-items-center">
          <AlertCircle size={16} className="me-1" />
          {error}
        </div>
      )}
    </div>
  );
};

export default FormField;
