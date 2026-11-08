import { ArrowRight } from 'lucide-react';
import { Link } from '../../../common/components/general/Link';
import { STATUS_LABELS } from '../copy';
import type { Status } from '../types';
import { StatusNode } from './StatusNode';

const ORDER: Status[] = ['win', 'good', 'room', 'problem', 'insufficient', 'na'];

export const StatusLegend = () => (
  <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
    {ORDER.map((status) => (
      <li key={status} className="flex items-center gap-1.5">
        <span className="flex w-5 justify-center text-foreground">
          <StatusNode status={status} className={status === 'na' ? undefined : 'size-4'} />
        </span>
        {STATUS_LABELS[status]}
      </li>
    ))}
    <li className="ml-auto">
      <Link
        href="/methodology"
        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
      >
        How we measure <ArrowRight className="size-3" aria-hidden />
      </Link>
    </li>
  </ul>
);
