import classNames from 'classnames';
import React, { useMemo, useState } from 'react';
import { useRidershipData } from '../../common/api/ridership';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { LINE_COLORS } from '../../common/constants/colors';
import { PercentageWidgetValue, TripsWidgetValue } from '../../common/types/basicWidgets';
import type { ServiceDay } from '../../common/types/ridership';
import { getHighestTphValue, normalizeToPercent } from '../../common/utils/ridership';
import { useDelimitatedRoute } from '../../common/utils/router';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { ServiceRidershipChart } from './charts/ServiceRidershipChart';
import { TphChart } from './charts/TphChart';

export const RidershipWidget: React.FC = () => {
  const allRidership = useRidershipData();

  const { line, linePath, lineShort, query } = useDelimitatedRoute();
  const routeOrLine = line === 'BUS' ? query.busRoute : lineShort;
  const lineData = allRidership.data?.lineData[`line-${routeOrLine?.replace(/\//g, '')}`];

  const color = LINE_COLORS[line ?? 'default'];
  const [serviceDay, setServiceDay] = useState<ServiceDay>('weekday');
  const highestTph = useMemo(() => (lineData ? getHighestTphValue(lineData) : 0), [lineData]);
  const startDate = useMemo(
    () => new Date(lineData?.startDate ?? '2020-02-23'),
    [lineData?.startDate]
  );
  const ridershipPercentage = normalizeToPercent(lineData?.ridershipHistory ?? []);
  const serviceHistory = lineData?.serviceHistory ?? [];

  return (
    <div className={classNames('h-full rounded-lg bg-white p-2 shadow-dataBox')}>
      <HomescreenWidgetTitle title="Ridership & Service Levels" href={`/${linePath}/ridership`} />

      <div className={classNames('flex w-full flex-row')}>
        <BasicWidgetDataLayout
          title="Pre-COVID Ridership"
          widgetValue={
            new PercentageWidgetValue(
              ridershipPercentage[ridershipPercentage.length - 1],
              ridershipPercentage[ridershipPercentage.length - 1] -
                ridershipPercentage[ridershipPercentage.length - 31]
            )
          }
          analysis={`from last month.`}
          sentimentDirection={'positiveOnIncrease'}
        />
        <BasicWidgetDataLayout
          title="Service Levels"
          widgetValue={
            new TripsWidgetValue(
              serviceHistory?.[serviceHistory.length - 1],
              serviceHistory?.[serviceHistory.length - 1] -
                serviceHistory?.[serviceHistory.length - 365]
            )
          }
          analysis={`since last year.`}
          sentimentDirection={'positiveOnIncrease'}
        />
      </div>
      <div className={classNames('h-50 pr-4')}>
        <ServiceRidershipChart lineData={lineData} startDate={startDate} color={color} />
      </div>
      <div className={classNames('h-50 pr-4')}>
        <TphChart
          lineData={lineData}
          serviceDay={serviceDay}
          color={color}
          highestTph={highestTph}
        />
      </div>
    </div>
  );
};
