import type { ReactNode } from 'react';
import { ToggleControl } from '../../hooks/useChartToggle';
import { useGreenBranch } from '../../hooks/useGreenBranch';
import {
  useCrServiceScope,
  useFleetScope,
  useReliabilityDirection,
  useServiceDay,
} from '../../hooks/usePageFilters';
import { useDelimitatedRoute } from '../../utils/router';
import { BranchSelector } from '../inputs/BranchSelector';

const FilterGroup = ({ label, children }: { label: string; children: ReactNode }) => (
  <div
    role="group"
    aria-label={label}
    className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-2"
  >
    <span
      aria-hidden
      className="text-xs font-semibold tracking-wide text-stone-600 uppercase dark:text-stone-400"
    >
      {label}
    </span>
    <div className="md:shrink-0">{children}</div>
  </div>
);

const ReliabilityDirectionFilter = () => {
  const { value, setValue, options } = useReliabilityDirection();
  return (
    <FilterGroup label="Direction">
      <ToggleControl value={value} options={options} onChange={setValue} variant="toggle" />
    </FilterGroup>
  );
};

const GreenBranchFilter = () => {
  const { routeId, setRouteId } = useGreenBranch();
  return (
    <FilterGroup label="Branch">
      <BranchSelector routeId={routeId} setRouteId={setRouteId} />
    </FilterGroup>
  );
};

const CrServiceFilters = () => {
  const { crRoute } = useDelimitatedRoute().query;
  const scope = useCrServiceScope();
  const day = useServiceDay();
  return (
    <>
      {crRoute && (
        <FilterGroup label="Showing">
          <ToggleControl value={scope.value} options={scope.options} onChange={scope.setValue} />
        </FilterGroup>
      )}
      <FilterGroup label="Day">
        <ToggleControl value={day.value} options={day.options} onChange={day.setValue} />
      </FilterGroup>
    </>
  );
};

const FleetScopeFilter = () => {
  const { value, setValue, options } = useFleetScope();
  return (
    <FilterGroup label="Showing">
      <ToggleControl value={value} options={options} onChange={setValue} />
    </FilterGroup>
  );
};

/** The filters that change everything on the current page, shown in the header beside the dates. */
export const PageFilters = () => {
  const {
    page,
    line,
    query: { busRoute, crRoute },
  } = useDelimitatedRoute();

  switch (page) {
    case 'reliability': {
      // Only subway headways are split by direction.
      const isSubway =
        line !== undefined &&
        line !== 'line-bus' &&
        line !== 'line-RIDE' &&
        line !== 'line-commuter-rail';
      return isSubway ? <ReliabilityDirectionFilter /> : null;
    }
    case 'delays':
    case 'predictions':
      return line === 'line-green' ? <GreenBranchFilter /> : null;
    case 'service':
      return line === 'line-commuter-rail' ? <CrServiceFilters /> : null;
    case 'fleet': {
      const hasRoute =
        (line === 'line-bus' && busRoute) || (line === 'line-commuter-rail' && crRoute);
      return hasRoute ? <FleetScopeFilter /> : null;
    }
    default:
      return null;
  }
};
