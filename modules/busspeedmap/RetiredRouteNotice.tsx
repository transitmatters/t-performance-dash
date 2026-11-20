import dayjs from 'dayjs';
import { Notice } from '../../common/components/notices/Notice';
import { BUS_SPEED_MAP_MIN_DATE, PRETTY_DATE_FORMAT } from '../../common/constants/dates';
import { useUpdateQuery } from '../../common/utils/router';
import { getMinMaxDatesForRoute } from '../../common/utils/stations';
import type { BusRoute } from '../../common/types/lines';
import type { Period } from './types';
import { periodStart } from './utils';

const UNIT: Record<Period, string> = { daily: 'day', weekly: 'week', monthly: 'month' };

/** The route's last day of service, if the period starts after it. */
export const serviceEndBefore = (
  busRoute: BusRoute | undefined,
  date: string,
  period: Period
): string | undefined => {
  const { maxDate } = getMinMaxDatesForRoute('Bus', busRoute);
  return maxDate && periodStart(date, period) > maxDate ? maxDate : undefined;
};

interface RetiredRouteNoticeProps {
  /** The route's last day of service. */
  serviceEnd: string;
  period: Period;
}

/**
 * Shown in place of the map for a period after a route stopped running, which would otherwise draw
 * nothing, or for a route whose route_id lives on, its replacement's segments.
 */
export const RetiredRouteNotice = ({ serviceEnd, period }: RetiredRouteNoticeProps) => {
  const updateQueryParams = useUpdateQuery();
  const lastDay = dayjs(serviceEnd).format(PRETTY_DATE_FORMAT);

  return (
    <Notice title="This route no longer runs">
      {serviceEnd < BUS_SPEED_MAP_MIN_DATE ? (
        `Its last day of service was ${lastDay}, before our bus speed data starts in ${dayjs(BUS_SPEED_MAP_MIN_DATE).format('MMMM YYYY')}, so there's no speed map for it.`
      ) : (
        <p>
          Its last day of service was {lastDay}.{' '}
          <button
            type="button"
            className="font-medium underline underline-offset-2"
            onClick={() => updateQueryParams({ date: serviceEnd }, false)}
          >
            See its last {UNIT[period]}
          </button>
        </p>
      )}
    </Notice>
  );
};
