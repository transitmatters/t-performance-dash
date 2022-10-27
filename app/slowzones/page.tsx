'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TotalSlowTime } from '../../components/slowzones/charts/TotalSlowTime';
import { fetchDelayTotals } from '../../data/slowzones';

async function getData() {
  const res = await fetch(
    'http://localhost:5000/traveltimes/2022-10-26?from_stop=70059&to_stop=70049'
  );
  return res.json();
}

export default async function SlowZones() {
  const delayTotals = use(getData());

  return <>{JSON.stringify(delayTotals)}</>;
}
