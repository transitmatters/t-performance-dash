import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { useRidershipData } from '../../common/api/hooks/ridership';
import { BasicDataWidgetItem } from '../../common/components/widgets/BasicDataWidgetItem';
import { BasicDataWidgetPair } from '../../common/components/widgets/BasicDataWidgetPair';
import { LINE_COLORS } from '../../common/constants/colors';
import { PercentageWidgetValue, TripsWidgetValue } from '../../common/types/basicWidgets';
import type { ServiceDay } from '../../common/types/ridership';
import { getHighestTphValue, normalizeToPercent } from '../../common/utils/ridership';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ServiceDayPicker } from '../../common/components/inputs/ServiceDayPicker';
import { widgetStyle } from '../../common/styles/widgets';
import { TphChart } from './charts/TphChart';
import { ServiceRidershipChart } from './charts/ServiceRidershipChart';

export default function RidershipDetails() {
  const allRidership = useRidershipData();

  const {
    line,
    lineShort,
    query: { busRoute },
  } = useDelimitatedRoute();
  const routeOrLine = line === 'BUS' ? busRoute : lineShort;
  // Get the proper line- index, replace slashes for 114/116/117 route
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

  // Only re-render chart when necesarry
  const serviceRidershipChart = useMemo(() => {
    return <ServiceRidershipChart lineData={lineData} startDate={startDate} color={color} />;
  }, [color, lineData, startDate]);

  // Only re-render chart when necesarry
  const serviceLevelChart = useMemo(() => {
    return (
      <>
        <TphChart
          lineData={lineData}
          serviceDay={serviceDay}
          color={color}
          highestTph={highestTph}
        />
        <ServiceDayPicker serviceDay={serviceDay} setServiceDay={setServiceDay} />
      </>
    );
  }, [color, highestTph, lineData, serviceDay]);

  return (
    <>
      <BasicDataWidgetPair>
        <BasicDataWidgetItem
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
        <BasicDataWidgetItem
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
      </BasicDataWidgetPair>
      <div className="flex w-full flex-row items-center justify-between text-lg">
        <h3>Weekday ridership and service levels</h3>
      </div>
      <div className={widgetStyle}>{serviceRidershipChart}</div>

      <div className="flex w-full flex-row items-center justify-between text-lg">
        <h3>Service Levels</h3>
      </div>
      <div className={classNames(widgetStyle, 'flex pr-3')}>{serviceLevelChart}</div>
    </>
  );
}
