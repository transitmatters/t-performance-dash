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
    (line === 'line-bus' || linePath === 'bus') &&
    (isStartDateAfterBusMaxDay || isEndDateAfterBusMaxDay)
  ) {
    return (
      <div className="rounded-md bg-yellow-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Real-time bus data is in beta</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Data shown here is collected by TransitMatters using the{' '}
                <Link
                  href="https://www.mbta.com/developers/v3-api/streaming"
                  rel="noopener noreferrer"
                  target="_blank"
                  className={classNames(lineColorTextHover[line ?? 'DEFAULT'])}
                >
                  MBTA's streaming API
                </Link>
                . Unlike other data sources we show, this data is not cleaned or filtered in any way
                before display. Innacuracies may be present.
              </p>
              <p>
                Official MBTA data will be shown when available. Technical details of our data
                collection can be found{' '}
                <Link
                  href="https://github.com/transitmatters/gobble"
                  rel="noopener noreferrer"
                  target="_blank"
                  className={classNames(lineColorTextHover[line ?? 'DEFAULT'])}
                >
                  here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};
