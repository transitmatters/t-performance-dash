import { CORE_TRACK_LENGTHS } from '../constants/speeds';

export const getSpeedWidgetValues = (medianTravelTimes, compTravelTimes, line) => {
  if (medianTravelTimes?.data == undefined || compTravelTimes?.data == undefined) {
    return { average: undefined, delta: undefined };
  }
  const values = medianTravelTimes.data.map(
    (datapoint) => CORE_TRACK_LENGTHS[line ?? 'DEFAULT'] / (datapoint.value / 3600)
  );
  const compValues = compTravelTimes.data.map(
    (datapoint) => CORE_TRACK_LENGTHS[line ?? 'DEFAULT'] / (datapoint.value / 3600)
  );

  const average = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const compAverage = compValues?.reduce((a, b) => a + b, 0) / compValues?.length;
  const delta = average - compAverage;
  return { average, delta };
};
