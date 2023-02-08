'use client';
import React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { optionsStation, stopIdsForStations } from '../../common/utils/stations';
import { useCustomQueries } from '../../common/api/datadashboard';
import { getCurrentDate } from '../../common/utils/date';
import { useDelimitatedRoute } from '../../common/utils/router';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { SingleDayAPIParams } from '../../common/types/api';
import { averageDwells, longestDwells } from '../../common/utils/dwells';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
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

  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);

  const { dwells } = useCustomQueries(
    {
      [SingleDayAPIParams.fromStop]: fromStopIds || '',
      [SingleDayAPIParams.toStop]: toStopIds || '',
      [SingleDayAPIParams.stop]: fromStopIds || '',
      [SingleDayAPIParams.date]: startDate ?? getCurrentDate(),
    },
    false,
    startDate !== undefined && fromStopIds !== null && toStopIds !== null
  );

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
        <DwellsSingleChart dwells={dwells} toStation={toStation} fromStation={fromStation} />
        <div className={classNames('flex w-full flex-row space-x-8')}>
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
      </div>
    </>
  );
};
