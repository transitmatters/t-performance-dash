import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames';
import React, { Fragment, useState } from 'react';
import { DayDelayTotals, SlowZoneResponse } from '../../types/dataPoints';
import { LineSegments } from './charts/LineSegments';
import { TotalSlowTime } from './charts/TotalSlowTime';
import { FilterBar } from './FilterBar';

interface SlowZonesContainerProps {
  delayTotals: DayDelayTotals[];
  allSlow: SlowZoneResponse[];
}

const graphs = [
  { id: 1, name: 'Line Segments' },
  { id: 2, name: 'Total Slow Time' },
];

export const SlowZonesContainer = ({ allSlow, delayTotals }: SlowZonesContainerProps) => {
  const [selectedGraph, setSelectedGraph] = useState(graphs[0]);

  return (
    <>
      <div className="mx-auto border-gray-200 bg-tm-red px-4 shadow-sm md:px-8">
        <div className="flex space-x-4 py-2">
          <Listbox value={selectedGraph} onChange={setSelectedGraph}>
            {({ open }) => (
              <>
                <div className="relative">
                  <Listbox.Button className="relative w-full cursor-default rounded-md border border-black  bg-tm-lightRed py-1.5 pl-3 pr-10 text-left text-white shadow-sm focus:outline-none focus:ring-1 sm:text-sm">
                    <span className="block truncate">{selectedGraph.name}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon className="text-white-400 h-5 w-5" aria-hidden="true" />
                    </span>
                  </Listbox.Button>

                  <Transition
                    show={open}
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {graphs.map((person) => (
                        <Listbox.Option
                          key={person.id}
                          className={({ active }) =>
                            classNames(
                              active ? 'bg-tm-lightRed text-white' : 'text-gray-900',
                              'relative cursor-default select-none py-2 pl-3 pr-9'
                            )
                          }
                          value={person}
                        >
                          {({ selected, active }) => (
                            <>
                              <span
                                className={classNames(
                                  selected ? 'font-semibold' : 'font-normal',
                                  'block truncate'
                                )}
                              >
                                {person.name}
                              </span>

                              {selected ? (
                                <span
                                  className={classNames(
                                    active ? 'text-black' : 'text-neutral-600',
                                    'absolute inset-y-0 right-0 flex items-center pr-4'
                                  )}
                                >
                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </>
            )}
          </Listbox>
        </div>
      </div>

      <div className="mx-auto border-b border-gray-200 py-4 px-4 pb-5 sm:px-6 sm:pb-0 md:px-8">
        {selectedGraph.name === 'Total Slow Time' ? (
          <TotalSlowTime
            data={delayTotals.filter((t) => new Date(t.date) > new Date(2020, 0, 1))}
          />
        ) : (
          <LineSegments data={allSlow} />
        )}
      </div>
    </>
  );
};
