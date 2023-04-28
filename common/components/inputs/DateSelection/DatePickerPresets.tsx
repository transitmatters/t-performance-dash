import React from 'react';
import classNames from 'classnames';
import type { DatePresetKey } from '../../../constants/dates';
import type { DateSelectionDefaultOptions } from './types/DateSelectionTypes';

interface DatePickerPresetsProps {
  preset: DatePresetKey | 'custom' | undefined;
  selectedOptions: DateSelectionDefaultOptions[];
  handleSelection: (preset: DatePresetKey) => void;
  close: () => void;
}

export const DatePickerPresets: React.FC<DatePickerPresetsProps> = ({
  preset,
  selectedOptions,
  handleSelection,
  close,
}) => {
  return (
    <div className="flex w-full flex-col">
      {selectedOptions.map((item) => (
        <div key={item.key} className="w-full">
          <button
            className="w-full"
            onClick={() => {
              handleSelection(item.key);
              close();
            }}
          >
            <div
              className={classNames(
                item.key === preset
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
