import React, { useRef } from 'react';
import classNames from 'classnames';
import { Option, Options } from './types';

interface SelectProps {
  options: Options;
  /** Non-standard value comparator because from/to gets copied by onpopstate */
  optionComparator: (option: Option) => boolean;
  onChange: (value: string | undefined) => void;
  defaultLabel: string;
  value: string;
  className: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  optionComparator,
  onChange,
  defaultLabel = '',
  value,
  className,
}) => {
  const elementRef = useRef(null);
  const optionValues = Object.values(options);

  const handleChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    const option = options[evt.target.value];
    onChange(option?.value);
  };

  const matchingIndex = optionValues.findIndex(optionComparator || ((o) => o.value === value));

  return (
    <div
      className={classNames('select-component', className, optionValues.length === 0 && 'disabled')}
    >
      <select
        ref={elementRef}
        onChange={handleChange}
        value={matchingIndex === -1 ? 'default' : matchingIndex}
      >
        <option value="default" disabled hidden>
          {defaultLabel}
        </option>
        {optionValues.map((option, index) => (
          <option value={index} key={index} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
