'use client';
import React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { SingleDayLineChart } from '../../common/components/charts/SingleDayLineChart';
import { BenchmarkFieldKeys, MetricFieldKeys, PointFieldKeys } from '../../src/charts/types';
import { SingleDayAPIParams } from '../../common/types/api';
import { locationDetails, optionsStation, stopIdsForStations } from '../../common/utils/stations';
import { useCustomQueries } from '../../common/api/datadashboard';
import { getCurrentDate } from '../../common/utils/date';
import { averageHeadway, longestHeadway } from '../../common/utils/headways';
import { useDelimitatedRoute } from '../../common/utils/router';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { TimeWidgetValue } from '../../common/types/basicWidgets';

export const HeadwaysWidget: React.FC = () => {
  const startDate = getCurrentDate();
  const { linePath, lineShort } = useDelimitatedRoute();
  const isMobile = !useBreakpoint('sm');

  const stations = optionsStation(lineShort);
  const toStation = stations?.[stations.length - 3];
  const fromStation = stations?.[3];

  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);

  const { headways } = useCustomQueries(
    {
      [SingleDayAPIParams.fromStop]: fromStopIds || '',
      [SingleDayAPIParams.toStop]: toStopIds || '',
      [SingleDayAPIParams.stop]: fromStopIds || '',
      [SingleDayAPIParams.date]: startDate,
    },
    false,
    fromStopIds !== null && toStopIds !== null
  );

  const isLoading = headways.isLoading || toStation === undefined || fromStation === undefined;

  if (headways.isError) {
    return <>Uh oh... error</>;
  }

  return (
    <>
      <HomescreenWidgetTitle title="Headways" href={`/${linePath}/headways`} />
      <div className={classNames('h-full rounded-lg bg-white p-2 shadow-dataBox')}>
        <SingleDayLineChart
          chartId={`headways-widget-${linePath}`}
          title={'Time between trains (headways)'}
          data={headways.data ?? []}
          date={startDate}
          metricField={MetricFieldKeys.headWayTimeSec}
          pointField={PointFieldKeys.currentDepDt}
          benchmarkField={BenchmarkFieldKeys.benchmarkHeadwayTimeSec}
          isLoading={isLoading}
          location={locationDetails(fromStation, toStation, lineShort)}
          fname={'headways'}
          showLegend={false}
        />
        <div className={classNames('flex w-full flex-row')}>
          <BasicWidgetDataLayout
            title="Average Headway"
            widgetValue={
              new TimeWidgetValue(headways.data ? averageHeadway(headways.data) : undefined, 1)
            }
            analysis={`from last ${dayjs().format('ddd')}.`}
          />
          <BasicWidgetDataLayout
            title="Longest Headway"
            widgetValue={
              new TimeWidgetValue(headways.data ? longestHeadway(headways.data) : undefined, 1)
            }
            analysis={`from last ${dayjs().format('ddd')}.`}
          />
        </div>
      </div>
    </>
  );
};
