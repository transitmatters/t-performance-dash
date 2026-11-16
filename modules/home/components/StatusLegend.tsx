import { cn } from '../../../common/utils/cn';
import { STATUS_LABELS } from '../copy';
import { STATUS_NODE_TONE } from '../format';
import type { Status } from '../types';
import { StatusNode } from './StatusNode';

// Not measured has no stop at all on the strip, so it needs no key.
const ORDER: Status[] = ['win', 'good', 'room', 'problem', 'insufficient'];

export const StatusLegend = () => (
  <ul
    aria-label="Key"
    className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground"
  >
    {ORDER.map((status) => (
      <li key={status} className="flex items-center gap-1.5">
        <span className={cn('flex w-5 justify-center', STATUS_NODE_TONE[status])}>
          <StatusNode status={status} className="size-4" />
        </span>
        {STATUS_LABELS[status]}
      </li>
    ))}
  </ul>
);
