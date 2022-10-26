'use client';

import { useQuery } from '@tanstack/react-query';
import { TotalSlowTime } from '../../components/slowzones/charts/TotalSlowTime';
import { fetchAllSlow, fetchDelayTotals } from '../../data/slowzones';

export default function SlowZones(props) {
  const allSlow = useQuery(['allSlow'], fetchAllSlow);
  const delayTotals = useQuery(['delayTotals'], fetchDelayTotals);

  return (
    <TotalSlowTime
      data={delayTotals.data?.filter((d) => new Date(2022, 1, 1) < new Date(d.date))}
    />
  );
}
