import type React from 'react';
import { useQueryParams } from '../../../common/utils/router';
import { ServiceAndRidershipContext } from './context';

type Props = {
  children: React.ReactNode;
};

export const ServiceAndRidershipProvider = (props: Props) => {
  const { children } = props;
  const { startDate, endDate } = useQueryParams() as Record<string, string>;

  return (
    <ServiceAndRidershipContext.Provider value={{ startDate, endDate }}>
      {children}
    </ServiceAndRidershipContext.Provider>
  );
};
