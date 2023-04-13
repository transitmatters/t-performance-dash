import { Popover, Transition } from '@headlessui/react';
import classNames from 'classnames';
import React, { useEffect, useState, Fragment } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faCalendarWeek } from '@fortawesome/free-solid-svg-icons';
import {
  buttonHighlightFocus,
  lineColorBackground,
  lineColorDarkBorder,
} from '../../../styles/general';
import { useDelimitatedRoute, useUpdateQuery } from '../../../utils/router';
import { RANGE_PRESETS, SINGLE_PRESETS } from '../../../constants/dates';
import { ALL_PAGES } from '../../../constants/pages';
import { DatePickers } from './DatePickers';
import { DatePickerPresets } from './DatePickerPresets';
import { RangeSelectionTab } from './RangeSelectionTab';

interface DateSelectionProps {
  type?: 'combo' | 'range' | 'single';
}

export const DateSelection: React.FC<DateSelectionProps> = ({ type = 'combo' }) => {
  const { line, query, page } = useDelimitatedRoute();
  const [range, setRange] = useState<boolean>(false);
  const [selection, setSelection] = useState<number | undefined>(undefined);
  const updateQueryParams = useUpdateQuery();
  const selectedOptions = range ? RANGE_PRESETS : SINGLE_PRESETS;
  const selectedOptionsArray = Object.values(selectedOptions);
  const { section } = ALL_PAGES[page];
  const handleSelection = (selection: number, range: boolean) => {
    const newOptions = range ? Object.values(RANGE_PRESETS) : Object.values(SINGLE_PRESETS);
    updateQueryParams(newOptions[selection].input ?? null, range);
    setRange(range);
    setSelection(selection);
  };

  useEffect(() => {
    setRange(type !== 'single');
  }, [type]);

  // Temporary solution to prevent presets carrying over across selection.
  // TODO: remove once presetContext is done.
  useEffect(() => {
    setSelection(undefined);
  }, [section, query.queryType]);

  return (
    <div
      className={classNames(
        'flex h-full max-w-full flex-row items-baseline overflow-hidden rounded-t-md border md:max-w-sm md:rounded-md',
        lineColorDarkBorder[line ?? 'DEFAULT']
      )}
    >
      <Popover
        className={classNames(
          'flex h-full w-full self-stretch overflow-hidden text-left',
          lineColorBackground[line ?? 'DEFAULT']
        )}
      >
        <Popover.Button
          className={classNames(
            'flex h-full w-full items-center justify-center self-stretch bg-black bg-opacity-10 px-3 py-1 text-white text-opacity-95 shadow-sm hover:bg-opacity-0 focus:bg-opacity-0 focus:outline-none',
            line && buttonHighlightFocus[line]
          )}
        >
          <FontAwesomeIcon
            icon={range ? faCalendarWeek : faCalendarDay}
            className="pr-1 text-white"
          />
          <p className="truncate">
            {selection != undefined ? selectedOptionsArray[selection].name : 'Custom'}
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
          <Popover.Panel className="absolute bottom-[5.25rem] left-4 z-20 origin-bottom-left overflow-visible rounded-md  bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none md:bottom-auto md:left-4 md:right-auto md:top-8 md:mt-2 md:origin-top-left">
            {({ close }) => (
              <div className="flex w-screen max-w-[240px] flex-col overflow-hidden rounded-md bg-white leading-6 shadow-lg ring-1 ring-gray-900/5">
                {type === 'combo' && <RangeSelectionTab range={range} setRange={setRange} />}
                <DatePickerPresets
                  selection={selection}
                  range={range}
                  selectedOptions={selectedOptionsArray}
                  handleSelection={handleSelection}
                  close={close}
                />
              </div>
            )}
          </Popover.Panel>
        </Transition>
      </Popover>
      <DatePickers setSelection={setSelection} setRange={setRange} range={range} type={type} />
    </div>
  );
};
