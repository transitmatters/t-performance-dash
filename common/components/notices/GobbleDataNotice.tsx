import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { faChartSimple } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import classNames from 'classnames';
import { useDelimitatedRoute } from '../../utils/router';
import { BUS_MAX_DAY } from '../../constants/dates';
import { lineColorTextHover } from '../../styles/general';

export const GobbleDataNotice: React.FC = () => {
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
    ((line === 'line-bus' || linePath === 'bus') &&
      (isStartDateAfterBusMaxDay || isEndDateAfterBusMaxDay)) ||
    line === 'line-commuter-rail' ||
    linePath === 'commuter-rail'
  ) {
    return (
      <div className={'flex items-center'}>
        <FontAwesomeIcon icon={faChartSimple} size={'lg'} />
        <div className={'mx-3 my-2 text-sm italic'}>
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
    );
  }
  return null;
};
