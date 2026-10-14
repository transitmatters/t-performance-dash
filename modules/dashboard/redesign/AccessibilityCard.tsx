import React from 'react';
import dayjs from 'dayjs';
import { Trans, useTranslation } from 'react-i18next';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../../common/components/ui/card';
import { Badge } from '../../../common/components/ui/badge';
import { Button } from '../../../common/components/ui/button';
import { Skeleton } from '../../../common/components/ui/skeleton';
import { useAccessibilityAlertsData } from '../../../common/api/hooks/alerts';
import { getRelevantAlerts } from '../../commute/alerts/AlertBox';
import { AlertEffect } from '../../../common/types/alerts';
import EscalatorIcon from '../../../public/Icons/EscalatorIcon.svg?react';
import ElevatorIcon from '../../../public/Icons/ElevatorIcon.svg?react';
import { rtStations } from '../../../common/constants/stations';
import type { LineShort } from '../../../common/types/lines';

interface AccessibilityCardProps {
  lineShort: LineShort;
}

export const AccessibilityCard: React.FC<AccessibilityCardProps> = ({ lineShort }) => {
  const { t } = useTranslation(['dashboard', 'common']);
  const accessibilityAlerts = useAccessibilityAlertsData(lineShort);
  const notTracked = lineShort === 'Commuter Rail' || lineShort === 'Bus';
  const isLoading = !notTracked && accessibilityAlerts.isLoading;
  const isError = !notTracked && accessibilityAlerts.isError;
  const current =
    notTracked || !accessibilityAlerts.data
      ? []
      : getRelevantAlerts(accessibilityAlerts.data, 'current');

  const lineStations =
    lineShort === 'Commuter Rail' || lineShort === 'Bus' ? [] : rtStations[lineShort].stations;

  const affectedStops = new Set(current.flatMap((alert) => alert.stops));
  const affectedStationCount = lineStations.filter((station) =>
    affectedStops.has(station.station)
  ).length;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle>{t('accessibility.title')}</CardTitle>
          <CardDescription>
            {notTracked
              ? t('accessibility.notTracked')
              : isLoading
                ? t('accessibility.checking')
                : isError
                  ? t('accessibility.error')
                  : affectedStationCount
                    ? t('accessibility.affected', {
                        count: affectedStationCount,
                        total: lineStations.length,
                      })
                    : t('accessibility.allAccessible')}
          </CardDescription>
        </div>
        <Badge
          variant={
            notTracked || isLoading
              ? 'outline'
              : isError
                ? 'destructive'
                : affectedStationCount
                  ? 'warning'
                  : 'success'
          }
          className="shrink-0"
        >
          {notTracked
            ? t('accessibility.badge.notApplicable')
            : isLoading
              ? t('badge.checking')
              : isError
                ? t('badge.unavailable')
                : affectedStationCount
                  ? t('accessibility.badge.affected', { count: affectedStationCount })
                  : t('accessibility.badge.allClear')}
        </Badge>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col">
        {isLoading && (
          <div className="flex flex-col gap-3 py-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}
        {isError && (
          <div className="py-2">
            <Button variant="outline" size="sm" onClick={() => accessibilityAlerts.refetch()}>
              {t('common:notices.error.retry')}
            </Button>
          </div>
        )}
        {current.length > 0 && (
          // Busy lines (Red has 15+ outages) outgrow the card, so the list scrolls. Focusable so
          // keyboard users can scroll it too, and labelled for screen readers.
          <div
            role="region"
            aria-label={t('accessibility.listLabel')}
            tabIndex={0}
            className="-mx-1 flex max-h-80 flex-col divide-y overflow-y-auto overscroll-contain rounded-md px-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden"
          >
            {current.map((alert) => {
              const start = alert.relevantTimes[0]?.start;
              const days = start ? dayjs().diff(start, 'day') : null;
              const stopsText = alert.stops
                .map((stop) => lineStations.find((station) => station.station === stop)?.stop_name)
                .filter(Boolean)
                .join(', ');
              const Icon =
                alert.type === AlertEffect.ESCALATOR_CLOSURE ? EscalatorIcon : ElevatorIcon;
              return (
                <div key={alert.id} className="flex items-start gap-3 py-3 first:pt-0">
                  <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="flex flex-1 flex-col gap-1">
                    <span className="text-sm font-medium">
                      <Trans
                        t={t}
                        i18nKey={
                          alert.type === AlertEffect.ESCALATOR_CLOSURE
                            ? 'accessibility.escalatorOut'
                            : 'accessibility.elevatorOut'
                        }
                        values={{ stops: stopsText }}
                        components={{ stops: <span className="font-semibold" /> }}
                      />
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {start && days !== null
                        ? t('accessibility.outageAge', {
                            count: days,
                            date: dayjs(start).format('MMM D, YYYY'),
                          })
                        : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {!notTracked && !isLoading && !isError && !current.length && (
          <p className="py-2 text-sm text-muted-foreground">{t('accessibility.noAlerts')}</p>
        )}
      </CardContent>
    </Card>
  );
};
