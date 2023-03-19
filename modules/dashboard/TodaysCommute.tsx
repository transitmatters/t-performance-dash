import React from 'react';
import { Alerts } from '../commute/alerts/Alerts';
import { ScheduleAdherence } from '../commute/adherence/ScheduleAdherence';
import { Speed } from '../commute/speed/Speed';
export const TodaysCommute = () => {
  return (
    <div>
      <h1 className="text-xl">Today's Commute</h1>
      <hr className="my-2 h-[2px] border-0 border-b border-white bg-gray-400" />
      <div className="flex flex-col gap-y-2 gap-x-8 xl:flex-row">
        <Alerts />
        <ScheduleAdherence />
        <Speed />
      </div>
    </div>
  );
};
