'use client';

import React from 'react';
import dayjs from 'dayjs';
import type { AggregateAPIOptions, SingleDayAPIOptions } from '../../common/types/api';
import { AggregateAPIParams, SingleDayAPIParams } from '../../common/types/api';
import { getParentStationForStopId, stopIdsForStations } from '../../common/utils/stations';
import { useDelimitatedRoute } from '../../common/utils/router';
import { averageTravelTime } from '../../common/utils/traveltimes';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import { TerminusNotice } from '../../common/components/notices/TerminusNotice';
import { BasicDataWidgetPair } from '../../common/components/widgets/BasicDataWidgetPair';
import { BasicDataWidgetItem } from '../../common/components/widgets/BasicDataWidgetItem';
import {
  useTravelTimesAggregateData,
  useTravelTimesSingleDayData,
} from '../../common/api/hooks/traveltimes';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { SingleChartWrapper } from '../../common/components/charts/SingleChartWrapper';
import { AggregateChartWrapper } from '../../common/components/charts/AggregateChartWrapper';
import { PageWrapper } from '../../common/layouts/PageWrapper';

export function TravelTimesDetails() {
  const {
    query: { startDate, endDate, to, from },
  } = useDelimitatedRoute();

  const fromStation = from ? getParentStationForStopId(from) : undefined;
  const toStation = to ? getParentStationForStopId(to) : undefined;
  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);

  const aggregate = Boolean(startDate && endDate);
  const enabled = Boolean(fromStopIds && toStopIds && startDate);
  const parameters: SingleDayAPIOptions | AggregateAPIOptions = aggregate
    ? {
        [AggregateAPIParams.fromStop]: fromStopIds,
        [AggregateAPIParams.toStop]: toStopIds,
        [AggregateAPIParams.startDate]: startDate,
        [AggregateAPIParams.endDate]: endDate,
      }
    : {
        [SingleDayAPIParams.fromStop]: fromStopIds,
        [SingleDayAPIParams.toStop]: toStopIds,
        [SingleDayAPIParams.stop]: fromStopIds,
        [SingleDayAPIParams.date]: startDate,
      };

  const travelTimes = useTravelTimesSingleDayData(parameters, !aggregate && enabled);
  const travelTimesAggregate = useTravelTimesAggregateData(parameters, aggregate && enabled);

  const travelTimeValues = aggregate
    ? travelTimesAggregate?.data?.by_date?.map((tt) => tt.mean)
    : travelTimes?.data?.map((tt) => tt.travel_time_sec);

  return (
    <PageWrapper pageTitle={'Travel Times'}>
      <BasicDataWidgetPair>
        <BasicDataWidgetItem
          title="Avg. Travel Time"
          widgetValue={
            new TimeWidgetValue(
              travelTimeValues ? averageTravelTime(travelTimeValues) : undefined,
              1
            )
          }
          analysis={`from last ${dayjs().format('ddd')}.`}
        />
      </BasicDataWidgetPair>
      <WidgetDiv>
        {aggregate ? (
          <AggregateChartWrapper
            query={travelTimesAggregate}
            toStation={toStation}
            fromStation={fromStation}
            type={'traveltimes'}
          />
        ) : (
          <SingleChartWrapper
            query={travelTimes}
            toStation={toStation}
            fromStation={fromStation}
            type={'traveltimes'}
          />
        )}
      </WidgetDiv>
      <TerminusNotice toStation={toStation} fromStation={fromStation} />
    </PageWrapper>
  );
}
