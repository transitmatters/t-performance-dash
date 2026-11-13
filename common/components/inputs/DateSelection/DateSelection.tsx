import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faCalendarWeek, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { CONTROL_SURFACE, FOCUS_RING_ON_SURFACE } from '../../../styles/general';
import { useDelimitatedRoute, useUpdateQuery } from '../../../utils/router';
import type { DatePresetKey } from '../../../constants/dates';
import { getRangePresets, SINGLE_PRESETS } from '../../../constants/dates';
import { useDatePresetStore } from '../../../state/datePresetStore';
import { checkForPreset, useSelectedPreset } from '../../../state/utils/datePresetUtils';
import { ALL_PAGES } from '../../../constants/pages';
import type { QueryTypeOptions } from '../../../types/router';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { DatePickers } from './DatePickers';
import { DatePickerPresets } from './DatePickerPresets';

interface DateSelectionProps {
  type: QueryTypeOptions;
}

export const DateSelection = ({ type }: DateSelectionProps) => {
  const { page, tab, query } = useDelimitatedRoute();
  const range = type === 'range';
  const [open, setOpen] = useState<boolean>(false);
  const { dateStoreSection } = ALL_PAGES[page];
  const setDatePreset = useDatePresetStore((state) => state.setDatePreset);
  const datePreset = useSelectedPreset();
  const updateQueryParams = useUpdateQuery();
  const presets = range ? getRangePresets(tab, page) : SINGLE_PRESETS[tab];
  const presetDateArray = Object.values(presets);

  const handleSelection = (datePresetKey: DatePresetKey) => {
    const selectedPreset = presets[datePresetKey];
    if (selectedPreset?.input) updateQueryParams(selectedPreset.input, false);
    setDatePreset(datePresetKey, dateStoreSection, range);
  };

  const clearPreset = () => {
    setDatePreset('custom', dateStoreSection, range);
  };

  useEffect(() => {
    if (checkForPreset(query) !== datePreset) {
      setDatePreset(checkForPreset(query), dateStoreSection, range);
    }
  }, [datePreset, dateStoreSection, query, range, setDatePreset]);

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
            <span className="truncate font-medium">
              {datePreset && presets[datePreset] ? presets[datePreset].name : 'Custom'}
            </span>
          </span>
          <FontAwesomeIcon
            icon={faChevronDown}
            className="size-3 shrink-0 text-stone-500 dark:text-stone-400"
            aria-hidden
          />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 overflow-hidden p-0">
          <div className="flex flex-col overflow-hidden leading-6">
            <DatePickerPresets
              preset={datePreset}
              selectedOptions={presetDateArray}
              handleSelection={handleSelection}
              close={() => setOpen(false)}
            />
          </div>
        </PopoverContent>
      </Popover>
      <DatePickers clearPreset={clearPreset} type={type} />
    </div>
  );
};
