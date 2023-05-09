import React, { useMemo, useState } from 'react';
import { useRidershipData } from '../../common/api/hooks/ridership';
import { BasicDataWidgetItem } from '../../common/components/widgets/BasicDataWidgetItem';
import { BasicDataWidgetPair } from '../../common/components/widgets/BasicDataWidgetPair';
import { LINE_COLORS } from '../../common/constants/colors';
import { PercentageWidgetValue, TripsWidgetValue } from '../../common/types/basicWidgets';
import type { ServiceDay } from '../../common/types/ridership';
import { getHighestTphValue, normalizeToPercent } from '../../common/utils/ridership';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ServiceDayPicker } from '../../common/components/inputs/ServiceDayPicker';
import { WidgetTitle } from '../dashboard/WidgetTitle';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { TphChart } from './charts/TphChart';
import { ServiceRidershipChart } from './charts/ServiceRidershipChart';

export function RidershipDetails() {
  const allRidership = useRidershipData();

  const {
    line,
    lineShort,
    query: { busRoute },
  } = useDelimitatedRoute();
  const routeOrLine = line === 'line-bus' ? busRoute : lineShort;
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
        <ServiceDayPicker setServiceDay={setServiceDay} />
      </>
    );
  }, [color, highestTph, lineData, serviceDay]);

  return (
    <PageWrapper pageTitle={'Ridership'}>
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
      <WidgetDiv>
        <WidgetTitle title="Weekday Ridership & Service" />
        {serviceRidershipChart}
      </WidgetDiv>

      <WidgetDiv className="flex flex-col pr-3">
        <WidgetTitle title="Service Levels" />
        {serviceLevelChart}
      </WidgetDiv>
    </PageWrapper>
  );
}
