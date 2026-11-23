import type { DashboardData } from '../../modules/serviceAndRidership/types';
import { isLineKind } from '../../modules/serviceAndRidership/types';
import { apiFetch } from './utils/fetch';

// The spec leaves lineKind open; a line of a kind the grid doesn't know how to draw is left out.
export const fetchServiceAndRidershipDashboardData = async (): Promise<DashboardData> => {
  const data = await apiFetch({
    path: '/api/service_ridership_dashboard',
    options: {},
    errorMessage: 'Failed to fetch service & ridership dashboard',
  });
  const lineData = Object.fromEntries(
    Object.entries(data.lineData).flatMap(([id, line]) =>
      isLineKind(line.lineKind) ? [[id, { ...line, lineKind: line.lineKind }]] : []
    )
  );
  return { ...data, lineData };
};
