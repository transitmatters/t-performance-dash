import classNames from 'classnames';
import React, { useMemo } from 'react';
import { formatDate } from '../../utils/date';
import { useDelimitatedRoute, useUpdateQuery } from '../../utils/router';
import { buttonHighlightConfig } from './styles/inputStyle';

interface NativeDateInputProps {
  range: boolean;
}

export const NativeDateInput: React.FC<NativeDateInputProps> = ({ range }) => {
  const {
    line,
    query: { startDate, endDate },
  } = useDelimitatedRoute();

  const updateQueryParams = useUpdateQuery({ range });

  const dates = useMemo(
    () => ({
      startDate: startDate,
      endDate: endDate,
    }),
    [startDate, endDate]
  );

  return (
    <div className="flex flex-row">
      <label className="block text-sm font-medium text-gray-700">{range && 'From'}</label>
      <input
        type="date"
        className={classNames(
          'inline-flex h-8 items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2  focus:ring-offset-2',
          line && buttonHighlightConfig[line]
        )}
        value={dates.startDate}
        onChange={(event) => updateQueryParams({ ...dates, startDate: event.target.value })}
        max={formatDate(new Date())}
      />
      {range && (
        <span className="flex flex-row">
          <label className="block text-sm font-medium text-gray-700">{'To'}</label>
          <span>
            <input
              type="date"
              className={classNames(
                'inline-flex h-8 items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2  focus:ring-offset-2',
                line && buttonHighlightConfig[line]
              )}
              value={dates.endDate}
              onChange={(event) => {
                updateQueryParams({ ...dates, endDate: event.target.value });
              }}
              max={formatDate(new Date())}
            />
          </span>
        </span>
      )}
    </div>
  );
};
