import { useQuery } from '@tanstack/react-query';
import { ONE_HOUR } from '../../constants/time';
import { FetchAlertDelaysByLineParams } from '../../types/api';
import type { LineDelays } from '../../types/delays';
import type { Line } from '../../types/lines';
import { fetchLineDelaysByLine } from '../delays';

const DELAY_LINE_IDS: Partial<Record<Line, string[]>> = {
  'line-red': ['Red'],
  'line-orange': ['Orange'],
  'line-blue': ['Blue'],
  'line-green': ['Green-B', 'Green-C', 'Green-D', 'Green-E'],
  'line-mattapan': ['Mattapan'],
  'line-commuter-rail': ['line-commuter-rail'],
};

function getLandingDateRange(): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 12 * 7); // 12 weeks
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

async function fetchDelaysForLineId(lineId: string): Promise<LineDelays[]> {
  const { startDate, endDate } = getLandingDateRange();
  return fetchLineDelaysByLine({
    [FetchAlertDelaysByLineParams.startDate]: startDate,
    [FetchAlertDelaysByLineParams.endDate]: endDate,
    [FetchAlertDelaysByLineParams.line]: lineId,
    [FetchAlertDelaysByLineParams.agg]: 'weekly',
  });
}

/**
 * Fetch weekly delay data for a line from the API (~12 weeks).
 * For Green line, aggregates all branches (B/C/D/E) by date.
 */
async function fetchLandingLineDelays(line: Line): Promise<LineDelays[]> {
  const lineIds = DELAY_LINE_IDS[line];
  if (!lineIds) return [];

  if (lineIds.length === 1) {
    return fetchDelaysForLineId(lineIds[0]);
  }

  // For Green line: fetch all branches and aggregate by date
  const allBranches = await Promise.all(lineIds.map(fetchDelaysForLineId));
  const byDate = new Map<string, LineDelays>();

  for (const branch of allBranches) {
    for (const entry of branch) {
      const existing = byDate.get(entry.date);
      if (existing) {
        existing.total_delay_time += entry.total_delay_time;
        existing.disabled_vehicle += entry.disabled_vehicle;
        existing.door_problem += entry.door_problem;
        existing.flooding += entry.flooding;
        existing.fire += entry.fire;
        existing.medical_emergency += entry.medical_emergency;
        existing.other += entry.other;
        existing.police_activity += entry.police_activity;
        existing.power_problem += entry.power_problem;
        existing.signal_problem += entry.signal_problem;
        existing.track_work += entry.track_work;
        existing.car_traffic += entry.car_traffic;
        existing.mechanical_problem += entry.mechanical_problem;
        existing.brake_problem += entry.brake_problem;
        existing.switch_problem += entry.switch_problem;
        existing.track_issue += entry.track_issue;
      } else {
        byDate.set(entry.date, { ...entry });
      }
    }
  }

  return Array.from(byDate.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export const useLandingLineDelays = (line: Line) => {
  return useQuery({
    queryKey: ['landingLineDelays', line],
    queryFn: () => fetchLandingLineDelays(line),
    staleTime: ONE_HOUR,
  });
};
