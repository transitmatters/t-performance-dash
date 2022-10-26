'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TotalSlowTime } from '../../components/slowzones/charts/TotalSlowTime';
import { fetchDelayTotals } from '../../data/slowzones';

export function SlowZones() {
  const delayTotals = useQuery(['delayTotals'], fetchDelayTotals);

  return (
    <TotalSlowTime
      data={delayTotals.data?.filter((d) => new Date(2022, 1, 1) < new Date(d.date))}
    />
  );
}
