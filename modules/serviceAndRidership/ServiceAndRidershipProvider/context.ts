import React from 'react';

import type { ServiceAndRidershipContext as TServiceAndRidershipContext } from '../types';

export const ServiceAndRidershipContext = React.createContext<TServiceAndRidershipContext>({
  startDate: undefined,
  endDate: undefined,
});
