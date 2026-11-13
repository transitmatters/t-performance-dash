import type { ReactNode } from 'react';
import { Link } from '../components/general/Link';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../components/ui/sidebar';
import { AppSidebar } from '../../modules/navigation/AppSidebar';
import { CommandPalette } from '../../modules/commandPalette/CommandPalette';
import { HeaderCommandTrigger } from '../../modules/commandPalette/CommandPaletteTrigger';
import { useCommandPaletteShortcut } from '../../modules/commandPalette/useCommandPaletteShortcut';
import { useDelimitatedRoute } from '../utils/router';

interface NavLayoutProps {
  children: ReactNode;
}

export const NavLayout = ({ children }: NavLayoutProps) => {
  // "The Living Map": the active line themes the whole shell (see [data-line] in globals.css).
  const { colorKey } = useDelimitatedRoute();
  useCommandPaletteShortcut();
  return (
    <SidebarProvider data-line={colorKey}>
      <AppSidebar />
      {/* The content ground sits one step back from the cards so they lift off it. `bg-stone-100`
          alone pinned that ground to light in both themes, which left every translucent surface on
          top of it (the amber notices especially) compositing against a near-white backdrop in dark
          mode. Pair it with the dark token so the ground flips with the theme. */}
      <SidebarInset className="min-w-0 bg-stone-100 dark:bg-background">
        {/* The sidebar becomes a sheet below md, so it needs a trigger of its own.
            h-12 is load-bearing: MobileHeader (modules/dashboard/MobileHeader.tsx) stacks its own
            sticky header at top-12, so this one must be exactly 48px or a gap opens between them. */}
        <header className="sticky top-0 z-20 flex h-12 items-center gap-2 border-b bg-sidebar px-2 text-sidebar-foreground md:hidden">
          <SidebarTrigger />
          <Link href="/" className="flex items-center">
            <img src="/TMLogo.svg" alt="TransitMatters" width={208} height={19.5} />
          </Link>
          <HeaderCommandTrigger />
        </header>
        {children}
        <CommandPalette />
      </SidebarInset>
    </SidebarProvider>
  );
};
