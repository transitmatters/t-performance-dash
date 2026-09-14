import React from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCircleInfo, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

export type NoticeVariant = 'info' | 'warning';

interface NoticeProps {
  /** `warning` for data that may be inaccurate/incomplete; `info` for neutral context. */
  variant?: NoticeVariant;
  /** Optional bold lead line above the body. */
  title?: React.ReactNode;
  /** Override the variant's default icon. */
  icon?: IconDefinition;
  className?: string;
  children: React.ReactNode;
}

const VARIANTS: Record<
  NoticeVariant,
  { container: string; icon: string; defaultIcon: IconDefinition }
> = {
  info: {
    container: 'bg-muted text-muted-foreground ring-foreground/10',
    icon: 'text-muted-foreground',
    defaultIcon: faCircleInfo,
  },
  warning: {
    container:
      'bg-amber-50 text-amber-900 ring-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100 dark:ring-amber-400/25',
    icon: 'text-amber-500 dark:text-amber-400',
    defaultIcon: faTriangleExclamation,
  },
};

/**
 * The single presentational shell for every page-level data caveat. One icon
 * slot, one container treatment per variant — so a stack of notices reads as
 * one system instead of four ad-hoc footnotes.
 */
export const Notice: React.FC<NoticeProps> = ({
  variant = 'info',
  title,
  icon,
  className,
  children,
}) => {
  const styles = VARIANTS[variant];
  return (
    <div
      className={classNames(
        'flex items-start gap-3 rounded-xl px-4 py-3 text-sm ring-1',
        styles.container,
        className
      )}
    >
      <FontAwesomeIcon
        icon={icon ?? styles.defaultIcon}
        className={classNames('mt-0.5 h-4 w-4 shrink-0', styles.icon)}
        aria-hidden
      />
      <div className="flex min-w-0 flex-col gap-1 [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2">
        {title && <p className="font-semibold">{title}</p>}
        {children}
      </div>
    </div>
  );
};
