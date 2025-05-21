'use client';
import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useDelimitatedRoute } from '../../common/utils/router';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { useSlowzoneDelayTotalData } from '../../common/api/hooks/slowzones';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { OVERVIEW_OPTIONS } from '../../common/constants/dates';
import { TotalSlowTimeWrapper } from './TotalSlowTimeWrapper';

dayjs.extend(utc);

export const SlowZonesWidget: React.FC = () => {
  const { line, query, lineShort } = useDelimitatedRoute();
  const delayTotals = useSlowzoneDelayTotalData();
  const { startDate } = OVERVIEW_OPTIONS[query.view ?? 'year'];

  const startDateUTC = dayjs.utc(startDate).startOf('day');
  const endDateUTC = dayjs.utc().startOf('day');
  const totalSlowTimeReady =
    !delayTotals.isError && delayTotals.data && startDateUTC && endDateUTC && lineShort && line;

  if (line === 'line-bus' || line === 'line-commuter-rail') {
    return null;
  }

  return (
    <>
      <WidgetDiv className="relative">
        <HomescreenWidgetTitle title="Slow zones" tab="slowzones" />
        {totalSlowTimeReady && lineShort !== 'Commuter Rail' && lineShort !== 'Bus' ? (
          <TotalSlowTimeWrapper
            data={delayTotals.data.data}
            startDateUTC={startDateUTC}
            endDateUTC={endDateUTC}
            line={line}
            lineShort={lineShort}
          />
        ) : (
          <ChartPlaceHolder query={delayTotals} />
        )}
      </WidgetDiv>
    </>
  );
};
