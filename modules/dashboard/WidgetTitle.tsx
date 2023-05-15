import React from 'react';
import classNames from 'classnames';
import type { Location } from '../../common/types/charts';
import type { Line } from '../../common/types/lines';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
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
  return (
    <div className="flex w-full flex-col items-baseline justify-between gap-x-4 p-2 text-xl md:flex-row">
      <div className="flex w-full flex-col md:w-auto ">
        <div className="flex w-full flex-row items-baseline justify-between">
          <h2 className={classNames('font-semibold', 'whitespace-nowrap text-stone-800')}>
            {title}
          </h2>
          {isMobile && <p className="text-xs italic text-stone-700">{`Date Placeholder`}</p>}
        </div>
        {subtitle && (
          <h2 className={classNames('whitespace-nowrap text-sm italic text-stone-600')}>
            {subtitle}
          </h2>
        )}
      </div>
      <div className="flex w-full flex-shrink flex-col overflow-hidden md:items-end">
        {!isMobile && <p className="text-xs italic text-stone-700">{`Date Placeholder`}</p>}
        {location && line && <LocationTitle location={location} line={line} both={both} />}
      </div>
    </div>
  );
};
