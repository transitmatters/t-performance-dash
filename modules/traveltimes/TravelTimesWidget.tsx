'use client';
import React from 'react';
import dayjs from 'dayjs';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { QueryNameKeys } from '../../common/types/api';
import { optionsStation, stopIdsForStations } from '../../common/utils/stations';
import { fetchSingleDayData } from '../../common/api/datadashboard';
import { useDelimitatedRoute } from '../../common/utils/router';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { averageTravelTime } from '../../common/utils/traveltimes';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import { ErrorNotice } from '../../common/components/notices/ErrorNotice';
import { TravelTimesSingleChart } from './charts/TravelTimesSingleChart';

export const TravelTimesWidget: React.FC = () => {
  const {
    linePath,
    lineShort,
    query: { startDate, busRoute },
  } = useDelimitatedRoute();

  const stations = optionsStation(lineShort, busRoute);
  const toStation = stations?.[stations.length - 3];
  const fromStation = stations?.[3];

  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);
  const traveltimes = useQuery([QueryNameKeys.traveltimes, fromStopIds, toStopIds, startDate], () =>
    fetchSingleDayData(QueryNameKeys.traveltimes, {
      date: startDate,
      from_stop: fromStopIds,
      to_stop: toStopIds,
    })
  );
  const travelTimeValues = traveltimes?.data?.map((tt) => tt.travel_time_sec);

  if (traveltimes.isError || !linePath) {
    return <ErrorNotice isWidget />;
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
                travelTimeValues ? averageTravelTime(travelTimeValues) : undefined,
                100
              )
            }
            analysis={`from last ${dayjs().format('ddd')}.`}
          />
          <BasicWidgetDataLayout
            title="Round Trip"
            widgetValue={
              new TimeWidgetValue(
                travelTimeValues ? averageTravelTime(travelTimeValues) * 2 : undefined, //TODO: Show real time for a round trip
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
