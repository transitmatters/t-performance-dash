import type { FC, ReactNode } from 'react';
import { CIPBanner } from '../components/CIPBanner';

interface LandingLayoutProps {
  children: ReactNode;
}

export const LandingLayout: FC<LandingLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-1 flex-col">
      <CIPBanner />
      <div className="flex-1">{children}</div>
    </div>
  );
};
