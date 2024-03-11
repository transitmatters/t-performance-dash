import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay } from '@fortawesome/free-solid-svg-icons';
import { useDelimitatedRoute } from '../../utils/router';
import { TODAY_STRING } from '../../constants/dates';

export const SameDayNotice: React.FC = () => {
  const {
    line,
    query: { date, endDate },
  } = useDelimitatedRoute();
  const isToday = date === TODAY_STRING || endDate === TODAY_STRING;

  if (isToday && line !== 'line-commuter-rail') {
    return (
      <div className={'flex items-center'}>
        <FontAwesomeIcon icon={faCalendarDay} size={'lg'} />
        <div className={'mx-3 my-2 text-sm italic'}>
          <p>
            Due to data not being cleaned yet, today's data may not be fully accurate and may look
            messy.
          </p>
          <p>Data is cleaned up overnight and should be more accurate tomorrow.</p>
        </div>
      </div>
    );
  }
  return null;
};
