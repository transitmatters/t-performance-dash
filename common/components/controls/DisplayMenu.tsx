import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faSliders } from '@fortawesome/free-solid-svg-icons';
import { useMajorEventsStore } from '../../state/majorEventsStore';
import { FOCUS_RING_ON_SURFACE } from '../../styles/general';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

/** View options that change how charts draw, not what data they show. Remembered per browser. */
export const DisplayMenu = () => {
  const showEvents = useMajorEventsStore((state) => state.showEvents);
  const setShowEvents = useMajorEventsStore((state) => state.setShowEvents);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={classNames(
          'flex h-8 items-center gap-x-2 rounded-md border border-stone-200 px-3 text-sm text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800',
          FOCUS_RING_ON_SURFACE
        )}
      >
        <FontAwesomeIcon icon={faSliders} className="size-3.5" aria-hidden />
        Display
        <FontAwesomeIcon icon={faChevronDown} className="size-3 opacity-70" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Show on charts</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={showEvents}
          onCheckedChange={setShowEvents}
          // Keep the menu open so the change can be seen on the charts behind it.
          onSelect={(event) => event.preventDefault()}
          className="items-start"
        >
          <span className="flex flex-col">
            <span>Major events</span>
            <span className="text-xs text-muted-foreground">
              Shutdowns, diversions and other big service changes
            </span>
          </span>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
