'use client';
import React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { optionsStation, stopIdsForStations } from '../../common/utils/stations';
import { useDelimitatedRoute } from '../../common/utils/router';
import { BasicWidgetDataLayout } from '../../common/components/widgets/internal/BasicWidgetDataLayout';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { averageDwells, longestDwells } from '../../common/utils/dwells';
import { TimeWidgetValue } from '../../common/types/basicWidgets';
import { useDwellsSingleDayData } from '../../common/api/hooks/dwells';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { SingleChartWrapper } from '../../common/components/charts/SingleChartWrapper';

export const DwellsWidget: React.FC = () => {
  const {
    line,
    lineShort,
    query: { startDate },
  } = useDelimitatedRoute();

  const stations = optionsStation(lineShort);
  const toStation = stations?.[stations.length - 3];
  const fromStation = stations?.[3];

  const { fromStopIds } = stopIdsForStations(fromStation, toStation);

  const dwells = useDwellsSingleDayData({ date: startDate, stop: fromStopIds });

  // Buses don't record dwells
  if (line === 'BUS') {
    return null;
  }

  return (
    <>
      <WidgetDiv>
        <HomescreenWidgetTitle title="Dwells" tab="tripDwells" />
        <div className={classNames('flex w-full flex-row')}>
          <BasicWidgetDataLayout
            title="Average Dwell"
            widgetValue={
              new TimeWidgetValue(dwells.data ? averageDwells(dwells.data) : undefined, 1)
            }
            analysis={`from last ${dayjs().format('ddd')}.`}
          />
          <BasicWidgetDataLayout
            title="Longest Dwell"
            widgetValue={
              new TimeWidgetValue(dwells.data ? longestDwells(dwells.data) : undefined, 1)
            }
            analysis={`from last ${dayjs().format('ddd')}.`}
          />
        </div>
        <SingleChartWrapper
          query={dwells}
          type={'dwells'}
          fromStation={fromStation}
          toStation={toStation}
          showLegend={false}
          isHomescreen={true}
        />
      </WidgetDiv>
    </>
  );
};
