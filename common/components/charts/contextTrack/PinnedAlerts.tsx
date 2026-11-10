import type { CSSProperties } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import type { OldAlert } from '../../../types/alerts';
import { ALERT_COLOR, alertKey, formatAlertRange } from './segments';

interface PinnedAlertsProps {
  alerts: OldAlert[];
  indent: number;
  onRemove: (key: string) => void;
}

/** The text of each alert shaded on the chart, which touch screens can't hover to read. */
export const PinnedAlerts = ({ alerts, indent, onRemove }: PinnedAlertsProps) => {
  if (!alerts.length) return null;
  return (
    // Lines up with the plot, except on phones where the indent would squeeze the text
    <ul
      className="flex flex-col gap-1 text-xs sm:pl-(--plot-left)"
      style={{ '--plot-left': `${indent}px` } as CSSProperties}
    >
      {alerts.map((alert) => {
        const key = alertKey(alert);
        return (
          <li key={key} className="flex items-start gap-2">
            <span
              aria-hidden
              className="mt-1 inline-block h-2 w-3 shrink-0 rounded-[2px]"
              style={{ backgroundColor: ALERT_COLOR }}
            />
            <p className="min-w-0 flex-1">
              <span className="mr-1.5 font-medium whitespace-nowrap tabular-nums">
                {formatAlertRange(alert)}
              </span>
              <span className="text-muted-foreground">{alert.text}</span>
            </p>
            <button
              type="button"
              onClick={() => onRemove(key)}
              aria-label="Remove this alert's shading"
              className="-my-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden"
            >
              <FontAwesomeIcon icon={faXmark} className="size-3" aria-hidden />
            </button>
          </li>
        );
      })}
    </ul>
  );
};
