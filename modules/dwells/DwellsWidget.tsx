'use client';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { SingleDayLineChart } from '../../common/components/charts/SingleDayLineChart';
import { MetricFieldKeys, PointFieldKeys } from '../../src/charts/types';
import { optionsStation, stopIdsForStations } from '../../common/utils/stations';
import { useCustomQueries } from '../../common/api/datadashboard';
import { getCurrentDate } from '../../common/utils/date';
import { useDelimitatedRoute } from '../../common/utils/router';
import type { Location } from '../../common/types/charts';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { SingleDayAPIParams } from '../../common/types/api';
import { averageDwells, longestDwells } from '../../common/utils/dwells';

export const DwellsWidget: React.FC = () => {
  const startDate = getCurrentDate();
  const { linePath, lineShort } = useDelimitatedRoute();

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

  const isLoading = dwells.isLoading || toStation === undefined || fromStation === undefined;

  if (dwells.isError) {
    return <>Uh oh... error</>;
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
          location={location}
          fname={'dwells'}
          showLegend={false}
        />
        <div className={classNames('flex w-full flex-row space-x-8')}>
          <BasicWidgetDataLayout
            title="Average Dwell"
            value={dwells.data ? averageDwells(dwells.data) : 0}
            unit="time"
            analysis="since last week"
            delta={1}
          />
          <BasicWidgetDataLayout
            title="Longest Dwell"
            value={dwells.data ? longestDwells(dwells.data) : 0}
            unit="time"
            analysis="since last week"
            delta={1}
          />
        </div>
      </div>
    </>
  );
};
