import { Popover, Tab, Transition } from '@headlessui/react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import React, { Fragment, useEffect, useState } from 'react';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  lineColorBackground,
  lineColorBorder,
  lineColorDarkBorder,
  lineColorText,
} from '../../../styles/general';
import { useDelimitatedRoute, useUpdateQuery } from '../../../utils/router';
import { buttonHighlightConfig } from '../styles/inputStyle';
import { DatePickers } from './DatePickers';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useRouter } from 'next/router';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
const est = 'America/New_York';

dayjs.extend(utc);
dayjs.extend(timezone);
const dateFormat = 'YYYY-MM-DD';
const today = dayjs().tz(est);
const todayString = today.format(dateFormat);

const options = {
  singleDay: [
    { name: 'Today', input: { startDate: todayString } },
    { name: 'Yesterday', input: { startDate: today.subtract(1, 'day').format(dateFormat) } },
    {
      name: `Last ${today.subtract(7, 'days').format('dddd')}`,
      input: {
        startDate: today.subtract(7, 'days').format(dateFormat),
      },
    },
    {
      name: `One year ago`,
      input: {
        startDate: today.subtract(1, 'year').format(dateFormat),
      },
    },
  ],
  range: [
    {
      name: 'Past week',
      input: {
        startDate: today.subtract(7, 'days').format(dateFormat),
        endDate: todayString,
      },
    },

    {
      name: 'Past 30 days',
      input: {
        startDate: today.subtract(30, 'days').format(dateFormat),
        endDate: todayString,
      },
    },
    {
      name: today.format('MMMM YYYY'),
      input: {
        startDate: today.startOf('month').format(dateFormat),
        endDate: todayString,
      },
    },
    {
      name: today.subtract(1, 'month').format('MMMM YYYY'),
      input: {
        startDate: today.subtract(1, 'month').startOf('month').format(dateFormat),
        endDate: today.subtract(1, 'month').endOf('month').format(dateFormat),
      },
    },
  ],
};
const rangeOptions = ['Single Day', 'Range'];

export const DateSelection = () => {
  const {
    line,
    query: { startDate, endDate },
  } = useDelimitatedRoute();
  const router = useRouter();
  let todayLink = false;
  if (startDate === todayString) {
    todayLink = true;
  }
  const updateQueryParams = useUpdateQuery();
  const [custom, setCustom] = useState<boolean>(false); // TODO: remove this and determine based on selected != undefined
  const [config, setConfig] = useState<{ range: boolean; selection: number | undefined }>({
    range: false,
    selection: 0,
  });
  const [firstLoad, setFirstLoad] = useState(true);
  const selectedOptions = config.range ? options.range : options.singleDay;
  const currentSelection =
    config.selection != undefined ? selectedOptions[config.selection] : undefined;

  const handleSelection = (selection, range) => {
    const newOptions = range ? options.range : options.singleDay;
    if (newOptions[selection].name === 'Custom') {
      setCustom(true);
    } else if (newOptions[selection].input) {
      setCustom(false);
      updateQueryParams(newOptions[selection].input ?? null, range);
    }
    setConfig({ range: range, selection: selection });
  };

  useEffect(() => {
    const isRange = Boolean(startDate && endDate);
    const isToday = Boolean(startDate === todayString);
    if (firstLoad && router.isReady) {
      setConfig({ range: isRange, selection: isToday ? 0 : selectedOptions.length - 1 });
      setCustom(!isToday);
    } else {
      setFirstLoad(!router.isReady);
    }
  }, [router.isReady]);

  return (
    <div
      className={classNames(
        'flex h-full max-w-full flex-row items-baseline overflow-hidden',
        lineColorBackground[line ?? 'DEFAULT']
      )}
    >
      <Popover className="flex h-full self-stretch overflow-hidden text-left">
        <Popover.Button
          className={classNames(
            'flex h-full w-full items-center self-stretch border bg-black bg-opacity-10 px-3 py-1 text-white text-opacity-90 shadow-sm hover:bg-opacity-5  focus:outline-none focus:ring-2  focus:ring-offset-2',
            line && buttonHighlightConfig[line],
            lineColorDarkBorder[line ?? 'DEFAULT']
          )}
        >
          <FontAwesomeIcon icon={faCalendar} className="pr-1 text-white" />
          <p className="truncate">{currentSelection?.name ?? 'Custom'}</p>
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
          <Popover.Panel className="absolute left-4 bottom-11 z-20 overflow-visible rounded-md  bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none md:bottom-auto md:left-auto md:right-0 md:mt-2 md:origin-top-right">
            {({ close }) => (
              <div className="flex w-screen max-w-[240px] flex-col gap-2 overflow-hidden rounded-md bg-white  p-4  leading-6 shadow-lg ring-1 ring-gray-900/5">
                <Tab.Group
                  onChange={(value) => {
                    handleSelection(0, value);
                  }}
                  selectedIndex={config.range ? 1 : 0}
                >
                  <Tab.List className="flex w-full flex-row justify-center">
                    {rangeOptions.map((option, index) => (
                      <Tab key={index} className="w-1/2 items-center shadow-sm">
                        {({ selected }) => (
                          <div
                            className={classNames(
                              lineColorBackground[line ?? 'DEFAULT'],
                              selected
                                ? 'bg-opacity-100 text-white text-opacity-90'
                                : `bg-opacity-0 ${lineColorText[line ?? 'DEFAULT']}`,
                              'border text-sm',
                              index === 0 ? 'rounded-l-lg' : 'rounded-r-lg',
                              lineColorBorder[line ?? 'DEFAULT']
                            )}
                          >
                            <p>{option}</p>
                          </div>
                        )}
                      </Tab>
                    ))}
                  </Tab.List>
                </Tab.Group>
                <div className="flex w-full flex-col">
                  {selectedOptions.map((item, index) => (
                    <div key={index} className="w-full">
                      <button
                        className="w-full"
                        onClick={() => {
                          handleSelection(index, config.range);
                          close();
                        }}
                      >
                        <div
                          className={classNames(
                            index === config.selection
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
              </div>
            )}
          </Popover.Panel>
        </Transition>
      </Popover>
      <DatePickers config={config} setConfig={setConfig} setCustom={setCustom} />
    </div>
  );
};
