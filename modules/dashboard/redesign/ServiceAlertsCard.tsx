import React from 'react';
import { TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { Line } from '../../../common/types/lines';
import { LINE_OBJECTS } from '../../../common/constants/lines';
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
import { useAlertsData } from '../../../common/api/hooks/alerts';
import { getRelevantAlerts } from '../../commute/alerts/AlertBox';
import { UpcomingTime } from '../../commute/alerts/Time';
import type { LineShort } from '../../../common/types/lines';

interface ServiceAlertsCardProps {
  lineShort: LineShort;
}

export const ServiceAlertsCard: React.FC<ServiceAlertsCardProps> = ({ lineShort }) => {
  const { t } = useTranslation(['dashboard', 'common']);
  const alerts = useAlertsData(lineShort);
  const { isLoading } = alerts;
  const { isError } = alerts;
  const current = alerts.data ? getRelevantAlerts(alerts.data, 'current') : [];
  const upcoming = alerts.data ? getRelevantAlerts(alerts.data, 'upcoming') : [];

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle>{t('serviceAlerts.title')}</CardTitle>
          <CardDescription>
            {isLoading
              ? t('serviceAlerts.checking')
              : isError
                ? t('serviceAlerts.error')
                : current.length
                  ? t('serviceAlerts.current', { count: current.length })
                  : t('serviceAlerts.none')}
          </CardDescription>
        </div>
        <Badge
          variant={
            isLoading ? 'outline' : isError ? 'destructive' : current.length ? 'warning' : 'success'
          }
          className="shrink-0"
        >
          {isLoading
            ? t('badge.checking')
            : isError
              ? t('badge.unavailable')
              : current.length
                ? t('serviceAlerts.badge.active', { count: current.length })
                : t('serviceAlerts.badge.normal')}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {isLoading ? (
          // The card description already says "Checking…"; the body is a skeleton, not repeat copy.
          <div className="flex flex-col gap-3 py-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : isError ? (
          // The card description already states the error; here we just offer the way out.
          <div className="py-2">
            <Button variant="outline" size="sm" onClick={() => alerts.refetch()}>
              {t('common:notices.error.retry')}
            </Button>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {t('serviceAlerts.upcoming', { count: upcoming.length })}
              </div>
            )}
            <div className="flex flex-col divide-y">
              {[...current, ...upcoming].slice(0, 4).map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 py-3 first:pt-0">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="flex flex-1 flex-col gap-1">
                    <span className="text-sm font-medium">{alert.header}</span>
                    <span className="flex items-center text-xs text-muted-foreground">
                      <UpcomingTime times={alert.relevantTimes} />
                    </span>
                  </div>
                </div>
              ))}
              {!current.length && !upcoming.length && (
                <p className="py-2 text-sm text-muted-foreground">
                  {t('serviceAlerts.noAlerts', {
                    line:
                      LINE_OBJECTS[`line-${lineShort.toLowerCase()}` as Line]?.name ?? lineShort,
                  })}
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
