import { useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { useHistoricalAlertsData } from '../../../common/api/hooks/alerts';
import { useWeatherData } from '../../../common/api/hooks/weather';
import { findMatch } from '../../../common/components/alerts/AlertFilter';
import { serviceDay } from '../../../common/components/charts/contextTrack/segments';
import { Link } from '../../../common/components/general/Link';
import { Card, CardDescription, CardHeader, CardTitle } from '../../../common/components/ui/card';
import { getLocationDetails } from '../../../common/utils/stations';
import { HeadwaysSingleChart } from '../../headways/charts/HeadwaysSingleChart';
import { useAlertStore } from '../../tripexplorer/AlertStore';
import type { HeroPick } from '../heroChart';
import { worstLabel } from '../heroChart';
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

const share = (pick: HeroPick) => Math.round((pick.bad / pick.judged) * 100);

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
      <Card className={`${SHADOW} h-[26rem] px-4`} aria-busy="true">
        <Placeholder className="h-4 w-64" />
        <Placeholder className="h-3 w-96 max-w-full" />
        <Placeholder className="mt-2 h-full w-full" />
      </Card>
    );
  }

  const { station } = pick;
  const { direction } = getLocationDetails(station.from, station.to);
  const href = `/${station.path}/trips/single/?from=${station.from.station}&to=${station.to.station}&date=${date}`;
  return (
    <Card data-line={station.line} className={`${SHADOW} tm-fade-in px-4`}>
      <CardHeader className="px-0">
        <CardTitle>
          {station.label} headways at {station.from.stop_name}, {direction}
        </CardTitle>
        <CardDescription>
          {dayjs(date).format('dddd, MMMM D')}: {share(pick)}% of trains here came bunched up or
          after a gap at least 50% longer than scheduled ({pick.bad} of {pick.judged}), the most of
          any subway line.{' '}
          <Link href={href} className="font-medium whitespace-nowrap hover:underline">
            <span className="text-foreground">Explore this day →</span>
          </Link>
        </CardDescription>
      </CardHeader>
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
