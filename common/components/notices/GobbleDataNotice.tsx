import React from 'react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useDelimitatedRoute } from '../../utils/router';
import { BUS_MAX_DAY } from '../../constants/dates';

/**
 * Provenance note for recent bus dates that predate cleaned MBTA data. Renders
 * as plain prose for the "About this data" accordion (see TripDataNotes).
 * Commuter Rail attribution is owned by BetaDataNotice.
 */
export const GobbleDataNotice: React.FC = () => {
  const {
    line,
    linePath,
    query: { date, startDate, endDate },
  } = useDelimitatedRoute();

  const isBus = line === 'line-bus' || linePath === 'bus';
  const isStartDateAfterBusMaxDay =
    (startDate !== undefined && dayjs(startDate).isAfter(BUS_MAX_DAY)) ||
    (date !== undefined && dayjs(date).isAfter(BUS_MAX_DAY));
  const isEndDateAfterBusMaxDay = endDate !== undefined && dayjs(endDate).isAfter(BUS_MAX_DAY);

  if (!(isBus && (isStartDateAfterBusMaxDay || isEndDateAfterBusMaxDay))) {
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
