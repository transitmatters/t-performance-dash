import React from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { getBusRoutes, getCommuterRailRoutes, getFerryRoutes } from '../../constants/stations';
import type { Line } from '../../types/lines';
import { COMMUTER_RAIL_LINE_NAMES, FERRY_LINE_NAMES } from '../../types/lines';
import {
  getBusRouteSelectionItemHref,
  getCommuterRailRouteSelectionItemHref,
  getFerryRouteSelectionItemHref,
  useDelimitatedRoute,
} from '../../utils/router';

/** Labels are what riders search by, and are unique, so they double as the combobox value. */
const optionsForLine = (line: Line): { key: string; label: string }[] => {
  switch (line) {
    case 'line-bus':
      return getBusRoutes().map((key) => ({ key, label: `Route ${key}` }));
    case 'line-commuter-rail':
      return getCommuterRailRoutes().map((key) => ({
        key,
        label: COMMUTER_RAIL_LINE_NAMES[key] ?? key,
      }));
    case 'line-ferry':
      return getFerryRoutes().map((key) => ({ key, label: FERRY_LINE_NAMES[key] ?? key }));
    default:
      return [];
  }
};

/**
 * Route selection for the modes that have one. It sits with the other page controls rather than in
 * the nav: picking a route parameterizes the current page, it doesn't navigate somewhere new.
 *
 * Built on Popover + Command (same pattern as StationSelector) rather than the base-ui Combobox
 * primitive: the Combobox's own positioner had a real bug — with collision-avoidance flipping
 * disabled it would drift the popup continuously down the page at a constant velocity, tied to a
 * broken ref forward inside its focus manager. Popover uses Radix's positioning, which every other
 * dropdown in this app already relies on without issue, and Command's list is a plain fixed-height
 * cmdk list with no positioning logic of its own — nothing here for either to fight over.
 */
export const RouteSelector: React.FC = () => {
  const route = useDelimitatedRoute();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const { line } = route;
  const options = React.useMemo(() => (line ? optionsForLine(line) : []), [line]);

  if (!line || options.length === 0) return null;

  const selectedKey = route.query.busRoute ?? route.query.crRoute ?? route.query.ferryRoute;
  const selected = options.find((option) => option.key === selectedKey);

  const hrefFor = (key: string) => {
    switch (line) {
      case 'line-commuter-rail':
        return getCommuterRailRouteSelectionItemHref(key, route);
      case 'line-ferry':
        return getFerryRouteSelectionItemHref(key, route);
      default:
        return getBusRouteSelectionItemHref(key, route);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-expanded={open}
          aria-label="Select route"
          className="focus-visible:border-ring focus-visible:ring-ring/50 flex h-7 w-44 items-center justify-between gap-x-2 rounded-md border border-transparent bg-white px-3 text-sm text-stone-900 outline-none hover:bg-stone-50 focus-visible:ring-3"
        >
          <span className="truncate">{selected?.label ?? 'Select route'}</span>
          <FontAwesomeIcon icon={faChevronDown} className="size-3 shrink-0 text-stone-500" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <Command>
          <CommandInput placeholder="Search routes..." />
          <CommandList>
            <CommandEmpty>No matching route.</CommandEmpty>
            {options.map((option) => (
              <CommandItem
                key={option.key}
                value={option.label}
                onSelect={() => {
                  setOpen(false);
                  if (option.key !== selectedKey) router.push(hrefFor(option.key));
                }}
              >
                <FontAwesomeIcon
                  icon={faCheck}
                  className={
                    option.key === selectedKey ? 'size-3.5 opacity-100' : 'size-3.5 opacity-0'
                  }
                />
                <span className="truncate">{option.label}</span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
