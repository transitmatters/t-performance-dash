import React, { ReactNode } from 'react';
import { classNames } from '../utils/tailwind';
import NegativeArrow from '../../public/Icons/NegativeArrow.svg';

type BasicDataWidgetItemProps = {
  title: string;
  value?: string;
  analysis: string;
  change: string;
  units?: string;
  icon?: ReactNode;
};

export const BasicDataWidgetItem: React.FC<BasicDataWidgetItemProps> = ({
  title,
  value,
  analysis,
  change,
  units,
  icon,
}) => {
  return (
    <div
      className={classNames(
        'w-1/2 rounded-lg border-design-lightGrey bg-white p-6 shadow-dataBox sm:w-auto'
      )}
    >
      <div className={classNames('flex flex-col items-start')}>
        <p className={classNames('text-base text-design-rb-500')}>{title}</p>
        <div className="flex flex-row items-baseline gap-x-1">
          <p className={classNames('text-4xl font-semibold text-design-rb-900 sm:text-3xl')}>
            {value}
          </p>
          <p className="text-base text-design-subtitleGrey">{units}</p>
        </div>
        <div className="flex flex-row items-baseline gap-x-1">
          {icon ? (
            icon
          ) : (
            <div className="mt-1 flex flex-row rounded-full bg-design-negative bg-opacity-20 px-2">
              <p className="text-sm text-design-negative">{change}</p>
            </div>
          )}
          <p className={classNames('text-sm text-design-subtitleGrey')}>{analysis}</p>
        </div>
      </div>
    </div>
  );
};
