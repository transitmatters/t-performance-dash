import type { Line } from '../../../common/types/lines';
import type { FleetMetrics } from '../../../common/types/dataPoints';
import type { ChartDatasetName } from '../../../common/utils/chartTitles';

export interface FleetType {
  // fleet_mix_<key>, from data-ingestion's CAR_TYPES, PROPULSIONS and CR_TYPES
  key: string;
  label: string;
  years?: string;
  // Inclusive car number ranges, from data-ingestion's CAR_TYPES. Rail car types only.
  ranges?: [number, number][];
}

// Oldest to newest (lightest to darkest in the chart). Only lines listed here get a fleet mix chart.
export const FLEET_TYPES: Partial<Record<Line, FleetType[]>> = {
  'line-red': [
    { key: 'red1', label: 'Pullman-Standard', years: '1969–70', ranges: [[1500, 1651]] },
    { key: 'red2', label: 'UTDC', years: '1987–89', ranges: [[1700, 1757]] },
    { key: 'red3', label: 'Bombardier', years: '1993–94', ranges: [[1800, 1885]] },
    { key: 'red4', label: 'CRRC', years: '2019–', ranges: [[1900, 2151]] },
  ],
  'line-orange': [
    { key: 'orange12', label: 'Hawker Siddeley', years: '1979–81', ranges: [[1200, 1319]] },
    { key: 'orange14', label: 'CRRC', years: '2018–25', ranges: [[1400, 1551]] },
  ],
  'line-green': [
    { key: 'type7', label: 'Type 7', years: '1986–97', ranges: [[3600, 3719]] },
    { key: 'type8', label: 'Type 8', years: '1999–2008', ranges: [[3800, 3894]] },
    { key: 'type9', label: 'Type 9', years: '2018–20', ranges: [[3900, 3923]] },
    { key: 'type10', label: 'Type 10', years: '2026–', ranges: [[4001, 4102]] },
  ],
  'line-bus': [
    { key: 'diesel', label: 'Diesel' },
    { key: 'cng', label: 'CNG' },
    { key: 'hybrid', label: 'Hybrid' },
    { key: 'battery', label: 'Battery-electric' },
  ],
  'line-commuter-rail': [
    { key: 'locomotive', label: 'Locomotive' },
    { key: 'mbb', label: 'MBB', years: '1987–88' },
    { key: 'bombardier', label: 'Bombardier', years: '1989–90' },
    { key: 'kawasaki', label: 'Kawasaki', years: '1990–91' },
    { key: 'rotem', label: 'Rotem', years: '2012–24' },
  ],
};

export interface FleetMetric {
  field: 'pct_new_trips' | 'pct_battery_trips' | 'avg_car_age' | 'avg_bus_age' | 'avg_cab_car_age';
  title: string;
  axisLabel: string;
  datasetName: ChartDatasetName;
}

export interface FleetModeMetrics {
  // fixedScale pins the axis to 0-100%; otherwise it fits the data, for shares that are still small.
  share?: FleetMetric & { tooltipSuffix: string; fixedScale: boolean };
  age: FleetMetric;
  mixTitle: string;
  mixSubtitle: string;
}

const RAIL_METRICS: FleetModeMetrics = {
  share: {
    field: 'pct_new_trips',
    title: '% of trips run by new trains',
    axisLabel: 'Trips run by new trains',
    datasetName: 'fleet-pct-new-trains',
    tooltipSuffix: 'new trains',
    fixedScale: true,
  },
  age: {
    field: 'avg_car_age',
    title: 'Average car age',
    axisLabel: 'Average car age (years)',
    datasetName: 'fleet-car-age',
  },
  mixTitle: 'Fleet mix',
  mixSubtitle: 'Share of cars by type',
};

export const getFleetModeMetrics = (line: Line | undefined): FleetModeMetrics => {
  switch (line) {
    case 'line-bus':
      return {
        share: {
          field: 'pct_battery_trips',
          title: '% of trips run by battery-electric buses',
          axisLabel: 'Trips run by battery-electric buses',
          datasetName: 'fleet-pct-battery-trips',
          tooltipSuffix: 'battery-electric',
          fixedScale: false,
        },
        age: {
          field: 'avg_bus_age',
          title: 'Average bus age',
          axisLabel: 'Average bus age (years)',
          datasetName: 'fleet-bus-age',
        },
        mixTitle: 'Fleet mix',
        mixSubtitle: 'Share of trips by propulsion',
      };
    case 'line-commuter-rail':
      return {
        age: {
          field: 'avg_cab_car_age',
          title: 'Average cab car age',
          axisLabel: 'Average cab car age (years)',
          datasetName: 'fleet-cab-car-age',
        },
        mixTitle: 'Cab car mix',
        mixSubtitle: 'Share of trips by the car at the cab end',
      };
    default:
      return RAIL_METRICS;
  }
};

export const hasFleetMetric = (datapoint: FleetMetrics, field: FleetMetric['field']) =>
  datapoint[field] !== undefined && datapoint[field] !== null;

export const getFleetMixValue = (datapoint: FleetMetrics, type: FleetType) =>
  datapoint[`fleet_mix_${type.key}`];

export const hasFleetMix = (datapoint: FleetMetrics, types: FleetType[]) =>
  types.some((type) => {
    const value = getFleetMixValue(datapoint, type);
    return value !== undefined && value !== null;
  });

/** The line's car types that can be told apart by car number, or undefined if it has none. */
export const getCarTypes = (line: Line | undefined): FleetType[] | undefined => {
  const types = line ? FLEET_TYPES[line]?.filter((type) => type.ranges) : undefined;
  return types?.length ? types : undefined;
};

/** The fleet type a car number belongs to, if it's in a known range. */
export const getFleetTypeForCar = (types: FleetType[], car: number) =>
  types.find((type) => type.ranges?.some(([low, high]) => low <= car && car <= high));
