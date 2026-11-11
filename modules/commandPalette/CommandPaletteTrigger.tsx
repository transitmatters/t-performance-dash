import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../common/components/ui/button';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../../common/components/ui/sidebar';
import { useCommandPaletteStore } from './store';
import { shortcutLabel } from './useCommandPaletteShortcut';

/** The sidebar's search button. In the icon rail it shrinks to the magnifier, with a tooltip. */
export const SidebarCommandTrigger = () => {
  const setOpen = useCommandPaletteStore((state) => state.setOpen);
  const shortcut = shortcutLabel();
  return (
    <SidebarGroup className="pb-0">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => setOpen(true)}
            tooltip={`Search (${shortcut})`}
            className="border border-sidebar-border bg-sidebar-accent/60 text-sidebar-foreground/80 hover:text-sidebar-foreground"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
            <span className="truncate">Search…</span>
            <kbd className="ml-auto rounded border border-sidebar-border px-1 font-sans text-[11px] text-sidebar-foreground/70">
              {shortcut}
            </kbd>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
};

/** The mobile header's search button, where the sidebar is a closed sheet. */
export const HeaderCommandTrigger = () => {
  const setOpen = useCommandPaletteStore((state) => state.setOpen);
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => setOpen(true)}
      aria-label="Search lines, routes and stations"
      className="ml-auto hover:bg-sidebar-accent hover:text-sidebar-foreground"
    >
      <FontAwesomeIcon icon={faMagnifyingGlass} />
    </Button>
  );
};
