import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import type { AlertTime } from '../../common/types/alerts';
import { wallClock } from '../../common/utils/date';

interface TimeProps {
  times: AlertTime[];
}

/** The dates an alert covers, e.g. "Nov 15", "Nov 15 - 20", "Nov 15 - Dec 2" or "Since Nov 15". */
export const getDateString = (times: AlertTime[]) => {
  const first = times[0].start;
  // Periods are in chronological order, so the last one ends the alert.
  const last = times[times.length - 1].end;
  if (!first) return last ? `Until ${wallClock(last).format('MMM D')}` : 'Ongoing';
  const start = wallClock(first);
  if (!last) return `Since ${start.format('MMM D')}`;

  let end = wallClock(last);
  // If it ends before 4 am, it ends on the previous service day
  if (end.hour() <= 4) {
    end = end.subtract(1, 'day');
  }

  if (!end.isAfter(start, 'day')) return start.format('MMM D');
  if (start.isSame(end, 'month')) return `${start.format('MMM D')} - ${end.format('D')}`;
  if (start.isSame(end, 'year')) return `${start.format('MMM D')} - ${end.format('MMM D')}`;
  return `${start.format('MMM D, YYYY')} - ${end.format('MMM D, YYYY')}`;
};

export const UpcomingTime = ({ times }: TimeProps) => {
  const timeString = getDateString(times);
  return (
    <>
      <FontAwesomeIcon icon={faCalendar} size={'sm'} className={'m-0 mr-1 h-4 w-4'} />
      {timeString}
    </>
  );
};
