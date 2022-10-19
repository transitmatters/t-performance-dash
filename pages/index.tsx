/* eslint-disable import/no-default-export */
import { SingleDayLineChart } from '../components/SingleDayLineChart';

import headwaysData from './data/headways.json';
import travelTimesData from './data/travel_times.json';
import dwellsData from './data/dwells.json';
import alerts from './data/alerts.json';

import React from 'react';
import { AlertBar } from '../components/alerts/AlertBar';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const tabs = [
  { name: 'Red Line', href: '#', current: false },
  { name: 'Blue Line', href: '#', current: false },
  { name: 'Orange Line', href: '#', current: true },
  { name: 'Green Line', href: '#', current: false },
  { name: 'Bus', href: '#', current: false },
];

export default function Home() {
  return (
    <>
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
                defaultValue={tabs.find((tab) => tab.current)?.name}
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
      </main>
      <AlertBar alerts={alerts} today={'2022-10-11'} isLoading={false} />
      <div className="px-4">
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
      </div>
    </>
  );
}
