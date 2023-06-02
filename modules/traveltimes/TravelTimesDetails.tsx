'use client';

import React from 'react';
import type { AggregateAPIOptions, SingleDayAPIOptions } from '../../common/types/api';
import { AggregateAPIParams, SingleDayAPIParams } from '../../common/types/api';
import {
  getLocationDetails,
  getParentStationForStopId,
  stopIdsForStations,
} from '../../common/utils/stations';
import { useDelimitatedRoute } from '../../common/utils/router';
import { TerminusNotice } from '../../common/components/notices/TerminusNotice';
import {
  useTravelTimesAggregateData,
  useTravelTimesSingleDayData,
} from '../../common/api/hooks/traveltimes';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { SingleChartWrapper } from '../../common/components/charts/SingleChartWrapper';
import { AggregateChartWrapper } from '../../common/components/charts/AggregateChartWrapper';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { ButtonGroup } from '../../common/components/general/ButtonGroup';
import { WidgetTitle } from '../dashboard/WidgetTitle';
import { LayoutType } from '../../common/layouts/layoutTypes';

export function TravelTimesDetails() {
  const {
    line,
    query: { startDate, endDate, to, from },
  } = useDelimitatedRoute();

  const fromStation = from ? getParentStationForStopId(from) : undefined;
  const toStation = to ? getParentStationForStopId(to) : undefined;
  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);
  const location = getLocationDetails(fromStation, toStation);

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

  const [peakTime, setPeakTime] = React.useState<'weekday' | 'weekend'>('weekday');

  return (
    <PageWrapper pageTitle={'Travel Times'}>
      <WidgetDiv>
        <WidgetTitle title="Travel Times" location={location} line={line} both />
        {aggregate ? (
          <AggregateChartWrapper
            query={travelTimesAggregate}
            toStation={toStation}
            fromStation={fromStation}
            type={'traveltimes'}
            timeUnit={'by_date'}
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
      {aggregate && (
        <WidgetDiv className="flex flex-col justify-center">
          <WidgetTitle title="Travel Times by Hour" location={location} line={line} both />
          <AggregateChartWrapper
            query={travelTimesAggregate}
            toStation={toStation}
            fromStation={fromStation}
            type={'traveltimes'}
            timeUnit={'by_time'}
            peakTime={peakTime === 'weekday' ? true : false}
          />
          <div className={'flex w-full justify-center pt-2'}>
            <ButtonGroup
              pressFunction={setPeakTime}
              options={[
                ['weekday', 'Weekday'],
                ['weekend', 'Weekend/Holiday'],
              ]}
              additionalDivClass="md:w-auto"
              additionalButtonClass="md:w-fit"
            />
          </div>
        </WidgetDiv>
      )}
      <TerminusNotice toStation={toStation} fromStation={fromStation} />
    </PageWrapper>
  );
}

TravelTimesDetails.Layout = LayoutType.Dashboard;
