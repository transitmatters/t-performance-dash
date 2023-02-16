import React from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import { mbtaTextConfig } from '../../common/components/inputs/styles/tailwind';
import { useDelimitatedRoute } from '../../common/utils/router';
import ExploreArrow from '../../public/Icons/Components/ExploreArrow.svg';
import { LINE_COLORS } from '../../common/constants/colors';

interface HomescreenWidgetTitle {
  title: string;
  href: string;
}
export const HomescreenWidgetTitle: React.FC<HomescreenWidgetTitle> = ({ title, href = '/' }) => {
  const { line } = useDelimitatedRoute();
  return (
    <Link href={href}>
      <div className="flex w-full flex-row items-center p-2 text-xl">
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
  );
};
