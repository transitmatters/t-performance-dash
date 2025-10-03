import type React from 'react';
import { useRouter } from 'next/router';
import { ServiceAndRidershipContext } from './context';

type Props = {
  children: React.ReactNode;
};

export const ServiceAndRidershipProvider = (props: Props) => {
  const { children } = props;
  const { query, isReady } = useRouter();

  if (!isReady) {
    return null;
  }

  const { startDate, endDate } = query as Record<string, string>;

  return (
    <ServiceAndRidershipContext.Provider value={{ startDate, endDate }}>
      {children}
    </ServiceAndRidershipContext.Provider>
  );
};
