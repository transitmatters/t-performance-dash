/**
 * The parts of the Regional Rail Explorer's `/api/journeys` response that the dashboard reads. Times
 * are seconds after midnight, and pass 86400 for trains after midnight.
 */

export type RreDayKind = 'weekday' | 'saturday' | 'sunday';

export interface RreJourneyParams {
  /** Parent station IDs, such as `place-sstat`. */
  from: string;
  to: string;
  day: RreDayKind;
  /** When the rider leaves, in seconds after midnight. */
  time: number;
}

interface RreStation {
  id: string;
  name: string;
}

export interface RreTravelSegment {
  kind: 'travel';
  startTime: number;
  endTime: number;
  startStation: RreStation;
  endStation: RreStation;
  routeId: string;
}

export interface RreTransferSegment {
  kind: 'transfer';
  startTime: number;
  endTime: number;
  waitDuration: number;
  walkDuration: number;
}

export type RreSegment = RreTravelSegment | RreTransferSegment;

export type RreAmenity = 'electricTrains' | 'increasedTopSpeed' | 'levelBoarding';

export interface RreJourney {
  scenario: { id: string; name: string };
  segments: RreSegment[];
  amenities: RreAmenity[];
  /** Keyed by the station the journey boards at: when trains leave it toward this trip. */
  arrivals: Record<string, { station: RreStation; times: number[] }>;
  navigationFailed: boolean;
}

/** What the Explorer sends in place of a journey when a scenario throws. */
export interface RreScenarioError {
  error: true;
  payload: { scenario: { id: string; name: string } };
}

/** Today's Commuter Rail first, then Regional Rail. */
export type RreJourneysResponse = (RreJourney | RreScenarioError)[];
