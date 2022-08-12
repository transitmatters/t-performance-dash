import React from 'react';
import classNames from 'classnames';
import { Option } from './types';

interface RadioFormProps {
  options: Option[];
  onChange: (value: string) => void;
  checked: string;
  className: string;
}

const RadioForm: React.FC<RadioFormProps> = ({ options, onChange, checked, className }) => {
  return (
    <div className={classNames('control', className)}>
      {options.map((opt, index) => (
        <label key={index}>
          <input
            type="radio"
            value={opt.value}
            onChange={(evt) => onChange(evt.target.value)}
            checked={opt.value === checked}
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
};

export default RadioForm;
