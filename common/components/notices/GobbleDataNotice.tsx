import { Link } from '../general/Link';
import { useLinePage, usePageDates } from '../../hooks/usePageParams';
import { asDateRange } from '../../utils/pageParams';
import { FERRY_ARCHIVE_MAX_DATE, TODAY_STRING } from '../../constants/dates';

/**
 * Whether a bus page's dates include today. Today is the only bus day served from Gobble: the
 * server reads LAMP for every earlier day from 2025-07-30, and the monthly archive before that,
 * but bus LAMP lags a day (see _lamp_key in server/chalicelib/s3.py). A single date counts as a
 * one-day range.
 */
export const includesGobbleOnlyBusDay = (
  start: string | undefined,
  end: string | undefined,
  today: string = TODAY_STRING
) => start !== undefined && start <= today && (end ?? start) >= today;

/**
 * Whether a ferry page's dates reach past the MBTA's monthly ferry archive. Every later day comes
 * from Gobble (or falls in the gap before it started). A single date counts as a one-day range.
 */
export const includesGobbleFerryDay = (start: string | undefined, end: string | undefined) =>
  start !== undefined && (end ?? start) > FERRY_ARCHIVE_MAX_DATE;

/**
 * Provenance note for bus data that comes straight from the MBTA's real-time feed rather than
 * cleaned MBTA data. Renders as plain prose for the "About this data" accordion (see
 * TripDataNotes). Commuter Rail and ferry attribution is owned by BetaDataNotice.
 */
export const GobbleDataNotice = () => {
  const { line } = useLinePage();
  const { startDate, endDate } = asDateRange(usePageDates());

  if (line !== 'line-bus' || !includesGobbleOnlyBusDay(startDate, endDate)) {
    return null;
  }

  return (
    <p>
      Today's data is collected via the{' '}
      <Link
        href="https://www.mbta.com/developers/v3-api/streaming"
        rel="noopener noreferrer"
        target="_blank"
      >
        MBTA's V3 API
      </Link>{' '}
      and isn't cleaned or filtered — expect reduced accuracy. Official MBTA data is shown once
      available.
    </p>
  );
};
