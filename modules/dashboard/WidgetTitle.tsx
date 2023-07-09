import React from 'react';
import classNames from 'classnames';
import type { Location } from '../../common/types/charts';
import type { Line } from '../../common/types/lines';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { useDelimitatedRoute } from '../../common/utils/router';
import { getSelectedDates } from '../../common/state/utils/dateStoreUtils';
import { LocationTitle } from './LocationTitle';

interface WidgetTitle {
  title: string;
  subtitle?: string;
  location?: Location;
  both?: boolean;
  line?: Line;
}

export const WidgetTitle: React.FC<WidgetTitle> = ({
  title,
  subtitle,
  both = false,
  location,
  line,
}) => {
  const isMobile = !useBreakpoint('md');
  const { query } = useDelimitatedRoute();
  const date = getSelectedDates({
    startDate: query.startDate ? query.startDate : query.date,
    endDate: query.endDate,
    view: query.view,
  });
  return (
    <div className="flex w-full flex-col items-baseline justify-between gap-x-4 gap-y-1 pb-1 text-base md:flex-row md:text-xl">
      <div className="flex w-full flex-col md:w-auto ">
        <div className="flex w-full flex-row items-baseline justify-between">
          <h2
            className={classNames(
              'font-semibold',
              'whitespace-nowrap leading-tight text-stone-800'
            )}
          >
            {title}
          </h2>
          {isMobile && <p className="text-xs italic text-stone-700">{date}</p>}
        </div>
        {subtitle && !isMobile && (
          <h2
            className={classNames('whitespace-nowrap text-sm italic leading-tight text-stone-600')}
          >
            {subtitle}
          </h2>
        )}
      </div>
      <div className="flex w-full flex-shrink flex-col overflow-hidden md:items-end">
        {!isMobile && <p className="text-xs italic text-stone-700">{date}</p>}
        {location && line && <LocationTitle location={location} line={line} both={both} />}
      </div>
    </div>
  );
};
