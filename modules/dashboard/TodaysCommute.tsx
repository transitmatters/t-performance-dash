import React from 'react';
import { Alerts } from '../commute/alerts/Alerts';
export const TodaysCommute = () => {
  return (
    <>
      <div>
        <h1 className="text-xl">Today's Commute</h1>
        <hr className="my-2 h-[2px] border-0 border-b border-white bg-gray-400" />
        <div className="flex flex-col gap-y-2 gap-x-4 xl:flex-row">
          <Alerts />
        </div>
      </div>
    </>
  );
};
