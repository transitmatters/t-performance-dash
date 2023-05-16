import React from 'react';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCalendar } from '@fortawesome/free-solid-svg-icons';
import type { AlertTime } from '../../../common/types/alerts';

interface TimeProps {
  times: AlertTime[];
}

export const CurrentTime: React.FC<TimeProps> = ({ times }) => {
  // Get end of service day (2 am)
  const dayEnd = dayjs().tz('America/New_York').add(1, 'day').set('hour', 2).set('minute', 0);
  const now = dayjs();
  const timeStrings = times.map((time) => {
    if (time.end == null) {
      return 'Ongoing';
    }
    const startTime = dayjs(time.start);
    const endTime = dayjs(time.end);
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
      <FontAwesomeIcon icon={faClock} size={'sm'} className={'m-0 mr-1 h-4 w-4 rounded-sm'} />
      <p className="w-auto">{timeStrings[0]}</p>
    </>
  );
};

// Get date description for upcoming alerts
const getDateString = (times: AlertTime[]) => {
  // Get last entry (they are ordered chronologically)
  let end = dayjs(times[times.length - 1].end);

  // If it ends before 4 am, it ends on the previous service day
  if (end.hour() <= 4) {
    end = end.subtract(1, 'day');
  }
  const start = dayjs(times[0].start);

  // A few if statements to choose best format based on difference between start and end date.
  if (start.date() === end.date()) return start.format('MMM D');
  if (start.month() === end.month()) return `${start.format('MMM D')} - ${end.format('D')}`;
  return `${start.format('MMM DD')} - ${end.format('MMM DD')}`;
};

export const UpcomingTime: React.FC<TimeProps> = ({ times }) => {
  const timeString = getDateString(times);
  return (
    <>
      <FontAwesomeIcon icon={faCalendar} size={'sm'} className={'m-0 mr-1 h-4 w-4'} />
      {timeString}
    </>
  );
};

export const SinceTime: React.FC<TimeProps> = ({ times }) => {
  const timeString = dayjs(times[0].start).format('MMM D YYYY');
  return (
    <>
      <FontAwesomeIcon icon={faCalendar} size={'sm'} className={'m-0 mr-1 h-4 w-4'} />
      Since {timeString}
    </>
  );
};
