import React from 'react';
import { useDelimitatedRoute } from '../../common/utils/router';
import { getSelectedDates } from '../../common/state/utils/dashboardUtils';

interface WidgetTitle {
  title: string;
}
export const WidgetTitle: React.FC<WidgetTitle> = ({ title }) => {
  const { query } = useDelimitatedRoute();
  const date = getSelectedDates({
    startDate: query.startDate,
    endDate: query.endDate,
    view: query.view,
  });

  return (
    <div className="flex w-full items-baseline justify-between p-2">
      <h3 className={'font-semibold text-stone-800'}>{title}</h3>
      <p className="text-xs italic text-stone-700">{date}</p>
    </div>
  );
};
