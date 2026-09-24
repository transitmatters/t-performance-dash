import type { Line } from '../../../common/types/lines';
import type { DeliveredTripMetrics } from '../../../common/types/dataPoints';

export interface FleetType {
  // Matches the fleet_mix_<key> field from data-ingestion's CAR_TYPES
  key: string;
  label: string;
  years: string;
}

// Car types per line, oldest to newest. Only lines with more than one type get a fleet mix chart.
export const FLEET_TYPES: Partial<Record<Line, FleetType[]>> = {
  'line-red': [
    // Named by builder, the way riders usually refer to them ("the CRRC cars")
    { key: 'red1', label: 'Pullman-Standard', years: '1969–70' },
    { key: 'red2', label: 'UTDC', years: '1987–89' },
    { key: 'red3', label: 'Bombardier', years: '1993–94' },
    { key: 'red4', label: 'CRRC', years: '2019–' },
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
