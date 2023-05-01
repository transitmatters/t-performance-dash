import React from 'react';
import classNames from 'classnames';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { lineColorBackground } from '../../../common/styles/general';
import { Divider } from '../../../common/components/general/Divider';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { useAlertsData } from '../../../common/api/hooks/alerts';
import { AlertBox } from './AlertBox';

export const Alerts: React.FC = () => {
  const {
    line,
    lineShort,
    query: { busRoute },
  } = useDelimitatedRoute();
  const alerts = useAlertsData(lineShort, busRoute);

  const divStyle = classNames(
    'flex flex-col rounded-md p-4 text-white shadow-dataBox w-full xl:w-1/3 gap-y-2 md:max-h-[309px] md:overflow-y-auto',
    lineColorBackground[line ?? 'DEFAULT']
  );

  const alertsReady = !alerts.isError && !alerts.isLoading && line && lineShort;

  if (!alertsReady) {
    return (
      <div className={divStyle}>
        <h3 className="w-full text-2xl font-semibold md:w-auto">Alerts</h3>
        <ChartPlaceHolder query={alerts} isInverse />
      </div>
    );
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
            busRoute={busRoute}
            type={'current'}
          />
        </div>
        <div className="md:mt-2 md:flex md:w-full md:flex-col">
          <Divider title="Upcoming" line={line} />

          <AlertBox
            alerts={alerts.data}
            lineShort={lineShort}
            busRoute={busRoute}
            type={'upcoming'}
          />
        </div>
      </div>
    </div>
  );
};
