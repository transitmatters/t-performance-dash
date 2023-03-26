import { faCalendarDay, faCalendarWeek } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button } from './Button';

interface RangeButtonProps {
  range: boolean;
  setRange: (range: boolean) => void;
}

export const RangeButton: React.FC<RangeButtonProps> = ({ range, setRange }) => {
  return (
    <Button
      content={
        range ? <FontAwesomeIcon icon={faCalendarDay} /> : <FontAwesomeIcon icon={faCalendarWeek} />
      }
      title={range ? 'Single Date' : 'Range of Dates'}
      onClick={() => setRange(!range)}
    />
  );
};
