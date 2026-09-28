import type { HistoricalBaselines } from '../../../common/types/baselines';
import type {
  DeliveredTripMetrics,
  RidershipCount,
  SlowZoneDayTotalsResponse,
} from '../../../common/types/dataPoints';
import type { Line } from '../../../common/types/lines';
import { lineSeriesId } from '../../../common/utils/baselines';
import type { DashboardData, LineData } from '../../serviceAndRidership/types';
import {
  CR_ELECTRIFIED_SHARE,
  CR_ELECTRIFIED_THRESHOLDS,
  FREQUENCY_GOALS,
  FREQUENT_BUS_LINE_IDS,
  METRICS,
  METRIC_ORDER,
  ROWS,
  WINDOW_WEEKS,
} from '../config';
import type { RowConfig, SubwayLine } from '../config';
import type { Cell, HeroStat, HomeData, MetricId, Row } from '../types';
import {
  baselineFor,
  frequencyCell,
  judgedCell,
  mph,
  naCell,
  ratioCell,
  sumHistories,
  tripMetricsSeries,
} from './cells';
import { buildFacts } from './facts';
import { combineCoverage, goalCoverage, middayHeadway } from './frequency';
import type { Point, Window } from './series';
import { fromRecord, mean, median, takeWindow, trendOf } from './series';
import { headlineFor } from './status';

export interface HomeSources {
  tripMetrics: Partial<Record<Line, DeliveredTripMetrics[]>>;
  ridership: Partial<Record<Line, RidershipCount[]>>;
  baselines: HistoricalBaselines | null;
  delayTotals: SlowZoneDayTotalsResponse;
  serviceAndRidership: DashboardData;
  now: Date;
}

const SLOW_ZONE_KEYS: Record<SubwayLine, string> = {
  'line-red': 'Red',
  'line-orange': 'Orange',
  'line-blue': 'Blue',
  'line-green': 'Green',
  'line-mattapan': 'Mattapan',
};

const COMING_SOON = 'Coming to the home page soon.';

const lineHref = (row: RowConfig, page: string) =>
  row.href.includes('/', 1) ? row.href : `${row.href}/${page}`;

/** Weekly means of daily slow-zone delay (seconds), summed over `keys`, for the last 12 weeks. */
const slowZoneWindow = (delayTotals: SlowZoneDayTotalsResponse, keys: string[]): Window => {
  const days = delayTotals.data.slice(-WINDOW_WEEKS * 7).map((d) => {
    const totals = d as unknown as Record<string, number>;
    return { date: d.date.slice(0, 10), value: keys.reduce((sum, k) => sum + (totals[k] ?? 0), 0) };
  });
  const weeks: Point[] = [];
  for (let i = 0; i < days.length; i += 7) {
    const week = days.slice(i, i + 7);
    weeks.push({ date: week[0].date, value: mean(week.map((d) => d.value)) });
  }
  return {
    points: weeks,
    values: weeks.map((w) => w.value as number),
    excluded: 0,
    asOf: days.at(-1)?.date,
  };
};

const subwayCells = (
  row: RowConfig,
  line: SubwayLine,
  src: HomeSources,
  frequencyLines: LineData[]
) => {
  const { now, baselines } = src;
  const trips = src.tripMetrics[line];
  const cells: Partial<Record<MetricId, Cell>> = {};

  cells.service = ratioCell(
    'service',
    tripMetricsSeries(trips, (d) => d.count),
    baselineFor(baselines, 'service', [line]),
    {
      now,
      aggregate: 'median',
      unit: 'pct',
      rawUnitLabel: 'trips/day',
      href: lineHref(row, 'service'),
    }
  );

  cells.frequency = frequencyLines.length
    ? frequencyCell(
        frequencyLines.map((l) => ({ line: l })),
        FREQUENCY_GOALS.subway,
        {
          now,
          asOf: src.serviceAndRidership.summaryData.endDate,
          href: lineHref(row, 'service'),
          notes:
            line === 'line-green'
              ? ['Trips on the shared trunk, all branches together.']
              : undefined,
        }
      )
    : { ...naCell('frequency', 'pct', 'Not in the schedule data yet.'), status: 'insufficient' };

  cells.speed = ratioCell(
    'speed',
    tripMetricsSeries(trips, mph),
    baselineFor(baselines, 'speed', [line]),
    {
      now,
      aggregate: 'median',
      unit: 'mph',
      rawUnitLabel: 'mph',
      headlineRaw: true,
      href: lineHref(row, 'speed'),
    }
  );

  const sz = slowZoneWindow(src.delayTotals, [SLOW_ZONE_KEYS[line]]);
  const szMean = sz.values.length ? mean(sz.values) : null;
  cells.slowZones = judgedCell('slowZones', szMean, {
    unit: 'seconds',
    window: sz,
    now,
    asOfOffsetDays: 0,
    href: lineHref(row, 'slowzones'),
  });

  const ridershipKey = lineSeriesId(line) ?? line;
  cells.ridership = ratioCell(
    'ridership',
    (src.ridership[line] ?? []).map((d) => ({ date: d.date, value: d.count })),
    baselineFor(baselines, 'ridership', [ridershipKey]),
    {
      now,
      aggregate: 'mean',
      unit: 'pct',
      rawUnitLabel: 'riders/weekday',
      href: lineHref(row, 'ridership'),
    }
  );

  const ageWindow = takeWindow(
    tripMetricsSeries(trips, (d) => d.avg_car_age),
    false
  );
  const recentAge = ageWindow.values.slice(-4);
  const newTrips = mean(
    (trips ?? [])
      .slice(-4)
      .map((d) => d.pct_new_trips ?? NaN)
      .filter(Number.isFinite)
  );
  cells.fleet = judgedCell('fleet', recentAge.length ? mean(recentAge) : null, {
    unit: 'years',
    window: ageWindow,
    now,
    secondary: newTrips > 0 ? `${Math.round(newTrips)}% of trips on new trains` : undefined,
    // Blue and Mattapan have no Fleet tab (one car type each), so their fleet links go nowhere new.
    href: line === 'line-blue' || line === 'line-mattapan' ? row.href : lineHref(row, 'fleet'),
  });

  return cells;
};

const linesOfKind = (srd: DashboardData, kinds: LineData['lineKind'][]) =>
  Object.values(srd.lineData).filter((l) => kinds.includes(l.lineKind));

const recentRiders = (line: LineData) => {
  const values = fromRecord(line.ridershipHistory)
    .slice(-WINDOW_WEEKS)
    .map((p) => p.value as number);
  return values.length ? mean(values) : 0;
};

const modeServiceCell = (row: RowConfig, src: HomeSources, mode: string, baselineId: string) =>
  ratioCell(
    'service',
    fromRecord(src.serviceAndRidership.modeData[mode]?.totalServiceHistory),
    baselineFor(src.baselines, 'scheduledService', [baselineId]),
    {
      now: src.now,
      aggregate: 'median',
      unit: 'pct',
      rawUnitLabel: 'scheduled trips/day',
      href: row.href,
    }
  );

const buildCells = (row: RowConfig, src: HomeSources): Partial<Record<MetricId, Cell>> => {
  const { now, baselines, serviceAndRidership: srd } = src;
  const asOf = srd.summaryData.endDate;

  switch (row.id) {
    case 'red':
    case 'orange':
    case 'blue':
    case 'green':
    case 'mattapan': {
      const gtfsId = lineSeriesId(row.line);
      return subwayCells(
        row,
        row.line as SubwayLine,
        src,
        gtfsId && srd.lineData[gtfsId] ? [srd.lineData[gtfsId]] : []
      );
    }
    case 'commuter-rail': {
      const lines = linesOfKind(srd, ['regional-rail']);
      return {
        service: modeServiceCell(row, src, 'regional-rail', 'mode-regional-rail'),
        frequency: frequencyCell(
          lines.map((line) => ({ line })),
          FREQUENCY_GOALS.commuterRail,
          { now, asOf, href: row.href }
        ),
        speed: naCell('speed', 'mph', 'Not measured for Commuter Rail yet.'),
        ridership: ratioCell(
          'ridership',
          fromRecord(srd.modeData['regional-rail']?.totalRidershipHistory),
          baselineFor(baselines, 'ridership', ['line-commuter-rail']),
          { now, aggregate: 'mean', unit: 'pct', rawUnitLabel: 'riders/weekday', href: row.href }
        ),
        fleet: judgedCell('fleet', CR_ELECTRIFIED_SHARE, {
          unit: 'pct',
          window: { points: [], values: [1], excluded: 0, asOf },
          now,
          minPoints: 1,
          asOfOffsetDays: 0,
          direction: 'higher',
          thresholds: CR_ELECTRIFIED_THRESHOLDS,
          secondary: 'Share of service run electric',
        }),
      };
    }
    case 'frequent-bus': {
      const lines = FREQUENT_BUS_LINE_IDS.map((id) => srd.lineData[id]).filter(Boolean);
      const withService = lines.filter(
        (l) => baselineFor(baselines, 'scheduledService', [l.id]).value !== null
      );
      const withRiders = lines.filter(
        (l) => l.ridershipHistory && baselineFor(baselines, 'ridership', [l.id]).value !== null
      );
      const routeNote = (n: number) =>
        n < lines.length ? [`${n} of ${lines.length} routes have a baseline.`] : [];
      return {
        service: ratioCell(
          'service',
          sumHistories(withService.map((l) => l.serviceHistory)),
          baselineFor(
            baselines,
            'scheduledService',
            withService.map((l) => l.id)
          ),
          {
            now,
            aggregate: 'median',
            unit: 'pct',
            rawUnitLabel: 'scheduled trips/day',
            href: row.href,
            notes: routeNote(withService.length),
          }
        ),
        frequency: frequencyCell(
          lines.map((line) => ({ line })),
          FREQUENCY_GOALS.frequentBus,
          {
            now,
            asOf,
            href: row.href,
            notes: ['Silver Line branches that share a street count together.'],
          }
        ),
        speed: naCell('speed', 'mph', COMING_SOON),
        ridership: ratioCell(
          'ridership',
          sumHistories(withRiders.map((l) => l.ridershipHistory)),
          baselineFor(
            baselines,
            'ridership',
            withRiders.map((l) => l.id)
          ),
          {
            now,
            aggregate: 'mean',
            unit: 'pct',
            rawUnitLabel: 'riders/weekday',
            href: row.href,
            notes: [
              ...routeNote(withRiders.length),
              'Several routes changed in the Bus Network Redesign.',
            ],
          }
        ),
        fleet: naCell('fleet', 'years', COMING_SOON),
      };
    }
    case 'all-bus': {
      const lines = linesOfKind(srd, ['bus', 'silver']);
      return {
        service: modeServiceCell(row, src, 'bus', 'mode-bus'),
        frequency: frequencyCell(
          lines.map((line) => ({ line, weight: recentRiders(line) })),
          FREQUENCY_GOALS.bus,
          { now, asOf, href: row.href }
        ),
        speed: naCell('speed', 'mph', COMING_SOON),
        ridership: ratioCell(
          'ridership',
          (src.ridership['line-bus'] ?? []).map((d) => ({ date: d.date, value: d.count })),
          baselineFor(baselines, 'ridership', ['line-bus']),
          { now, aggregate: 'mean', unit: 'pct', rawUnitLabel: 'riders/weekday', href: row.href }
        ),
        fleet: naCell('fleet', 'years', COMING_SOON),
      };
    }
    case 'ferry':
      return {
        service: modeServiceCell(row, src, 'boat', 'mode-boat'),
        frequency: naCell('frequency', 'pct', 'No frequency goal for ferries yet.'),
        speed: naCell('speed', 'mph', 'Not measured for ferries.'),
        ridership: ratioCell(
          'ridership',
          fromRecord(srd.modeData.boat?.totalRidershipHistory),
          baselineFor(baselines, 'ridership', ['line-ferry']),
          { now, aggregate: 'mean', unit: 'pct', rawUnitLabel: 'riders/weekday', href: row.href }
        ),
        fleet: naCell('fleet', 'years', 'Not measured for ferries.'),
      };
    default:
      return {};
  }
};

const NOT_MEASURED: Partial<Record<MetricId, string>> = {
  slowZones: 'Slow zones are tracked on the subway only.',
};

const buildRow = (config: RowConfig, src: HomeSources): Row => {
  const built = buildCells(config, src);
  const cells = Object.fromEntries(
    METRIC_ORDER.map((metric) => [
      metric,
      built[metric] ??
        naCell(metric, METRICS[metric].scoreUnit, NOT_MEASURED[metric] ?? 'Not measured.'),
    ])
  ) as Record<MetricId, Cell>;
  return {
    id: config.id,
    label: config.label,
    group: config.group,
    line: config.line,
    href: config.href,
    cells,
    headline: headlineFor(Object.values(cells), config.minMeasured, METRICS),
  };
};

const buildHero = (src: HomeSources): HeroStat[] => {
  const { baselines, serviceAndRidership: srd, delayTotals } = src;
  // Riders: subway plus bus, against the sum of each line's own best.
  const riderKeys: [Line, string][] = [
    ['line-red', 'line-Red'],
    ['line-orange', 'line-Orange'],
    ['line-blue', 'line-Blue'],
    ['line-green', 'line-Green'],
    ['line-bus', 'line-bus'],
  ];
  const riderBest = baselineFor(
    baselines,
    'ridership',
    riderKeys.map(([, key]) => key)
  ).value;
  const riderWindow = takeWindow(
    sumHistories(
      riderKeys.map(([line]) =>
        Object.fromEntries((src.ridership[line] ?? []).map((d) => [d.date, d.count]))
      )
    )
  );

  const serviceWindow = takeWindow(fromRecord(srd.summaryData.totalServiceHistory));
  const serviceBest = baselineFor(baselines, 'scheduledService', ['total']).value;

  const slowZones = slowZoneWindow(delayTotals, Object.values(SLOW_ZONE_KEYS));

  const frequentLines = FREQUENT_BUS_LINE_IDS.map((id) => srd.lineData[id]).filter(Boolean);
  const frequent = combineCoverage(
    frequentLines.map((line) => ({ coverage: goalCoverage(line, FREQUENCY_GOALS.frequentBus) }))
  );

  const crLines = linesOfKind(srd, ['regional-rail']);
  const crWeekday = middayHeadway(crLines, 'weekday');
  const crSaturday = middayHeadway(crLines, 'saturday');

  return [
    {
      id: 'riders',
      label: 'Subway & bus riders',
      value: riderBest && riderWindow.values.length ? mean(riderWindow.values) / riderBest : null,
      unit: 'pct',
      detail: 'of the busiest weeks on record',
      direction: 'higher',
      trend: trendOf(riderWindow),
    },
    {
      id: 'service',
      label: 'Scheduled service',
      value: serviceBest ? median(serviceWindow.values) / serviceBest : null,
      unit: 'pct',
      detail: 'of the most trips ever scheduled',
      direction: 'higher',
      trend: trendOf(serviceWindow),
    },
    {
      id: 'slowZones',
      label: 'Slow zone delay',
      value: slowZones.values.length ? mean(slowZones.values.slice(-1)) / 60 : null,
      unit: 'minutes',
      detail: 'added per day across the subway, last week',
      direction: 'lower',
      trend: trendOf(slowZones),
    },
    {
      id: 'frequentBus',
      label: 'Frequent Bus',
      value: frequent,
      unit: 'pct',
      detail: `of service hours at every ${FREQUENCY_GOALS.frequentBus} min or better`,
      direction: 'higher',
    },
    {
      id: 'crHeadway',
      label: 'Commuter Rail midday',
      value: crWeekday,
      unit: 'minutes',
      detail:
        crSaturday !== null
          ? `between trains on weekdays, ${Math.round(crSaturday)} on Saturdays`
          : 'between trains on weekdays',
      direction: 'lower',
    },
  ];
};

export const buildHome = (src: HomeSources): HomeData => {
  const rows = ROWS.map((config) => buildRow(config, src));
  return {
    schemaVersion: 1,
    generatedAt: src.now.toISOString(),
    rows,
    hero: buildHero(src),
    facts: buildFacts(rows),
  };
};
