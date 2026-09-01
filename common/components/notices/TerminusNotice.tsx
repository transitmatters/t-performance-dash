import React from 'react';
import type { Station } from '../../types/stations';
import { Notice } from './Notice';

interface TerminusNoticeProps {
  toStation?: Station;
  fromStation?: Station;
}

export const TerminusNotice: React.FC<TerminusNoticeProps> = ({ toStation, fromStation }) => {
  const isTerminus = toStation?.terminus || fromStation?.terminus;

  if (!isTerminus) {
    return null;
  }

  return (
    <Notice variant="warning">
      Data collection at terminus stations can be incomplete, which may affect travel time and dwell
      figures in particular.
    </Notice>
  );
};
