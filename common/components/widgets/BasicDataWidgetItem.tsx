import React from 'react';
import type { BasicWidgetDataLayoutProps } from './internal/BasicWidgetDataLayout';
import { BasicWidgetDataLayout } from './internal/BasicWidgetDataLayout';
import { WidgetDiv } from './WidgetDiv';

export const BasicDataWidgetItem: React.FC<BasicWidgetDataLayoutProps> = ({
  title,
  analysis: analysis,
  widgetValue,
  sentimentDirection,
}) => {
  return (
    <WidgetDiv className="w-1/2 sm:w-auto sm:p-4">
      <BasicWidgetDataLayout
        title={title}
        analysis={analysis}
        widgetValue={widgetValue}
        sentimentDirection={sentimentDirection}
      />
    </WidgetDiv>
  );
};
