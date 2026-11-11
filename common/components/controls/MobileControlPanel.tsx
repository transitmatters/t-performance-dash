import classNames from 'classnames';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSliders } from '@fortawesome/free-solid-svg-icons';
import { LINE_COLORS } from '../../constants/colors';
import type { Line } from '../../types/lines';
import { usePageHeading } from '../../hooks/usePageHeading';
import { useMajorEventsStore } from '../../state/majorEventsStore';
import { FOCUS_RING_ON_SURFACE, lineColorBackground } from '../../styles/general';
import { readableOn } from '../../utils/general';
import { ToggleSwitch } from '../inputs/ToggleSwitch';
import { useDateSummary } from '../inputs/DateSelection/useDateSummary';
import type { StationSelectorWidgetProps } from '../widgets/StationSelectorWidget';
import { StationSelectorWidget, useTripStations } from '../widgets/StationSelectorWidget';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import type { ControlPanelProps } from './ControlPanel';
import { queryTypeFor, showsDates, showsDisplayMenu, showsTripControls } from './ControlPanel';
import { DateControl } from './DateControl';
import { HeaderFilterSlot } from './HeaderFilters';
import { RouteSelector } from './RouteSelector';
import { TripModeToggle } from './TripModeToggle';

/** The modes whose pages are per route, so the sheet offers RouteSelector. */
const ROUTED_LINES: Line[] = ['line-bus', 'line-commuter-rail', 'line-ferry'];

const Section = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-xs font-semibold tracking-wide text-stone-600 uppercase dark:text-stone-400">
      {label}
    </span>
    {children}
  </div>
);

/** The trip's two ends by name. Also fills in default stations while the picker sits closed. */
const TripStops = ({ line, busRoute, crRoute, ferryRoute }: StationSelectorWidgetProps) => {
  const { fromStation, toStation } = useTripStations({ line, busRoute, crRoute, ferryRoute });
  if (!fromStation || !toStation) return null;
  return (
    <span className="truncate text-xs text-stone-600 dark:text-stone-400">
      {fromStation.stop_name} → {toStation.stop_name}
    </span>
  );
};

/**
 * On phones the controls collapse to a one-line summary at the bottom of the screen; Edit opens
 * them all in a sheet.
 */
export const MobileControlPanel = ({
  dateStoreSection,
  line,
  busRoute,
  crRoute,
  ferryRoute,
  hasStationStore,
  hasRouteSelector = true,
}: ControlPanelProps) => {
  const [open, setOpen] = useState(false);
  const queryType = queryTypeFor(dateStoreSection);
  const { presetName, dates } = useDateSummary(queryType);
  const { lineName, pageTitle } = usePageHeading();
  const showEvents = useMajorEventsStore((state) => state.showEvents);
  const setShowEvents = useMajorEventsStore((state) => state.setShowEvents);
  const trips = showsTripControls(dateStoreSection, line, hasStationStore);
  const hasDates = showsDates(dateStoreSection, line);
  const editNeedsDarkText = readableOn(LINE_COLORS[line ?? 'default']) === 'dark';

  const headline = hasDates ? (presetName ?? dates) : pageTitle;
  const detail = hasDates && presetName ? dates : undefined;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="fixed bottom-0 z-20 flex w-full flex-row items-center gap-3 border-t border-stone-200 bg-white px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-stone-900 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-sm font-semibold">{headline}</span>
          {trips && line ? (
            <TripStops line={line} busRoute={busRoute} crRoute={crRoute} ferryRoute={ferryRoute} />
          ) : (
            detail && (
              <span className="truncate text-xs text-stone-600 dark:text-stone-400">{detail}</span>
            )
          )}
        </div>
        <SheetTrigger
          className={classNames(
            'flex h-10 shrink-0 items-center gap-x-2 rounded-lg px-4 text-sm font-semibold focus-visible:ring-offset-2',
            FOCUS_RING_ON_SURFACE,
            lineColorBackground[line ?? 'DEFAULT'],
            editNeedsDarkText ? 'text-stone-900' : 'text-white'
          )}
        >
          <FontAwesomeIcon icon={faSliders} className="size-3.5" aria-hidden />
          Edit
        </SheetTrigger>
      </div>
      <SheetContent side="bottom" className="max-h-[88dvh] gap-0 overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>
            {lineName} · {pageTitle}
          </SheetTitle>
          <SheetDescription className="sr-only">Change what this page shows.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4">
          {hasRouteSelector && line && ROUTED_LINES.includes(line) && (
            <Section label="Route">
              <RouteSelector />
            </Section>
          )}
          {trips && line && (
            <Section label="Stations">
              <StationSelectorWidget
                line={line}
                busRoute={busRoute}
                crRoute={crRoute}
                ferryRoute={ferryRoute}
              />
            </Section>
          )}
          {trips && (
            <Section label="Trip view">
              <TripModeToggle />
            </Section>
          )}
          {hasDates && (
            <Section label="Dates">
              <DateControl dateStoreSection={dateStoreSection} queryType={queryType} />
            </Section>
          )}
          <HeaderFilterSlot className="flex flex-col gap-4 empty:hidden" />
          {showsDisplayMenu(dateStoreSection) && (
            <ToggleSwitch
              enabled={showEvents}
              setEnabled={setShowEvents}
              label="Show major events on charts"
            />
          )}
        </div>
        <SheetFooter>
          <SheetClose
            className={classNames(
              'h-11 rounded-lg text-sm font-semibold focus-visible:ring-offset-2',
              FOCUS_RING_ON_SURFACE,
              lineColorBackground[line ?? 'DEFAULT'],
              editNeedsDarkText ? 'text-stone-900' : 'text-white'
            )}
          >
            Done
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
