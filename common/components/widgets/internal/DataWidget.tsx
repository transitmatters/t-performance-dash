import React from 'react';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import type { WidgetValueInterface } from '../../../types/basicWidgets';
import type { LayoutKind, SentimentDirection } from './HorizontalDataWidget';
import { HorizontalDataWidget } from './HorizontalDataWidget';
import { BasicWidgetDataLayout } from './BasicWidgetDataLayout';

interface DataWidgetProps {
  title: React.ReactNode;
  analysis: React.ReactNode;
  widgetValue: WidgetValueInterface;
  sentimentDirection?: SentimentDirection;
  layoutKind?: LayoutKind;
  isLarge?: boolean;
}

export const DataWidget: React.FC<DataWidgetProps> = ({
  title,
  analysis,
  widgetValue,
  sentimentDirection,
  layoutKind,
  isLarge,
}) => {
  const isHorizontal = !useBreakpoint('lg');

  if (isHorizontal)
    return (
      <HorizontalDataWidget
        title={title}
        analysis={analysis}
        widgetValue={widgetValue}
        sentimentDirection={sentimentDirection}
        layoutKind={layoutKind}
        isLarge={true}
      />
    );
  return (
    <BasicWidgetDataLayout
      title={title}
      analysis={analysis}
      widgetValue={widgetValue}
      sentimentDirection={sentimentDirection}
      layoutKind={layoutKind}
      isLarge={true}
    />
  );
};
