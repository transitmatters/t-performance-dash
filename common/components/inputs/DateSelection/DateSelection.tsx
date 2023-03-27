import { Popover, Tab, Transition } from '@headlessui/react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import React, { Fragment, useEffect, useState } from 'react';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { lineColorBackground, lineColorBorder, lineColorText } from '../../../styles/general';
import { useDelimitatedRoute, useUpdateQuery } from '../../../utils/router';
import { buttonHighlightConfig } from '../styles/inputStyle';
import { DatePickers } from './DatePickers';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useRouter } from 'next/router';
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
      name: `One year ago today`,
      input: {
        startDate: today.subtract(1, 'year').format(dateFormat),
      },
    },
    { name: 'Custom' },
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
    { name: 'Custom' },
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
  const [custom, setCustom] = useState<boolean>(false);
  const [config, setConfig] = useState<{ range: boolean; selection: number }>({
    range: false,
    selection: 0,
  });
  const [firstLoad, setFirstLoad] = useState(true);
  const selectedOptions = config.range ? options.range : options.singleDay;
  const currentSelection = selectedOptions[config.selection];

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
    <div className="flex flex-row items-baseline gap-1">
      {custom && <DatePickers config={config} setConfig={setConfig} />}

      <Popover className="relative inline-block h-full text-left">
        <Popover.Button
          className={classNames(
            'inline-flex items-center self-stretch rounded-sm px-3 py-1 text-white text-opacity-90 shadow-sm hover:bg-opacity-70  focus:outline-none focus:ring-2  focus:ring-offset-2',
            line && buttonHighlightConfig[line],
            line && lineColorBackground[line]
          )}
        >
          <FontAwesomeIcon icon={faCalendar} className="pr-2 text-white" />
          <span>{currentSelection.name}</span>
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
          <Popover.Panel className="absolute right-0 z-20 mt-2 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
                <Tab.Group
                  vertical
                  manual
                  onChange={(event) => {
                    handleSelection(event, config.range);
                    close();
                  }}
                  selectedIndex={config.selection}
                >
                  <Tab.List className="flex w-full flex-col">
                    {selectedOptions.map((item, index) => (
                      <Tab onClick={() => close()} key={index} className="w-full">
                        {({ selected }) => (
                          <div
                            className={classNames(
                              selected
                                ? 'bg-gray-200 text-gray-900'
                                : 'text-gray-70 bg-gray-100 bg-opacity-0',
                              'flex w-full items-start px-4 py-2 text-sm hover:bg-opacity-80',
                              index === selectedOptions.length - 1 && 'font-semibold'
                            )}
                          >
                            {item.name}
                          </div>
                        )}
                      </Tab>
                    ))}
                  </Tab.List>
                </Tab.Group>
              </div>
            )}
          </Popover.Panel>
        </Transition>
      </Popover>
    </div>
  );
};
