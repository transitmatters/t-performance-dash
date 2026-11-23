import type { DashboardData } from '../../modules/serviceAndRidership/types';

import { apiFetchUnchecked } from './utils/fetch';

export const fetchServiceAndRidershipDashboardData = async (): Promise<DashboardData> => {
  return apiFetchUnchecked({
    path: '/api/service_ridership_dashboard',
    options: {},
    errorMessage: 'Failed to fetch service & ridership dashboard',
  });
};
