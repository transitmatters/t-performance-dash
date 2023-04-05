import React from 'react';
import { LayoutType } from '../../common/layouts/layoutTypes';
import { LineHealth } from './LineHealth';

export default function Overview() {
  return (
    <div className="flex flex-col pt-2">
      <LineHealth />
    </div>
  );
}
Overview.Layout = LayoutType.Overview;
