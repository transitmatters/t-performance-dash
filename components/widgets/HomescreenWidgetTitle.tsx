import React from 'react';
import ExploreArrow from '../../public/Icons/Components/ExploreArrow.svg';

interface HomescreenWidgetTitle {
  title: string;
}
export const HomescreenWidgetTitle: React.FC<HomescreenWidgetTitle> = ({ title }) => {
  return (
    <div className="flex w-full flex-row items-center justify-between text-xl">
      <h3>{title}</h3>
      <div className="flex flex-row items-center gap-x-2">
        <h3 className="text-base text-design-darkGrey">Explore</h3>
        <ExploreArrow className="h-3 w-auto" alt="Go" />
      </div>
    </div>
  );
};
