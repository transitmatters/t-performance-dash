import React, { useMemo, useState } from 'react';

import { CardFrame } from '../CardFrame';
import { useServiceAndRidershipContext } from '../useServiceAndRidershipContext';
import type { LineData, ServiceDay } from '../types';

import { ButtonGroup } from '../../../common/components/general/ButtonGroup';
import { useGenerateHref } from '../../../common/utils/router';
import { ALL_PAGES } from '../../../common/constants/pages';
import {
  BUS_ROUTES,
  COMMUTER_RAIL_ROUTES,
  type BusRoute,
  type CommuterRailRoute,
} from '../../../common/types/lines';
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

  const generateHref = useGenerateHref();
  const href = useMemo(() => {
    // Navigate to the overview page for subway lines
    if (['red', 'blue', 'green', 'orange', 'mattapan'].includes(lineKind)) {
      return generateHref(
        ALL_PAGES.overview,
        'serviceAndRidership',
        {},
        lineKind as 'red' | 'blue' | 'green' | 'orange' | 'mattapan'
      );
    }
    if (lineKind === 'regional-rail') {
      const crRoute = id.replace('line-', 'CR-') as CommuterRailRoute;
      if (COMMUTER_RAIL_ROUTES.includes(crRoute)) {
        return generateHref(
          ALL_PAGES.singleTrips,
          'serviceAndRidership',
          {
            crRoute: id.replace('line-', 'CR-') as CommuterRailRoute,
            startDate,
            endDate,
          },
          'commuter-rail'
        );
      }
    }
    if (lineKind === 'bus' && BUS_ROUTES.includes(shortName as BusRoute)) {
      return generateHref(
        ALL_PAGES.singleTrips,
        'serviceAndRidership',
        { busRoute: shortName as BusRoute, startDate, endDate },
        'bus'
      );
    }
    return null;
  }, [generateHref, id, lineKind, shortName, startDate, endDate]);

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

  return (
    <CardFrame title={title} details={renderDetails()} titleHref={href}>
      {renderSectionLabel('Current service levels')}
      <ButtonGroup
        options={serviceDayItems.map((item) => [item.value, item.label])}
        pressFunction={setServiceDay}
        selectedIndex={serviceDayItems.findIndex((item) => item.value === serviceDay)}
        additionalDivClass="mb-2"
      />
      <TphChart
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
