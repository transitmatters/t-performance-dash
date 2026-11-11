import { round } from '@lodash-utils';
import type { SingleDayDataPoint } from '../../../common/types/charts';
import type { FleetType } from '../../fleet/constants/fleetTypes';
import { getFleetTypeForCar } from '../../fleet/constants/fleetTypes';

// A train whose cars are of more than one fleet type
export const MIXED_FLEET = 'mixed';

export interface VehicleTravelTime {
  // Lead car (subway) or bus number, as the MBTA labels the vehicle
  vehicle: string;
  trips: number;
  median_travel_time_sec: number;
  // Only when the distance between the stations is known (not for buses)
  median_speed_mph: number | null;
  // A FleetType key, MIXED_FLEET, or null when the line has no fleet types or the cars are unknown
  fleet_type: string | null;
  // Every car seen on this vehicle's trips
  cars: string;
}

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

// Consists are pipe-separated ("1932|1933|..."); Green Line labels join cars with a dash
const getCarNumbers = (point: SingleDayDataPoint) =>
  (point.vehicle_consist ?? point.vehicle_label ?? '')
    .split(/[|-]/)
    .map((car) => car.trim())
    .filter((car) => car.length > 0);

const getFleetCategory = (cars: string[], fleetTypes: FleetType[] | undefined) => {
  if (!fleetTypes) return null;
  const keys = new Set(
    cars
      .map((car) => getFleetTypeForCar(fleetTypes, Number(car))?.key)
      .filter((key) => key !== undefined)
  );
  if (keys.size === 0) return null;
  return keys.size === 1 ? [...keys][0] : MIXED_FLEET;
};

/** Median travel time (and speed, when the distance is known) for each train or bus, fastest first. */
export const getTravelTimesByVehicle = (
  data: SingleDayDataPoint[],
  fleetTypes: FleetType[] | undefined,
  distanceMiles: number | undefined
): VehicleTravelTime[] => {
  const byVehicle = new Map<string, SingleDayDataPoint[]>();
  data.forEach((point) => {
    if (!point.vehicle_label || !point.travel_time_sec) return;
    byVehicle.set(point.vehicle_label, [...(byVehicle.get(point.vehicle_label) ?? []), point]);
  });

  return [...byVehicle.entries()]
    .map(([vehicle, points]) => {
      const cars = [...new Set(points.flatMap(getCarNumbers))];
      const medianTravelTime = median(points.map((point) => point.travel_time_sec!));
      return {
        vehicle,
        trips: points.length,
        median_travel_time_sec: medianTravelTime,
        median_speed_mph: distanceMiles
          ? round((3600 * distanceMiles) / medianTravelTime, 1)
          : null,
        fleet_type: getFleetCategory(cars, fleetTypes),
        cars: cars.join(', '),
      };
    })
    .sort((a, b) => a.median_travel_time_sec - b.median_travel_time_sec);
};
