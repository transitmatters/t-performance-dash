import React from 'react';
import { LineHealth } from './LineHealth';
import { TodaysCommute } from './TodaysCommute';

export default function Overview() {
  return (
    <div className="flex flex-col gap-y-8 pt-2">
      <TodaysCommute />
      <LineHealth />
    </div>
  );
}
