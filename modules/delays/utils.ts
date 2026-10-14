import { i18n } from '../../common/i18n';
import type { LineDelays } from '../../common/types/delays';

/** A delay reason, named by its field in the delays API. */
export type DelayReason =
  | 'disabled_vehicle'
  | 'door_problem'
  | 'power_problem'
  | 'signal_problem'
  | 'switch_problem'
  | 'brake_problem'
  | 'track_issue'
  | 'track_work'
  | 'car_traffic'
  | 'mechanical_problem'
  | 'flooding'
  | 'police_activity'
  | 'medical_emergency'
  | 'fire'
  | 'other';

// In display order. The emoji stay out of the catalog so translators only see words.
const REASON_EMOJI: Record<DelayReason, string> = {
  disabled_vehicle: '🚉',
  door_problem: '🚪',
  power_problem: '🔌',
  signal_problem: '🚦',
  switch_problem: '🎚️',
  brake_problem: '🛑',
  track_issue: '🛤️',
  track_work: '🚧',
  car_traffic: '🚙',
  mechanical_problem: '🔧',
  flooding: '🌊',
  police_activity: '🚓',
  medical_emergency: '🚑',
  fire: '🚒',
  other: '',
};

export const DELAY_REASONS = Object.keys(REASON_EMOJI) as DelayReason[];

export const reasonLabel = (reason: DelayReason) => {
  const label = i18n.t(`delays:reasons.${reason}`);
  return REASON_EMOJI[reason] ? `${REASON_EMOJI[reason]} ${label}` : label;
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

  const reasonSums = DELAY_REASONS.map((reason) => ({
    label: reasonLabel(reason),
    total: data.reduce((sum, point) => sum + (point[reason as keyof LineDelays] as number), 0),
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
