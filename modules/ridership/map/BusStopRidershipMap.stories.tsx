import { LINE_OBJECTS } from '../../../common/constants/lines';
import { BusStopRidershipMap } from './BusStopRidershipMap';

export default {
  title: 'BusStopRidershipMap',
  component: BusStopRidershipMap,
};

// SL4 inbound, Fall 2025
const stops = [
  { stop_id: '64', boardings: 960.2, alightings: 0.0 },
  { stop_id: '3', boardings: 115.8, alightings: 40.8 },
  { stop_id: '4', boardings: 111.1, alightings: 93.6 },
  { stop_id: '5', boardings: 218.8, alightings: 81.5 },
  { stop_id: '1787', boardings: 192.2, alightings: 61.0 },
  { stop_id: '1788', boardings: 263.6, alightings: 118.7 },
  { stop_id: '5093', boardings: 231.0, alightings: 105.5 },
  { stop_id: '5095', boardings: 169.5, alightings: 160.8 },
  { stop_id: '15095', boardings: 90.2, alightings: 116.2 },
  { stop_id: '6565', boardings: 71.5, alightings: 499.1 },
  { stop_id: '6537', boardings: 44.7, alightings: 464.8 },
  { stop_id: '6538', boardings: 0.0, alightings: 740.0 },
];

const stopNames: Record<string, string> = {
  '64': 'Nubian',
  '3': 'Washington St @ Melnea Cass Blvd - Silver Line',
  '4': 'Washington St @ Lenox St',
  '5': 'Washington St @ Massachusetts Ave',
  '1787': 'Washington St @ Worcester St',
  '1788': 'Washington St @ E Newton St',
  '5093': 'Washington St @ Union Pk',
  '5095': 'Washington St @ E Berkeley St',
  '15095': 'Washington St @ Herald St',
  '6565': 'Washington St @ Tufts Med Ctr',
  '6537': 'Washington St @ Essex St',
  '6538': 'Essex St @ Atlantic Ave',
};

const SL4 = ({ direction }: { direction: 'horizontal' | 'vertical' }) => (
  <BusStopRidershipMap
    stops={stops}
    stopNames={stopNames}
    color={LINE_OBJECTS['line-bus'].color}
    direction={direction}
  />
);

export const Horizontal = () => <SL4 direction="horizontal" />;

export const Vertical = () => <SL4 direction="vertical" />;
