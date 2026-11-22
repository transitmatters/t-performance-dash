import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

import { Button } from '../../../common/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '../../../common/components/ui/input-group';
import { ToggleGroup, ToggleGroupItem } from '../../../common/components/ui/toggle-group';
import { LineCard } from '../LineCard';
import type { LineData, SummaryData } from '../types';

import { useInfiniteScroll } from './useInfiniteScroll';
import type { Sort, SortFn } from './sorting';
import { sortFunctions } from './sorting';

type Props = {
  lineData: Record<string, LineData>;
  // eslint-disable-next-line react-x/no-unused-props -- we'll use this eventually
  summaryData: SummaryData;
  filter?: (r: LineData) => boolean;
};

type LineKindOption = 'all' | 'bus' | 'rapid-transit' | 'regional-rail' | 'boat';
type DisplayOption = 'grid' | 'rows';

const LINE_KIND_OPTIONS: [LineKindOption, string][] = [
  ['all', 'All'],
  ['rapid-transit', 'Rapid transit'],
  ['bus', 'Bus'],
  ['regional-rail', 'Commuter Rail'],
  ['boat', 'Ferry'],
];

const pagination = 12;
const defaultFilter = (x: LineData) => !!x;

const getDocumentElement = () => {
  if (typeof document !== 'undefined') {
    return document.documentElement;
  }
  return null;
};

const sortOnKey = (data: LineData[], sortFn: SortFn) => {
  const keys: Record<string, number> = {};
  data.forEach((line) => {
    keys[line.id] = sortFn(line);
  });
  return data.sort((a, b) => {
    const ka = keys[a.id];
    const kb = keys[b.id];
    if (ka === kb) {
      return 0;
    } else {
      return ka > kb ? 1 : -1;
    }
  });
};

/** Matches a route number ("39", "SL4"), a line or route name ("Harvard", "Fitchburg"), or an id. */
const matchesQuery = (lineData: LineData, query: string) => {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [lineData.shortName, lineData.longName, lineData.id].some((text) =>
    text?.toLowerCase().includes(needle)
  );
};

const matchesLineKindOption = (lineData: LineData, option: LineKindOption) => {
  const { lineKind } = lineData;
  if (option === 'all') {
    return true;
  }
  if (option === 'regional-rail' || option === 'bus' || option === 'boat') {
    return lineKind === option;
  }
  return lineKind !== 'regional-rail' && lineKind !== 'bus' && lineKind !== 'boat'; // Sorry
};

const getTailwindClassForDisplayOption = (display: DisplayOption) => {
  return display === 'grid'
    ? 'w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'
    : 'w-full flex flex-col gap-4';
};

export const LineGrid = (props: Props) => {
  const { lineData: lineData, filter = defaultFilter } = props;
  const [limit, setLimit] = useState(pagination);
  const [query, setQuery] = useState('');
  const [kindOption, setKindOption] = useState<LineKindOption>('all');

  // NOTE(idr): These are migrated from the Covid Recovery Dash and are unused at the moment
  // but we could eventually add controls for them.
  const [sort] = useState<Sort | ''>('');
  const [display] = useState<DisplayOption>('grid');

  const searched = useMemo(
    () => Object.values(lineData).filter((line) => filter(line) && matchesQuery(line, query)),
    [lineData, filter, query]
  );

  const availableItems = useMemo(
    () =>
      sortOnKey(
        searched.filter((line) => matchesLineKindOption(line, kindOption)),
        sortFunctions[sort || 'kind']
      ),
    [searched, kindOption, sort]
  );

  const shownItems = useMemo(() => availableItems.slice(0, limit), [availableItems, limit]);

  useInfiniteScroll({
    element: getDocumentElement(),
    enabled: limit < availableItems.length,
    scrollTolerance: 300,
    onRequestMoreItems: () => setLimit((l) => l + pagination),
  });

  const updateQuery = (value: string) => {
    setQuery(value);
    setLimit(pagination);
  };
  const updateKind = (value: LineKindOption) => {
    setKindOption(value);
    setLimit(pagination);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <InputGroup className="h-9 bg-background sm:max-w-xs">
          <InputGroupAddon>
            <Search aria-hidden />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="Search routes and lines"
            aria-label="Search routes and lines"
          />
        </InputGroup>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={kindOption}
          // Radix clears the value when the active chip is pressed again; treat that as "All".
          onValueChange={(value) => updateKind((value || 'all') as LineKindOption)}
          aria-label="Filter by mode"
          // The shadcn gap utility doesn't resolve in this Tailwind build (see ButtonGroup).
          className="flex-wrap justify-start gap-1.5"
        >
          {LINE_KIND_OPTIONS.map(([option, label]) => (
            <ToggleGroupItem
              key={option}
              value={option}
              className="data-[state=on]:border-foreground/40"
            >
              {label}
              <span className="text-muted-foreground tabular-nums">
                {searched.filter((line) => matchesLineKindOption(line, option)).length}
              </span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      {shownItems.length ? (
        <div className={getTailwindClassForDisplayOption(display)}>
          {shownItems.map((item) => (
            <LineCard lineData={item} key={item.id} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl py-10 text-sm text-muted-foreground ring-1 ring-foreground/10">
          No routes or lines match.
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              updateQuery('');
              updateKind('all');
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
};
