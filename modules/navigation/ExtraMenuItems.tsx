import { DonateButton } from '../../common/components/buttons/DonateButton';
import { SidebarSeparator } from '../../common/components/ui/sidebar';
import { ThemeToggle } from '../../common/components/nav/ThemeToggle';

/** Kept short so lines stay above the fold; the utility links are in SiteFooter. */
export const ExtraMenuItems = () => {
  return (
    <div className="flex flex-col gap-2 pb-1">
      <SidebarSeparator className="mx-0" />
      <ThemeToggle />
      <DonateButton />
    </div>
  );
};
