import { SingleDayDataPoint } from '../src/charts/types';
import { SingleDayAPIOptions } from '../types/api';
import { APP_DATA_BASE_PATH } from '../utils/constants';

// Date isn't really optional. If date is not set this query will be disabled.
// Just setting it as optional because dashboard loads this before user input.
export const fetchSingleDayData = (name: string, options: SingleDayAPIOptions, date?: string,): Promise<SingleDayDataPoint[]> => {
    const url = new URL(`${APP_DATA_BASE_PATH}/${name}/${date}`, window.location.origin);

    Object.entries(options).forEach(([key, value]) => {
        value?.forEach((subvalue) => url.searchParams.append(key, subvalue))
    });
    return fetch(url).then((resp) => resp.json());
};