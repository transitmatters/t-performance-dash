import classNames from 'classnames';
import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faCalendarWeek } from '@fortawesome/free-solid-svg-icons';
import {
  buttonHighlightFocus,
  lineColorDarkBackground,
  lineColorLightBorder,
  lineColorVar,
} from '../../../styles/general';
import { useDelimitatedRoute, useUpdateQuery } from '../../../utils/router';
import type { DatePresetKey } from '../../../constants/dates';
import { RANGE_PRESETS, SINGLE_PRESETS } from '../../../constants/dates';
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

export const DateSelection: FC<DateSelectionProps> = ({ type }) => {
  const { line, page, tab, query } = useDelimitatedRoute();
  const range = type === 'range';
  const [open, setOpen] = useState<boolean>(false);
  const { dateStoreSection } = ALL_PAGES[page];
  const setDatePreset = useDatePresetStore((state) => state.setDatePreset);
  const datePreset = useSelectedPreset();
  const updateQueryParams = useUpdateQuery();
  const presets = range ? RANGE_PRESETS[tab] : SINGLE_PRESETS[tab];
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
    <div
      className={classNames(
        'flex w-full flex-row overflow-visible rounded-md border md:max-w-sm lg:w-auto',
        lineColorLightBorder[line ?? 'DEFAULT']
      )}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          style={lineColorVar(line)}
          className={classNames(
            'flex h-10 w-full items-center justify-center self-stretch rounded-l-[calc(var(--radius-md)-1px)] px-3 py-1 text-white/95 hover:bg-(--line-color-dark)/70 focus-visible:bg-(--line-color-dark)/70 focus-visible:ring-2 focus-visible:outline-hidden md:h-7',
            line && buttonHighlightFocus[line],
            lineColorDarkBackground[line ?? 'DEFAULT']
          )}
        >
          <FontAwesomeIcon
            icon={range ? faCalendarWeek : faCalendarDay}
            className="pr-1 text-white"
          />
          <p className="truncate">
            {datePreset && presets[datePreset] ? presets[datePreset].name : 'Custom'}
          </p>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          // Wide enough to fully clear a card's own header controls when this opens over them —
          // a narrower box left a few px of the row peeking past its right edge (odd notch).
          className="w-56 overflow-hidden p-0"
        >
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
