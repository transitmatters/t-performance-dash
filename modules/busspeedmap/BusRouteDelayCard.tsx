'use client';

import { useBusRouteDelays } from '../../common/api/hooks/busSpeedSegments';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { WidgetTitle } from '../../common/components/widgets/WidgetTitle';
import { getBusRouteDisplayName } from '../../common/constants/lines';
import { FOCUS_RING_ON_SURFACE } from '../../common/styles/general';
import { cn } from '../../common/utils/cn';
import { DELAY_LOST_COLOR, DIRECTION_IDS, TIME_BANDS } from './constants';
import type { RouteDelayRow } from './routeDelays';
import { routeDelayRows, selectRouteDelayBands, tripMinutes } from './routeDelays';
import type { DayType, DirectionFilter, Period } from './types';
import { useDirectionAndDays, useTimeBand } from './useBusSpeedParams';

interface BusRouteDelayCardProps {
  date: string;
  period: Period;
  dayType: DayType;
  direction: DirectionFilter;
  /** The route_ids on show: one, or each of a combined route like SL4/SL5. */
  routeIds: string[];
}

const FREE_FLOW_BAR = 'bg-stone-300 dark:bg-stone-600';

const Legend = () => (
  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
    <span className="flex items-center gap-1.5">
      <span className={cn('h-2.5 w-4 rounded-sm', FREE_FLOW_BAR)} />
      At free flow
    </span>
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-4 rounded-sm" style={{ backgroundColor: DELAY_LOST_COLOR }} />
      Lost to delay
    </span>
  </div>
);

interface BandRowsProps {
  rows: RouteDelayRow[];
  /** The longest running time on the card, in minutes, which the bars are drawn against. */
  longest: number;
}

/** A bar per band: the median trip's time between stops, the part it lost to delay in colour. */
const BandRows = ({ rows, longest }: BandRowsProps) => {
  const timeBand = useTimeBand();

  return (
    <ol className="flex flex-col">
      {rows.map(({ band, entry }) => {
        const { label, hours } = TIME_BANDS.find(({ key }) => key === band) ?? {};
        const selected = band === timeBand.value;
        const minutes = entry && tripMinutes(entry);
        return (
          <li key={band}>
            {/* Picks the band for the map too, so the slow stretches behind a long bar are a
                click away. */}
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => timeBand.setValue(band)}
              className={cn(
                'grid w-full grid-cols-[5.5rem_1fr_auto] items-center gap-x-3 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted sm:grid-cols-[7.5rem_1fr_auto]',
                selected && 'bg-muted',
                FOCUS_RING_ON_SURFACE
              )}
            >
              <span className="row-span-2 flex flex-col leading-tight">
                <span className={cn('text-foreground', selected && 'font-semibold')}>{label}</span>
                <span className="text-xs text-muted-foreground">{hours}</span>
              </span>
              {minutes ? (
                <>
                  <span className="flex h-3 overflow-hidden rounded-sm" aria-hidden>
                    <span
                      className={FREE_FLOW_BAR}
                      style={{
                        width: `${(Math.min(minutes.freeFlow, minutes.running) / longest) * 100}%`,
                      }}
                    />
                    <span
                      style={{
                        width: `${(minutes.lost / longest) * 100}%`,
                        backgroundColor: DELAY_LOST_COLOR,
                      }}
                    />
                  </span>
                  <span className="text-right font-semibold whitespace-nowrap text-foreground tabular-nums">
                    {minutes.lost} min lost
                  </span>
                  <span className="col-span-2 text-xs text-muted-foreground tabular-nums">
                    {minutes.running} min between stops, against {minutes.freeFlow} at free flow ·{' '}
                    {entry.n_trips.toLocaleString()} trips
                  </span>
                </>
              ) : (
                <span className="col-span-2 row-span-2 text-xs text-muted-foreground">
                  Too few trips with a free-flow time
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
};

/**
 * How many minutes the median trip loses to delay between stops, in each time band, for the route
 * and direction on the speed map. Shows nothing for an archive published before the pipeline wrote
 * route delays.
 */
export const BusRouteDelayCard = ({
  date,
  period,
  dayType,
  direction,
  routeIds,
}: BusRouteDelayCardProps) => {
  const delays = useBusRouteDelays({ date, period }, Boolean(date));
  const directionAndDays = useDirectionAndDays();

  if (delays.isLoading || delays.data === null) return null;

  const renderBody = () => {
    if (delays.isError || !delays.data) return <ChartPlaceHolder query={delays} />;

    const bands = selectRouteDelayBands(delays.data, period, dayType);
    const routes = routeIds
      .map((routeId) => ({
        routeId,
        rows: routeDelayRows(bands, routeId, DIRECTION_IDS[direction]),
      }))
      .filter(({ rows }) => rows.some(({ entry }) => entry));
    if (!routes.length) {
      return (
        <p className="text-sm text-muted-foreground">
          Not enough trips with a free-flow time for these days and this direction. A route needs
          trips before 6am or after 10pm to measure its free flow.
        </p>
      );
    }

    const longest = Math.max(
      ...routes.flatMap(({ rows }) =>
        rows.map(({ entry }) => (entry ? tripMinutes(entry).running : 0))
      )
    );

    return (
      <>
        <Legend />
        {routes.map(({ routeId, rows }) => (
          <section key={routeId} className="flex flex-col gap-1">
            {routes.length > 1 || routeIds.length > 1 ? (
              <h3 className="text-sm font-semibold text-foreground">
                Route {getBusRouteDisplayName(routeId)}
              </h3>
            ) : null}
            <BandRows rows={rows} longest={longest} />
          </section>
        ))}
      </>
    );
  };

  return (
    <WidgetDiv>
      <WidgetTitle
        title="Delay vs. free flow"
        subtitle={`Minutes lost per trip · ${directionAndDays}`}
      />
      <div className="flex flex-col gap-3">
        {renderBody()}
        <p className="text-xs text-muted-foreground">
          Each bar is the median trip&apos;s time moving between stops, for trips setting out at
          that time of day. The grey part is the same trip at free flow: how long it takes before
          6am and after 10pm, when traffic is light. Delay counts whatever holds a bus up between
          stops, traffic and signals alike, but not time at stops. A trip counts when at least 90%
          of its route has a free-flow time. Pick a time of day to show it on the map.
        </p>
      </div>
    </WidgetDiv>
  );
};
