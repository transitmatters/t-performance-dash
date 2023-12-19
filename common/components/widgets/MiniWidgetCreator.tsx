import React from 'react';
import type { WidgetValueInterface } from '../../types/basicWidgets';
import { DataPair } from '../general/DataPair';
import { SmallDelta } from './internal/SmallDelta';
import { SmallData } from './internal/SmallData';

interface MiniWidgetObject {
  type: 'delta' | 'data' | string;
  widgetValue: WidgetValueInterface;
  text: string;
}
[];

interface MiniWidgetCreatorProps {
  widgetObjects: MiniWidgetObject[];
}

const getDeltaOrDataComponent = (widgetObject: MiniWidgetObject) => {
  if (widgetObject.type === 'delta') {
    return <SmallDelta analysis={widgetObject.text} widgetValue={widgetObject.widgetValue} />;
  }
  return <SmallData analysis={widgetObject.text} widgetValue={widgetObject.widgetValue} />;
};

const getWidgets = (widgetObject: MiniWidgetObject[]) => {
  const widgets: React.ReactNode[] = [];
  for (let x = 0; x < widgetObject.length; x += 2) {
    widgets.push(
      <DataPair key={x} last={x + 3 > widgetObject.length}>
        {getDeltaOrDataComponent(widgetObject[x])}
        {x + 1 < widgetObject.length ? getDeltaOrDataComponent(widgetObject[x + 1]) : null}
      </DataPair>
    );
  }
  return widgets;
};

export const MiniWidgetCreator: React.FC<MiniWidgetCreatorProps> = ({ widgetObjects }) => {
  return (
    <div className="flex w-full flex-row gap-y-4 overflow-x-auto py-1 md:py-2">
      {getWidgets(widgetObjects)}
    </div>
  );
};
