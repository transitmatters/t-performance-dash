import type { DelayCause } from '../../../common/types/delays';
import type { Line } from '../../../common/types/lines';

export type DelayReasonKey = DelayCause;
export type DelayFamilyId =
  | 'vehicle'
  | 'infrastructure'
  | 'planned'
  | 'external'
  | 'medical'
  | 'unknown';

export interface DelayFamily {
  id: DelayFamilyId;
  label: string;
  color: string;
}

export interface DelayReason {
  key: DelayReasonKey;
  label: string;
  family: DelayFamilyId;
  color: string;
}

export const DELAY_FAMILIES: DelayFamily[] = [
  { id: 'vehicle', label: 'Vehicle', color: '#2f6fb8' },
  { id: 'infrastructure', label: 'Infrastructure', color: '#c2540a' },
  { id: 'planned', label: 'Planned work', color: '#7b4fa3' },
  { id: 'external', label: 'External', color: '#3aa07c' },
  { id: 'medical', label: 'Medical & police', color: '#b0435f' },
  { id: 'unknown', label: 'No reason given', color: '#78716c' },
];

export const DELAY_REASONS: DelayReason[] = [
  { key: 'disabled_vehicle', label: 'Disabled train', family: 'vehicle', color: '#1d4f91' },
  { key: 'door_problem', label: 'Door problem', family: 'vehicle', color: '#2f6fb8' },
  { key: 'brake_problem', label: 'Brake issue', family: 'vehicle', color: '#5b92d0' },
  { key: 'mechanical_problem', label: 'Mechanical problem', family: 'vehicle', color: '#8db5e3' },
  { key: 'signal_problem', label: 'Signal problem', family: 'infrastructure', color: '#9a3b00' },
  { key: 'power_problem', label: 'Power/wire issue', family: 'infrastructure', color: '#c2540a' },
  { key: 'switch_problem', label: 'Switch problem', family: 'infrastructure', color: '#e07a2b' },
  { key: 'track_issue', label: 'Track issue', family: 'infrastructure', color: '#f2a15f' },
  { key: 'track_work', label: 'Track work', family: 'planned', color: '#7b4fa3' },
  { key: 'car_traffic', label: 'Cars/traffic', family: 'external', color: '#1f7a5a' },
  { key: 'flooding', label: 'Flooding', family: 'external', color: '#3aa07c' },
  { key: 'fire', label: 'Fire department activity', family: 'external', color: '#7cc4a4' },
  { key: 'medical_emergency', label: 'Medical emergency', family: 'medical', color: '#b0435f' },
  { key: 'police_activity', label: 'Police activity', family: 'medical', color: '#d9788d' },
  { key: 'other', label: 'Other/no reason given', family: 'unknown', color: '#78716c' },
];

export const REASON_BY_KEY = Object.fromEntries(DELAY_REASONS.map((r) => [r.key, r])) as Record<
  DelayReasonKey,
  DelayReason
>;

// Bus alerts cite disabled buses, not trains
export const reasonLabel = (reason: DelayReason, line?: Line) =>
  reason.key === 'disabled_vehicle' && line === 'line-bus' ? 'Disabled bus' : reason.label;
