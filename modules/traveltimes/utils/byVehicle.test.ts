import { describe, expect, it } from 'vitest';
import type { SingleDayDataPoint } from '../../../common/types/charts';
import { getCarTypes } from '../../fleet/constants/fleetTypes';
import { MIXED_FLEET, getTravelTimesByVehicle } from './byVehicle';

const trip = (vehicle_label: string, travel_time_sec: number, vehicle_consist?: string) =>
  ({
    route_id: 'Red',
    direction: 0,
    vehicle_label,
    travel_time_sec,
    vehicle_consist,
  }) as SingleDayDataPoint;

const redTypes = getCarTypes('line-red');

describe('getTravelTimesByVehicle', () => {
  it('takes each vehicle median, fastest first, with speed from the distance', () => {
    const data = [trip('1900', 600), trip('1900', 900), trip('1900', 700), trip('1800', 480)];
    const result = getTravelTimesByVehicle(data, redTypes, 2);
    expect(result.map((v) => [v.vehicle, v.trips, v.median_travel_time_sec])).toEqual([
      ['1800', 1, 480],
      ['1900', 3, 700],
    ]);
    expect(result[0].median_speed_mph).toBe(15);
  });

  it('colours by car type, and a train of two types as mixed', () => {
    const data = [trip('1900', 600, '1900|1901'), trip('1800', 600, '1800|1900')];
    const types = Object.fromEntries(
      getTravelTimesByVehicle(data, redTypes, 2).map((v) => [v.vehicle, v.fleet_type])
    );
    expect(types).toEqual({ '1900': 'red4', '1800': MIXED_FLEET });
  });

  it('leaves speed out without a distance, as for bus stops', () => {
    const [bus] = getTravelTimesByVehicle([trip('0601', 1200)], undefined, undefined);
    expect(bus).toMatchObject({ median_speed_mph: null, fleet_type: null });
  });

  it('has no car types for buses, whose types are by propulsion', () => {
    expect(getCarTypes('line-bus')).toBeUndefined();
  });
});
