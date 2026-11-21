import dayjs from 'dayjs';
import { useLatestBusSpeedDate } from '../../common/api/hooks/busSpeedSegments';
import { Badge } from '../../common/components/ui/badge';
import type { Period } from './types';
import { inProgressThrough } from './utils';

/** The current week or month has a file too, built from the days so far. */
export const InProgressBadge = ({ date, period }: { date?: string; period: Period }) => {
  const { data: latestDate } = useLatestBusSpeedDate();
  const throughDate = inProgressThrough(date, period, latestDate);
  if (!throughDate) return null;
  const through = dayjs(throughDate).format('MMM D');
  return (
    <Badge
      variant="warning"
      title={`Figures cover service through ${through}, not the full ${period === 'weekly' ? 'week' : 'month'}.`}
    >
      In progress · through {through}
    </Badge>
  );
};
