'use client';

import React from 'react';
import dayjs from 'dayjs';

import { useQuery } from '@tanstack/react-query';
import { BasicDataWidgetPair } from '../../common/components/widgets/BasicDataWidgetPair';
import { BasicDataWidgetItem } from '../../common/components/widgets/BasicDataWidgetItem';
import { SlowZonesContainer } from '../../modules/slowzones/SlowZonesContainer';
import { useDelimitatedRoute } from '../../common/utils/router';
import { SZWidgetValue, TimeWidgetValue } from '../../common/types/basicWidgets';
import { useSlowZoneCalculations } from '../../common/utils/slowZoneUtils';
import { fetchAllSlow, fetchDelayTotals } from './api/slowzones';

export default function SlowZonesDetails() {
  const delayTotals = useQuery(['delayTotals'], fetchDelayTotals);
  const allSlow = useQuery(['allSlow'], fetchAllSlow);
  const {
    lineShort,
    query: { startDate, endDate },
  } = useDelimitatedRoute();

  const delayTotalsData = delayTotals.data ?? [];
  const filteredDelayTotals = delayTotalsData.filter(
    (t) => dayjs(t.date).isAfter(dayjs(startDate)) && dayjs(t.date).isBefore(dayjs(endDate))
  );

  const { current, delayDelta } = useSlowZoneCalculations({
    lineShort,
    allSlow: allSlow.data,
    totals: filteredDelayTotals,
  });

  if (delayTotals.isLoading || allSlow.isLoading) {
    return <>Loading ... teehee</>;
  }

  if (delayTotals.isError || allSlow.isError) {
    return <>Uh oh... error</>;
  }

  return (
    <>
      <BasicDataWidgetPair>
        <BasicDataWidgetItem
          title="Delay Change"
          widgetValue={new TimeWidgetValue(delayDelta, 0)}
          analysis={`from last ${dayjs().format('ddd')}.`}
        />
        <BasicDataWidgetItem
          title="# Slow Zones"
          widgetValue={new SZWidgetValue(current, 0)}
          analysis={`from last ${dayjs().format('ddd')}.`}
        />
      </BasicDataWidgetPair>

      <SlowZonesContainer
        allSlow={allSlow.data}
        delayTotals={filteredDelayTotals}
        line={lineShort}
      />
    </>
  );
}
