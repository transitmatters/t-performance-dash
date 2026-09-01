import React from 'react';
import dayjs from 'dayjs';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../../common/components/ui/card';
import { Badge } from '../../../common/components/ui/badge';
import { useAccessibilityAlertsData } from '../../../common/api/hooks/alerts';
import { getRelevantAlerts } from '../../commute/alerts/AlertBox';
import { AlertEffect } from '../../../common/types/alerts';
import EscalatorIcon from '../../../public/Icons/EscalatorIcon.svg';
import ElevatorIcon from '../../../public/Icons/ElevatorIcon.svg';
import { rtStations } from '../../../common/constants/stations';
import type { LineShort } from '../../../common/types/lines';

interface AccessibilityCardProps {
  lineShort: LineShort;
}

export const AccessibilityCard: React.FC<AccessibilityCardProps> = ({ lineShort }) => {
  const accessibilityAlerts = useAccessibilityAlertsData(lineShort);
  const current =
    lineShort === 'Commuter Rail' || lineShort === 'Bus'
      ? []
      : accessibilityAlerts.data
        ? getRelevantAlerts(accessibilityAlerts.data, 'current')
        : [];

  const lineStations =
    lineShort === 'Commuter Rail' || lineShort === 'Bus' ? [] : rtStations[lineShort].stations;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle>Accessibility</CardTitle>
          <CardDescription>
            {current.length
              ? `${current.length} of ${lineStations.length} stations have equipment out of service`
              : 'All stations fully accessible'}
          </CardDescription>
        </div>
        <Badge variant={current.length ? 'warning' : 'success'} className="shrink-0">
          {current.length ? `${current.length} open` : 'All clear'}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col divide-y">
        {current.slice(0, 4).map((alert) => {
          const start = alert.relevantTimes[0]?.start;
          const days = start ? dayjs().diff(start, 'day') : null;
          const stopsText = alert.stops
            .map((stop) => lineStations.find((station) => station.station === stop)?.stop_name)
            .filter(Boolean)
            .join(', ');
          const Icon = alert.type === AlertEffect.ESCALATOR_CLOSURE ? EscalatorIcon : ElevatorIcon;
          return (
            <div key={alert.id} className="flex items-start gap-3 py-3 first:pt-0">
              <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-sm font-medium">
                  {alert.type === AlertEffect.ESCALATOR_CLOSURE ? 'Escalator' : 'Elevator'} out of
                  service · <span className="font-semibold">{stopsText}</span>
                </span>
                <span className="text-muted-foreground text-xs">
                  {days !== null ? `${days} day${days === 1 ? '' : 's'} · ` : ''}
                  {start ? `since ${dayjs(start).format('MMM D, YYYY')}` : ''}
                </span>
              </div>
            </div>
          );
        })}
        {!current.length && (
          <p className="text-muted-foreground py-2 text-sm">No open accessibility alerts.</p>
        )}
      </CardContent>
    </Card>
  );
};
