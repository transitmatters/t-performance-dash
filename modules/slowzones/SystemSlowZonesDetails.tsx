import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { i18n } from '../../common/i18n';
import { Link } from '../../common/components/general/Link';
import {
  useSlowzoneAllData,
  useSlowzoneDelayTotalData,
  useSpeedRestrictionData,
} from '../../common/api/hooks/slowzones';
import { useDelimitatedRoute } from '../../common/utils/router';
import { Widget } from '../../common/components/widgets';
import { ChartStack } from '../../common/components/charts/ChartStack';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { filterAllSlow, formatSegments } from '../../common/utils/slowZoneUtils';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { ButtonGroup } from '../../common/components/general/ButtonGroup';
import { useChartToggle } from '../../common/hooks/useChartToggle';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { formatDateTodayCheck } from '../../common/state/utils/dateStoreUtils';
import type { Direction } from '../../common/types/dataPoints';
import type { Line } from '../../common/types/lines';
import { TotalSlowTime } from './charts/TotalSlowTime';
import { LineSegments } from './charts/LineSegments';
import { getLineSegmentsContainerStyle } from './constants/chartConfig';
import { DirectionObject } from './constants/constants';
import { SlowZonesMap } from './map';
import type { SlowZonesLineName } from './types';

interface SystemSlowZonesDetailsProps {
  showTitle?: boolean;
}

const DIRECTION_OPTIONS = Object.entries(DirectionObject) as [Direction, string][];
const LINE_OPTIONS: [SlowZonesLineName, string][] = [
  ['Red', i18n.t('slowzones:lineOptions.red')],
  ['Orange', i18n.t('slowzones:lineOptions.orange')],
  ['Blue', i18n.t('slowzones:lineOptions.blue')],
  ['Green', i18n.t('slowzones:lineOptions.green')],
  ['Mattapan', i18n.t('slowzones:lineOptions.mattapan')],
];

export function SystemSlowZonesDetails({ showTitle = false }: SystemSlowZonesDetailsProps) {
  const { t } = useTranslation(['slowzones', 'common']);
  const delayTotals = useSlowzoneDelayTotalData();
  const allData = useSlowzoneAllData();
  const isMobile = !useBreakpoint('sm');
  const { value: direction, control: directionControl } = useChartToggle(
    'northbound',
    DIRECTION_OPTIONS
  );
  // Typed so the per-direction catalog keys resolve statically.
  const segmentsDirection: Direction = direction;

  const [lineShort, setLineShort] = useState<SlowZonesLineName>('Red');
  const line = `line-${lineShort.toLowerCase()}` as Line;
  const isDesktop = useBreakpoint('lg');

  const {
    query: { startDate, endDate },
  } = useDelimitatedRoute();

  const speedRestrictions = useSpeedRestrictionData({ lineId: line, date: endDate! });

  const startDateUTC = startDate ? dayjs.utc(startDate).startOf('day') : undefined;
  const endDateUTC = endDate ? dayjs.utc(endDate).startOf('day') : undefined;

  const graphData = useMemo(() => {
    if (allData.data && startDateUTC && endDateUTC) {
      const fitleredData = filterAllSlow(
        Array.isArray(allData.data) ? allData.data : allData.data.data,
        startDateUTC,
        endDateUTC
      );
      return formatSegments(fitleredData, startDateUTC, direction);
    } else return [];
  }, [allData.data, endDateUTC, startDateUTC, direction]);

  const stationPairs = new Set(graphData.map((dataPoint) => dataPoint.id));

  if (!endDateUTC || !startDateUTC) {
    return <p>{t('common:notices.selectDateRange')}</p>;
  }

  return (
    <PageWrapper pageTitle={t('common:pages.slowzones.name')}>
      <ChartPageDiv>
        <Widget
          title={t('totalSlowTime')}
          subtitle={
            <Link href="https://transitmatters.org/blog/slowzonesupdate" target="_blank">
              {t('totalSlowTimeSubtitle')}
            </Link>
          }
          ready={[delayTotals]}
        >
          {delayTotals.data && (
            <TotalSlowTime
              data={Array.isArray(delayTotals.data) ? delayTotals.data : delayTotals.data.data}
              startDateUTC={startDateUTC}
              endDateUTC={endDateUTC}
              showTitle={showTitle}
            />
          )}
        </Widget>
        <Widget
          title={t('lineMap')}
          subtitle={t('asOf', { date: formatDateTodayCheck(endDate!) })}
          action={
            <ButtonGroup
              line={line}
              pressFunction={setLineShort}
              selectedIndex={LINE_OPTIONS.findIndex(([key]) => key === lineShort)}
              options={LINE_OPTIONS}
              additionalDivClass="w-auto"
              additionalButtonClass="px-3"
            />
          }
          ready={[allData, speedRestrictions]}
        >
          <SlowZonesMap
            key={lineShort}
            slowZones={allData.data!}
            speedRestrictions={speedRestrictions.data}
            lineName={lineShort}
            direction={isDesktop ? 'horizontal' : 'vertical'}
          />
        </Widget>
        <Widget
          title={t(`segments.title.${segmentsDirection}`)}
          subtitle={t('segments.subtitle')}
          action={directionControl}
          ready={[allData]}
        >
          <ChartStack>
            {/* On mobile the strip scrolls sideways, so it bleeds to the card edge rather than
                stopping at the padding. */}
            <div className="-mx-3 overflow-x-auto overflow-y-hidden px-3 sm:mx-0 sm:px-0">
              <div style={getLineSegmentsContainerStyle(stationPairs.size, isMobile)}>
                <LineSegments
                  data={graphData}
                  startDateUTC={startDateUTC}
                  endDateUTC={endDateUTC}
                  direction={direction}
                />
              </div>
            </div>
          </ChartStack>
        </Widget>
      </ChartPageDiv>
    </PageWrapper>
  );
}
