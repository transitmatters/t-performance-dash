import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { useTripMetricsForLanding } from '../../common/api/hooks/tripmetrics';
import { useRidershipDataLanding } from '../../common/api/hooks/ridership';
import { useSlowzoneDelayTotalData } from '../../common/api/hooks/slowzones';
import { useServiceAndRidershipDashboard } from '../../common/api/hooks/serviceAndRidership';
import { useLandingLineDelays } from '../../common/api/hooks/landingGrades';
import { useAlertsData } from '../../common/api/hooks/alerts';
import { LoadingSpinner } from '../../common/components/graphics/LoadingSpinner';
import type { Line } from '../../common/types/lines';
import type { AlertsResponse } from '../../common/types/alerts';
import type { DashboardData, LineData } from '../serviceAndRidership/types';
import { SUBWAY_LINES, SECONDARY_LINES, computeLineGrade } from './grading';
import type { LineGradeResult, ScheduledServiceData } from './grading';
import { LineGradeCard } from './LineGradeCard';

const LINE_KIND_MAP: Partial<Record<Line, string>> = {
  'line-bus': 'bus',
  'line-commuter-rail': 'regional-rail',
  'line-ferry': 'boat',
};

/**
 * Aggregate scheduled service data for a mode (bus/ferry/CR) from the dashboard.
 * Sums the latest week's trips and baseline trips across all routes of that kind.
 */
function getScheduledServiceForMode(
  dashboard: DashboardData,
  line: Line
): ScheduledServiceData | undefined {
  const kind = LINE_KIND_MAP[line];
  if (!kind) return undefined;

  let current = 0;

  // Aggregate weekly service history across all routes of this mode
  const weeklyTotals: Record<string, number> = {};
  for (const lineData of Object.values(dashboard.lineData)) {
    if (lineData.lineKind !== kind) continue;
    current += getLatestServiceHistory(lineData);
    const history = lineData.serviceHistory;
    if (!history) continue;
    for (const [date, trips] of Object.entries(history)) {
      weeklyTotals[date] = (weeklyTotals[date] ?? 0) + (trips ?? 0);
    }
  }

  // Use 75th percentile of non-zero service history as baseline
  // Filters zeros (seasonal gaps like ferry in winter) and outliers
  const nonZero = Object.values(weeklyTotals)
    .filter((v) => v > 0)
    .sort((a, b) => a - b);
  const baseline =
    nonZero.length > 0
      ? nonZero[Math.min(Math.floor(nonZero.length * 0.99), nonZero.length - 1)]
      : 0;

  if (baseline === 0) return undefined;
  return { current, baseline };
}

function getLatestServiceHistory(lineData: LineData): number {
  const history = lineData.serviceHistory;
  if (!history) return 0;
  const keys = Object.keys(history);
  if (keys.length === 0) return 0;
  return history[keys[keys.length - 1]] ?? 0;
}

export const LineReportCard: React.FC = () => {
  const tripMetrics = useTripMetricsForLanding();
  const ridership = useRidershipDataLanding();
  const slowZones = useSlowzoneDelayTotalData();
  const dashboard = useServiceAndRidershipDashboard();
  const redDelays = useLandingLineDelays('line-red');
  const orangeDelays = useLandingLineDelays('line-orange');
  const blueDelays = useLandingLineDelays('line-blue');
  const greenDelays = useLandingLineDelays('line-green');
  const mattapanDelays = useLandingLineDelays('line-mattapan');
  const commuterRailDelays = useLandingLineDelays('line-commuter-rail');

  // Fetch current alerts for each line
  const redAlerts = useAlertsData('Red');
  const orangeAlerts = useAlertsData('Orange');
  const blueAlerts = useAlertsData('Blue');
  const greenAlerts = useAlertsData('Green');
  const mattapanAlerts = useAlertsData('Mattapan');

  const isLoading =
    tripMetrics.isLoading ||
    ridership.isLoading ||
    slowZones.isLoading ||
    dashboard.isLoading ||
    redDelays.isLoading ||
    orangeDelays.isLoading ||
    blueDelays.isLoading ||
    greenDelays.isLoading ||
    mattapanDelays.isLoading ||
    commuterRailDelays.isLoading;

  const delayDataByLine = useMemo(
    () => ({
      'line-red': redDelays.data,
      'line-orange': orangeDelays.data,
      'line-blue': blueDelays.data,
      'line-green': greenDelays.data,
      'line-mattapan': mattapanDelays.data,
      'line-commuter-rail': commuterRailDelays.data,
    }),
    [
      redDelays.data,
      orangeDelays.data,
      blueDelays.data,
      greenDelays.data,
      mattapanDelays.data,
      commuterRailDelays.data,
    ]
  );

  const alertsByLine = useMemo(() => {
    const alertData: Record<string, AlertsResponse[] | undefined> = {
      'line-red': redAlerts.data,
      'line-orange': orangeAlerts.data,
      'line-blue': blueAlerts.data,
      'line-green': greenAlerts.data,
      'line-mattapan': mattapanAlerts.data,
    };
    return alertData;
  }, [redAlerts.data, orangeAlerts.data, blueAlerts.data, greenAlerts.data, mattapanAlerts.data]);

  const grades = useMemo(() => {
    if (!tripMetrics.data || !ridership.data || !slowZones.data) {
      return null;
    }

    const results: Record<string, LineGradeResult> = {};
    const allLines = [...SUBWAY_LINES, ...SECONDARY_LINES];

    for (const line of allLines) {
      results[line] = computeLineGrade({
        line,
        tripMetrics: tripMetrics.data[line],
        slowZoneTotals: slowZones.data.data,
        delayData: delayDataByLine[line as keyof typeof delayDataByLine],
        ridershipData: ridership.data[line],
        scheduledService: dashboard.data
          ? getScheduledServiceForMode(dashboard.data, line)
          : undefined,
      });
    }

    return results;
  }, [tripMetrics.data, ridership.data, slowZones.data, delayDataByLine, dashboard.data]);

  if (isLoading || !grades) {
    return (
      <div className="flex w-full max-w-5xl items-center justify-center px-4 py-12 md:px-8 lg:px-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-5xl flex-col gap-4 px-4 md:px-8 lg:px-12">
      <h2 className="text-3xl font-thin text-stone-900 lg:text-4xl">How is your line doing?</h2>
      <p className="text-sm text-stone-600">
        Composite scores based on service, speed, slow zones, delays, and ridership compared to
        historical peaks and what TransitMatters considers a baseline for each line. Scores are
        calculated using data from the last 3 months and recalculated every week. Trend arrows show
        whether each metric is improving or declining over the last 2 weeks.
      </p>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {SUBWAY_LINES.map((line) => (
          <LineGradeCard key={line} line={line} grade={grades[line]} alerts={alertsByLine[line]} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {SECONDARY_LINES.map((line) => (
          <LineGradeCard key={line} line={line} grade={grades[line]} alerts={alertsByLine[line]} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-400">
        <span>
          <FontAwesomeIcon icon={faTriangleExclamation} className="mr-1 text-[9px]" />
          Biggest area for improvement
        </span>
        <span>
          <span className="mr-1 text-green-600">↑</span> Improving
        </span>
        <span>
          <span className="mr-1 text-red-500">↓</span> Declining
        </span>
      </div>
    </div>
  );
};
