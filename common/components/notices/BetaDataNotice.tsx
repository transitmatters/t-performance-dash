import dayjs from 'dayjs';
import { Link } from '../general/Link';
import { FERRY_ARCHIVE_MAX_DATE, PRETTY_DATE_FORMAT } from '../../constants/dates';
import { useDelimitatedRoute } from '../../utils/router';
import { includesGobbleFerryDay } from './GobbleDataNotice';

const Collection = () => (
  <>
    TransitMatters collects this data using the{' '}
    <Link
      href="https://www.mbta.com/developers/v3-api/streaming"
      rel="noopener noreferrer"
      target="_blank"
    >
      MBTA&apos;s V3 API
    </Link>
    . It isn&apos;t cleaned or filtered before display, so we may occasionally miss trips or stops.
    Confirm anything you see here against official MBTA sources when possible. See our{' '}
    <Link href="https://github.com/transitmatters/gobble" rel="noopener noreferrer" target="_blank">
      GitHub repository
    </Link>{' '}
    for technical details.
  </>
);

/**
 * The data caveat for data TransitMatters records itself: Commuter Rail always, and ferry days after
 * the MBTA's monthly archive ends. Beta status, how the data is collected, and its known gaps.
 * Renders as plain prose for embedding inside the "About this data" accordion (see TripDataNotes).
 */
export const BetaDataNotice = () => {
  const {
    line,
    linePath,
    query: { date, startDate, endDate },
  } = useDelimitatedRoute();

  if (line === 'line-commuter-rail' || linePath === 'commuter-rail') {
    return (
      <>
        <p className="font-medium text-foreground">How Commuter Rail data is collected</p>
        <p>
          <Collection />
        </p>
        <p>
          Benchmarks start on October 4, 2026, when we began comparing each train to its own
          schedule. Before then they were often another train&apos;s, so we don&apos;t show them.
        </p>
      </>
    );
  }

  if (
    (line === 'line-ferry' || linePath === 'ferry') &&
    includesGobbleFerryDay(startDate ?? date, endDate ?? date)
  ) {
    return (
      <>
        <p className="font-medium text-foreground">How ferry data is collected</p>
        <p>
          Through {dayjs(FERRY_ARCHIVE_MAX_DATE).format(PRETTY_DATE_FORMAT)}, ferry data comes from
          the MBTA&apos;s official archive. After that, <Collection />
        </p>
      </>
    );
  }

  return null;
};
