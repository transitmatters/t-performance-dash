import { Popover, Tab, Transition } from '@headlessui/react';
import classNames from 'classnames';
import React, { Fragment, useState } from 'react';
import { lineColorBackground, lineColorBorder } from '../../../styles/general';
import { useDelimitatedRoute } from '../../../utils/router';
import { DatePickers } from './DatePickers';
const options = {
  singleDay: ['Today', 'Yesterday', 'Custom'],
  range: ['Past week', 'Past month', 'Custom'],
};
const rangeOptions = ['Single Day', 'Range'];

export const DateSelection = () => {
  const { line } = useDelimitatedRoute();
  const [selection, setSelection] = useState<number>(0);
  const [range, setRange] = useState<boolean>(false);
  const [custom, setCustom] = useState<boolean>(false);
  const selectedOptions = range ? options.range : options.singleDay;
  const currentSelection = range ? options.range[selection] : options.singleDay[selection];

  const handleSelection = (value) => {
    if (selectedOptions[value] === 'Custom') {
      setCustom(true);
    } else {
      setCustom(false);
    }
    setSelection(value);
  };
  console.log('custom', custom);

  return (
    <div className="flex flex-row items-baseline gap-1">
      <Popover className="relative inline-block text-left">
        <Popover.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          <span>{currentSelection}</span>
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
          <Popover.Panel className="absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {({ close }) => (
              <div className="flex  w-screen max-w-sm flex-col overflow-hidden rounded-md bg-white  text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
                <Tab.Group
                  onChange={(value) => {
                    setRange(Boolean(value));
                    setSelection(0);
                  }}
                  selectedIndex={range ? 1 : 0}
                >
                  <Tab.List className="flex w-full flex-row">
                    {rangeOptions.map((option, index) => (
                      <Tab key={index} className="w-full items-center justify-center">
                        {({ selected }) => (
                          <div
                            className={classNames(
                              lineColorBackground[line ?? 'DEFAULT'],
                              selected
                                ? 'bg-opacity-100 text-white text-opacity-90'
                                : 'bg-opacity-0 text-black',
                              'border py-2',
                              index === 0 ? 'rounded-tl-md' : 'rounded-tr-md',
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
                    handleSelection(event);
                    close();
                  }}
                  selectedIndex={selection}
                >
                  <Tab.List className="flex flex-col p-2">
                    {selectedOptions.map((item, index) => (
                      <Tab onClick={() => close()} key={index}>
                        {({ selected }) => (
                          <div
                            className={classNames(
                              selected ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                              'block px-4 py-2 text-sm'
                            )}
                          >
                            {item}
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
      {custom && <DatePickers range={range} setRange={setRange} />}
    </div>
  );
};
