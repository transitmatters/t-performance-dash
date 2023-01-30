import Train from '../public/Icons/Train.svg';
import Heart from '../public/Icons/Heart.svg';

export type NavBarItem = {
  name: NavBarItemNames;
  icon: React.FC<any>; // TODO: get type for SVGS.
  type: NavBarTypes;
};

export type NavBarItemNames =
  | 'Lines'
  | 'Slow Zones'
  | 'New Train Tracker'
  | 'Service & Recovery'
  | 'Donate';

export enum NavBarKeys {
  list = 'listbox',
  button = 'button',
}

export type NavBarTypes = NavBarKeys;

export const NAV_BAR_LINKS: Record<string, NavBarItem> = {
  line: { name: 'Lines', icon: Train, type: NavBarKeys.list },
  donate: { name: 'Donate', icon: Heart, type: NavBarKeys.button },
};
