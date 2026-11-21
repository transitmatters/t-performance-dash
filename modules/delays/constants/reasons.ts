import type { DelayCause } from '../../../common/types/delays';
import type { Line } from '../../../common/types/lines';
import { patternFill } from '../../../common/utils/chartPatterns';
import type { PatternShape } from '../../../common/utils/chartPatterns';
import { isColorblindMode } from '../../../common/utils/colorVision';
import { hexWithAlpha } from '../../../common/utils/general';

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

/**
 * Each reason's color is a shade of its family's hue. Colorblind mode moves the families onto
 * Okabe-Ito hues (vehicle blue, infrastructure amber, planned pink, external sky, medical
 * vermilion), since external green against infrastructure orange is lost without red-green vision.
 */
const REASON_COLORS: (Omit<DelayReason, 'color'> & { color: string; cvdColor: string })[] = [
  {
    key: 'disabled_vehicle',
    label: 'Disabled train',
    family: 'vehicle',
    color: '#1d4f91',
    cvdColor: '#00336e',
  },
  {
    key: 'door_problem',
    label: 'Door problem',
    family: 'vehicle',
    color: '#2f6fb8',
    cvdColor: '#1d5fb0',
  },
  {
    key: 'brake_problem',
    label: 'Brake issue',
    family: 'vehicle',
    color: '#5b92d0',
    cvdColor: '#3d74c2',
  },
  {
    key: 'mechanical_problem',
    label: 'Mechanical problem',
    family: 'vehicle',
    color: '#8db5e3',
    cvdColor: '#7a93cf',
  },
  {
    key: 'signal_problem',
    label: 'Signal problem',
    family: 'infrastructure',
    color: '#9a3b00',
    cvdColor: '#a86f00',
  },
  {
    key: 'power_problem',
    label: 'Power/wire issue',
    family: 'infrastructure',
    color: '#c2540a',
    cvdColor: '#e69f00',
  },
  {
    key: 'switch_problem',
    label: 'Switch problem',
    family: 'infrastructure',
    color: '#e07a2b',
    cvdColor: '#f2b640',
  },
  {
    key: 'track_issue',
    label: 'Track issue',
    family: 'infrastructure',
    color: '#f2a15f',
    cvdColor: '#f7cf80',
  },
  {
    key: 'track_work',
    label: 'Track work',
    family: 'planned',
    color: '#7b4fa3',
    cvdColor: '#cc79a7',
  },
  {
    key: 'car_traffic',
    label: 'Cars/traffic',
    family: 'external',
    color: '#1f7a5a',
    cvdColor: '#2b8fc2',
  },
  { key: 'flooding', label: 'Flooding', family: 'external', color: '#3aa07c', cvdColor: '#56b4e9' },
  {
    key: 'fire',
    label: 'Fire department activity',
    family: 'external',
    color: '#7cc4a4',
    cvdColor: '#a3dcf7',
  },
  {
    key: 'medical_emergency',
    label: 'Medical emergency',
    family: 'medical',
    color: '#b0435f',
    cvdColor: '#d55e00',
  },
  {
    key: 'police_activity',
    label: 'Police activity',
    family: 'medical',
    color: '#d9788d',
    cvdColor: '#f59060',
  },
  {
    key: 'other',
    label: 'Other/no reason given',
    family: 'unknown',
    color: '#78716c',
    cvdColor: '#78716c',
  },
];

export const DELAY_REASONS: DelayReason[] = REASON_COLORS.map(({ color, cvdColor, ...reason }) => ({
  ...reason,
  get color() {
    return isColorblindMode() ? cvdColor : color;
  },
}));

export const REASON_BY_KEY = Object.fromEntries(DELAY_REASONS.map((r) => [r.key, r])) as Record<
  DelayReasonKey,
  DelayReason
>;

/**
 * Colorblind mode textures each family, so a family reads by pattern even where its hue doesn't;
 * the reasons within one are told apart by lightness, which survives every kind of color blindness.
 */
const FAMILY_PATTERNS: Record<DelayFamilyId, PatternShape> = {
  vehicle: 'solid',
  infrastructure: 'diagonal',
  planned: 'dots',
  external: 'crosshatch',
  medical: 'horizontal',
  unknown: 'vertical',
};

/** A reason's fill on a chart: its color, plus its family's pattern in colorblind mode. */
export const reasonFill = (key: DelayReasonKey, alpha = 1): string | CanvasPattern => {
  const { color, family } = REASON_BY_KEY[key];
  if (isColorblindMode()) return patternFill(color, FAMILY_PATTERNS[family], alpha);
  return alpha < 1 ? hexWithAlpha(color, alpha) : color;
};

// Bus alerts cite disabled buses, not trains
export const reasonLabel = (reason: DelayReason, line?: Line) =>
  reason.key === 'disabled_vehicle' && line === 'line-bus' ? 'Disabled bus' : reason.label;
