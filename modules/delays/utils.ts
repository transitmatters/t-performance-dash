import type { LineDelays } from '../../common/types/delays';

const REASON_LABELS: Record<string, string> = {
  disabled_vehicle: '🚉 Disabled Train',
  door_problem: '🚪 Door Problem',
  power_problem: '🔌 Power/Wire Issue',
  signal_problem: '🚦 Signal Problem',
  switch_problem: '🎚️ Switch Problem',
  brake_problem: '🛑 Brake Issue',
  track_issue: '🛤️ Track Issue',
  track_work: '🚧 Track Work',
  car_traffic: '🚙 Cars/Traffic',
  mechanical_problem: '🔧 Mechanical Problem',
  flooding: '🌊 Flooding',
  police_activity: '🚓 Police Activity',
  medical_emergency: '🚑 Medical Emergency',
  fire: '🚒 Fire Department Activity',
  other: 'Other/No Reason Given',
};

const mean = (values: number[]) =>
  values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : NaN;

const halves = <T>(values: T[]): [T[], T[]] => {
  const mid = Math.floor(values.length / 2);
  return [values.slice(0, mid), values.slice(mid)];
};

export const getDelayStats = (data: LineDelays[], agg: 'daily' | 'weekly') => {
  const totals = data.map((point) => point.total_delay_time);
  const totalDelay = totals.reduce((sum, v) => sum + v, 0);
  const [leading, trailing] = halves(totals);

  const reasonSums = Object.entries(REASON_LABELS).map(([key, label]) => ({
    label,
    total: data.reduce((sum, point) => sum + (point[key as keyof LineDelays] as number), 0),
  }));
  const topReason = reasonSums.reduce((max, reason) => (reason.total > max.total ? reason : max), {
    label: '',
    total: 0,
  });

  return {
    totalDelay, // total minutes delayed across the window
    avgDelay: mean(totals), // minutes delayed per period (day or week)
    avgDelayDelta: mean(trailing) - mean(leading), // minutes, trailing minus leading half
    agg,
    topReasonLabel: topReason.total ? topReason.label : null,
    topReasonShare: totalDelay ? topReason.total / totalDelay : null,
  };
};
