'use client';
import React from 'react';
import dayjs from 'dayjs';
import classNames from 'classnames';
import { SingleDayLineChart } from '../../common/components/charts/SingleDayLineChart';
import { BenchmarkFieldKeys, MetricFieldKeys, PointFieldKeys } from '../../src/charts/types';
import { SingleDayAPIParams } from '../../common/types/api';
import { locationDetails, optionsStation, stopIdsForStations } from '../../common/utils/stations';
import { useCustomQueries } from '../../common/api/datadashboard';
import { useDelimitatedRoute } from '../../common/utils/router';
import { getCurrentDate } from '../../common/utils/date';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { averageTravelTime } from '../../common/utils/traveltimes';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { TimeWidgetValue } from '../../common/types/basicWidgets';

export const TravelTimesWidget: React.FC = () => {
  const startDate = getCurrentDate();
  const { linePath, lineShort } = useDelimitatedRoute();
  const isMobile = !useBreakpoint('sm');

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

  const isLoading = traveltimes.isLoading || toStation === undefined || fromStation === undefined;

  if (traveltimes.isError || !linePath) {
    return <>Uh oh... error</>;
  }

  return (
    <>
      <HomescreenWidgetTitle title="Travel Times" href={`/${linePath}/traveltimes`} />
      <div className={classNames('h-full rounded-lg bg-white p-2 shadow-dataBox')}>
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
          location={locationDetails(fromStation, toStation, lineShort)}
          fname={'traveltimes'}
          showLegend={false}
        />
        <div className={classNames('flex w-full flex-row')}>
          <BasicWidgetDataLayout
            title="Avg. Travel Time"
            widgetValue={
              new TimeWidgetValue(
                traveltimes.data ? averageTravelTime(traveltimes.data) : undefined,
                100
              )
            }
            analysis={`from last ${dayjs().format('ddd')}.`}
          />
          <BasicWidgetDataLayout
            title="Round Trip"
            widgetValue={
              new TimeWidgetValue(
                traveltimes.data ? averageTravelTime(traveltimes.data) * 2 : undefined, //TODO: Show real time for a round trip
                1200
              )
            }
            analysis={`from last ${dayjs().format('ddd')}.`}
          />
        </div>
      </div>
    </>
  );
};
