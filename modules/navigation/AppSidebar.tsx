import React from 'react';
import { Link } from '../../common/components/general/Link';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from '../../common/components/ui/sidebar';
import { isBetaHost } from '../../common/utils/constants';
import { NavLines } from './NavLines';
import { NavSystem } from './NavSystem';
import { ExtraMenuItems } from './ExtraMenuItems';

export const AppSidebar: React.FC<React.ComponentProps<typeof Sidebar>> = ({ ...props }) => {
  const { isMobile, setOpenMobile } = useSidebar();
  // On mobile the sidebar is a sheet, so navigating should dismiss it.
  const close = React.useCallback(() => {
    if (isMobile) setOpenMobile(false);
  }, [isMobile, setOpenMobile]);

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border" {...props}>
      <SidebarHeader className="flex-row items-center justify-between overflow-hidden px-3 py-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
        <Link
          href="/"
          onClick={close}
          className="flex h-6 items-center group-data-[collapsible=icon]:hidden"
        >
          <img
            src="/TMLogo.svg"
            alt="TransitMatters"
            width={3189}
            height={299}
            fetchPriority="high"
            className="h-5 w-auto"
          />
        </Link>
        {/* Sheet on mobile has its own trigger in NavLayout's header. */}
        <SidebarTrigger className="hidden shrink-0 md:inline-flex" />
      </SidebarHeader>
      <SidebarContent>
        <NavSystem close={close} />
        <NavLines close={close} />
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        {isBetaHost() && (
          <p className="text-sidebar-foreground/60 px-2 text-xs">
            Beta: usage data collected via Datadog
          </p>
        )}
        <ExtraMenuItems />
      </SidebarFooter>
    </Sidebar>
  );
};
