import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';

import { LINE_OBJECTS } from '../../constants/lines';
import { useSelectedStore } from '../../stores/useSelected';

import { classNames } from '../utils/tailwind';
import { buttonConfig, lineSelectionButtonConfig, lineSelectionConfig } from './LineSelectorStyle';

export const LineSelector = () => {
  const selectedLine = useSelectedStore((state) => state.line);
  return (
    <Listbox value={selectedLine} onChange={() => null}>
      {({ open }) => (
        <>
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-default bg-white px-2 text-left  shadow-sm focus:outline-none focus:ring-1 sm:text-sm">
              <div
                className={classNames(
                  'ml-2 flex h-8 w-8 rounded-full border-2 bg-opacity-80',
                  buttonConfig[selectedLine.key],
                  open ? 'shadow-simpleInset' : 'shadow-simple'
                )}
              >
                <p className={`z-10 m-auto select-none text-sm text-white`}>{selectedLine.key}</p>
              </div>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="w-34 absolute left-1 -top-3 origin-top-right -translate-y-full transform divide-y divide-gray-100 rounded-md bg-white text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                {Object.entries(LINE_OBJECTS).map(([_, metadata]) => (
                  <Listbox.Option
                    key={metadata.key}
                    className={({ active }) =>
                      classNames(
                        active
                          ? 'border-opacity-100 bg-opacity-20'
                          : 'border-opacity-20 bg-opacity-0 text-gray-900',
                        'relative cursor-default select-none py-2 pl-3 pr-6',
                        lineSelectionConfig[metadata.key]
                      )
                    }
                    value={metadata}
                  >
                    {({ selected }) => (
                      <div
                        className={classNames(
                          selected ? 'font-semibold' : 'font-normal',
                          'flex flex-row gap-2 truncate'
                        )}
                      >
                        <div
                          className={classNames(
                            'h-5 w-5 rounded-full',
                            lineSelectionButtonConfig[metadata.key],
                            lineSelectionConfig[metadata.key],
                            selected ? 'bg-opacity-100' : 'bg-opacity-20'
                          )}
                        ></div>
                        {metadata.name}
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
};
