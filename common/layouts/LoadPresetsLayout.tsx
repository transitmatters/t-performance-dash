import type { FC, ReactNode } from 'react';
import { usePresetsOnFirstLoad } from '../utils/firstLoad';
import { useDelimitatedRoute } from '../utils/router';
import { ALL_PAGES } from '../constants/pages';

interface LoadPresetsLayoutProps {
  children?: ReactNode;
}
export const LoadPresetsLayout: FC<LoadPresetsLayoutProps> = ({ children }) => {
  const { page, query } = useDelimitatedRoute();
  const dateStoreSection = page ? ALL_PAGES[page]?.dateStoreSection : undefined;
  usePresetsOnFirstLoad(dateStoreSection, query);
  return <>{children}</>;
};
