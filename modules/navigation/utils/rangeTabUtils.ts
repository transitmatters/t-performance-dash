import dayjs from 'dayjs';
import type { NextRouter } from 'next/router';
import { DATE_FORMAT, ONE_WEEK_AGO_STRING, TODAY_STRING } from '../../../common/constants/dates';
import { saveDateConfig } from '../../../common/state/utils/dateConfigUtils';
import type { DateConfig } from '../../../common/state/dateConfig';
import type { TripsSectionParams } from '../../../common/state/types/dateConfigTypes';

export const switchToSingleDay = (router: NextRouter, dateConfig: DateConfig) => {
  saveDateConfig('trips', router.query, dateConfig);
  router.query.queryType = 'single';
  router.query.startDate = router.query.endDate;
  delete router.query.endDate;
  router.push(router, undefined, { shallow: true });
  return;
};

export const switchToRange = (router: NextRouter, dateConfig: DateConfig) => {
  router.query.queryType = 'range';
  const { tripConfig } = dateConfig;

  if (tripConfig.endDate) {
    return returnToPreviousRange(router, tripConfig);
  }
  createNewRange(router);
};

export const returnToPreviousRange = (router: NextRouter, tripConfig: TripsSectionParams) => {
  router.query.endDate = tripConfig.endDate;
  router.query.startDate = tripConfig.startDate;
  router.push({ pathname: router.pathname, query: router.query }, undefined, { shallow: true });
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
  router.push(router, undefined, { shallow: true });
};
