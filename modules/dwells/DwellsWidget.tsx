'use client';
import React from 'react';
import classNames from 'classnames';
import { secondsToMinutes } from 'date-fns';
import ArrowDownNegative from '../../public/Icons/ArrowDownNegative.svg';
import { SingleDayLineChart } from '../../common/components/charts/SingleDayLineChart';
import { MetricFieldKeys, PointFieldKeys } from '../../src/charts/types';
import { locationDetails, optionsStation, stopIdsForStations } from '../../common/utils/stations';
import { useCustomQueries } from '../../common/api/datadashboard';
import { getCurrentDate } from '../../common/utils/date';
import { useDelimitatedRoute } from '../../common/utils/router';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { SingleDayAPIParams } from '../../common/types/api';
import { averageDwells, longestDwells } from '../../common/utils/dwells';

export const DwellsWidget: React.FC = () => {
  const startDate = getCurrentDate();
  const { line, linePath, lineShort } = useDelimitatedRoute();

  const stations = optionsStation(lineShort);
  const toStation = stations?.[stations.length - 3];
  const fromStation = stations?.[3];

  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);

  const { dwells } = useCustomQueries(
    {
      [SingleDayAPIParams.fromStop]: fromStopIds || '',
      [SingleDayAPIParams.toStop]: toStopIds || '',
      [SingleDayAPIParams.stop]: fromStopIds || '',
      [SingleDayAPIParams.date]: startDate,
    },
    false,
    fromStopIds !== null && toStopIds !== null
  );

  const isLoading = dwells.isLoading || toStation === undefined || fromStation === undefined;

  if (dwells.isError) {
    return <>Uh oh... error</>;
  }

  // Buses don't record dwells
  if (line === 'BUS') {
    return null;
  }

  return (
    <>
      <HomescreenWidgetTitle title="Dwells" href={`/${linePath}/dwells`} />
      <div className={classNames('h-full rounded-lg bg-white p-2 shadow-dataBox')}>
        <SingleDayLineChart
          chartId={`dwells-widget-${linePath}`}
          title={'Time spent at station (dwells)'}
          data={dwells.data ?? []}
          date={startDate}
          metricField={MetricFieldKeys.dwellTimeSec}
          pointField={PointFieldKeys.arrDt}
          isLoading={isLoading}
          location={locationDetails(fromStation, toStation, lineShort)}
          fname={'dwells'}
          showLegend={false}
        />
        <div className={classNames('flex w-full flex-row')}>
          <BasicWidgetDataLayout
            title="Average Dwell"
            value={
              dwells.data ? secondsToMinutes(averageDwells(dwells.data)).toString() : 'Loading...'
            }
            units="min"
            analysis="+1.0 since last week"
            Icon={<ArrowDownNegative className="h-3 w-auto" alt="Your Company" />}
          />
          <BasicWidgetDataLayout
            title="Longest Dwell"
            value={
              dwells.data ? secondsToMinutes(longestDwells(dwells.data)).toString() : 'Loading...'
            }
            units="min"
            analysis="+1.0 since last week"
            Icon={<ArrowDownNegative className="h-3 w-auto" alt="Your Company" />}
          />
        </div>
      </div>
    </>
  );
};
