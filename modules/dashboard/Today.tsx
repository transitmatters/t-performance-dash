import React from 'react';
import { LayoutType } from '../../common/layouts/layoutTypes';
import { TodaysCommute } from './TodaysCommute';

export default function Today() {
  return (
    <div className="flex flex-col pt-2">
      <TodaysCommute />
    </div>
  );
}

Today.Layout = LayoutType.Metrics;
