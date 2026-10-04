import React from 'react';
import { STATUS_LABELS } from '../copy';
import type { Status } from '../types';
import { StatusNode } from './StatusNode';

const ORDER: Status[] = ['win', 'good', 'room', 'problem', 'insufficient', 'na'];

export const StatusLegend: React.FC = () => (
  <ul className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
    {ORDER.map((status) => (
      <li key={status} className="flex items-center gap-1.5">
        <span className="text-foreground flex w-5 justify-center">
          <StatusNode status={status} className={status === 'na' ? undefined : 'size-4'} />
        </span>
        {STATUS_LABELS[status]}
      </li>
    ))}
  </ul>
);
