'use client';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { capitalize } from 'lodash';
import { secondsToMinutes } from 'date-fns';
import ArrowDownNegative from '../../public/Icons/ArrowDownNegative.svg';
import { SingleDayLineChart } from '../../common/components/charts/SingleDayLineChart';
import { MetricFieldKeys, PointFieldKeys } from '../../src/charts/types';
import { optionsStation, stopIdsForStations } from '../../utils/stations';
import { useCustomQueries } from '../../common/api/datadashboard';
import { getCurrentDate } from '../../utils/date';
import { useDelimitatedRoute } from '../../common/utils/router';
import type { Location } from '../../common/types/charts';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { SingleDayAPIParams } from '../../common/types/api';

export const DwellsWidget: React.FC = () => {
  const startDate = getCurrentDate();
  const { linePath, line, lineShort } = useDelimitatedRoute();

  const stations = optionsStation(lineShort);
  const toStation = stations?.[stations.length - 3];
  const fromStation = stations?.[1];

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

  const averageDwells = useMemo(() => {
    if (dwells && dwells.data && dwells.data.length >= 1) {
      const totalSum = dwells?.data
        .map((trip) => trip.dwell_time_sec)
        .reduce((a, b) => {
          if (a && b) {
            return a + b;
          } else {
            return 0;
          }
        });
      return (totalSum || 0) / dwells.data.length;
    } else {
      return 0;
    }
  }, [dwells]);

  const longestDwell = useMemo(() => {
    if (dwells && dwells.data && dwells.data.length >= 1) {
      const allDwells = dwells?.data
        .map((trip) => trip.dwell_time_sec)
        .filter((dwell) => dwell !== undefined) as number[];
      return Math.max(...allDwells);
    } else {
      return 0;
    }
  }, [dwells]);

  const location: Location = useMemo(() => {
    if (toStation === undefined || fromStation === undefined) {
      return {
        to: toStation?.stop_name || 'Loading...',
        from: fromStation?.stop_name || 'Loading...',
        direction: 'southbound',
        line: linePath,
      };
    }

    return {
      to: toStation.stop_name,
      from: fromStation.stop_name,
      direction: 'southbound',
      line: linePath,
    };
  }, [fromStation, linePath, toStation]);

  const isLoading = dwells.isLoading || toStation === undefined || fromStation === undefined;

  if (dwells.isError) {
    return <>Uh oh... error</>;
  }

  return (
    <>
      <HomescreenWidgetTitle title="Dwells" href={`/${linePath}/dwells`} />
      <div className={classNames('h-full rounded-lg bg-white p-2 shadow-dataBox')}>
        <SingleDayLineChart
          chartId={`dwells-widget-${line}`}
          title={'Time spent at station (dwells)'}
          data={dwells.data || []}
          date={startDate}
          metricField={MetricFieldKeys.dwellTimeSec}
          pointField={PointFieldKeys.arrDt}
          isLoading={isLoading}
          location={location}
          fname={'dwells'}
          showLegend={false}
        />
        <div className={classNames('flex w-full flex-row')}>
          <BasicWidgetDataLayout
            title="Average Dwell"
            value={secondsToMinutes(averageDwells).toString()}
            units="min"
            analysis="+1.0 since last week"
            Icon={<ArrowDownNegative className="h-3 w-auto" alt="Your Company" />}
          />
          <BasicWidgetDataLayout
            title="Longest Dwell"
            value={secondsToMinutes(longestDwell).toString()}
            units="min"
            analysis="+1.0 since last week"
            Icon={<ArrowDownNegative className="h-3 w-auto" alt="Your Company" />}
          />
        </div>
      </div>
    </>
  );
};
