import classNames from 'classnames';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faCalendarWeek, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { CONTROL_SURFACE, FOCUS_RING_ON_SURFACE } from '../../../styles/general';
import { usePageRoute, useUpdateQuery } from '../../../utils/router';
import type { DatePresetKey } from '../../../constants/dates';
import type { NotableDate } from '../../../constants/notableDates';
import { getRangePresets, SINGLE_PRESETS } from '../../../constants/dates';
import { checkForPreset } from '../../../utils/datePresets';
import type { QueryTypeOptions } from '../../../types/router';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { DatePickers } from './DatePickers';
import { DatePickerPresets } from './DatePickerPresets';
import { NotableDatePresets } from './NotableDatePresets';
import { useNotableDates } from './useNotableDates';

interface DateSelectionProps {
  type: QueryTypeOptions;
}

export const DateSelection = ({ type }: DateSelectionProps) => {
  const { page, tab, query } = usePageRoute();
  const range = type === 'range';
  const [open, setOpen] = useState<boolean>(false);
  const datePreset = checkForPreset(query);
  const updateQueryParams = useUpdateQuery();
  const presets = range ? getRangePresets(tab, page) : SINGLE_PRESETS[tab];
  const presetDateArray = Object.values(presets);
  const notable = useNotableDates(type);
  const selectedName =
    (datePreset !== 'custom' ? presets[datePreset]?.name : undefined) ??
    notable.selected?.label ??
    'Custom';

  const handleSelection = (datePresetKey: DatePresetKey) => {
    const selectedPreset = presets[datePresetKey];
    if (selectedPreset?.input) updateQueryParams(selectedPreset.input, false);
  };

  const handleNotableSelection = (entry: NotableDate) => {
    updateQueryParams(notable.queryFor(entry), false);
  };

  return (
    <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={classNames(
            'flex h-10 w-full items-center justify-between gap-x-2 rounded-md px-3 text-sm whitespace-nowrap focus-visible:ring-offset-1 md:h-8 md:w-auto',
            CONTROL_SURFACE,
            FOCUS_RING_ON_SURFACE
          )}
        >
          <span className="flex min-w-0 items-center gap-x-2">
            <FontAwesomeIcon
              icon={range ? faCalendarWeek : faCalendarDay}
              className="size-3.5 shrink-0 text-stone-500 dark:text-stone-400"
              aria-hidden
            />
            <span className="truncate font-medium">{selectedName}</span>
          </span>
          <FontAwesomeIcon
            icon={faChevronDown}
            className="size-3 shrink-0 text-stone-500 dark:text-stone-400"
            aria-hidden
          />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="max-h-(--radix-popover-content-available-height) w-64 overflow-y-auto p-0"
        >
          <div className="flex flex-col leading-6">
            <DatePickerPresets
              preset={datePreset}
              selectedOptions={presetDateArray}
              handleSelection={handleSelection}
              close={() => setOpen(false)}
            />
            <NotableDatePresets
              options={notable.options}
              selected={notable.selected}
              handleSelection={handleNotableSelection}
              close={() => setOpen(false)}
            />
          </div>
        </PopoverContent>
      </Popover>
      <DatePickers type={type} />
    </div>
  );
};
