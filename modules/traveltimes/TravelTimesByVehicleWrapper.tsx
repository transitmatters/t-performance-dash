import { useMemo } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import type { SingleDayDataPoint } from '../../common/types/charts';
import type { Station } from '../../common/types/stations';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { useDelimitatedRoute } from '../../common/utils/router';
import { getLocationDetails } from '../../common/utils/stations';
import { getStationDistance } from '../../common/utils/stationDistances';
import { getCarTypes } from '../fleet/constants/fleetTypes';
import { getTravelTimesByVehicle } from './utils/byVehicle';
import { TravelTimesByVehicleChart } from './charts/TravelTimesByVehicleChart';

interface TravelTimesByVehicleWrapperProps {
  query: UseQueryResult<SingleDayDataPoint[]>;
  toStation: Station;
  fromStation: Station;
  vehicleNoun: 'Train' | 'Bus';
}

export const TravelTimesByVehicleWrapper = ({
  query,
  toStation,
  fromStation,
  vehicleNoun,
}: TravelTimesByVehicleWrapperProps) => {
  const {
    line,
    query: { date },
  } = useDelimitatedRoute();
  const carTypes = getCarTypes(line);
  const data = useMemo(
    () =>
      getTravelTimesByVehicle(
        query.data ?? [],
        carTypes,
        getStationDistance(fromStation.station, toStation.station)
      ),
    [query.data, carTypes, fromStation.station, toStation.station]
  );

  const dataReady = !query.isError && query.data && date;
  if (!dataReady) return <ChartPlaceHolder query={query} />;
  if (data.length < 1) return <NoDataNotice shutdownScope="trip" metric="traveltimes" />;

  return (
    <TravelTimesByVehicleChart
      data={data}
      line={line}
      carTypes={carTypes}
      vehicleNoun={vehicleNoun}
      date={date}
      location={getLocationDetails(fromStation, toStation)}
    />
  );
};
