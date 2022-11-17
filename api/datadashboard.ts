import { SingleDayDataPoint } from '../src/charts/types';
import { APP_DATA_BASE_PATH } from '../utils/constants';


export const fetchSingleDayData = (name: string, date: string, options): Promise<SingleDayDataPoint[]> => {
  const url = new URL(`/${name}/${date}`, window.location.origin);
  
  Object.entries(options).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((subvalue) => url.searchParams.append(key, subvalue));
    } else {
      url.searchParams.append(key, value);
    }
  });

  return fetch(url.toString()).then((resp) => resp.json());

  
};