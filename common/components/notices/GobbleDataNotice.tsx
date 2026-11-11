import { Link } from '../general/Link';
import { useDelimitatedRoute } from '../../utils/router';
import { TODAY_STRING } from '../../constants/dates';

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
 * Provenance note for bus data that comes straight from the MBTA's real-time feed rather than
 * cleaned MBTA data. Renders as plain prose for the "About this data" accordion (see
 * TripDataNotes). Commuter Rail attribution is owned by BetaDataNotice.
 */
export const GobbleDataNotice = () => {
  const {
    line,
    linePath,
    query: { date, startDate, endDate },
  } = useDelimitatedRoute();

  const isBus = line === 'line-bus' || linePath === 'bus';

  if (!(isBus && includesGobbleOnlyBusDay(startDate ?? date, endDate ?? date))) {
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
