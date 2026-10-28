import type { HoverCardContent, HoverCardRow } from '../components/charts/hoverCard/types';
import { CHART_COLORS } from '../constants/colors';
import type { SingleDayDataPoint } from '../types/charts';

// GTFS-RT OccupancyStatus values that describe how full a car is, from emptiest to fullest.
// MBTA percentages stay low even on crowded cars (standing room starts around 12%), so the
// status leads and the percentage is only a detail.
const LEVELS = {
  EMPTY: { label: 'Empty', color: CHART_COLORS.GREEN },
  MANY_SEATS_AVAILABLE: { label: 'Many seats', color: CHART_COLORS.GREEN },
  FEW_SEATS_AVAILABLE: { label: 'Few seats', color: CHART_COLORS.YELLOW },
  STANDING_ROOM_ONLY: { label: 'Standing room', color: CHART_COLORS.RED },
  CRUSHED_STANDING_ROOM_ONLY: { label: 'Crushed', color: CHART_COLORS.PURPLE },
  FULL: { label: 'Full', color: CHART_COLORS.PURPLE },
} as const;

type OccupancyLevel = keyof typeof LEVELS;

// Only seen on the end cars of one Red Line set, with no percentage, so it reads as a cab or
// sensor state rather than a crowded car.
const NOT_BOARDING = 'NOT_ACCEPTING_PASSENGERS';

export interface CarOccupancy {
  id: string;
  level: OccupancyLevel | null;
  notBoarding: boolean;
  percentage: number | null;
}

const isLevel = (status: string): status is OccupancyLevel => status in LEVELS;

/** Each car of a trip's consist with its occupancy reading, in consist order. */
export const parseConsist = (
  point?: Pick<SingleDayDataPoint, 'vehicle_consist' | 'occupancy_status' | 'occupancy_percentage'>
): CarOccupancy[] => {
  const ids = point?.vehicle_consist?.split('|').filter(Boolean) ?? [];
  const statuses = point?.occupancy_status?.split('|') ?? [];
  const percentages = point?.occupancy_percentage?.split('|') ?? [];
  return ids.map((id, index) => {
    const status = statuses[index] ?? '';
    const level = isLevel(status) ? status : null;
    const percentage = percentages[index] ? Number(percentages[index]) : NaN;
    return {
      id,
      level,
      notBoarding: status === NOT_BOARDING,
      percentage: level && Number.isFinite(percentage) ? percentage : null,
    };
  });
};

const rank = (level: OccupancyLevel) => Object.keys(LEVELS).indexOf(level);

/** The fullest car that reported a reading, if any did. */
export const busiestCar = (cars: CarOccupancy[]): CarOccupancy | undefined =>
  cars
    .filter((car) => car.level)
    .reduce<CarOccupancy | undefined>(
      (busiest, car) => (!busiest || rank(car.level!) > rank(busiest.level!) ? car : busiest),
      undefined
    );

/**
 * The consist as a train of cars tinted by occupancy, plus a load row for the busiest car. A lone
 * vehicle without readings (a bus) stays a plain chip.
 */
export const consistHoverContent = (
  point?: SingleDayDataPoint
): Pick<HoverCardContent, 'train' | 'chips'> & { load?: HoverCardRow } => {
  const cars = parseConsist(point);
  if (cars.length === 0) return {};
  const busiest = busiestCar(cars);
  const reported = cars.some((car) => car.level || car.notBoarding);
  if (cars.length === 1 && !reported) {
    return { chips: { label: 'Vehicle', values: [cars[0].id] } };
  }

  const legend: { label: string; color?: string }[] = [];
  const addToLegend = (label: string, color?: string) => {
    if (!legend.some((entry) => entry.label === label)) legend.push({ label, color });
  };
  const sorted = [...cars].sort(
    (a, b) => (a.level ? rank(a.level) : Infinity) - (b.level ? rank(b.level) : Infinity)
  );
  for (const car of sorted) {
    if (car.level) addToLegend(LEVELS[car.level].label, LEVELS[car.level].color);
    else if (reported) addToLegend(car.notBoarding ? 'Not boarding' : 'No data');
  }

  return {
    train: {
      label: cars.length > 1 ? 'Vehicles' : 'Vehicle',
      cars: cars.map((car) => ({
        id: car.id,
        color: car.level ? LEVELS[car.level].color : undefined,
        noReading: reported && !car.level,
        detail: reported
          ? car.percentage !== null
            ? `${Math.round(car.percentage)}%`
            : '—'
          : undefined,
      })),
      legend: reported ? legend : undefined,
    },
    load: busiest?.level
      ? {
          label: 'Load',
          value: LEVELS[busiest.level].label,
          detail: `${cars.filter((car) => car.level).length} of ${cars.length} cars reporting`,
          color: LEVELS[busiest.level].color,
        }
      : undefined,
  };
};
