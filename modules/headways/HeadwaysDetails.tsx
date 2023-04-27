'use client';

import React from 'react';
import dayjs from 'dayjs';
import type { AggregateAPIOptions, SingleDayAPIOptions } from '../../common/types/api';
import { AggregateAPIParams, SingleDayAPIParams } from '../../common/types/api';
import { getParentStationForStopId, stopIdsForStations } from '../../common/utils/stations';
import { useDelimitatedRoute } from '../../common/utils/router';
import { BasicDataWidgetPair } from '../../common/components/widgets/BasicDataWidgetPair';
import { BasicDataWidgetItem } from '../../common/components/widgets/BasicDataWidgetItem';
import { averageHeadway, longestHeadway } from '../../common/utils/headways';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import { TerminusNotice } from '../../common/components/notices/TerminusNotice';
import {
  useHeadwaysAggregateData,
  useHeadwaysSingleDayData,
} from '../../common/api/hooks/headways';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { SingleChartWrapper } from '../../common/components/charts/SingleChartWrapper';
import { AggregateChartWrapper } from '../../common/components/charts/AggregateChartWrapper';
import { HeadwaysHistogram } from './charts/HeadwaysHistogram';

export default function HeadwaysDetails() {
  const {
    query: { startDate, endDate, to, from },
  } = useDelimitatedRoute();

  const fromStation = from ? getParentStationForStopId(from) : undefined;
  const toStation = to ? getParentStationForStopId(to) : undefined;
  const { fromStopIds } = stopIdsForStations(fromStation, toStation);

  const aggregate = Boolean(startDate && endDate);
  const enabled = Boolean(fromStopIds && startDate);
  const parameters: SingleDayAPIOptions | AggregateAPIOptions = aggregate
    ? {
        [AggregateAPIParams.stop]: fromStopIds,
        [AggregateAPIParams.startDate]: startDate,
        [AggregateAPIParams.endDate]: endDate,
      }
    : {
        [SingleDayAPIParams.stop]: fromStopIds,
        [SingleDayAPIParams.date]: startDate,
      };

  const headways = useHeadwaysSingleDayData(parameters, !aggregate && enabled);
  const headwaysAggregate = useHeadwaysAggregateData(parameters, aggregate && enabled);

  const headwaysData = aggregate ? headwaysAggregate?.data?.by_date : headways?.data;

  return (
    <>
      <BasicDataWidgetPair>
        <BasicDataWidgetItem
          title="Average Headway"
          widgetValue={
            new TimeWidgetValue(headwaysData ? averageHeadway(headwaysData) : undefined, 1)
          }
          analysis={`from last ${dayjs().format('ddd')}.`}
        />
        <BasicDataWidgetItem
          title="Longest Headway"
          widgetValue={
            new TimeWidgetValue(headwaysData ? longestHeadway(headwaysData) : undefined, 1)
          }
          analysis={`from last ${dayjs().format('ddd')}.`}
        />
      </BasicDataWidgetPair>
      <WidgetDiv>
        {aggregate ? (
          <AggregateChartWrapper
            query={headwaysAggregate}
            toStation={toStation}
            fromStation={fromStation}
            type={'headways'}
          />
        ) : (
          <SingleChartWrapper
            query={headways}
            toStation={toStation}
            fromStation={fromStation}
            type={'headways'}
          />
        )}
      </WidgetDiv>
      {!aggregate && (
        <>
          <div className="flex w-full flex-row items-center justify-between text-lg">
            <h3>Headway Variance</h3>
          </div>

          <WidgetDiv>
            <HeadwaysHistogram
              headways={headways}
              fromStation={fromStation}
              toStation={toStation}
            />
          </WidgetDiv>
        </>
      )}
      <TerminusNotice toStation={toStation} fromStation={fromStation} />
    </>
  );
}
