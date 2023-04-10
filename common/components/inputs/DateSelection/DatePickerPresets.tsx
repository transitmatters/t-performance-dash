import React from 'react';
import classNames from 'classnames';
import type { DateSelectionDefaultOptions, DateSelectionInput } from './types/DateSelectionTypes';

interface DatePickerPresetsProps {
  config: DateSelectionInput;
  selectedOptions: DateSelectionDefaultOptions[];
  handleSelection: (selection: number, range: boolean) => void;
  close: () => void;
}

export const DatePickerPresets: React.FC<DatePickerPresetsProps> = ({
  config,
  selectedOptions,
  handleSelection,
  close,
}) => {
  return (
    <div className="flex w-full flex-col">
      {selectedOptions.map((item, index) => (
        <div key={index} className="w-full">
          <button
            className="w-full"
            onClick={() => {
              handleSelection(index, config.range);
              close();
            }}
          >
            <div
              className={classNames(
                index === config.selection
                  ? 'bg-gray-200 text-gray-900'
                  : 'text-gray-70 bg-gray-100 bg-opacity-0',
                'flex w-full items-start px-4 py-2 text-sm hover:bg-opacity-80'
              )}
            >
              {item.name}
            </div>
          </button>
        </div>
      ))}
    </div>
  );
};
