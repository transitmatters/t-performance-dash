import classNames from 'classnames';
import React from 'react';
import type { DateOption } from '../../types/inputs';
import { formatDate } from '../../utils/date';
import { useDelimitatedRoute } from '../../utils/router';
import { buttonHighlightConfig } from './styles/inputStyle';

interface NativeDateInputProps {
  dateSelection: DateOption;
  setDateSelection: (dateSelection: DateOption) => void;
}

export const NativeDateInput: React.FC<NativeDateInputProps> = ({
  dateSelection,
  setDateSelection,
}) => {
  const route = useDelimitatedRoute();

  return (
    <div className="flex flex-row">
      <label className="block text-sm font-medium text-gray-700">
        {dateSelection?.range && 'From'}
      </label>
      <input
        type="date"
        className={classNames(
          'inline-flex h-8 items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2  focus:ring-offset-2',
          buttonHighlightConfig[route.line]
        )}
        onChange={(event) => setDateSelection({ ...dateSelection, startDate: event.target.value })}
        max={formatDate(new Date())}
      />
      {dateSelection?.range && (
        <span className="flex flex-row">
          <label className="block text-sm font-medium text-gray-700">{'To'}</label>
          <span>
            <input
              type="date"
              className={classNames(
                'inline-flex h-8 items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2  focus:ring-offset-2',
                buttonHighlightConfig[route.line]
              )}
              onChange={(event) => {
                setDateSelection({ ...dateSelection, endDate: event.target.value });
              }}
              max={formatDate(new Date())}
            />
          </span>
        </span>
      )}
    </div>
  );
};
