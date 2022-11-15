'use client';

import React, { useState } from 'react';
import { AlertBar } from '../components/alerts/AlertBar';
import { AggregateLineChart } from '../components/dashboard/charts/AggregateLineChart';
import { SingleDayLineChart } from '../components/dashboard/charts/SingleDayLineChart';
import { DateInput } from '../components/inputs/DateInput';
import { Select } from '../components/inputs/Select';
import alerts from '../data/alerts.json';
import dwellsData from '../data/dwells.json';
import headwaysData from '../data/headways.json';
import travelTimesData from '../data/travel_times.json';
import dwellsDataAgg from '../data/dwells_agg.json';
import headwaysDataAgg from '../data/headways_agg.json';
import travelTimesDataAgg from '../data/travel_times_agg.json';

import { DateOption, SelectOption } from '../types/inputs';
import { optionsForField, swapStations } from '../utils/stations';
import { BenchmarkFieldKeys, MetricFieldKeys, PointFieldKeys } from '../src/charts/types';
import { COLORS } from '../constants/colors';

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
            <button onClick={() => { console.log(headwaysDataAgg) }}>databutton</button>
          </div>
        </div>
      </div>
      <AlertBar alerts={alerts} today={'2022-10-11'} isLoading={false} />
      <div className="px-4">
        {dateSelection?.endDate ?
          <div>
            <div className={'charts main-column'}>
              <AggregateLineChart
                chartId={'travel_times_agg'}
                title={'Travel times'}
                data={travelTimesDataAgg['by_date']?.filter(x => x.peak === 'all') || []}
                // This is service date when agg by date. dep_time_from_epoch when agg by hour. Can probably remove this prop.
                pointField={PointFieldKeys.serviceDate}
                timeUnit={'day'}
                //TODO: get this to display week day correctly...
                timeFormat={'MMM d yyyy'}
                seriesName='Median travel time'
                startDate={dateSelection?.startDate}
                endDate={dateSelection?.endDate}
                // There were 2 diff colors in v3 of dashboard. Why?
                fillColor={COLORS.charts.fillBackgroundColor}
                location={'todo'}
                // TODO: isLoading
                isLoading={false}
                bothStops={true}
                fname="traveltimes"
              />
            </div>
            <div className={'charts main-column'}>
              <AggregateLineChart
                chartId={'headways_agg'}
                title={'Time between trains (headways)'}
                data={headwaysDataAgg}
                pointField={PointFieldKeys.serviceDate}
                timeUnit={'day'}
                //TODO: get this to display week day correctly...
                timeFormat={'MMM d yyyy'}
                seriesName='Median headway'
                startDate={dateSelection?.startDate}
                endDate={dateSelection?.endDate}
                // There were 2 diff colors in v3 of dashboard. Why?
                fillColor={COLORS.charts.fillBackgroundColor}
                location={'todo'}
                // TODO: isLoading
                isLoading={false}
                fname="headways"
              />
            </div>
            { // TODO: Make this only appear when not on bus lines.
              // !bus_mode &&  
              <div className={'charts main-column'}>
                <AggregateLineChart
                  chartId={'dwells_agg'}
                  title={'Time spent at stations (dwells)'}
                  data={dwellsDataAgg}
                  pointField={PointFieldKeys.serviceDate}
                  timeUnit={'day'}
                  //TODO: get this to display week day correctly...
                  timeFormat={'MMM d yyyy'}
                  seriesName='Median dwell time'
                  startDate={dateSelection?.startDate}
                  endDate={dateSelection?.endDate}
                  // There were 2 diff colors in v3 of dashboard. Why?
                  fillColor={COLORS.charts.fillBackgroundColor}
                  // TODO: location
                  location={'todo'}
                  // TODO: isLoading
                  isLoading={false}
                  fname="dwells"
                />
              </div>
            }
            <div className={'charts main-column'}>
              <AggregateLineChart
                chartId={'dwells_agg'}
                title={'Travel times by hour'}
                data={travelTimesDataAgg['by_time'].filter(data => data.is_peak_day)} // TODO: Add toggle for this.
                pointField={PointFieldKeys.depTimeFromEpoch}
                timeUnit={'hour'}
                //TODO: get this to display week day correctly...
                timeFormat='hh:mm a'
                seriesName='Median travel time'
                startDate={dateSelection?.startDate}
                endDate={dateSelection?.endDate}
                // There were 2 diff colors in v3 of dashboard. Also make these constants
                fillColor={COLORS.charts.fillBackgroundColorHourly}
                // TODO: location
                location={'todo'}
                // TODO: isLoading
                isLoading={false}
                bothStops={true}
                fname="traveltimesByHour"
              />
            </div>
          </div>
          :
          <div>
            <div className={'charts main-column'}>
              <SingleDayLineChart
                chartId={'travelTimes'}
                title={'Travel Times'}
                data={travelTimesData}
                metricField={MetricFieldKeys.travelTimeSec}
                benchmarkField={BenchmarkFieldKeys.benchmarkTravelTimeSec}
                pointField={PointFieldKeys.depDt}
                bothStops={true}
                location={'todo'}
                isLoading={false}
                fname={'todo'}
              />
            </div>

            <div className={'charts main-column'}>
              <SingleDayLineChart
                chartId={'headways'}
                title={'Time between trains (headways)'}
                data={headwaysData}
                metricField={MetricFieldKeys.headWayTimeSec}
                benchmarkField={BenchmarkFieldKeys.benchmarkHeadwayTimeSec}
                pointField={PointFieldKeys.currentDepDt}
                location={'todo'}
                isLoading={false}
                fname={'todo'}
              />
            </div>
            <div className={'charts main-column'}>
              <SingleDayLineChart
                chartId={'dwells'}
                title={'Time spent at station (dwells)'}
                data={dwellsData}
                metricField={MetricFieldKeys.dwellTimeSec}
                pointField={PointFieldKeys.arrDt}
                location={'todo'}
                isLoading={false}
                fname={'todo'}
              />
            </div>
          </div>
        }
      </div>
    </>
  );
}
