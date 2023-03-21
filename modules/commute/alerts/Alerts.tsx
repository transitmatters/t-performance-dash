import React from 'react';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { fetchAlerts } from '../../../common/api/alerts';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { lineColorBackground } from '../../../common/styles/general';
import { Divider } from '../../../common/components/general/Divider';
import { AlertBox } from './AlertBox';

export const Alerts: React.FC = () => {
  const { line, lineShort, query } = useDelimitatedRoute();
  const alerts = useQuery(['alerts', lineShort, query.busRoute], () =>
    fetchAlerts(lineShort, query.busRoute)
  );

  const divStyle = classNames(
    'flex flex-col items-center rounded-md p-4 text-white shadow-dataBox w-full xl:w-1/2 gap-y-2 md:max-h-[300px] md:overflow-y-auto',
    lineColorBackground[line ?? 'DEFAULT']
  );

  if (alerts.isLoading || !line || !lineShort) {
    return <div className={divStyle}>Loading...</div>;
  }
  if (alerts.isError) {
    return <div className={divStyle}>Error getting alerts.</div>;
  }

  return (
    <div className={divStyle}>
      <h3 className="w-full text-2xl font-semibold md:w-auto">Alerts</h3>
      <div className="flex w-full flex-row gap-x-4 overflow-x-scroll pb-2 md:flex-col md:gap-x-0 md:overflow-x-auto">
        <div className="md:w-full">
          <Divider title="Today" line={line} />

          <AlertBox
            alerts={alerts.data}
            lineShort={lineShort}
            line={line}
            busRoute={query.busRoute}
            type={'current'}
          />
        </div>
        <div className="md:mt-2 md:flex md:w-full md:flex-col">
          <Divider title="Upcoming" line={line} />

          <AlertBox
            alerts={alerts.data}
            lineShort={lineShort}
            line={line}
            busRoute={query.busRoute}
            type={'upcoming'}
          />
        </div>
      </div>
    </div>
  );
};
