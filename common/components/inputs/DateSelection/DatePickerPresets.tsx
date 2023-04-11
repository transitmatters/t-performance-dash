import React from 'react';
import classNames from 'classnames';
import type { DateSelectionDefaultOptions } from './types/DateSelectionTypes';

interface DatePickerPresetsProps {
  selection: number | undefined;
  range: boolean;
  selectedOptions: DateSelectionDefaultOptions[];
  handleSelection: (selection: number, range: boolean) => void;
  close: () => void;
}

export const DatePickerPresets: React.FC<DatePickerPresetsProps> = ({
  selection,
  range,
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
              handleSelection(index, range);
              close();
            }}
          >
            <div
              className={classNames(
                index === selection
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
