import dayjs from 'dayjs';
import { Badge } from '../../common/components/ui/badge';
import { YESTERDAY_STRING } from '../../common/constants/dates';
import type { Period } from './types';
import { isPeriodInProgress } from './utils';

/** The current week or month has a file too, built from the days so far. */
export const InProgressBadge = ({ date, period }: { date?: string; period: Period }) => {
  if (!isPeriodInProgress(date, period)) return null;
  const through = dayjs(YESTERDAY_STRING).format('MMM D');
  return (
    <Badge
      variant="warning"
      title={`Figures cover service through ${through}, not the full ${period === 'weekly' ? 'week' : 'month'}.`}
    >
      In progress · through {through}
    </Badge>
  );
};
