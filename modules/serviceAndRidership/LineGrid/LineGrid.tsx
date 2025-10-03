import React, { useMemo, useState } from 'react';

import { LineCard } from '../LineCard';
import type { LineData, SummaryData } from '../types';

import { useInfiniteScroll } from './useInfiniteScroll';
import type { Sort, SortFn } from './sorting';
import { sortFunctions } from './sorting';

type Props = {
  lineData: Record<string, LineData>;
  // eslint-disable-next-line react/no-unused-prop-types -- we'll use this eventually
  summaryData: SummaryData;
  filter?: (r: LineData) => boolean;
};

type LineKindOption = 'all' | 'bus' | 'rapid-transit' | 'regional-rail' | 'boat';
type DisplayOption = 'grid' | 'rows';

const pagination = 12;
const defaultFilter = (x) => !!x;

const getDocumentElement = () => {
  if (typeof document !== 'undefined') {
    return document.documentElement;
  }
  return null;
};

const sortOnKey = (data: LineData[], sortFn: SortFn) => {
  const keys = {};
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

const matchesQuery = (lineData: LineData, query: string) => {
  const { id } = lineData;
  const title = lineData.shortName || lineData.longName;
  return !query || title?.toLowerCase().includes(query) || id.toLowerCase().includes(query);
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

// TODO(idr): Migrate sorting from CRD
const isRidershipSort = (sort: '' | Sort) => {
  return (
    sort === 'lowestRidershipFraction' ||
    sort === 'highestRidershipFraction' ||
    sort === 'lowestTotalRidership' ||
    sort === 'highestTotalRidership'
  );
};

const getTailwindClassForDisplayOption = (display: DisplayOption) => {
  return display === 'grid'
    ? 'w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4'
    : 'w-full flex flex-col gap-4';
};

export const LineGrid = (props: Props) => {
  const { lineData: lineData, filter = defaultFilter } = props;
  const [limit, setLimit] = useState(pagination);

  // NOTE(idr): These are migrated from the Covid Recovery Dash and are unused at the moment
  // but we could eventually add controls for them.
  const [query] = useState('');
  const [sort] = useState<Sort | ''>('');
  const [display] = useState<DisplayOption>('grid');
  const [kindOption] = useState<LineKindOption>('all');

  const availableItems = useMemo(() => {
    return sortOnKey(
      Object.values(lineData).filter(
        (lineData) =>
          filter(lineData) &&
          matchesQuery(lineData, query) &&
          matchesLineKindOption(lineData, kindOption)
      ),
      sortFunctions[sort || 'kind']
    );
  }, [lineData, filter, query, kindOption, sort]);

  const shownItems = useMemo(() => availableItems.slice(0, limit), [availableItems, limit]);

  useInfiniteScroll({
    element: getDocumentElement(),
    enabled: limit < availableItems.length,
    scrollTolerance: 300,
    onRequestMoreItems: () => setLimit((l) => l + pagination),
  });

  return (
    <div className={getTailwindClassForDisplayOption(display)}>
      {shownItems.map((item) => (
        <LineCard lineData={item} key={item.id} />
      ))}
    </div>
  );
};
