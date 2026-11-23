'use client';
import { useLinePage } from '../../common/hooks/usePageParams';
import { ServiceDetails } from './ServiceDetails';
import { CommuterRailService } from './regionalRail/CommuterRailService';

/** Rapid transit compares delivered trips to the schedule; Commuter Rail measures the schedule against Regional Rail. */
export function ServicePage() {
  const { line } = useLinePage();
  return line === 'line-commuter-rail' ? <CommuterRailService /> : <ServiceDetails />;
}
