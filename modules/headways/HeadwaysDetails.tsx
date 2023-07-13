'use client';

import React from 'react';
import dayjs from 'dayjs';
import type { AggregateAPIOptions, SingleDayAPIOptions } from '../../common/types/api';
import { AggregateAPIParams, SingleDayAPIParams } from '../../common/types/api';
import {
  getLocationDetails,
  getParentStationForStopId,
  stopIdsForStations,
} from '../../common/utils/stations';
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
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { WidgetTitle } from '../dashboard/WidgetTitle';
import { Layout } from '../../common/layouts/layoutTypes';
import { HeadwaysHistogramWrapper } from './charts/HeadwaysHistogramWrapper';

export function HeadwaysDetails() {
  const {
    line,
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
    <PageWrapper pageTitle={'Headways'}>
      <BasicDataWidgetPair>
        <BasicDataWidgetItem
          title="Average Headway"
          layoutKind="no-delta"
          widgetValue={
            new TimeWidgetValue(headwaysData ? averageHeadway(headwaysData) : undefined, undefined)
          }
          analysis={`from last ${dayjs().format('ddd')}.`}
        />
        <BasicDataWidgetItem
          title="Longest Headway"
          layoutKind="no-delta"
          widgetValue={
            new TimeWidgetValue(headwaysData ? longestHeadway(headwaysData) : undefined, undefined)
          }
          analysis={`from last ${dayjs().format('ddd')}.`}
        />
      </BasicDataWidgetPair>
      <WidgetDiv>
        <WidgetTitle
          title="Headways"
          subtitle="Time between trains"
          location={getLocationDetails(fromStation, toStation)}
          line={line}
        />

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
        <WidgetDiv>
          <WidgetTitle
            title="Headway Variance"
            location={getLocationDetails(fromStation, toStation)}
            line={line}
          />

          <HeadwaysHistogramWrapper
            query={headways}
            fromStation={fromStation}
            toStation={toStation}
          />
        </WidgetDiv>
      )}
      <TerminusNotice toStation={toStation} fromStation={fromStation} />
    </PageWrapper>
  );
}

HeadwaysDetails.Layout = Layout.Dashboard;
