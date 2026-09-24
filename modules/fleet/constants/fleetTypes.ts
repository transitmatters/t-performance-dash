import type { Line } from '../../../common/types/lines';
import type { DeliveredTripMetrics } from '../../../common/types/dataPoints';

export interface FleetType {
  // fleet_mix_<key>, from data-ingestion's CAR_TYPES
  key: string;
  label: string;
  years: string;
}

// Oldest to newest. Only lines listed here get a fleet mix chart.
export const FLEET_TYPES: Partial<Record<Line, FleetType[]>> = {
  'line-red': [
    { key: 'red1', label: 'Pullman-Standard', years: '1969–70' },
    { key: 'red2', label: 'UTDC', years: '1987–89' },
    { key: 'red3', label: 'Bombardier', years: '1993–94' },
    { key: 'red4', label: 'CRRC', years: '2019–' },
  ],
  'line-orange': [
    { key: 'orange12', label: 'Hawker Siddeley', years: '1979–81' },
    { key: 'orange14', label: 'CRRC', years: '2018–25' },
  ],
  'line-green': [
    { key: 'type7', label: 'Type 7', years: '1986–97' },
    { key: 'type8', label: 'Type 8', years: '1999–2008' },
    { key: 'type9', label: 'Type 9', years: '2018–20' },
    { key: 'type10', label: 'Type 10', years: '2026–' },
  ],
};

export const getFleetMixValue = (datapoint: DeliveredTripMetrics, type: FleetType) =>
  datapoint[`fleet_mix_${type.key}`];

export const hasFleetMix = (datapoint: DeliveredTripMetrics, types: FleetType[]) =>
  types.some((type) => {
    const value = getFleetMixValue(datapoint, type);
    return value !== undefined && value !== null;
  });
