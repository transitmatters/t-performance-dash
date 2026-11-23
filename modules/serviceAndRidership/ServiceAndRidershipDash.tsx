import { useServiceAndRidershipDashboard } from '../../common/api/hooks/serviceAndRidership';

import { LineGrid } from './LineGrid';
import { SummaryCard } from './SummaryCard';

export function ServiceAndRidershipDash() {
  const { data } = useServiceAndRidershipDashboard();

  return (
    <>
      <div className="flex w-full flex-col gap-4">
        {data && <SummaryCard {...data} />}
        {data && <LineGrid {...data} />}
      </div>
    </>
  );
}
