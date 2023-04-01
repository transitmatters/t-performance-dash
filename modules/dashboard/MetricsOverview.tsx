import React from 'react';
import { LineHealth } from './LineHealth';

export default function MetricsOverview() {
  return (
    <>
      <div className="flex flex-col gap-y-8 pt-2">
        <LineHealth />
      </div>
    </>
  );
}

MetricsOverview.Layout = 'Metrics';
