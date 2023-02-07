'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BasicDataWidgetPair } from '../../common/components/widgets/BasicDataWidgetPair';
import { BasicDataWidgetItem } from '../../common/components/widgets/BasicDataWidgetItem';
import { SlowZonesContainer } from '../../modules/slowzones/SlowZonesContainer';
import { useDelimitatedRoute } from '../../common/utils/router';
import { fetchAllSlow, fetchDelayTotals } from './api/slowzones';
import { TimeWidgetValue } from '../../common/types/basicWidgets';

export default function SlowZonesDetails() {
  const delayTotals = useQuery(['delayTotals'], fetchDelayTotals);
  const allSlow = useQuery(['allSlow'], fetchAllSlow);
  const { lineShort } = useDelimitatedRoute();

  const formattedTotals = useMemo(
    () =>
      delayTotals.data && delayTotals.data.filter((t) => new Date(t.date) > new Date(2022, 0, 1)),
    [delayTotals.data]
  );

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
          widgetValue={
            new TimeWidgetValue(
              formattedTotals ? formattedTotals[formattedTotals.length - 1][lineShort] / 60 : 0,
              1
            )
          }
          analysis="since last week"
        />
        <BasicDataWidgetItem
          title="# Slow Zones"
          widgetValue={new TimeWidgetValue(7, 1)}
          analysis="since last week"
        />
      </BasicDataWidgetPair>
      {}
      <SlowZonesContainer allSlow={allSlow.data} delayTotals={formattedTotals} line={lineShort} />
    </>
  );
}
