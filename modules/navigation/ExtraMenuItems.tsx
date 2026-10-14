import React from 'react';
import { i18n } from '../../common/i18n';
import { Link } from '../../common/components/general/Link';
import { DonateButton } from '../../common/components/buttons/DonateButton';
import { SidebarSeparator } from '../../common/components/ui/sidebar';
import { ThemeToggle } from '../../common/components/nav/ThemeToggle';

const LINKS = [
  {
    name: i18n.t('navigation:links.about'),
    href: 'https://transitmatters.org/transitmatters-labs',
  },
  { name: i18n.t('navigation:links.joinUs'), href: 'https://transitmatters.org/join' },
  { name: i18n.t('navigation:links.feedback'), href: 'https://forms.gle/SKYtxgKSyCrYxM1v7' },
  {
    name: i18n.t('navigation:links.source'),
    href: 'https://github.com/transitmatters/t-performance-dash',
  },
  { name: i18n.t('navigation:links.attributions'), href: '/opensource' },
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
