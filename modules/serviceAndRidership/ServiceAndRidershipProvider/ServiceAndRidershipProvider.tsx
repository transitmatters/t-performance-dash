import type React from 'react';
import { useSearch } from '@tanstack/react-router';
import { ServiceAndRidershipContext } from './context';

type Props = {
  children: React.ReactNode;
};

export const ServiceAndRidershipProvider = (props: Props) => {
  const { children } = props;
  const { startDate, endDate } = useSearch({ from: '/system/ridership' });

  return (
    <ServiceAndRidershipContext.Provider value={{ startDate, endDate }}>
      {children}
    </ServiceAndRidershipContext.Provider>
  );
};
