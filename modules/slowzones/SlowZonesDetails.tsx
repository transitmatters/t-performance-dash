'use client';

import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useQuery } from '@tanstack/react-query';

import { BasicDataWidgetPair } from '../../common/components/widgets/BasicDataWidgetPair';
import { BasicDataWidgetItem } from '../../common/components/widgets/BasicDataWidgetItem';
import { SlowZonesContainer } from '../../modules/slowzones/SlowZonesContainer';
import { useDelimitatedRoute } from '../../common/utils/router';
import { SZWidgetValue, TimeWidgetValue } from '../../common/types/basicWidgets';
import { getSlowZoneDeltas } from '../../common/utils/slowZoneUtils';
import { TODAY_UTC } from '../../common/components/inputs/DateSelection/DateConstants';
import { fetchAllSlow, fetchDelayTotals } from './api/slowzones';
dayjs.extend(utc);

export default function SlowZonesDetails() {
  const delayTotals = useQuery(['delayTotals'], fetchDelayTotals);
  const allSlow = useQuery(['allSlow'], fetchAllSlow);
  const {
    lineShort,
    query: { startDate, endDate },
  } = useDelimitatedRoute();

  const startDateUTC = dayjs.utc(startDate);
  const endDateUTC = endDate ? dayjs.utc(endDate) : TODAY_UTC;

  const delayTotalsData = delayTotals.data ?? [];
  const filteredDelayTotals = delayTotalsData.filter((t) => {
    const date = dayjs.utc(t.date);
    return date.isSameOrAfter(startDateUTC) && date.isSameOrBefore(endDateUTC);
  });

  const allSlowData = allSlow.data ?? [];
  const filteredAllSlow = allSlowData.filter((t) => {
    const start = dayjs.utc(t.start);
    const end = dayjs.utc(t.end);
    return (
      t.color === lineShort &&
      (start.isAfter(startDateUTC) || end.isAfter(startDateUTC)) &&
      start.isBefore(endDateUTC)
    );
  });

  const { zonesDelta, delayDelta } = getSlowZoneDeltas({
    lineShort,
    allSlow: filteredAllSlow,
    totals: filteredDelayTotals,
    startDateUTC: startDateUTC,
    endDateUTC: endDateUTC,
  });

  if (delayTotals.isLoading || allSlow.isLoading) {
    return <>Loading...</>;
  }
  // TODO: Error should only be shown on the individual graphs. Same with loading
  if (delayTotals.isError || allSlow.isError) {
    return <>Uh oh... error</>;
  }

  return (
    <>
      <BasicDataWidgetPair>
        <BasicDataWidgetItem
          title="Delay Change"
          widgetValue={new TimeWidgetValue(delayDelta, delayDelta)}
          analysis={`from last ${dayjs().format('ddd')}.`}
          comparison={false}
        />
        <BasicDataWidgetItem
          title="# Slow Zones"
          widgetValue={new SZWidgetValue(zonesDelta, zonesDelta)}
          analysis={`from last ${dayjs().format('ddd')}.`}
          comparison={false}
        />
      </BasicDataWidgetPair>

      <SlowZonesContainer
        allSlow={filteredAllSlow}
        delayTotals={delayTotalsData}
        line={lineShort}
      />
    </>
  );
}
