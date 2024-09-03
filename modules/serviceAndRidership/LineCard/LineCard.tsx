import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { TiCancel, TiTicket } from 'react-icons/ti';

import { CardFrame } from '../CardFrame';
import { TabPicker } from '../TabPicker';
import { useServiceAndRidershipContext } from '../useServiceAndRidershipContext';
import type { LineData, ServiceDay } from '../types';

import { lineKindColors } from './colors';
import { TphChart } from './TphChart';
import { ServiceRidershipChart } from './ServiceRidershipChart';

import styles from './LineCard.module.css';

type Props = {
  lineData: LineData;
};

const serviceDayItems = [
  { value: 'weekday', label: 'Weekdays' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const hasFreeFarePilot = (routeShortName: string) => ['23', '28', '29'].includes(routeShortName);

const getHighestTphValue = (lineData: LineData) => {
  let max = 0;
  Object.entries(lineData.serviceRegimes).forEach(([key, regime]) => {
    if (key === 'baseline' || key === 'current') {
      Object.values(regime).forEach((serviceLevel) => {
        if (serviceLevel.tripsPerHour) {
          max = Math.max(max, ...serviceLevel.tripsPerHour);
        }
      });
    }
  });
  return max;
};

const regionalRailCaveats = (
  <details>
    <summary>Caveats on Commuter Rail data</summary>
    <div className={styles.detailsExpanded}>
      The MBTA doesn't provide us daily Commuter Rail ridership from before June 2020. We estimate a
      baseline (100%) value for February 2020 based on{' '}
      <a
        href="https://mbta-massdot.opendata.arcgis.com/datasets/MassDOT::mbta-commuter-rail-ridership-by-trip-season-route-line-and-stop/explore"
        target="_blank"
        rel="noreferrer"
      >
        2018 per-line ridership values
      </a>
      .
    </div>
  </details>
);

export const LineCard = (props: Props) => {
  const { lineData } = props;
  const { id, ridershipHistory, lineKind, serviceHistory, serviceRegimes, shortName, longName } =
    lineData;

  const color = lineKindColors[lineKind] || 'black';
  const [serviceDay, setServiceDay] = useState<ServiceDay>('weekday');
  const highestTph = useMemo(() => getHighestTphValue(lineData), [lineData]);
  const title = shortName || longName;
  const { startDate, endDate } = useServiceAndRidershipContext();

  const ridershipAndFrequencyLabel = ridershipHistory
    ? 'Weekday ridership and service levels'
    : 'Weekday service levels (ridership not available)';

  const renderSectionLabel = (title: string, rightElement: React.ReactNode = null) => {
    return (
      <h3 className={styles.sectionLabel}>
        <div className="label">{title}</div>
        {rightElement}
      </h3>
    );
  };

  const renderDetails = () => {
    if (lineData.lineKind === 'regional-rail') {
      return regionalRailCaveats;
    }
    return null;
  };

  const renderStatusBadge = () => {
    const { current, baseline } = serviceRegimes;
    if (hasFreeFarePilot(shortName)) {
      return (
        <div className={classNames(styles.statusBadge, 'good')}>
          <TiTicket size={20} />
          <a
            href="https://www.mbta.com/projects/fare-free-bus-pilot-route-28"
            target="_blank"
            rel="noopener noreferrer"
          >
            Free Fare Pilot
          </a>
        </div>
      );
    }
    if (current.weekday.totalTrips === 0) {
      return (
        <div className={classNames(styles.statusBadge, 'bad')}>
          <TiCancel size={20} />
          Canceled
        </div>
      );
    } else if (current.saturday.totalTrips === 0 && baseline.saturday.totalTrips > 0) {
      return (
        <div className={classNames(styles.statusBadge, 'warning')}>
          <TiCancel size={20} />
          Weekends
        </div>
      );
    }
  };

  const tabs = (
    <TabPicker
      className={styles.tabs}
      value={serviceDay}
      items={serviceDayItems}
      onSelectValue={(d) => setServiceDay(d as any)}
      baseId={`line-day-selector-${id}`}
      aria-label="Select day of service"
    />
  );

  return (
    <CardFrame title={title} topRight={renderStatusBadge()} details={renderDetails()}>
      {renderSectionLabel('Daily service levels', tabs)}
      <TphChart
        lineTitle={`${title}, ${serviceDay}`}
        baselineTph={serviceRegimes.baseline[serviceDay].tripsPerHour!}
        currentTph={serviceRegimes.current[serviceDay].tripsPerHour!}
        color={color}
        highestTph={highestTph}
      />
      {renderSectionLabel(ridershipAndFrequencyLabel)}
      <ServiceRidershipChart
        lineId={lineData.id}
        lineTitle={`${title}, ${serviceDay}`}
        startDate={startDate}
        endDate={endDate}
        ridershipHistory={ridershipHistory}
        serviceHistory={serviceHistory}
        color={color}
      />
    </CardFrame>
  );
};
