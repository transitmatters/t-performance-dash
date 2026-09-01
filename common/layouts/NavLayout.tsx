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
      <SidebarInset className="min-w-0 bg-stone-100">
        {/* The sidebar becomes a sheet below md, so it needs a trigger of its own. */}
        <header className="bg-sidebar text-sidebar-foreground sticky top-0 z-20 flex items-center gap-2 border-b px-2 py-1.5 md:hidden">
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
