import React from 'react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useDelimitatedRoute } from '../../utils/router';
import { BUS_MAX_DAY, LAMP_BUS_START_DAY } from '../../constants/dates';

/**
 * Provenance note for bus dates that predate cleaned MBTA data. Only the
 * 2025-11-01..2025-12-31 window (after the monthly archive, before LAMP's bus feed
 * starts) is actually raw/uncleaned -- dates from LAMP_BUS_START_DAY on are served from
 * LAMP, same as the rest of the system. Renders as plain prose for the "About this data"
 * accordion (see TripDataNotes). Commuter Rail attribution is owned by BetaDataNotice.
 */
export const GobbleDataNotice: React.FC = () => {
  const {
    line,
    linePath,
    query: { date, startDate, endDate },
  } = useDelimitatedRoute();

  const isBus = line === 'line-bus' || linePath === 'bus';
  // A single date counts as its own one-day range, so a plain interval-overlap check
  // covers both single-day and range pages -- including a range that spans clean over
  // the gap (e.g. Sep 2025-Mar 2026) without either endpoint landing inside it.
  const rangeStart = startDate ?? date;
  const rangeEnd = endDate ?? date;
  const overlapsGobbleOnlyWindow =
    rangeStart !== undefined &&
    rangeEnd !== undefined &&
    dayjs(rangeEnd).isAfter(BUS_MAX_DAY) &&
    dayjs(rangeStart).isBefore(LAMP_BUS_START_DAY);

  if (!(isBus && overlapsGobbleOnlyWindow)) {
    return null;
  }

  return (
    <p>
      For these recent dates, data is collected via the{' '}
      <Link
        href="https://www.mbta.com/developers/v3-api/streaming"
        rel="noopener noreferrer"
        target="_blank"
      >
        MBTA&apos;s V3 API
      </Link>{' '}
      and isn&apos;t cleaned or filtered — expect reduced accuracy. Official MBTA data is shown once
      available.
    </p>
  );
};
