import { useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { useHistoricalAlertsData } from '../../../common/api/hooks/alerts';
import { useWeatherData } from '../../../common/api/hooks/weather';
import { findMatch } from '../../../common/components/alerts/AlertFilter';
import { serviceDay } from '../../../common/components/charts/contextTrack/segments';
import { Link } from '../../../common/components/general/Link';
import { RouteBullet } from '../../../common/components/transit/RouteBullet';
import { Card } from '../../../common/components/ui/card';
import { getLocationDetails } from '../../../common/utils/stations';
import { HeadwaysSingleChart } from '../../headways/charts/HeadwaysSingleChart';
import { useAlertStore } from '../../tripexplorer/AlertStore';
import type { HeroPick } from '../heroChart';
import { minutesText, timeText, worstLabel } from '../heroChart';
import { useHeroChart } from '../useHeroChart';
import { Placeholder } from './Placeholder';

// Layered: a tight contact shadow, a soft lift, and a wide glow in the line's own color.
const SHADOW =
  'shadow-[0_1px_2px_rgb(0_0_0/0.06),0_12px_32px_-12px_rgb(0_0_0/0.22),0_48px_96px_-40px_color-mix(in_oklch,var(--primary)_55%,transparent)] dark:shadow-[0_1px_2px_rgb(0_0_0/0.5),0_16px_40px_-12px_rgb(0_0_0/0.7),0_48px_96px_-40px_color-mix(in_oklch,var(--primary)_50%,transparent)]';

/**
 * The same day's alerts and weather the trip page shows, for the chart's context track. The chart
 * rebuilds itself when either arrives, which would restart its draw-in, so it waits for both.
 */
const useDayLayers = (pick: HeroPick | undefined, date: string) => {
  const { data, isLoading } = useHistoricalAlertsData(
    pick ? date : undefined,
    pick?.station.lineShort ?? 'Red'
  );
  const alerts = useMemo(() => data?.filter(findMatch), [data]);
  const setAlerts = useAlertStore((store) => store.setAlerts);
  useEffect(() => {
    if (pick) setAlerts(alerts, isLoading);
  }, [pick, alerts, isLoading, setAlerts]);
  // The same request the chart makes, so it finds the answer already in the cache.
  const weather = useWeatherData(
    { start_date: date, end_date: serviceDay(date).close.format('YYYY-MM-DD') },
    Boolean(pick)
  );
  return Boolean(pick) && !isLoading && !weather.isPending;
};

const Stat = ({ value, label, detail }: { value: string; label: string; detail: string }) => (
  <div className="flex flex-col">
    <dd className="order-1 text-3xl font-bold tracking-tight text-primary tabular-nums">{value}</dd>
    <dt className="order-2 text-sm font-medium">{label}</dt>
    <span className="order-3 text-xs text-muted-foreground tabular-nums">{detail}</span>
  </div>
);

/**
 * Yesterday's headways on the line that ran the most unevenly, as the line's own trip chart draws
 * them: the day draws itself in, then the longest wait is called out.
 */
export const HeroChart = () => {
  const { pick, date, state } = useHeroChart();
  const ready = useDayLayers(pick, date);
  const callout = useMemo(
    () => pick && { index: pick.worst, label: worstLabel(pick.rows[pick.worst]) },
    [pick]
  );

  if (state === 'empty') return null;
  if (!pick || !callout || !ready) {
    return (
      <Card className={`${SHADOW} h-[30rem] px-4 sm:px-5`} aria-busy="true">
        <Placeholder className="h-3 w-40" />
        <Placeholder className="h-5 w-72 max-w-full" />
        <Placeholder className="mt-2 h-full w-full" />
      </Card>
    );
  }

  const { station } = pick;
  const worst = pick.rows[pick.worst];
  const { direction } = getLocationDetails(station.from, station.to);
  const href = `/${station.path}/trips/single/?from=${station.from.station}&to=${station.to.station}&date=${date}`;
  return (
    <Card data-line={station.line} className={`${SHADOW} tm-fade-in gap-5 px-4 pt-0 sm:px-5`}>
      {/* The line's color along the top edge, like a platform sign. */}
      <div aria-hidden className="-mx-4 h-1 bg-primary sm:-mx-5" />
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <div className="flex max-w-xl flex-col gap-1.5">
          <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Yesterday’s roughest line
          </span>
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <span className="text-primary">
              <RouteBullet size="lg" />
            </span>
            {station.label} at {station.from.stop_name}, {direction}
          </h2>
          <p className="text-sm text-muted-foreground">
            Headways on {dayjs(date).format('dddd, MMMM D')}: a larger share of trains came bunched
            up or after a long gap here than on any other subway line.{' '}
            <Link href={href} className="font-medium whitespace-nowrap hover:underline">
              <span className="text-foreground">Explore this day →</span>
            </Link>
          </p>
        </div>
        <dl className="flex gap-8">
          <Stat
            value={`${Math.round((pick.bad / pick.judged) * 100)}%`}
            label="bunched or long gaps"
            detail={`${pick.bad} of ${pick.judged} trains`}
          />
          <Stat
            value={`${minutesText(worst.headway_time_sec ?? 0)} min`}
            label="longest wait"
            detail={`${timeText(worst)}, scheduled every ${minutesText(worst.benchmark_headway_time_sec ?? 0)}`}
          />
        </dl>
      </div>
      <HeadwaysSingleChart
        headways={pick.rows}
        fromStation={station.from}
        toStation={station.to}
        date={date}
        callout={callout}
        actions={false}
        intro
      />
    </Card>
  );
};
