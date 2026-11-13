import classNames from 'classnames';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSliders } from '@fortawesome/free-solid-svg-icons';
import { usePageControls } from '../../hooks/usePageControls';
import { usePageHeading } from '../../hooks/usePageHeading';
import { useMajorEventsStore } from '../../state/majorEventsStore';
import { FOCUS_RING_ON_SURFACE, lineColorBackground, textOnLineColor } from '../../styles/general';
import { ToggleSwitch } from '../inputs/ToggleSwitch';
import { DateSelection } from '../inputs/DateSelection/DateSelection';
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
import { LabeledControl } from './LabeledControl';
import { PageFilters } from './PageFilters';
import { RouteSelector } from './RouteSelector';
import { TripModeToggle } from './TripModeToggle';

const DETAIL_TEXT = 'truncate text-xs text-stone-600 dark:text-stone-400';

/** The trip's two ends by name. Also fills in default stations while the picker sits closed. */
const TripStops = (props: StationSelectorWidgetProps) => {
  const { fromStation, toStation } = useTripStations(props);
  if (!fromStation || !toStation) return null;
  return (
    <span className={DETAIL_TEXT}>
      {fromStation.stop_name} → {toStation.stop_name}
    </span>
  );
};

/**
 * On phones the controls collapse to a one-line summary at the bottom of the screen; Edit opens
 * them all in a sheet.
 */
export const MobileControlPanel = () => {
  const [open, setOpen] = useState(false);
  const {
    line,
    busRoute,
    crRoute,
    ferryRoute,
    queryType,
    showRouteSelector,
    showTripControls,
    showDateControl,
    showDisplayMenu,
  } = usePageControls();
  const { presetName, dates } = useDateSummary(queryType);
  const { lineName, pageTitle } = usePageHeading();
  const { showEvents, setShowEvents } = useMajorEventsStore();
  const stationProps =
    showTripControls && line ? { line, busRoute, crRoute, ferryRoute } : undefined;

  const headline = showDateControl ? (presetName ?? dates) : pageTitle;
  const detail = showDateControl && presetName ? dates : undefined;
  const lineButton = classNames(
    'rounded-lg text-sm font-semibold focus-visible:ring-offset-2',
    FOCUS_RING_ON_SURFACE,
    lineColorBackground[line ?? 'DEFAULT'],
    textOnLineColor(line)
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="fixed bottom-0 z-20 flex w-full flex-row items-center gap-3 border-t border-stone-200 bg-white px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-stone-900 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-sm font-semibold">{headline}</span>
          {stationProps ? (
            <TripStops {...stationProps} />
          ) : (
            detail && <span className={DETAIL_TEXT}>{detail}</span>
          )}
        </div>
        <SheetTrigger
          className={classNames('flex h-10 shrink-0 items-center gap-x-2 px-4', lineButton)}
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
          {showRouteSelector && (
            <LabeledControl label="Route">
              <RouteSelector />
            </LabeledControl>
          )}
          {stationProps && (
            <>
              <LabeledControl label="Stations">
                <StationSelectorWidget {...stationProps} />
              </LabeledControl>
              <LabeledControl label="Trip view">
                <TripModeToggle />
              </LabeledControl>
            </>
          )}
          {showDateControl && (
            <LabeledControl label="Dates">
              <DateSelection type={queryType} />
            </LabeledControl>
          )}
          <div className="flex flex-col gap-4 empty:hidden">
            <PageFilters />
          </div>
          {showDisplayMenu && (
            <ToggleSwitch
              enabled={showEvents}
              setEnabled={setShowEvents}
              label="Show major events on charts"
            />
          )}
        </div>
        <SheetFooter>
          <SheetClose className={classNames('h-11', lineButton)}>Done</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
