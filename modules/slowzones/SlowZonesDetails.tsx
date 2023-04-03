'use client';

import React, { useMemo } from 'react';
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
  const { lineShort } = useDelimitatedRoute();

  const formattedTotals = useMemo(
    () =>
      delayTotals.data && delayTotals.data.filter((t) => new Date(t.date) > new Date(2022, 0, 1)),
    [delayTotals.data]
  );

  const { current, lastWeek, totalDelay, totalDelayLasteek } = useSlowZoneCalculations({
    lineShort,
    allSlow: allSlow.data,
    formattedTotals,
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
          title="Total Delay"
          widgetValue={new TimeWidgetValue(totalDelay, totalDelay - totalDelayLasteek)}
          analysis={`from last ${dayjs().format('ddd')}.`}
        />
        <BasicDataWidgetItem
          title="# Slow Zones"
          widgetValue={new SZWidgetValue(current, current && lastWeek ? current - lastWeek : 0)}
          analysis={`from last ${dayjs().format('ddd')}.`}
        />
      </BasicDataWidgetPair>

      <SlowZonesContainer allSlow={allSlow.data} delayTotals={formattedTotals} line={lineShort} />
    </>
  );
}
