import type { UseQueryResult } from '@tanstack/react-query';
import type { SingleDayDataPoint } from '../../../common/types/charts';
import type { Station } from '../../../common/types/stations';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { NoDataNotice } from '../../../common/components/notices/NoDataNotice';
import { useSingleDate } from '../../../common/hooks/usePageParams';
import { HeadwaysHistogram } from './HeadwaysHistogram';

interface HeadwaysHistogramWrapperProps {
  query: UseQueryResult<SingleDayDataPoint[]>;
  toStation: Station | undefined;
  fromStation: Station | undefined;
}

export const HeadwaysHistogramWrapper = ({
  query,
  toStation,
  fromStation,
}: HeadwaysHistogramWrapperProps) => {
  const { date } = useSingleDate();
  const dataReady = !query.isError && query.data && toStation && fromStation;
  if (!dataReady) return <ChartPlaceHolder query={query} />;
  if (query.data.length < 1) return <NoDataNotice shutdownScope="trip" metric="headways" />;
  return (
    <HeadwaysHistogram
      date={date}
      headways={query.data}
      fromStation={fromStation}
      toStation={toStation}
    />
  );
};
