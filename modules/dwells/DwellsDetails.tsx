'use client';
import React from 'react';
import dayjs from 'dayjs';
import type { AggregateAPIOptions, SingleDayAPIOptions } from '../../common/types/api';
import { AggregateAPIParams, SingleDayAPIParams } from '../../common/types/api';
import { getParentStationForStopId, stopIdsForStations } from '../../common/utils/stations';
import { useDelimitatedRoute } from '../../common/utils/router';
import { BasicDataWidgetPair } from '../../common/components/widgets/BasicDataWidgetPair';
import { BasicDataWidgetItem } from '../../common/components/widgets/BasicDataWidgetItem';
import { averageDwells, longestDwells } from '../../common/utils/dwells';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import { ErrorNotice } from '../../common/components/notices/ErrorNotice';
import { TerminusNotice } from '../../common/components/notices/TerminusNotice';
import { useDwellsAggregateData, useDwellsSingleDayData } from '../../common/api/hooks/dwells';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { DwellsSingleChart } from './charts/DwellsSingleChart';
import { DwellsAggregateChart } from './charts/DwellsAggregateChart';

export default function DwellsDetails() {
  const {
    query: { startDate, endDate, to, from },
  } = useDelimitatedRoute();

  const fromStation = from ? getParentStationForStopId(from) : undefined;
  const toStation = to ? getParentStationForStopId(to) : undefined;
  const { fromStopIds } = stopIdsForStations(fromStation, toStation);

  const aggregate = startDate !== undefined && endDate !== undefined;
  const enabled = fromStopIds !== undefined && startDate !== undefined;
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

  const dwells = useDwellsSingleDayData(parameters, !aggregate && enabled);
  const dwellsAggregate = useDwellsAggregateData(parameters, aggregate && enabled);

  const dwellsData = aggregate ? dwellsAggregate?.data?.by_date : dwells?.data;

  if (dwells.isError) {
    return <ErrorNotice />;
  }

  return (
    <>
      <BasicDataWidgetPair>
        <BasicDataWidgetItem
          title="Average Dwell"
          widgetValue={new TimeWidgetValue(dwellsData ? averageDwells(dwellsData) : undefined, 1)}
          analysis={`from last ${dayjs().format('ddd')}.`}
        />
        <BasicDataWidgetItem
          title="Longest Dwell"
          widgetValue={new TimeWidgetValue(dwellsData ? longestDwells(dwellsData) : undefined, 1)}
          analysis={`from last ${dayjs().format('ddd')}.`}
        />
      </BasicDataWidgetPair>
      <WidgetDiv>
        {aggregate ? (
          <DwellsAggregateChart
            dwells={dwellsAggregate}
            toStation={toStation}
            fromStation={fromStation}
          />
        ) : (
          <DwellsSingleChart dwells={dwells} toStation={toStation} fromStation={fromStation} />
        )}
      </WidgetDiv>
      <TerminusNotice toStation={toStation} fromStation={fromStation} />
    </>
  );
}
