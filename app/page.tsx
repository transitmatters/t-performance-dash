'use client';

import React, { useState } from 'react';
import { AlertBar } from '../components/alerts/AlertBar';
import { DateInput } from '../components/inputs/DateInput';
import { Select } from '../components/inputs/Select';
import alerts from '../data/alerts.json';
import { DateOption, SelectOption } from '../types/inputs';
import { optionsForField, swapStations } from '../utils/stations';
import { AggregatePage } from '../components/dashboard/charts/AggregatePage';
import { SingleDayPage } from '../components/dashboard/charts/SingleDayPage';

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

const fetchData = () => {
  const url = new URL(`http://localhost:5000/headways/2022-11-03`, window.location.origin);
  url.searchParams.append('stop', '70057')
  const request = fetch(url.toString()).then(response => response.json());

}

export default function Home() {
  const [fromStation, setFromStation] = useState<SelectOption | null>(null);
  const [toStation, setToStation] = useState<SelectOption | null>(null);
  const [dateSelection, setDateSelection] = useState<DateOption | null>(null);



  return (
    <>
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
                      ? 'border-mbta-orange text-orange-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                    'whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium'
                  )}
                  aria-current={tab.current ? 'page' : undefined}
                >
                  {tab.name}
                </a>
              ))}
            </nav>
            <Select
              label={'From'}
              options={optionsForField('from', 'Red', fromStation?.value, toStation?.value)}
              selected={fromStation}
              setSelected={setFromStation}
            />
            <Select
              label={'To'}
              options={optionsForField('to', 'Red', fromStation?.value, toStation?.value)}
              selected={toStation}
              setSelected={setToStation}
            />
            <button
              onClick={() => swapStations(fromStation, toStation, setFromStation, setToStation)}
            >
              Swap
            </button>
            <DateInput dateSelection={dateSelection} setDateSelection={setDateSelection} />
            <button onClick={() => fetchData()}>data boi</button>
          </div>
        </div>
      </div>
      <AlertBar alerts={alerts} today={'2022-10-11'} isLoading={false} />
      <div className="px-4">
        {dateSelection?.endDate ?
          <AggregatePage dateSelection={dateSelection} />
          :
          <SingleDayPage />
        }
      </div>
    </>
  );
}
