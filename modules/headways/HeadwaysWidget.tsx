'use client';
import React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { QueryNameKeys } from '../../common/types/api';
import { optionsStation, stopIdsForStations } from '../../common/utils/stations';
import { fetchSingleDayData } from '../../common/api/datadashboard';
import { averageHeadway, longestHeadway } from '../../common/utils/headways';
import { useDelimitatedRoute } from '../../common/utils/router';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { HeadwaysSingleChart } from './charts/HeadwaysSingleChart';

export const HeadwaysWidget: React.FC = () => {
  const {
    linePath,
    lineShort,
    query: { startDate, busRoute },
  } = useDelimitatedRoute();

  const stations = optionsStation(lineShort, busRoute);
  const toStation = stations?.[stations.length - 3];
  const fromStation = stations?.[3];

  const { fromStopIds } = stopIdsForStations(fromStation, toStation);
  const headways = useQuery([QueryNameKeys.headways, fromStopIds, startDate], () =>
    fetchSingleDayData(QueryNameKeys.headways, { date: startDate, stop: fromStopIds })
  );

  const headwaysReady = !headways.isError && headways.data && lineShort && linePath;

  return (
    <>
      <div className={classNames('h-full rounded-lg bg-white p-2 shadow-dataBox')}>
        <HomescreenWidgetTitle title="Headways" href={`/${linePath}/headways`} />
        {headwaysReady ? (
          <>
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
            <HeadwaysSingleChart
              headways={headways}
              fromStation={toStation}
              toStation={fromStation}
              showLegend={false}
              homescreen={true}
            />
          </>
        ) : (
          <ChartPlaceHolder query={headways} />
        )}
      </div>
    </>
  );
};
