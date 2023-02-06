'use client';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { secondsToMinutes } from 'date-fns';
import ArrowDownNegative from '../../public/Icons/ArrowDownNegative.svg';
import { SingleDayLineChart } from '../../common/components/charts/SingleDayLineChart';
import { BenchmarkFieldKeys, MetricFieldKeys, PointFieldKeys } from '../../src/charts/types';
import { SingleDayAPIParams } from '../../common/types/api';
import { optionsStation, stopIdsForStations } from '../../common/utils/stations';
import { useCustomQueries } from '../../common/api/datadashboard';
import { useDelimitatedRoute } from '../../common/utils/router';
import { getCurrentDate } from '../../common/utils/date';
import type { Location } from '../../common/types/charts';
import Device from '../../common/components/general/Device/Device';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';

export const TravelTimesWidget: React.FC = () => {
  const startDate = getCurrentDate();
  const { linePath, lineShort } = useDelimitatedRoute();

  const stations = optionsStation(lineShort);
  const toStation = stations?.[stations.length - 3];
  const fromStation = stations?.[3];

  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);

  const { traveltimes } = useCustomQueries(
    {
      [SingleDayAPIParams.fromStop]: fromStopIds || '',
      [SingleDayAPIParams.toStop]: toStopIds || '',
      [SingleDayAPIParams.stop]: fromStopIds || '',
      [SingleDayAPIParams.date]: startDate,
    },
    false,
    fromStopIds !== null && toStopIds !== null
  );

  // TODO: If these error out, should only affect the widget, not the title.
  const averageTravelTime = React.useMemo(() => {
    if (traveltimes && traveltimes.data && traveltimes.data.length >= 1) {
      const totalSum = traveltimes?.data
        .map((trip) => trip.travel_time_sec)
        .reduce((a, b) => {
          if (a && b) {
            return a + b;
          } else {
            return 0;
          }
        });
      return (totalSum || 0) / traveltimes.data.length;
    } else {
      return 0;
    }
  }, [traveltimes]);

  const location: Location = useMemo(() => {
    if (toStation === undefined || fromStation === undefined) {
      return {
        to: toStation?.stop_name || 'Loading...',
        from: fromStation?.stop_name || 'Loading...',
        direction: 'southbound',
        line: lineShort,
      };
    }

    return {
      to: toStation.stop_name,
      from: fromStation.stop_name,
      direction: 'southbound',
      line: lineShort,
    };
  }, [fromStation, lineShort, toStation]);

  const isLoading = traveltimes.isLoading || toStation === undefined || fromStation === undefined;

  if (traveltimes.isError || !linePath) {
    return <>Uh oh... error</>;
  }

  return (
    <>
      <HomescreenWidgetTitle title="Travel Times" href={`/${linePath}/traveltimes`} />
      <div className={classNames('h-full rounded-lg bg-white p-2 shadow-dataBox')}>
        <Device>
          {({ isMobile }) => (
            <SingleDayLineChart
              chartId={`traveltimes-widget-${linePath}`}
              title={'Travel Times'}
              data={traveltimes.data ?? []}
              date={startDate}
              metricField={MetricFieldKeys.travelTimeSec}
              pointField={PointFieldKeys.depDt}
              benchmarkField={BenchmarkFieldKeys.benchmarkTravelTimeSec}
              isLoading={isLoading}
              bothStops={true}
              location={location}
              fname={'traveltimes'}
              showLegend={!isMobile}
            />
          )}
        </Device>
        <div className={classNames('flex w-full flex-row')}>
          <BasicWidgetDataLayout
            title="Average Travel Time"
            value={secondsToMinutes(averageTravelTime).toString()}
            units="min"
            analysis="+1.0 since last week"
            Icon={<ArrowDownNegative className="h-3 w-auto" alt="Your Company" />}
          />
          <BasicWidgetDataLayout
            title="Round Trip"
            value={secondsToMinutes(averageTravelTime * 2).toString()} //TODO: Show real time for a round trip
            units="min"
            analysis="+2 since last week"
            Icon={<ArrowDownNegative className="h-3 w-auto" alt="Your Company" />}
          />
        </div>
      </div>
    </>
  );
};
