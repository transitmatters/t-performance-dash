/* eslint-disable import/no-default-export */
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { SingleDayLineChart } from './SingleDayLineChart';
import headwaysData from './data/headways.json';
import travelTimesData from './data/travel_times.json';
import dwellsData from './data/dwells.json';

const tabs = [
  { name: 'Red Line', href: '#', current: false },
  { name: 'Blue Line', href: '#', current: false },
  { name: 'Orange Line', href: '#', current: true },
  { name: 'Green Line', href: '#', current: false },
  { name: 'Bus', href: '#', current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Home() {
  return (
    <>
      <div>
        <Disclosure as="nav" className="bg-neutral-700 shadow">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                <div className="relative flex h-16 justify-between">
                  <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </Disclosure.Button>
                  </div>
                  <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                    <div className="flex flex-shrink-0 items-center">
                      <img
                        className="block h-6 w-auto stroke-black lg:hidden"
                        src="tm-logo.svg"
                        alt="Your Company"
                      />
                      <img
                        className="hidden h-6 w-auto stroke-black lg:block"
                        src="tm-logo.svg"
                        alt="Your Company"
                      />
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                      {/* Current: "border-indigo-500 text-gray-900", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" */}
                      <a
                        href="#"
                        className="inline-flex items-center border-b-2 border-white px-1 pt-1 text-sm font-medium text-white"
                      >
                        Data Dashboard
                      </a>
                      <a
                        href="#"
                        className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-white hover:border-white hover:text-slate-200"
                      >
                        Slow Zones
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="sm:hidden">
                <div className="space-y-1 pt-2 pb-4">
                  {/* Current: "bg-indigo-50 border-indigo-500 text-indigo-700", Default: "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700" */}
                  <Disclosure.Button
                    as="a"
                    href="#"
                    className="block border-l-4 border-indigo-500 bg-indigo-50 py-2 pl-3 pr-4 text-base font-medium text-indigo-700"
                  >
                    Data Dashboard
                  </Disclosure.Button>
                  <Disclosure.Button
                    as="a"
                    href="#"
                    className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                  >
                    Slow Zones
                  </Disclosure.Button>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
        <main>
          <div className="mx-auto border-b border-gray-200 py-6 px-4 pb-5 sm:px-6 sm:pb-0 md:px-8">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Data Dashboard</h3>
            <div className="mt-3 sm:mt-4">
              <div className="sm:hidden">
                <label htmlFor="current-tab" className="sr-only">
                  Select a tab
                </label>
                <select
                  id="current-tab"
                  name="current-tab"
                  className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  defaultValue={tabs.find((tab) => tab.current).name}
                >
                  {tabs.map((tab) => (
                    <option key={tab.name}>{tab.name}</option>
                  ))}
                </select>
              </div>
              <div className="hidden sm:block">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab) => (
                    <a
                      key={tab.name}
                      href={tab.href}
                      className={classNames(
                        tab.current
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                        'whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium'
                      )}
                      aria-current={tab.current ? 'page' : undefined}
                    >
                      {tab.name}
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          </div>
          <div className={'charts main-column'}>
            <SingleDayLineChart
              chartId={'travelTimes'}
              title={'Travel Times'}
              data={travelTimesData}
              metricField={'travel_time_sec'}
              benchmarkField={'benchmark_travel_time_sec'}
              pointField={'dep_dt'}
              bothStops={true}
            />
          </div>
          <div className={'charts main-column'}>
            <SingleDayLineChart
              chartId={'headways'}
              title={'Time between trains (headways)'}
              data={headwaysData}
              metricField={'headway_time_sec'}
              benchmarkField={'benchmark_headway_time_sec'}
              pointField={'current_dep_dt'}
            />
          </div>
          <div className={'charts main-column'}>
            <SingleDayLineChart
              chartId={'dwells'}
              title={'Time spent at station (dwells)'}
              data={dwellsData}
              metricField={'dwell_time_sec'}
              pointField={'arr_dt'}
            />
          </div>
        </main>
      </div>
    </>
  );
}
