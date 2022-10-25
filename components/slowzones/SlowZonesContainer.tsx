import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllSlow, fetchDelayTotals } from '../../pages/data/slowzones';
import { TotalSlowTime } from './charts/TotalSlowTime';

export const SlowZonesContainer = () => {
  const allSlow = useQuery(['allSlow'], fetchAllSlow);
  const delayTotals = useQuery(['delayTotals'], fetchDelayTotals);
  return (
    <TotalSlowTime
      data={delayTotals.data?.filter((d) => new Date(2022, 1, 1) < new Date(d.date))}
    />
  );
};
