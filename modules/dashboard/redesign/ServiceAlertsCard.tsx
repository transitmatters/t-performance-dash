import React from 'react';
import { Bus } from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../../common/components/ui/card';
import { Badge } from '../../../common/components/ui/badge';
import { useAlertsData } from '../../../common/api/hooks/alerts';
import { getRelevantAlerts } from '../../commute/alerts/AlertBox';
import { UpcomingTime } from '../../commute/alerts/Time';
import type { LineShort } from '../../../common/types/lines';

interface ServiceAlertsCardProps {
  lineShort: LineShort;
}

export const ServiceAlertsCard: React.FC<ServiceAlertsCardProps> = ({ lineShort }) => {
  const alerts = useAlertsData(lineShort);
  const current = alerts.data ? getRelevantAlerts(alerts.data, 'current') : [];
  const upcoming = alerts.data ? getRelevantAlerts(alerts.data, 'upcoming') : [];

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle>Service alerts</CardTitle>
          <CardDescription>
            {current.length
              ? `${current.length} affecting service right now`
              : 'Nothing affecting service right now'}
          </CardDescription>
        </div>
        <Badge variant={current.length ? 'warning' : 'success'} className="shrink-0">
          {current.length ? `${current.length} active` : 'Running normally'}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {upcoming.length > 0 && (
          <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Upcoming · {upcoming.length}
          </div>
        )}
        <div className="flex flex-col divide-y">
          {[...current, ...upcoming].slice(0, 4).map((alert) => (
            <div key={alert.id} className="flex items-start gap-3 py-3 first:pt-0">
              <Bus className="text-muted-foreground mt-0.5 size-4 shrink-0" />
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
      </CardContent>
    </Card>
  );
};
