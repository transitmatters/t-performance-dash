import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay } from '@fortawesome/free-solid-svg-icons';
import { useDelimitatedRoute } from '../../utils/router';
import { TODAY_STRING } from '../../constants/dates';

export const SameDayNotice: React.FC = () => {
  const {
    query: { date, endDate },
  } = useDelimitatedRoute();
  const isToday = date === TODAY_STRING || endDate === TODAY_STRING;

  if (isToday) {
    return (
      <div className={'flex items-center'}>
        <FontAwesomeIcon icon={faCalendarDay} size={'lg'} />
        <div className={'mx-3 my-2 text-sm italic'}>
          <p>Data from today may not be complete. Data comes in with a delay of up to two hours</p>
        </div>
      </div>
    );
  }
  return null;
};
