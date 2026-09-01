import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '../../common/components/ui/sidebar';
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
    // No collapsible mode and no SidebarRail: the original sidebar was fixed, and the rail's
    // resize/collapse hit-target along the whole right edge was catching stray clicks near the
    // footer, hiding the donate button behind a collapsed state nobody meant to trigger.
    <Sidebar collapsible="none" {...props}>
      <SidebarHeader className="overflow-hidden px-3 py-3">
        <Link href="/" onClick={close} className="flex h-6 items-center">
          <Image
            src="/TMLogo.png"
            alt="TransitMatters"
            width={3189}
            height={299}
            priority
            className="h-5 w-auto"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavSystem close={close} />
        <NavLines close={close} />
      </SidebarContent>
      <SidebarFooter>
        <ExtraMenuItems />
      </SidebarFooter>
    </Sidebar>
  );
};
