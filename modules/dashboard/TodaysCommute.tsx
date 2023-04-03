import React from 'react';
import { Alerts } from '../commute/alerts/Alerts';
export const TodaysCommute = () => {
  return (
    <div>
      <div className="flex flex-col gap-y-2 gap-x-4 xl:flex-row">
        <Alerts />
      </div>
    </div>
  );
};
