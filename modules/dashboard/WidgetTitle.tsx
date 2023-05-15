import React from 'react';
import classNames from 'classnames';
import type { Location } from '../../common/types/charts';
import type { Line } from '../../common/types/lines';
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
  return (
    <div className="flex w-full flex-row items-baseline justify-between p-2 text-xl">
      <div className="flex flex-col">
        <h2 className={classNames('font-semibold', 'text-stone-800')}>{title}</h2>
        {subtitle && <h2 className={classNames('text-sm italic text-stone-600')}>{subtitle}</h2>}
      </div>
      <div className="flex flex-col items-end">
        {location && line && <LocationTitle location={location} line={line} both={both} />}
        <p className="text-xs italic text-stone-700">{`Date Placeholder`}</p>
      </div>
    </div>
  );
};
