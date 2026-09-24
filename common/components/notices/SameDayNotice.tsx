import React from 'react';
import { useDelimitatedRoute } from '../../utils/router';
import { TODAY_STRING } from '../../constants/dates';
import { Notice } from './Notice';

export const SameDayNotice: React.FC = () => {
  const {
    query: { date, endDate },
  } = useDelimitatedRoute();
  const isToday = date === TODAY_STRING || endDate === TODAY_STRING;

  if (!isToday) {
    return null;
  }

  return (
    <Notice variant="warning">
      Data from today may be incomplete — it arrives with a delay of up to two hours.
    </Notice>
  );
};
