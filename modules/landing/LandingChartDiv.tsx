import type { ReactElement } from 'react';

interface LandingChartDivProps {
  children: ReactElement[];
}

export const LandingChartDiv = ({ children }: LandingChartDivProps) => {
  return (
    <div className="flex h-fit w-full max-w-lg flex-col gap-y-1 rounded-md border-2 border-slate-600 bg-white px-4 py-2 lg:max-w-md xl:max-w-lg">
      {children}
    </div>
  );
};
