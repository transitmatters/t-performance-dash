import classNames from 'classnames';
import type { DatePresetKey } from '../../../constants/dates';
import type {
  DateParams,
  DateSelectionDefaultOptions,
  SingleDateParams,
} from './types/DateSelectionTypes';

interface DatePickerPresetsProps {
  preset: DatePresetKey | 'custom' | undefined;
  selectedOptions: DateSelectionDefaultOptions<DateParams | SingleDateParams>[];
  handleSelection: (preset: DatePresetKey) => void;
  close: () => void;
}

export const DatePickerPresets = ({
  preset,
  selectedOptions,
  handleSelection,
  close,
}: DatePickerPresetsProps) => {
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
                  ? 'bg-stone-100 font-semibold text-stone-900 dark:bg-stone-800 dark:text-stone-100'
                  : 'text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800',
                'flex w-full items-start px-4 py-2 text-sm'
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
