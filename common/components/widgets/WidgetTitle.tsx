import React from 'react';
import classNames from 'classnames';
import type { Location } from '../../types/charts';
import type { Line } from '../../types/lines';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useDelimitatedRoute } from '../../utils/router';
import { getSelectedDates } from '../../state/utils/dateStoreUtils';
import { LocationTitle } from '../../../modules/dashboard/LocationTitle';

interface WidgetTitle {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
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
      <div className="flex w-full flex-col md:w-auto">
        <div className="flex w-full flex-row items-baseline justify-between">
          <h2 className="leading-tight whitespace-nowrap text-stone-800">{title}</h2>
          {isMobile && <p className="text-xs text-stone-700 italic">{date}</p>}
        </div>
        {subtitle && (
          <h2
            className={classNames('text-sm leading-tight whitespace-nowrap text-stone-600 italic')}
          >
            {subtitle}
          </h2>
        )}
      </div>
      <div className="flex w-full flex-shrink flex-col overflow-hidden md:items-end">
        {!isMobile && <p className="text-xs text-stone-700 italic">{date}</p>}
        {location && line && <LocationTitle location={location} line={line} both={both} />}
      </div>
    </div>
  );
};
