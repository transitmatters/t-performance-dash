import Link from 'next/link';
import React from 'react';
import { DonateButton } from '../../common/components/buttons/DonateButton';
import { SidebarSeparator } from '../../common/components/ui/sidebar';
import { ThemeToggle } from '../../common/components/nav/ThemeToggle';

const LINKS = [
  { name: 'About', href: 'https://transitmatters.org/transitmatters-labs' },
  { name: 'Join us', href: 'https://transitmatters.org/join' },
  { name: 'Feedback', href: 'https://forms.gle/SKYtxgKSyCrYxM1v7' },
  { name: 'Source', href: 'https://github.com/transitmatters/t-performance-dash' },
  { name: 'Attributions', href: '/opensource' },
];

/**
 * Utility links are secondary to the nav, so they wrap inline rather than taking a row each —
 * stacked, they cost enough vertical space to push lines below the fold.
 */
export const ExtraMenuItems: React.FC = () => {
  return (
    <div className="flex flex-col gap-2 pb-1">
      <SidebarSeparator className="mx-0" />
      <ul className="flex flex-wrap gap-x-3 gap-y-1 px-2 text-xs">
        {LINKS.map((link) => (
          <li key={link.name}>
            <Link
              href={link.href}
              className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:underline"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
      <ThemeToggle />
      <DonateButton />
    </div>
  );
};
