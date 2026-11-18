import { CHART_COLORS } from '../../../../common/constants/colors';

// A made-up bad morning on the Orange Line, drawn the way the trip charts draw a real day: a
// normal start, snow from 7:30, a disabled train at 8:20 that stops service for 24 minutes, a crush
// of crowded trains after it, and back on time by lunch. It's an illustration, not data: the same
// seed gives the same day every time.

/** Minutes after midnight. */
export const START = 300;
export const END = 1500;
/** TransitMatters' benchmark trip time, in seconds. */
export const BENCHMARK = 720;
export const SNOW: [number, number] = [450, 700];
export const ALERT: [number, number] = [500, 548];
export const GAP: [number, number] = [503, 527];

export type TripStatus = 'ok' | '25' | '50' | '100';
export type Crowding = 'many' | 'few' | 'stand';

export interface Car {
  number: number;
  /** How full, from 0 to 1. */
  load: number;
  crowding: Crowding;
}

export interface Trip {
  /** Departure, in minutes after midnight. */
  minute: number;
  seconds: number;
  status: TripStatus;
  cars: Car[];
}

/** The trip charts' own severity colors and legend labels, readable in either theme. */
export const STATUS: Record<TripStatus, { label: string; color: string }> = {
  ok: { label: 'On time', color: CHART_COLORS.GREEN },
  '25': { label: '25%+ off', color: CHART_COLORS.YELLOW },
  '50': { label: '50%+ off', color: CHART_COLORS.RED },
  '100': { label: '100%+ off', color: CHART_COLORS.PURPLE },
};

export const CROWDING: Record<Crowding, string> = {
  many: 'Many seats',
  few: 'Few seats',
  stand: 'Standing room only',
};

/** Against the benchmark, the same bands the trip charts use. */
export const judge = (ratio: number): TripStatus =>
  ratio < 1.25 ? 'ok' : ratio < 1.5 ? '25' : ratio < 2 ? '50' : '100';

const crowdingOf = (load: number): Crowding =>
  load < 0.45 ? 'many' : load < 0.75 ? 'few' : 'stand';

/** Degrees Fahrenheit: a cold snap around 8 AM, warming into the afternoon. */
export const temperature = (minute: number) =>
  31 -
  7 * Math.exp(-(((minute - 490) / 75) ** 2)) +
  7 * Math.max(0, Math.sin(((minute - 620) / 820) * Math.PI));

export interface Day {
  trips: Trip[];
  worst: Trip;
  /** When the temperature bottoms out, in minutes after midnight. */
  lowMinute: number;
  low: number;
}

export function buildDay(seed = 1106): Day {
  let state = seed;
  const random = () => (state = (state * 16807) % 2147483647) / 2147483647;
  const trips: Trip[] = [];

  for (let minute = 318; minute < END - 8;) {
    const rush = (minute > 420 && minute < 570) || (minute > 960 && minute < 1110);
    if (minute <= GAP[0] || minute >= GAP[1]) {
      let seconds = 600 + (random() - 0.5) * 80 + (rush ? 35 : 0);
      if (minute > SNOW[0] && minute < SNOW[1]) {
        seconds *= 1.06 + 0.12 * Math.sin(((minute - SNOW[0]) / (SNOW[1] - SNOW[0])) * Math.PI);
      }
      // Stuck behind the disabled train, then the crush once it clears.
      if (minute >= 482 && minute <= GAP[0]) seconds = 880 + (minute - 482) * 40 + random() * 110;
      if (minute >= GAP[1] && minute < 562) {
        seconds = Math.max(seconds, 1280 - (minute - GAP[1]) * 19 + random() * 90);
      }
      const load =
        0.22 +
        (rush ? 0.42 : 0) -
        (minute > 1110 ? 0.08 : 0) +
        (minute >= 482 && minute < 580 ? 0.3 : 0);
      const cars: Car[] = [];
      for (let pair = 0; pair < 3; pair++) {
        const base = 1400 + Math.floor(random() * 76) * 2;
        for (const number of [base, base + 1]) {
          const carLoad = Math.min(0.99, Math.max(0.03, load * (0.7 + random() * 0.6)));
          cars.push({ number, load: carLoad, crowding: crowdingOf(carLoad) });
        }
      }
      trips.push({
        minute,
        seconds: Math.round(seconds),
        status: judge(seconds / BENCHMARK),
        cars,
      });
    }
    const headway = minute >= GAP[1] && minute < 545 ? 2.2 : rush ? 6 : minute < 1260 ? 8.5 : 12;
    minute += headway * (0.8 + random() * 0.4);
  }

  let lowMinute = START;
  for (let m = START; m <= END; m += 5) if (temperature(m) < temperature(lowMinute)) lowMinute = m;
  return {
    trips,
    worst: trips.reduce((a, b) => (b.seconds > a.seconds ? b : a)),
    lowMinute,
    low: Math.round(temperature(lowMinute)),
  };
}

/** "8:20 AM" */
export const clockText = (minute: number) => {
  const m = Math.round(minute) % 1440;
  const hour = Math.floor(m / 60);
  return `${hour % 12 || 12}:${String(m % 60).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
};

/** "27m 48s" */
export const durationText = (seconds: number) =>
  `${Math.floor(seconds / 60)}m ${String(Math.round(seconds % 60)).padStart(2, '0')}s`;

/** The crowding most of a trip's cars report. */
export const mostCrowding = (trip: Trip): Crowding => {
  const counts: Record<Crowding, number> = { many: 0, few: 0, stand: 0 };
  trip.cars.forEach((car) => counts[car.crowding]++);
  return (['stand', 'few', 'many'] as const).reduce((a, b) => (counts[b] > counts[a] ? b : a));
};
