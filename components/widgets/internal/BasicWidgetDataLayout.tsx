import React from 'react';
import { classNames } from '../../utils/tailwind';

type BasicWidgetDataLayoutProps = {
  title: string;
  value?: string;
  analysis: string;
  change?: string;
  units?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: any;
};

export const BasicWidgetDataLayout: React.FC<BasicWidgetDataLayoutProps> = ({
  title,
  value,
  analysis,
  change,
  units,
  Icon,
}) => {
  return (
    <div className={classNames('w-1/2 bg-white p-2')}>
      <div className={classNames('flex flex-col items-start')}>
        <p className={classNames('text-base text-gray-700')}>{title}</p>
        <div className="flex flex-row items-baseline gap-x-1">
          <p className={classNames('text-4xl font-semibold text-design-rb-900 sm:text-3xl')}>
            {value}
          </p>
          <p className="text-base text-design-subtitleGrey">{units}</p>
        </div>
        <div className="flex flex-row items-baseline gap-x-1">
          <div className="mt-1 flex flex-row rounded-full bg-design-negative bg-opacity-20 px-3">
            <p className="text-sm text-design-negative">{change}</p>
          </div>

          <p className={classNames('text-sm text-design-subtitleGrey')}>{analysis}</p>
        </div>
      </div>
    </div>
  );
};
