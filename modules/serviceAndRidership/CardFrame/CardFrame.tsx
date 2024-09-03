import React from 'react';

import { WidgetDiv } from '../../../common/components/widgets';

type Props = {
  title: React.ReactNode;
  topRight?: React.ReactNode;
  children: React.ReactNode;
  details?: React.ReactNode;
};

export const CardFrame = (props: Props) => {
  const { title, topRight = null, details = null, children } = props;

  const renderTopRow = () => {
    return (
      <div className="flex-row">
        <h2 className="text-lg font-semibold">{title}</h2>
        {topRight}
      </div>
    );
  };

  const renderDetails = () => {
    if (details) {
      return <div>{details}</div>;
    }
    return null;
  };

  return (
    <WidgetDiv className="pb-16">
      {renderTopRow()}
      {renderDetails()}
      {children}
    </WidgetDiv>
  );
};
