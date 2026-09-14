import React from 'react';
import Link from 'next/link';
import { useDelimitatedRoute } from '../../utils/router';

/**
 * The single Commuter Rail data caveat: beta status, how the data is collected,
 * and its known gaps. Renders as plain prose for embedding inside the
 * "About this data" accordion (see TripDataNotes).
 */
export const BetaDataNotice: React.FC = () => {
  const { line, linePath } = useDelimitatedRoute();

  if (line !== 'line-commuter-rail' && linePath !== 'commuter-rail') {
    return null;
  }

  return (
    <>
      <p className="text-foreground font-medium">How Commuter Rail data is collected</p>
      <p>
        TransitMatters collects this data using the{' '}
        <Link
          href="https://www.mbta.com/developers/v3-api/streaming"
          rel="noopener noreferrer"
          target="_blank"
        >
          MBTA&apos;s V3 API
        </Link>
        . It isn&apos;t cleaned or filtered before display, so we may occasionally miss trips or
        stops. Confirm anything you see here against official MBTA sources when possible. See our{' '}
        <Link
          href="https://github.com/transitmatters/gobble"
          rel="noopener noreferrer"
          target="_blank"
        >
          GitHub repository
        </Link>{' '}
        for technical details.
      </p>
    </>
  );
};
