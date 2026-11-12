import dayjs from 'dayjs';
import { FERRY_ARCHIVE_MAX_DATE } from '../../constants/dates';
import { useDelimitatedRoute } from '../../utils/router';
import { Notice } from './Notice';
import { includesGobbleFerryDay } from './GobbleDataNotice';

/** The visible accuracy warning for data TransitMatters records itself rather than cleaned MBTA data. */
export const BetaAccuracyNotice = () => {
  const {
    line,
    linePath,
    query: { date, startDate, endDate },
  } = useDelimitatedRoute();

  if (line === 'line-commuter-rail' || linePath === 'commuter-rail') {
    return (
      <Notice variant="warning">
        Commuter Rail data is in beta — headways and travel times may be incomplete or inaccurate.
      </Notice>
    );
  }

  if (
    (line === 'line-ferry' || linePath === 'ferry') &&
    includesGobbleFerryDay(startDate ?? date, endDate ?? date)
  ) {
    return (
      <Notice variant="warning">
        Ferry data after {dayjs(FERRY_ARCHIVE_MAX_DATE).format('MMMM YYYY')} is in beta — headways
        and travel times may be incomplete or inaccurate.
      </Notice>
    );
  }

  return null;
};
