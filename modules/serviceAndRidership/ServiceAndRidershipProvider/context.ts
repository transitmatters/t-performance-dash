import { createContext } from 'react';

import type { ServiceAndRidershipContext as TServiceAndRidershipContext } from '../types';

export const ServiceAndRidershipContext = createContext<TServiceAndRidershipContext>({
  startDate: undefined,
  endDate: undefined,
});
