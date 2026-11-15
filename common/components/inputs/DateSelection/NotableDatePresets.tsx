import classNames from 'classnames';
import { useId } from 'react';
import type { NotableDate } from '../../../constants/notableDates';
import { formatNotableDate } from '../../../utils/notableDates';

interface NotableDatePresetsProps {
  options: NotableDate[];
  selected: NotableDate | undefined;
  handleSelection: (entry: NotableDate) => void;
  close: () => void;
}

/** Notable days or periods on this line, listed under the usual presets. */
export const NotableDatePresets = ({
  options,
  selected,
  handleSelection,
  close,
}: NotableDatePresetsProps) => {
  const headingId = useId();
  if (!options.length) return null;
  return (
    <div
      role="group"
      aria-labelledby={headingId}
      className="flex w-full flex-col border-t border-stone-200 dark:border-stone-700"
    >
      <span
        id={headingId}
        className="px-4 pt-2.5 pb-1 text-xs font-medium text-stone-500 dark:text-stone-400"
      >
        Notable dates
      </span>
      {options.map((entry) => (
        <button
          key={entry.label}
          className="w-full"
          onClick={() => {
            handleSelection(entry);
            close();
          }}
        >
          <div
            className={classNames(
              entry === selected
                ? 'bg-stone-100 font-semibold text-stone-900 dark:bg-stone-800 dark:text-stone-100'
                : 'text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800',
              'flex w-full flex-col items-start px-4 py-1.5 text-left text-sm'
            )}
          >
            {entry.label}
            <span className="text-xs font-normal text-stone-500 tabular-nums dark:text-stone-400">
              {formatNotableDate(entry)}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};
