import { useContext } from 'react';

import { ServiceAndRidershipContext } from './ServiceAndRidershipProvider/context';

export const useServiceAndRidershipContext = () => {
  return useContext(ServiceAndRidershipContext);
};
