import React from 'react';
import { useDelimitatedRoute } from '../../common/utils/router';
import type { Tab } from '../../common/types/router';
import { BusNavMenu } from './BusNavMenu';
import { SubwayNavMenu } from './SubwayNavMenu';
import { SystemNavMenu } from './SystemNavMenu';
import Link from 'next/link';
import { NavSection } from '../../common/components/nav/NavSection';
import { SubwaySection } from '../../common/components/nav/SubwaySection';
import { BusSection } from '../../common/components/nav/BusSection';

interface SideNavigationProps {
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SideNavigation: React.FC<SideNavigationProps> = ({ setSidebarOpen }) => {
  return (
    <nav className="flex flex-1 flex-col pb-3 md:px-4 md:pb-0 md:pt-5">
      <ul role={'navigation'} className="flex flex-1 flex-col gap-y-1">
        <Link href="/" className="hover:text-white">Home</Link>
        <Link href="/system/slowzones" className="hover:text-white">Slow Zones</Link>
        <NavSection title="Subway" content={<SubwaySection />} />
        <NavSection title="Bus" content={<BusSection />} />
      </ul>
    </nav>
  );
};
