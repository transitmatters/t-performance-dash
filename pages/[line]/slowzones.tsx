'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllSlow, fetchDelayTotals } from '../../api/slowzones';
import { BasicDataWidgetPair } from '../../components/widgets/BasicDataWidgetPair';
import ArrowDownNegative from '../../public/Icons/ArrowDownNegative.svg';
import { BasicDataWidgetItem } from '../../components/widgets/BasicDataWidgetItem';
import { SlowZonesContainer } from '../../components/slowzones/SlowZonesContainer';
import { useDelimitatedRoute } from '../../components/utils/router';
import { LINE_OBJECTS } from '../../constants/lines';

export default function SlowZones() {
  const delayTotals = useQuery(['delayTotals'], fetchDelayTotals);
  const allSlow = useQuery(['allSlow'], fetchAllSlow);
  const route = useDelimitatedRoute();

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
          value={
            formattedTotals &&
            (
              formattedTotals[formattedTotals.length - 1][LINE_OBJECTS[route.line]?.short] / 60
            ).toFixed(2)
          }
          units="min"
          analysis="+1.0 since last week"
          icon={<ArrowDownNegative className="h-3 w-auto" alt="Your Company" />}
        />
        <BasicDataWidgetItem
          title="# Slow Zones"
          value="7"
          units="min"
          analysis="+2 since last week"
          icon={<ArrowDownNegative className="h-3 w-auto" alt="Your Company" />}
        />
      </BasicDataWidgetPair>
      {}
      <SlowZonesContainer
        allSlow={allSlow.data}
        delayTotals={formattedTotals}
        line={LINE_OBJECTS[route.line]?.short}
      />
    </>
  );
}
