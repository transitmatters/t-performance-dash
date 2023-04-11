import classNames from 'classnames';
import React from 'react';
import { useDelimitatedRoute } from '../../utils/router';
import { buttonHighlightFocus, lineColorText } from '../../styles/general';

interface RadioListProps {
  title?: React.ReactNode;
  legendText: React.ReactNode;
  defaultValue?: string;
  value: string;
  setValue: (value: string) => void;
  options: { value: string; label: string }[];
}

export const RadioList: React.FC<RadioListProps> = ({
  title,
  legendText,
  value,
  setValue,
  defaultValue,
  options,
}) => {
  const { line } = useDelimitatedRoute();

  return (
    <div>
      <label className="text-base font-semibold text-gray-900">{title}</label>
      <fieldset className="mt-4">
        <legend className="sr-only">{legendText}</legend>
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option.value} className="flex items-center">
              <input
                id={option.value}
                name="notification-method"
                type="radio"
                defaultChecked={option.value === defaultValue}
                checked={option.value === value}
                className={classNames(
                  'ml-2 h-3 w-3 border-gray-300',
                  line && `${lineColorText[line]} ${buttonHighlightFocus[line]}`
                )}
                onClick={() => {
                  setValue(option.value);
                }}
              />
              <label
                htmlFor={option.value}
                className="ml-2 block text-sm font-normal leading-6 text-gray-900"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  );
};
