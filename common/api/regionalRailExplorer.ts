import { REGIONAL_RAIL_EXPLORER_URL } from '../constants/regionalRail';
import type { RreJourneyParams, RreJourneysResponse } from '../types/regionalRailExplorer';
import { fetchOrThrow } from './utils/ApiError';

// The API and the Explorer page take the same query, so a preview and its link always agree
const journeyQuery = ({ from, to, day, time }: RreJourneyParams) =>
  new URLSearchParams({ from, to, day, time: `${time}`, navigationKind: 'depart-at' }).toString();

/** The Explorer's page for this trip. */
export const rreExploreUrl = (params: RreJourneyParams) =>
  `${REGIONAL_RAIL_EXPLORER_URL}/explore?${journeyQuery(params)}`;

/**
 * Plans the trip on today's Commuter Rail and on Regional Rail. The Explorer's CloudFront caches
 * each query for a day, so a station pair costs its Lambda one run a day at most.
 */
export const fetchRreJourneys = async (params: RreJourneyParams): Promise<RreJourneysResponse> => {
  const response = await fetchOrThrow(
    `${REGIONAL_RAIL_EXPLORER_URL}/api/journeys?${journeyQuery(params)}`,
    undefined,
    'Failed to fetch Regional Rail Explorer journeys'
  );
  return await response.json();
};
