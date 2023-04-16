'use client';

import React from 'react';
import dayjs from 'dayjs';
import type { AggregateAPIOptions, SingleDayAPIOptions } from '../../common/types/api';
import { AggregateAPIParams, SingleDayAPIParams } from '../../common/types/api';
import { getParentStationForStopId, stopIdsForStations } from '../../common/utils/stations';
import { useDelimitatedRoute } from '../../common/utils/router';
import { averageTravelTime } from '../../common/utils/traveltimes';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import { ErrorNotice } from '../../common/components/notices/ErrorNotice';
import { TerminusNotice } from '../../common/components/notices/TerminusNotice';
import { BasicDataWidgetPair } from '../../common/components/widgets/BasicDataWidgetPair';
import { BasicDataWidgetItem } from '../../common/components/widgets/BasicDataWidgetItem';
import {
  useTravelTimesAggregateData,
  useTravelTimesSingleDayData,
} from '../../common/api/hooks/traveltimes';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { TravelTimesSingleChart } from './charts/TravelTimesSingleChart';
import { TravelTimesAggregateChart } from './charts/TravelTimesAggregateChart';

export default function TravelTimesDetails() {
  const {
    linePath,
    query: { startDate, endDate, to, from },
  } = useDelimitatedRoute();

  const fromStation = from ? getParentStationForStopId(from) : undefined;
  const toStation = to ? getParentStationForStopId(to) : undefined;
  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);

  const aggregate = startDate !== undefined && endDate !== undefined;
  const enabled = fromStopIds !== undefined && toStopIds !== undefined && startDate !== undefined;
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

  const travelTimesSingle = useTravelTimesSingleDayData(parameters, !aggregate && enabled);
  const travelTimesAggregate = useTravelTimesAggregateData(parameters, aggregate && enabled);

  const traveltimes = aggregate ? travelTimesAggregate : travelTimesSingle;
  const travelTimeValues = aggregate
    ? travelTimesAggregate?.data?.by_date?.map((tt) => tt.mean)
    : travelTimesSingle?.data?.map((tt) => tt.travel_time_sec);

  if (traveltimes.isError || !linePath) {
    return <ErrorNotice />;
  }

  return (
    <>
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
          <TravelTimesAggregateChart
            traveltimes={travelTimesAggregate}
            fromStation={fromStation}
            toStation={toStation}
          />
        ) : (
          <TravelTimesSingleChart
            traveltimes={travelTimesSingle}
            fromStation={fromStation}
            toStation={toStation}
          />
        )}
      </WidgetDiv>
      <TerminusNotice toStation={toStation} fromStation={fromStation} />
    </>
  );
}
