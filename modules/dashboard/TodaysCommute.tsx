import React from 'react';
import { Alerts } from '../commute/alerts/Alerts';
import { Speed } from '../commute/speed/Speed';
import { useDelimitatedRoute } from '../../common/utils/router';
export const TodaysCommute = () => {
  const { tab, line } = useDelimitatedRoute();
  return (
    <div>
      <h1 className="text-xl">Today's Commute</h1>
      <hr className="my-2 h-[2px] border-0 border-b border-white bg-gray-400" />
      <div className="flex flex-col gap-x-4 gap-y-2 xl:flex-row">
        <Alerts />
        {tab === 'Subway' && line !== 'GL' && <Speed />}
      </div>
    </div>
  );
};
