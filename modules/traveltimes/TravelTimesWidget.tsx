'use client';
import React from 'react';
import dayjs from 'dayjs';
import classNames from 'classnames';
import { optionsStation, stopIdsForStations } from '../../common/utils/stations';
import { useDelimitatedRoute } from '../../common/utils/router';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { averageTravelTime } from '../../common/utils/traveltimes';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import { useTravelTimesSingleDayData } from '../../common/api/hooks/traveltimes';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { SingleChartWrapper } from '../../common/components/charts/SingleChartWrapper';

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
  const traveltimes = useTravelTimesSingleDayData({
    date: startDate,
    from_stop: fromStopIds,
    to_stop: toStopIds,
  });
  const travelTimeValues = traveltimes?.data?.map((tt) => tt.travel_time_sec);
  const traveltimesReady = !traveltimes.isError && traveltimes.data && lineShort && linePath;

  return (
    <WidgetDiv>
      <HomescreenWidgetTitle title="Travel Times" tab={'tripTraveltimes'} />
      <>
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
        <SingleChartWrapper
          query={traveltimes}
          toStation={toStation}
          fromStation={fromStation}
          showLegend={true}
          type={'traveltimes'}
        />
      </>
    </WidgetDiv>
  );
};
