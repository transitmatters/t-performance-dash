import classNames from 'classnames';
import React from 'react';

type BasicWidgetDataLayoutProps = {
  title: string;
  value?: string;
  analysis: string;
  units?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: any;
};

export const BasicWidgetDataLayout: React.FC<BasicWidgetDataLayoutProps> = ({
  title,
  value,
  analysis,
  units,
  Icon,
}) => {
  return (
    <div className={classNames('w-1/2 bg-white p-2')}>
      <div className={classNames('flex flex-col items-start')}>
        <p className={classNames('text-base')}>{title}</p>
        <div className="flex flex-row items-baseline gap-x-1">
          <p className={classNames('text-4xl text-black')}>{value}</p>
          <p className="text-base text-design-subtitleGrey">{units}</p>
        </div>
        <div className="flex flex-row items-center gap-x-1">
          <div>{Icon}</div>
          <p className={classNames('text-xs text-design-subtitleGrey')}>{analysis}</p>
        </div>
      </div>
    </div>
  );
};
