'use client';

import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useTranslation } from 'react-i18next';
import { useDelimitatedRoute } from '../../common/utils/router';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { useDeliveredTripMetrics } from '../../common/api/hooks/tripmetrics';
import { useBusTripMetrics } from '../../common/api/hooks/busTripMetrics';
import { useCrTripMetrics } from '../../common/api/hooks/crTripMetrics';
import { Widget } from '../../common/components/widgets';
import { getBusRouteIds } from '../../common/constants/lines';
import { useChartToggle } from '../../common/hooks/useChartToggle';
import { COMMUTER_RAIL_LINE_NAMES } from '../../common/types/lines';
import { getSpeedGraphConfig } from '../speed/constants/speeds';
import { FleetAgeGraphWrapper } from './FleetAgeGraphWrapper';
import { FleetShareGraphWrapper } from './FleetShareGraphWrapper';
import { FleetMixGraphWrapper } from './FleetMixGraphWrapper';
import { FLEET_TYPES, getFleetModeMetrics } from './constants/fleetTypes';

dayjs.extend(utc);

// data-ingestion's system-wide row for bus and Commuter Rail.
const SYSTEM_WIDE_ROUTE = 'all';

export function FleetDetails() {
  const { t } = useTranslation(['fleet', 'common']);
  const {
    line,
    query: { startDate, endDate, busRoute, crRoute },
  } = useDelimitatedRoute();
  const config = getSpeedGraphConfig(dayjs(startDate), dayjs(endDate));
  const isBus = line === 'line-bus';
  const isCommuterRail = line === 'line-commuter-rail';
  const isRail = !isBus && !isCommuterRail;
  const selectedRoute = isBus ? busRoute : isCommuterRail ? crRoute : undefined;
  const routeLabel = isBus
    ? t('common:routes.busRoute', { route: busRoute })
    : (COMMUTER_RAIL_LINE_NAMES[crRoute!] ?? crRoute ?? '');
  // Commuter Rail calls its routes lines, as on the Reliability page.
  const allLabel = isCommuterRail ? t('scope.allLines') : t('scope.allRoutes');
  // Follows the route picked in the header, like the other bus and CR pages.
  const { value: scope, control: scopeControl } = useChartToggle(
    'route',
    [
      ['route', routeLabel],
      ['all', allLabel],
    ],
    { paramKey: 'fleetScope' }
  );
  const byRoute = scope === 'route' && Boolean(selectedRoute);
  const route = byRoute ? selectedRoute : SYSTEM_WIDE_ROUTE;
  const enabled = Boolean(startDate && endDate && line && config.agg);

  const railMetrics = useDeliveredTripMetrics(
    { start_date: startDate, end_date: endDate, agg: config.agg, line },
    enabled && isRail
  );
  const busMetrics = useBusTripMetrics(
    {
      start_date: startDate,
      end_date: endDate,
      agg: config.agg,
      route: byRoute && busRoute ? getBusRouteIds(busRoute).join(',') : route,
    },
    enabled && isBus
  );
  const crMetrics = useCrTripMetrics(
    { start_date: startDate, end_date: endDate, agg: config.agg, route },
    enabled && isCommuterRail
  );
  const fleetMetrics = isBus ? busMetrics : isCommuterRail ? crMetrics : railMetrics;

  const fleetTypes = line ? FLEET_TYPES[line] : undefined;
  const metrics = getFleetModeMetrics(line);
  const scopeLabel = byRoute ? routeLabel : allLabel;
  const subtitle = (railSubtitle: string) => (isRail ? railSubtitle : scopeLabel);
  // Shuttle shading marks rail shutdowns; bus and CR gaps are just missing samples.
  const shuttling = isRail;

  if (!startDate || !endDate) {
    return <p>{t('common:notices.selectDateRange')}</p>;
  }

  return (
    <PageWrapper pageTitle={t('common:pages.fleet.name')}>
      <ChartPageDiv>
        {!isRail && selectedRoute && <div className="flex justify-end">{scopeControl}</div>}
        {metrics.share && (
          <Widget
            title={metrics.share.title}
            subtitle={subtitle(t('shareSubtitle'))}
            ready={[fleetMetrics]}
          >
            <FleetShareGraphWrapper
              data={fleetMetrics.data!}
              metric={metrics.share}
              showShuttling={shuttling}
              config={config}
              startDate={startDate}
              endDate={endDate}
            />
          </Widget>
        )}
        <Widget
          title={metrics.age.title}
          subtitle={subtitle(t('ageSubtitle'))}
          ready={[fleetMetrics]}
        >
          <FleetAgeGraphWrapper
            data={fleetMetrics.data!}
            metric={metrics.age}
            showShuttling={shuttling}
            config={config}
            startDate={startDate}
            endDate={endDate}
          />
        </Widget>
        {fleetTypes && (
          <Widget
            title={metrics.mixTitle}
            subtitle={
              isRail
                ? metrics.mixSubtitle
                : t('mixSubtitleScoped', { subtitle: metrics.mixSubtitle, scope: scopeLabel })
            }
            ready={[fleetMetrics]}
          >
            <FleetMixGraphWrapper
              data={fleetMetrics.data!}
              types={fleetTypes}
              showShuttling={shuttling}
              config={config}
              startDate={startDate}
              endDate={endDate}
            />
          </Widget>
        )}
        <p className="text-sm text-muted-foreground">
          {isBus && t('notes.bus')}
          {isCommuterRail && t('notes.commuterRail')}
          {isRail && t('notes.rail')}
        </p>
      </ChartPageDiv>
    </PageWrapper>
  );
}
