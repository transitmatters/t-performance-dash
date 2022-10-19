import { useQuery } from '@tanstack/react-query';
import { fetchAllSlow, fetchDelayTotals } from '../../pages/data/slowzones';

export const SlowZonesContainer = () => {
  const allSlow = useQuery(['allSlow'], fetchAllSlow);
  const delayTotals = useQuery(['delayTotals'], fetchDelayTotals);
  return <>Slow Zones</>;
};
