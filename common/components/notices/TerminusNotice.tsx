import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlassChart } from '@fortawesome/free-solid-svg-icons';
import type { Station } from '../../types/stations';

interface TerminusNoticeProps {
  toStation?: Station;
  fromStation?: Station;
}

export const TerminusNotice: React.FC<TerminusNoticeProps> = ({ toStation, fromStation }) => {
  const isTerminus = toStation?.terminus || fromStation?.terminus;
  if (isTerminus) {
    return (
      <div className={'flex items-center'}>
        <FontAwesomeIcon icon={faMagnifyingGlassChart} size={'2x'} />
        <div className={'m-3 text-sm italic'}>
          <p>
            Due to data collection issues at terminus stations, data is not guaranteed to be
            complete.
          </p>
          <p>This may lead to inaccuracies, particularly in travel time & dwell calculations.</p>
        </div>
      </div>
    );
  }
  return null;
};
