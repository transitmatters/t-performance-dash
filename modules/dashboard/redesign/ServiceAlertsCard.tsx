import React from 'react';
import { TriangleAlert } from 'lucide-react';

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
  const alerts = useAlertsData(lineShort);
  const { isLoading } = alerts;
  const { isError } = alerts;
  const current = alerts.data ? getRelevantAlerts(alerts.data, 'current') : [];
  const upcoming = alerts.data ? getRelevantAlerts(alerts.data, 'upcoming') : [];

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle>Service alerts</CardTitle>
          <CardDescription>
            {isLoading
              ? 'Checking for active alerts…'
              : isError
                ? "Couldn't load service alerts."
                : current.length
                  ? `${current.length} affecting service right now`
                  : 'Nothing affecting service right now'}
          </CardDescription>
        </div>
        <Badge
          variant={
            isLoading ? 'outline' : isError ? 'destructive' : current.length ? 'warning' : 'success'
          }
          className="shrink-0"
        >
          {isLoading
            ? 'Checking…'
            : isError
              ? 'Unavailable'
              : current.length
                ? `${current.length} active`
                : 'Running normally'}
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
              Try again
            </Button>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Upcoming · {upcoming.length}
              </div>
            )}
            <div className="flex flex-col divide-y">
              {[...current, ...upcoming].slice(0, 4).map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 py-3 first:pt-0">
                  <TriangleAlert className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                  <div className="flex flex-1 flex-col gap-1">
                    <span className="text-sm font-medium">{alert.header}</span>
                    <span className="text-muted-foreground flex items-center text-xs">
                      <UpcomingTime times={alert.relevantTimes} />
                    </span>
                  </div>
                </div>
              ))}
              {!current.length && !upcoming.length && (
                <p className="text-muted-foreground py-2 text-sm">
                  No alerts for the {lineShort} Line.
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
