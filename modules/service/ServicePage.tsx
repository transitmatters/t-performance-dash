'use client';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ServiceDetails } from './ServiceDetails';
import { CommuterRailService } from './regionalRail/CommuterRailService';

/** Rapid transit compares delivered trips to the schedule; Commuter Rail measures the schedule against Regional Rail. */
export function ServicePage() {
  const { line } = useDelimitatedRoute();
  return line === 'line-commuter-rail' ? <CommuterRailService /> : <ServiceDetails />;
}
