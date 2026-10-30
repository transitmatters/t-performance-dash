import type { CSSProperties } from 'react';
import classNames from 'classnames';
import type { TooltipSide } from '@transitmatters/stripmap';

import styles from './StationRidershipTooltip.module.css';

interface StationRidershipTooltipProps {
  stationName: string;
  side: TooltipSide;
  color: string;
  average?: number;
  otherLines: string[];
}

export const StationRidershipTooltip = ({
  stationName,
  side,
  color,
  average,
  otherLines,
}: StationRidershipTooltipProps) => (
  <div
    style={{ '--tooltip-accent-color': color } as CSSProperties}
    className={classNames(
      styles.tooltip,
      '[--tooltip-background:white] dark:[--tooltip-background:var(--color-stone-800)]',
      side === 'top' && styles.horizontal,
      side === 'left' && styles.reverse
    )}
  >
    <div className={styles.triangle} />
    <div className={classNames(styles.content, 'shadow-dataBox')}>
      <div className={styles.title}>{stationName}</div>
      <div className={classNames(styles.body, 'text-sm text-stone-800 dark:text-stone-100')}>
        {average === undefined ? (
          <span className="text-xs text-stone-500 italic dark:text-stone-400">
            No fare gates here, so there are no station counts.
          </span>
        ) : (
          <>
            <span>
              <b>{Math.round(average).toLocaleString('en-us')}</b> weekday fare validations
            </span>
            {otherLines.length > 0 && (
              <span className="text-xs text-stone-500 italic dark:text-stone-400">
                Includes riders for the {otherLines.join(' and ')} Line
                {otherLines.length > 1 ? 's' : ''}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  </div>
);
