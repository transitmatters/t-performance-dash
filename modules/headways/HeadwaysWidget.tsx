'use client';
import React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { optionsStation, stopIdsForStations } from '../../common/utils/stations';
import { averageHeadway, longestHeadway } from '../../common/utils/headways';
import { useDelimitatedRoute } from '../../common/utils/router';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import { useHeadwaysSingleDayData } from '../../common/api/hooks/headways';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import {
  SingleChartWrapper,
  SingleChartWrapper,
} from '../../common/components/charts/SingleChartWrapper';

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
  const headways = useHeadwaysSingleDayData({ stop: fromStopIds, date: startDate });

  return (
    <>
      <WidgetDiv>
        <HomescreenWidgetTitle title="Headways" tab="tripHeadways" />
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
        <SingleChartWrapper
          query={headways}
          type={'headways'}
          fromStation={fromStation}
          toStation={toStation}
          showLegend={false}
          isHomescreen={true}
        />
      </WidgetDiv>
    </>
  );
};
