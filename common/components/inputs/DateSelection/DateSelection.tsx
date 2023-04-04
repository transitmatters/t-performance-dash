import { Popover, Transition } from '@headlessui/react';
import classNames from 'classnames';
import React, { Fragment, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { faCalendarDay, faCalendarWeek } from '@fortawesome/free-solid-svg-icons';
import { lineColorBackground, lineColorDarkBorder } from '../../../styles/general';
import { useDelimitatedRoute, useUpdateQuery } from '../../../utils/router';
import { buttonHighlightConfig } from '../styles/inputStyle';
import { DatePickers } from './DatePickers';
import { DATE_PICKER_PRESETS, TODAY_STRING } from '../../../constants/dates';
import type { DateSelectionInput } from './types/DateSelectionTypes';
import { RangeSelectionTab } from './RangeSelectionTab';
import { DatePickerPresets } from './DatePickerPresets';

export const DateSelection = () => {
  const { line, query } = useDelimitatedRoute();
  const { startDate, endDate } = query;
  const [config, setConfig] = useState<DateSelectionInput>({
    range: false,
    selection: 0,
  });
  const [firstLoad, setFirstLoad] = useState(true);
  const router = useRouter();
  const updateQueryParams = useUpdateQuery();
  const selectedOptions = config.range ? DATE_PICKER_PRESETS.range : DATE_PICKER_PRESETS.singleDay;

  const handleSelection = (selection: number, range: boolean) => {
    const newOptions = range ? DATE_PICKER_PRESETS.range : DATE_PICKER_PRESETS.singleDay;
    updateQueryParams(newOptions[selection].input ?? null, range);
    setConfig({ range: range, selection: selection });
  };

  /*
    This allows us to set the preset to "today" if someone navigates to the page with today's date in the params.
    Wait until router.isReady so startDate & endDate are populated.
  */
  useEffect(() => {
    const isRange = Boolean(startDate && endDate);
    const isToday = Boolean(startDate === TODAY_STRING);
    if (firstLoad && router.isReady) {
      setConfig({ range: isRange, selection: isToday ? 0 : undefined });
      setFirstLoad(false);
    }
  }, [router.isReady, startDate, endDate, firstLoad]);

  return (
    <div
      className={classNames(
        'flex h-full max-w-full flex-row  items-baseline overflow-hidden rounded-t-md border md:rounded-md',
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
            line && buttonHighlightConfig[line]
          )}
        >
          <FontAwesomeIcon
            icon={config.range ? faCalendarWeek : faCalendarDay}
            className="pr-1 text-white"
          />
          <p className="truncate">
            {config.selection != undefined ? selectedOptions[config.selection].name : 'Custom'}
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
          <Popover.Panel className="absolute bottom-[5.25rem] left-4 z-20 origin-bottom-left overflow-visible rounded-md  bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none md:bottom-auto md:right-auto md:left-4 md:top-8 md:mt-2 md:origin-top-left">
            {({ close }) => (
              <div className="flex w-screen max-w-[240px] flex-col overflow-hidden rounded-md bg-white leading-6 shadow-lg ring-1 ring-gray-900/5">
                <RangeSelectionTab config={config} handleSelection={handleSelection} />
                <DatePickerPresets
                  config={config}
                  selectedOptions={selectedOptions}
                  handleSelection={handleSelection}
                  close={close}
                />
              </div>
            )}
          </Popover.Panel>
        </Transition>
      </Popover>
      <DatePickers config={config} setConfig={setConfig} />
    </div>
  );
};
