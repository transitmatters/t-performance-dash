import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';

import { useSlowzoneAllData, useSlowzoneDelayTotalData } from '../../common/api/hooks/slowzones';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { WidgetTitle } from '../dashboard/WidgetTitle';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { Layout } from '../../common/layouts/layoutTypes';
import { filterAllSlow, formatSegments } from '../../common/utils/slowZoneUtils';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { ButtonGroup } from '../../common/components/general/ButtonGroup';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import type { Direction } from '../../common/types/dataPoints';
import { TotalSlowTime } from './charts/TotalSlowTime';
import { LineSegments } from './charts/LineSegments';
import { DirectionObject } from './constants/constants';

interface SystemSlowZonesDetailsProps {
  showTitle?: boolean;
}

export function SystemSlowZonesDetails({ showTitle = false }: SystemSlowZonesDetailsProps) {
  const delayTotals = useSlowzoneDelayTotalData();
  const allData = useSlowzoneAllData();
  const isMobile = !useBreakpoint('sm');
  const [direction, setDirection] = useState<Direction>('northbound');

  const {
    query: { startDate, endDate },
  } = useDelimitatedRoute();

  const startDateUTC = startDate ? dayjs.utc(startDate).startOf('day') : undefined;
  const endDateUTC = endDate ? dayjs.utc(endDate).startOf('day') : undefined;

  const totalSlowTimeReady = !delayTotals.isError && delayTotals.data && startDateUTC && endDateUTC;
  const lineSegmentsReady = !allData.isError && allData.data && startDateUTC && endDateUTC;
  const graphData = useMemo(() => {
    if (allData.data && startDateUTC && endDateUTC) {
      const fitleredData = filterAllSlow(allData.data, startDateUTC, endDateUTC);
      return formatSegments(fitleredData, startDateUTC, 'northbound');
    } else return [];
  }, [allData.data, endDateUTC, startDateUTC]);

  const stationPairs = new Set(graphData.map((dataPoint) => dataPoint.id));

  return (
    <PageWrapper pageTitle={'Slow zones'}>
      <ChartPageDiv>
        <WidgetDiv>
          <WidgetTitle title="Total slow time" />
          <div className="relative flex flex-col">
            {totalSlowTimeReady ? (
              <TotalSlowTime
                data={delayTotals.data}
                startDateUTC={startDateUTC}
                endDateUTC={endDateUTC}
                showTitle={showTitle}
              />
            ) : (
              <div className="relative flex h-full">
                <ChartPlaceHolder query={delayTotals} />
              </div>
            )}
          </div>
        </WidgetDiv>
        <div className="h-full rounded-lg bg-white p-4 shadow-dataBox">
          <div className="flex flex-col p-4 sm:p-0 lg:flex-row">
            <WidgetTitle title={`${DirectionObject[direction]} segments`} />
            <div className="lg:ml-2">
              <ButtonGroup pressFunction={setDirection} options={Object.entries(DirectionObject)} />
            </div>
          </div>
          <div className="relative flex flex-col">
            <div className="pb-4 pl-4 sm:pb-0 sm:pl-0">
              <div className="flex flex-col gap-y-1 pt-2">
                {lineSegmentsReady ? (
                  <div className="w-full overflow-x-auto overflow-y-hidden">
                    <div
                      style={
                        isMobile
                          ? { width: stationPairs.size * 64, height: 480 }
                          : { height: stationPairs.size * 40 }
                      }
                    >
                      <LineSegments
                        data={graphData}
                        startDateUTC={startDateUTC}
                        endDateUTC={endDateUTC}
                        direction={direction}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="relative flex h-full">
                    <ChartPlaceHolder query={delayTotals} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ChartPageDiv>
    </PageWrapper>
  );
}

SystemSlowZonesDetails.Layout = Layout.Dashboard;
