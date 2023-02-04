import React, { ReactNode } from 'react';
import { classNames } from '../utils/tailwind';
import ArrowDownNegative from '../../public/Icons/ArrowDownNegative.svg';

type BasicDataWidgetItemProps = {
  title: string;
  value?: string;
  analysis: string;
  units?: string;
  icon?: ReactNode;
};

export const BasicDataWidgetItem: React.FC<BasicDataWidgetItemProps> = ({
  title,
  value,
  analysis,
  units,
  icon,
}) => {
  return (
    <div
      className={classNames('w-1/2 rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox')}
    >
      <div className={classNames('flex flex-col items-start')}>
        <p className={classNames('text-base')}>{title}</p>
        <div className="flex flex-row items-baseline gap-x-1">
          <p className={classNames('text-4xl text-black')}>{value}</p>
          <p className="text-base text-design-subtitleGrey">{units}</p>
        </div>
        <div className="flex flex-row items-center gap-x-1">
          {icon ? (
            icon
          ) : (
            <ArrowDownNegative className="h-3 w-auto" alt="Negative Sentiment Indication" />
          )}
          <p className={classNames('text-xs text-design-subtitleGrey')}>{analysis}</p>
        </div>
      </div>
    </div>
  );
};
