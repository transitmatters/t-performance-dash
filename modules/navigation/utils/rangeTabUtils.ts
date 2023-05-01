import dayjs from 'dayjs';
import type { NextRouter } from 'next/router';
import { DATE_FORMAT, ONE_WEEK_AGO_STRING, TODAY_STRING } from '../../../common/constants/dates';
import { saveDashboardConfig } from '../../../common/state/utils/dashboardUtils';
import type { DashboardConfig } from '../../../common/state/dashboardConfig';
import type { TripsSectionParams } from '../../../common/state/types/dashboardConfigTypes';

export const switchToSingleDay = (router: NextRouter, dashboardConfig: DashboardConfig) => {
  saveDashboardConfig('trips', router.query, dashboardConfig);
  router.query.queryType = 'single';
  router.query.startDate = router.query.endDate;
  delete router.query.endDate;
  router.push(router);
  return;
};

export const switchToRange = (router: NextRouter, dashboardConfig: DashboardConfig) => {
  router.query.queryType = 'range';
  const { tripConfig } = dashboardConfig;

  if (tripConfig.endDate) {
    return returnToPreviousRange(router, tripConfig);
  }
  createNewRange(router);
};

export const returnToPreviousRange = (router: NextRouter, tripConfig: TripsSectionParams) => {
  router.query.endDate = tripConfig.endDate;
  router.query.startDate = tripConfig.startDate;
  router.push({ pathname: router.pathname, query: router.query });
};

export const createNewRange = (router: NextRouter) => {
  if (typeof router.query?.startDate === 'string') {
    router.query.endDate = router.query.startDate;
    router.query.startDate = dayjs(router.query.startDate).subtract(1, 'week').format(DATE_FORMAT);
  } else {
    // If for some reason, startDate is not set - create a range view of the past week.
    router.query.startDate = ONE_WEEK_AGO_STRING;
    router.query.endDate = TODAY_STRING;
  }
  router.query.queryType = 'range';
  router.push(router);
};
