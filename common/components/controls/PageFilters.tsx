import { ToggleControl } from '../../hooks/useChartToggle';
import { useGreenBranch } from '../../hooks/useGreenBranch';
import {
  useCrServiceScope,
  useFleetScope,
  useReliabilityDirection,
  useServiceDay,
} from '../../hooks/usePageFilters';
import { SUBWAY_LINES } from '../../types/lines';
import { useDelimitatedRoute } from '../../utils/router';
import { BranchSelector } from '../inputs/BranchSelector';
import { LabeledControl } from './LabeledControl';

interface OptionFilterProps<K extends string> {
  label: string;
  value: K;
  setValue: (value: K) => void;
  options: [K, string][];
  variant?: 'toggle' | 'select';
}

/** A filter hook's result (value, setValue, options) as a labelled control. */
const OptionFilter = <K extends string>({
  label,
  value,
  setValue,
  options,
  variant,
}: OptionFilterProps<K>) => (
  <LabeledControl label={label}>
    <ToggleControl value={value} options={options} onChange={setValue} variant={variant} />
  </LabeledControl>
);

const ReliabilityDirectionFilter = () => {
  const direction = useReliabilityDirection();
  return <OptionFilter label="Direction" variant="toggle" {...direction} />;
};

const GreenBranchFilter = () => {
  const { routeId, setRouteId } = useGreenBranch();
  return (
    <LabeledControl label="Branch">
      <BranchSelector routeId={routeId} setRouteId={setRouteId} />
    </LabeledControl>
  );
};

const CrServiceFilters = ({ hasRoute }: { hasRoute: boolean }) => {
  const scope = useCrServiceScope();
  const day = useServiceDay();
  return (
    <>
      {hasRoute && <OptionFilter label="Showing" {...scope} />}
      <OptionFilter label="Day" {...day} />
    </>
  );
};

const FleetScopeFilter = () => {
  const scope = useFleetScope();
  return <OptionFilter label="Showing" {...scope} />;
};

/** The filters that change everything on the current page, shown in the header beside the dates. */
export const PageFilters = () => {
  const {
    page,
    line,
    query: { busRoute, crRoute },
  } = useDelimitatedRoute();

  switch (page) {
    case 'reliability':
      // Only subway headways are split by direction.
      return line && SUBWAY_LINES.includes(line) ? <ReliabilityDirectionFilter /> : null;
    case 'delays':
    case 'predictions':
      return line === 'line-green' ? <GreenBranchFilter /> : null;
    case 'service':
      return line === 'line-commuter-rail' ? (
        <CrServiceFilters hasRoute={Boolean(crRoute)} />
      ) : null;
    case 'fleet': {
      const hasRoute =
        (line === 'line-bus' && busRoute) || (line === 'line-commuter-rail' && crRoute);
      return hasRoute ? <FleetScopeFilter /> : null;
    }
    default:
      return null;
  }
};
