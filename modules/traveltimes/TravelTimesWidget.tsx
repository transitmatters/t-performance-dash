'use client';
import React from 'react';
import dayjs from 'dayjs';
import classNames from 'classnames';
import { SingleDayAPIParams } from '../../common/types/api';
import { optionsStation, stopIdsForStations } from '../../common/utils/stations';
import { useCustomQueries } from '../../common/api/datadashboard';
import { useDelimitatedRoute } from '../../common/utils/router';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { averageTravelTime } from '../../common/utils/traveltimes';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import { TravelTimesSingleChart } from './charts/TravelTimesSingleChart';

export const TravelTimesWidget: React.FC = () => {
  const {
    linePath,
    lineShort,
    query: { startDate, busLine },
  } = useDelimitatedRoute();

  const stations = optionsStation(lineShort, busLine);
  const toStation = stations?.[stations.length - 3];
  const fromStation = stations?.[3];

  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);

  const { traveltimes } = useCustomQueries(
    {
      [SingleDayAPIParams.fromStop]: fromStopIds,
      [SingleDayAPIParams.toStop]: toStopIds,
      [SingleDayAPIParams.stop]: fromStopIds,
      [SingleDayAPIParams.date]: startDate,
    },
    false,
    startDate !== undefined && fromStopIds !== null && toStopIds !== null
  );

  if (traveltimes.isError || !linePath) {
    return <>Uh oh... error</>;
  }

  return (
    <>
      <div className={classNames('h-full rounded-lg bg-white p-2 shadow-dataBox')}>
        <HomescreenWidgetTitle title="Travel Times" href={`/${linePath}/traveltimes`} />

        <div className={classNames('space-between flex w-full flex-row')}>
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
        <TravelTimesSingleChart
          traveltimes={traveltimes}
          fromStation={fromStation}
          toStation={toStation}
          showLegend={false}
          homescreen={true}
        />
      </div>
    </>
  );
};
