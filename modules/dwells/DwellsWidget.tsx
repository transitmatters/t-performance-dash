'use client';
import React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { optionsStation, stopIdsForStations } from '../../common/utils/stations';
import { fetchSingleDayData } from '../../common/api/datadashboard';
import { useDelimitatedRoute } from '../../common/utils/router';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { QueryNameKeys } from '../../common/types/api';
import { averageDwells, longestDwells } from '../../common/utils/dwells';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import { ErrorNotice } from '../../common/components/notices/ErrorNotice';
import { DwellsSingleChart } from './charts/DwellsSingleChart';

export const DwellsWidget: React.FC = () => {
  const {
    line,
    linePath,
    lineShort,
    query: { startDate },
  } = useDelimitatedRoute();

  const stations = optionsStation(lineShort);
  const toStation = stations?.[stations.length - 3];
  const fromStation = stations?.[3];

  const { fromStopIds } = stopIdsForStations(fromStation, toStation);

  const dwells = useQuery([QueryNameKeys.dwells, fromStopIds, startDate], () =>
    fetchSingleDayData(QueryNameKeys.dwells, { date: startDate, stop: fromStopIds })
  );

  if (dwells.isError) {
    return <ErrorNotice isWidget />;
  }

  // Buses don't record dwells
  if (line === 'BUS') {
    return null;
  }

  return (
    <>
      <div className={classNames('h-full rounded-lg bg-white p-2 shadow-dataBox')}>
        <HomescreenWidgetTitle title="Dwells" href={`/${linePath}/dwells`} />
        <div className={classNames('flex w-full flex-row')}>
          <BasicWidgetDataLayout
            title="Average Dwell"
            widgetValue={
              new TimeWidgetValue(dwells.data ? averageDwells(dwells.data) : undefined, 1)
            }
            analysis={`from last ${dayjs().format('ddd')}.`}
          />
          <BasicWidgetDataLayout
            title="Longest Dwell"
            widgetValue={
              new TimeWidgetValue(dwells.data ? longestDwells(dwells.data) : undefined, 1)
            }
            analysis={`from last ${dayjs().format('ddd')}.`}
          />
        </div>
        <DwellsSingleChart
          dwells={dwells}
          toStation={toStation}
          fromStation={fromStation}
          homescreen={true}
        />
      </div>
    </>
  );
};
