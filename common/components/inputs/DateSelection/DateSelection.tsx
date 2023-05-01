import { Popover, Transition } from '@headlessui/react';
import classNames from 'classnames';
import React, { useEffect, useState, Fragment } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faCalendarWeek } from '@fortawesome/free-solid-svg-icons';
import {
  buttonHighlightFocus,
  lineColorDarkBackground,
  lineColorLightBorder,
} from '../../../styles/general';
import { useDelimitatedRoute, useUpdateQuery } from '../../../utils/router';
import type { DatePresetKey } from '../../../constants/dates';
import { RANGE_PRESETS, SINGLE_PRESETS } from '../../../constants/dates';
import { useDatePresetConfig } from '../../../state/datePresetConfig';
import { useSelectedPreset } from '../../../state/utils/datePresetUtils';
import { ALL_PAGES } from '../../../constants/pages';
import { DatePickers } from './DatePickers';
import { DatePickerPresets } from './DatePickerPresets';
import { RangeSelectionTab } from './RangeSelectionTab';

interface DateSelectionProps {
  type?: 'combo' | 'range' | 'single';
}

export const DateSelection: React.FC<DateSelectionProps> = ({ type = 'combo' }) => {
  const { line, page } = useDelimitatedRoute();
  const [range, setRange] = useState<boolean>(false);
  const { section } = ALL_PAGES[page];
  const setDatePreset = useDatePresetConfig((state) => state.setDatePreset);
  const datePreset = useSelectedPreset(range);
  const updateQueryParams = useUpdateQuery();
  const presets = range ? RANGE_PRESETS : SINGLE_PRESETS;
  const presetDateArray = Object.values(presets);

  const handleSelection = (datePresetKey: DatePresetKey) => {
    const selectedPreset = presets[datePresetKey];
    if (selectedPreset?.input) updateQueryParams(selectedPreset.input, range);
    setDatePreset(datePresetKey, section, range);
  };

  useEffect(() => {
    setRange(type !== 'single');
  }, [type]);

  const clearPreset = () => {
    setDatePreset('custom', section, range);
  };

  return (
    <div
      className={classNames(
        'flex w-full flex-row overflow-hidden rounded-md  md:max-w-sm md:overflow-visible lg:w-auto'
      )}
    >
      <Popover
        className={classNames('flex h-10 w-full self-stretch overflow-hidden text-left md:h-7')}
      >
        <Popover.Button
          className={classNames(
            'flex h-10 w-full items-center justify-center self-stretch rounded-l-[.25rem] border px-3 py-1 text-white text-opacity-95 hover:bg-opacity-70 focus:bg-opacity-70 focus:outline-none md:h-7',
            line && buttonHighlightFocus[line],
            lineColorLightBorder[line ?? 'DEFAULT'],
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
        </Popover.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Popover.Panel className="fixed bottom-[5.25rem] left-4 origin-bottom-left overflow-visible rounded-md  bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none md:bottom-auto md:left-auto md:right-auto md:top-auto md:mt-9 md:origin-top-left">
            {({ close }) => (
              <div className="flex w-screen max-w-[240px] flex-col overflow-hidden rounded-md bg-white leading-6 shadow-lg ring-1 ring-gray-900/5">
                {type === 'combo' && <RangeSelectionTab range={range} setRange={setRange} />}
                <DatePickerPresets
                  preset={datePreset}
                  selectedOptions={presetDateArray}
                  handleSelection={handleSelection}
                  close={close}
                />
              </div>
            )}
          </Popover.Panel>
        </Transition>
      </Popover>
      <DatePickers clearPreset={clearPreset} setRange={setRange} range={range} type={type} />
    </div>
  );
};
