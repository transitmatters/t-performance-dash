import type { LineData, SummaryData } from '../types/ridership';

export const fetchAllRidership = (): Promise<{
  summaryData: SummaryData;
  lineData: Record<string, LineData>;
}> => {
  const all_ridership_url = new URL(`/ridership.json`, window.location.origin);
  return fetch(all_ridership_url.toString()).then((resp) => resp.json());
};
