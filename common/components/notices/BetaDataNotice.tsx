import React from 'react';
import dayjs from 'dayjs';
import Link from 'next/link';
import classNames from 'classnames';
import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import { useDelimitatedRoute } from '../../utils/router';
import { BUS_MAX_DAY } from '../../constants/dates';
import { lineColorTextHover } from '../../styles/general';

export const BetaDataNotice: React.FC = () => {
  const {
    line,
    linePath,
    query: { date, startDate, endDate },
  } = useDelimitatedRoute();

  const isStartDateAfterBusMaxDay =
    (startDate !== undefined && dayjs(startDate).isAfter(BUS_MAX_DAY)) ||
    (date !== undefined && dayjs(date).isAfter(BUS_MAX_DAY));
  const isEndDateAfterBusMaxDay = endDate !== undefined && dayjs(endDate).isAfter(BUS_MAX_DAY);

  if (
    (line === 'line-commuter-rail' || linePath === 'commuter-rail') &&
    (isStartDateAfterBusMaxDay || isEndDateAfterBusMaxDay)
  ) {
    return (
      <div className="rounded-md bg-yellow-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Real-time Commuter Rail data is in beta
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                TransitMatters collects this data using the{' '}
                <Link
                  href="https://www.mbta.com/developers/v3-api/streaming"
                  rel="noopener noreferrer"
                  target="_blank"
                  className={classNames(lineColorTextHover[line ?? 'DEFAULT'])}
                >
                  MBTA's V3 API
                </Link>
                . Unlike data from other sources, it is not cleaned or filtered before display.
                Please expect reduced accuracy.
              </p>
              <p>
                Technical details of our data collection are available in our{' '}
                <Link
                  href="https://github.com/transitmatters/gobble"
                  rel="noopener noreferrer"
                  target="_blank"
                  className={classNames(lineColorTextHover[line ?? 'DEFAULT'])}
                >
                  GitHub repository
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};
