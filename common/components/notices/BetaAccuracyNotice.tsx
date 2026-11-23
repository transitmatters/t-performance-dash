import dayjs from 'dayjs';
import { FERRY_ARCHIVE_MAX_DATE } from '../../constants/dates';
import { useLinePage, usePageDates } from '../../hooks/usePageParams';
import { asDateRange } from '../../utils/pageParams';
import { Notice } from './Notice';
import { includesGobbleFerryDay } from './GobbleDataNotice';

/** The visible accuracy warning for data TransitMatters records itself rather than cleaned MBTA data. */
export const BetaAccuracyNotice = () => {
  const { line } = useLinePage();
  const { startDate, endDate } = asDateRange(usePageDates());

  if (line === 'line-commuter-rail') {
    return (
      <Notice variant="warning">
        Commuter Rail data is in beta — headways and travel times may be incomplete or inaccurate.
      </Notice>
    );
  }

  if (line === 'line-ferry' && includesGobbleFerryDay(startDate, endDate)) {
    return (
      <Notice variant="warning">
        Ferry data after {dayjs(FERRY_ARCHIVE_MAX_DATE).format('MMMM YYYY')} is in beta — headways
        and travel times may be incomplete or inaccurate.
      </Notice>
    );
  }

  return null;
};
