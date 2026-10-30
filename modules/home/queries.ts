import { overviewQuery } from '../../common/api/hooks/overview';
import { queryClient } from '../../common/api/queryClient';

/** Starts the home page's fetch from the route loader, before the page's own code has loaded. */
export const prefetchHomeData = () => queryClient.prefetchQuery(overviewQuery);
