'use client';
import React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { SingleDayAPIParams } from '../../common/types/api';
import { optionsStation, stopIdsForStations } from '../../common/utils/stations';
import { useCustomQueries } from '../../common/api/datadashboard';
import { averageHeadway, longestHeadway } from '../../common/utils/headways';
import { useDelimitatedRoute } from '../../common/utils/router';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import { getCurrentDate } from '../../common/utils/date';
import { HeadwaysSingleChart } from './charts/HeadwaysSingleChart';

export const HeadwaysWidget: React.FC = () => {
  const {
    linePath,
    lineShort,
    query: { startDate },
  } = useDelimitatedRoute();

  const stations = optionsStation(lineShort);
  const toStation = stations?.[stations.length - 3];
  const fromStation = stations?.[3];

  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);

  const { headways } = useCustomQueries(
    {
      [SingleDayAPIParams.fromStop]: fromStopIds || '',
      [SingleDayAPIParams.toStop]: toStopIds || '',
      [SingleDayAPIParams.stop]: fromStopIds || '',
      [SingleDayAPIParams.date]: startDate ?? getCurrentDate(),
    },
    false,
    startDate !== undefined && fromStopIds !== null && toStopIds !== null
  );

  if (headways.isError) {
    return <>Uh oh... error</>;
  }

  return (
    <>
      <HomescreenWidgetTitle title="Headways" href={`/${linePath}/headways`} />
      <div className={classNames('h-full rounded-lg bg-white p-2 shadow-dataBox')}>
        <HeadwaysSingleChart
          headways={headways}
          fromStation={toStation}
          toStation={fromStation}
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
