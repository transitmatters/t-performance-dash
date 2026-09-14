import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../components/ui/sidebar';
import { AppSidebar } from '../../modules/navigation/AppSidebar';
import { useDelimitatedRoute } from '../utils/router';

interface NavLayoutProps {
  children: React.ReactNode;
}

export const NavLayout: React.FC<NavLayoutProps> = ({ children }) => {
  // "The Living Map": the active line themes the whole shell (see [data-line] in globals.css).
  const { line } = useDelimitatedRoute();
  return (
    <SidebarProvider data-line={line ?? undefined}>
      <AppSidebar />
      {/* The content ground sits one step back from the cards so they lift off it. `bg-stone-100`
          alone pinned that ground to light in both themes, which left every translucent surface on
          top of it (the amber notices especially) compositing against a near-white backdrop in dark
          mode. Pair it with the dark token so the ground flips with the theme. */}
      <SidebarInset className="dark:bg-background min-w-0 bg-stone-100">
        {/* The sidebar becomes a sheet below md, so it needs a trigger of its own.
            h-12 is load-bearing: MobileHeader (modules/dashboard/MobileHeader.tsx) stacks its own
            sticky header at top-12, so this one must be exactly 48px or a gap opens between them. */}
        <header className="bg-sidebar text-sidebar-foreground sticky top-0 z-20 flex h-12 items-center gap-2 border-b px-2 md:hidden">
          <SidebarTrigger />
          <Link href="/" className="flex items-center">
            <Image src="/TMLogo.png" alt="TransitMatters" width={208} height={19.5} />
          </Link>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};
