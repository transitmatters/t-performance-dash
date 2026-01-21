import React from 'react';
import { useTripExplorerQueries } from '../../common/api/datadashboard';
import type { Station } from '../../common/types/stations';
import type { AggregateAPIOptions, SingleDayAPIOptions } from '../../common/types/api';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { WidgetTitle } from '../../common/components/widgets/WidgetTitle';
import { getLocationDetails } from '../../common/utils/stations';
import type { Line } from '../../common/types/lines';
import { AggregateChartWrapper } from '../../common/components/charts/AggregateChartWrapper';
import { ButtonGroup } from '../../common/components/general/ButtonGroup';
import { TravelTimesAggregateWrapper } from '../traveltimes/TravelTimesAggregateWrapper';
import { TravelTimesSingleWrapper } from '../traveltimes/TravelTimesSingleWrapper';
import { HeadwaysSingleWrapper } from '../headways/HeadwaysSingleWrapper';
import { HeadwaysAggregateWrapper } from '../headways/HeadwaysAggregateWrapper';
import { HeadwaysHistogramWrapper } from '../headways/charts/HeadwaysHistogramWrapper';
import { BunchingByHourWrapper } from '../bunching/BunchingByHourWrapper';

interface BusTripGraphsProps {
  fromStation: Station;
  toStation: Station;
  parameters: AggregateAPIOptions | SingleDayAPIOptions; // TODO
  aggregate: boolean;
  enabled: boolean;
  line: Line | undefined;
}

export const BusTripGraphs: React.FC<BusTripGraphsProps> = ({
  fromStation,
  toStation,
  parameters,
  aggregate,
  enabled,
  line,
}) => {
  const { traveltimes, headways } = useTripExplorerQueries(
    'bus',
    parameters,
    // @ts-expect-error The overloading doesn't seem to handle this const
    aggregate,
    enabled
  );
  const location = getLocationDetails(fromStation, toStation);
  const [peakTime, setPeakTime] = React.useState<'weekday' | 'weekend'>('weekday');

  return (
    <div className="flex flex-col gap-4">
      {aggregate ? (
        <>
          <WidgetDiv>
            <WidgetTitle title="Travel times" location={location} line={line} both />
            <TravelTimesAggregateWrapper
              query={traveltimes}
              fromStation={fromStation}
              toStation={toStation}
            />
          </WidgetDiv>
          <WidgetDiv>
            <WidgetTitle
              title="Headways"
              subtitle="Time between buses"
              location={location}
              line={line}
            />
            <HeadwaysAggregateWrapper
              query={headways}
              toStation={toStation}
              fromStation={fromStation}
            />
          </WidgetDiv>
          <WidgetDiv className="flex flex-col justify-center">
            <WidgetTitle title="Travel times by hour" location={location} line={line} both />
            <AggregateChartWrapper
              query={traveltimes}
              toStation={toStation}
              fromStation={fromStation}
              type={'traveltimes'}
              timeUnit={'by_time'}
              peakTime={peakTime === 'weekday' ? true : false}
            />
            <div className={'flex w-full justify-center pt-2'}>
              <ButtonGroup
                line={line}
                pressFunction={setPeakTime}
                options={[
                  ['weekday', 'Weekday'],
                  ['weekend', 'Weekend/holiday'],
                ]}
                additionalDivClass="md:w-auto"
                additionalButtonClass="md:w-fit"
              />
            </div>
          </WidgetDiv>
        </>
      ) : (
        <>
          <WidgetDiv>
            <WidgetTitle title="Travel times" location={location} line={line} both />
            <TravelTimesSingleWrapper
              query={traveltimes}
              toStation={toStation}
              fromStation={fromStation}
            />
          </WidgetDiv>
          <WidgetDiv>
            <WidgetTitle
              title="Headways"
              subtitle="Time between buses"
              location={location}
              line={line}
            />
            <HeadwaysSingleWrapper
              query={headways}
              toStation={toStation}
              fromStation={fromStation}
            />
          </WidgetDiv>
          <WidgetDiv>
            <WidgetTitle
              title="Headway distribution"
              subtitle="Time between buses"
              location={location}
              line={line}
            />
            <HeadwaysHistogramWrapper
              query={headways}
              toStation={toStation}
              fromStation={fromStation}
            />
          </WidgetDiv>
          <WidgetDiv>
            <WidgetTitle
              title="Bunching by hour"
              subtitle="Percentage of bunched, on-time, and gapped trips"
              location={location}
              line={line}
            />
            <BunchingByHourWrapper
              query={headways}
              toStation={toStation}
              fromStation={fromStation}
            />
          </WidgetDiv>
        </>
      )}
    </div>
  );
};
