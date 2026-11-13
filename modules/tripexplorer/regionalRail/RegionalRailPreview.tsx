import { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import {
  faArrowUpRightFromSquare,
  faBolt,
  faGaugeHigh,
  faWheelchair,
} from '@fortawesome/free-solid-svg-icons';
import { useRreJourneys } from '../../../common/api/hooks/regionalRailExplorer';
import { rreExploreUrl } from '../../../common/api/regionalRailExplorer';
import { Button } from '../../../common/components/ui/button';
import { Widget } from '../../../common/components/widgets';
import { REGIONAL_RAIL_REPORTS_URL } from '../../../common/constants/regionalRail';
import { ToggleControl } from '../../../common/hooks/useChartToggle';
import type { RreAmenity, RreDayKind } from '../../../common/types/regionalRailExplorer';
import type { Station } from '../../../common/types/stations';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { ComparisonTable } from './ComparisonTable';
import { TrainsStrip } from './TrainsStrip';
import type { StripRow } from './TrainsStrip';
import {
  DAY_OPTIONS,
  DEFAULT_TIME,
  DOT_CLASS,
  RR_COLORS,
  TIME_OPTIONS,
  compareTrips,
  dayKindForDate,
  describeDeparture,
} from './utils';

const AMENITIES: Record<RreAmenity, { icon: IconDefinition; label: string }> = {
  electricTrains: { icon: faBolt, label: 'Fast, quiet and reliable electric trains' },
  increasedTopSpeed: {
    icon: faGaugeHigh,
    label: 'Modern track and signals, so trains run at full speed',
  },
  levelBoarding: { icon: faWheelchair, label: 'High platforms for quick, accessible boarding' },
};

const NewTab = () => <span className="sr-only"> (opens in a new tab)</span>;

// The global `a { color: inherit; text-decoration: none }` outranks utilities set on a link
// itself, so a link's color and underline go on a span inside it
const Underlined = ({ children }: { children: string }) => (
  <span className="underline underline-offset-2">{children}</span>
);

// Keeps the referrer, so the Explorer's visit counts show the traffic the dashboard sends
const EXTERNAL = { target: '_blank', rel: 'noopener' } as const;

/** Shown when the Explorer's API can't be reached: the link to it still works. */
const ExplorerCallout = ({ trip, href }: { trip: string; href: string }) => (
  <div
    style={RR_COLORS}
    className="flex flex-col gap-x-4 gap-y-1 rounded-lg border border-(--rr)/40 bg-(--rr)/10 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between dark:border-(--rr-dark)/40 dark:bg-(--rr-dark)/10"
  >
    <p className="text-sm leading-snug">
      See how Regional Rail, with a train at least every 30 minutes all day, would change trips from{' '}
      {trip}.
    </p>
    <a href={href} {...EXTERNAL} className="shrink-0 text-sm font-medium">
      <Underlined>Open the Regional Rail Explorer</Underlined>
      <NewTab />
    </a>
  </div>
);

interface RegionalRailPreviewProps {
  fromStation: Station;
  toStation: Station;
}

/**
 * This trip on Regional Rail next to today's Commuter Rail, as TransitMatters' Regional Rail
 * Explorer plans it. It's a short version of the Explorer's comparison, and links there for the rest.
 */
export const RegionalRailPreview = ({ fromStation, toStation }: RegionalRailPreviewProps) => {
  const {
    query: { date },
  } = useDelimitatedRoute();
  const [chosenDay, setChosenDay] = useState<RreDayKind>();
  const [time, setTime] = useState(DEFAULT_TIME);
  // A single day plans the kind of day it falls on, until the rider picks another
  const day = chosenDay ?? dayKindForDate(date);
  const params = { from: fromStation.station, to: toStation.station, day, time };
  const journeys = useRreJourneys(params);
  const comparison = useMemo(
    () => (Array.isArray(journeys.data) ? compareTrips(journeys.data) : undefined),
    [journeys.data]
  );
  const exploreUrl = rreExploreUrl(params);
  const trip = `${fromStation.stop_name} to ${toStation.stop_name}`;

  if (journeys.isError) return <ExplorerCallout trip={trip} href={exploreUrl} />;
  // The Explorer can't route this trip on Regional Rail, so there's nothing to compare
  if (comparison && !comparison.regionalRail) return null;

  const { today = null, regionalRail, amenities = [] } = comparison ?? {};
  const stripRows: StripRow[] = [];
  if (today?.trains) {
    const { trains, caught } = today;
    stripRows.push({ label: 'Today', trains, caught, dotClassName: DOT_CLASS.today });
  }
  if (regionalRail?.trains) {
    const { trains, caught } = regionalRail;
    stripRows.push({
      label: 'Regional Rail',
      trains,
      caught,
      dotClassName: DOT_CLASS.regionalRail,
    });
  }

  return (
    <Widget
      title="With Regional Rail"
      subtitle={`${trip}, ${describeDeparture(day, time)}`}
      action={
        <div className="flex gap-2">
          <ToggleControl
            value={day}
            options={DAY_OPTIONS}
            onChange={(next: RreDayKind) => setChosenDay(next)}
            variant="select"
          />
          <ToggleControl
            value={`${time}`}
            options={TIME_OPTIONS}
            onChange={(next) => setTime(Number(next))}
            variant="select"
          />
        </div>
      }
      ready={journeys}
    >
      {regionalRail && (
        <div style={RR_COLORS} className="flex flex-col gap-5 pt-2">
          <ComparisonTable today={today} regionalRail={regionalRail} />
          {stripRows.length > 0 && <TrainsStrip rows={stripRows} departAt={time} />}
          {amenities.length > 0 && (
            <ul className="flex flex-col gap-1.5 text-sm">
              {amenities.map((amenity) => (
                <li key={amenity} className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={AMENITIES[amenity].icon}
                    className="w-4 text-(--rr) dark:text-(--rr-dark)"
                  />
                  {AMENITIES[amenity].label}
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Button
              asChild
              className="h-auto min-h-8 max-w-full shrink bg-(--rr) py-1.5 text-left whitespace-normal hover:bg-(--rr)/90 dark:bg-(--rr-dark) dark:hover:bg-(--rr-dark)/90"
            >
              <a href={exploreUrl} {...EXTERNAL}>
                <span className="flex items-center gap-1.5 text-white dark:text-stone-950">
                  See the whole trip on the Regional Rail Explorer
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                </span>
                <NewTab />
              </a>
            </Button>
            <a href={REGIONAL_RAIL_REPORTS_URL} {...EXTERNAL} className="text-sm font-medium">
              <Underlined>Read our Regional Rail reports</Underlined>
              <NewTab />
            </a>
          </div>
          <p className="text-xs text-muted-foreground">
            Both columns are schedules: the MBTA&apos;s current timetable and TransitMatters&apos;
            plan for Regional Rail. The other charts on this page show what actually ran.
          </p>
        </div>
      )}
    </Widget>
  );
};
