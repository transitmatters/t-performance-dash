import React from 'react';
import { Alerts } from '../commute/alerts/Alerts';
import { Speed } from '../commute/speed/Speed';
import { useDelimitatedRoute } from '../../common/utils/router';
export const TodaysCommute = () => {
  const { tab, line } = useDelimitatedRoute();
  return (
    <div className="flex flex-col gap-x-4 gap-y-2 xl:flex-row">
      <Alerts />
      {tab === 'Subway' && line !== 'GL' && <Speed />}
    </div>
  );
};
