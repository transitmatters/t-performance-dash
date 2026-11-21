import { useDelimitatedRoute } from '../../utils/router';
import { SERVICE_DATE_STRING, TODAY_STRING } from '../../constants/dates';
import { Notice } from './Notice';

/**
 * Which unfinished day a page's dates include, if any: today, or before 3 AM, yesterday, whose
 * service is still running (service days run from 3 AM to 3 AM).
 */
export const unfinishedDay = (
  dates: (string | undefined)[],
  today: string = TODAY_STRING,
  serviceDate: string = SERVICE_DATE_STRING
): 'today' | 'yesterday' | undefined => {
  if (dates.includes(today)) return 'today';
  if (dates.includes(serviceDate)) return 'yesterday';
  return undefined;
};

export const SameDayNotice = () => {
  const {
    query: { date, endDate },
  } = useDelimitatedRoute();
  const day = unfinishedDay([date, endDate]);

  if (!day) {
    return null;
  }

  return (
    <Notice variant="warning">
      {day === 'today'
        ? 'Data from today may be incomplete — it arrives with a delay of up to two hours.'
        : 'Yesterday’s service runs until 3 AM, so its data may be incomplete — it arrives with a delay of up to two hours.'}
    </Notice>
  );
};
