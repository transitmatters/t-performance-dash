import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCalendar } from '@fortawesome/free-solid-svg-icons';
import type { AlertTime } from '../../../common/types/alerts';
import { easternNow, wallClock } from '../../../common/utils/date';

interface TimeProps {
  times: AlertTime[];
}

export const CurrentTime = ({ times }: TimeProps) => {
  const now = easternNow();
  // End of the service day (2 am)
  const dayEnd = now.add(1, 'day').hour(2).minute(0).second(0);
  const timeStrings = times.map((time) => {
    if (time.end == null) {
      return 'Ongoing';
    }
    const startTime = wallClock(time.start ?? time.end);
    const endTime = wallClock(time.end);
    if (startTime.isAfter(now)) {
      if (endTime.isAfter(dayEnd)) {
        // has not begun and ends after end of service day
        return `${startTime.format('h:mm A')} - end of service`;
      }
      // Has not begun and ends before end of service time
      return `${startTime.format('h:mm A')} - ${endTime.format('h:mm A')}`;
    }
    if (endTime.isAfter(dayEnd)) {
      // Has begun and continues through tomorrow
      return 'All Day';
    } else {
      // Has begun but ends before end of service time
      return `Until ${endTime.format('h:mm A')}`;
    }
  });

  // TODO: If timestrings length is more than 1 -> Add visual indicator to expand to see all times (uncommon).
  return (
    <>
      <FontAwesomeIcon icon={faClock} size={'sm'} className={'m-0 mr-1 h-4 w-4 rounded-xs'} />
      <p className="w-auto">{timeStrings[0]}</p>
    </>
  );
};

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

export const EffectiveTime = ({ times }: TimeProps) => {
  const { start } = times[0];
  return (
    <>
      <FontAwesomeIcon icon={faCalendar} size={'sm'} className={'m-0 mr-1 h-4 w-4'} />
      {start ? `Since ${wallClock(start).format('MMM D YYYY')}` : 'Ongoing'}
    </>
  );
};
