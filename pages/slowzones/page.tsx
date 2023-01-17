'use client';

import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { fetchAllSlow, fetchDelayTotals } from '../../api/slowzones';
import { SlowZonesContainer } from '../../components/slowzones/SlowZonesContainer';

export default function SlowZones() {
  const delayTotals = useQuery(['delayTotals'], fetchDelayTotals);
  const allSlow = useQuery(['allSlow'], fetchAllSlow);

  if (delayTotals.isLoading || allSlow.isLoading) {
    return <>Loading ... teehee</>;
  }

  if (delayTotals.isError || allSlow.isError) {
    return <>Uh oh... error</>;
  }

  return <SlowZonesContainer delayTotals={delayTotals.data} allSlow={allSlow.data} />;
}
