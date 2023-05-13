import React from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import { mbtaTextConfig } from '../../common/components/inputs/styles/tailwind';
import { getHref, useDelimitatedRoute, useHandlePageNavigation } from '../../common/utils/router';
import ExploreArrow from '../../public/Icons/Components/ExploreArrow.svg';
import { LINE_COLORS } from '../../common/constants/colors';
import type { Page } from '../../common/constants/pages';
import { ALL_PAGES } from '../../common/constants/pages';
import { useDashboardConfig } from '../../common/state/dashboardConfig';

interface HomescreenWidgetTitle {
  title: string;
  tab: Page;
}
export const HomescreenWidgetTitle: React.FC<HomescreenWidgetTitle> = ({ title, tab }) => {
  const { line, page, query, linePath } = useDelimitatedRoute();
  const handlePageNavigation = useHandlePageNavigation();
  const dashboardConfig = useDashboardConfig();
  const href = getHref(dashboardConfig, ALL_PAGES[tab], page, query, linePath);
  return (
    <div className="flex w-full items-baseline justify-between p-2">
      <Link onClick={() => handlePageNavigation(ALL_PAGES[tab])} href={href}>
        <div className="flex w-full cursor-pointer flex-row items-center text-xl">
          <h3
            className={classNames(
              'font-semibold',
              line ? mbtaTextConfig[line] : 'text-design-subtitleGrey'
            )}
          >
            {title}
          </h3>
          <ExploreArrow fill={LINE_COLORS[line ?? 'default']} className="h-4 w-auto pl-2" />
        </div>
      </Link>
      <p className="text-xs italic text-stone-700">{`Date Placeholder`}</p>
    </div>
  );
};
