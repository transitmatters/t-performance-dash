import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { WidgetDiv } from '../../../common/components/widgets';

type Props = {
  href: null | string;
  title: React.ReactNode;
  topRight?: React.ReactNode;
  children: React.ReactNode;
  details?: React.ReactNode;
};

export const CardFrame = (props: Props) => {
  const { title, href, topRight = null, details = null, children } = props;

  const titleElement = href ? (
    <Link href={href} className="flex items-center">
      {title}
      <FontAwesomeIcon icon={faChevronRight} className="h-4 w-auto pl-2" />
    </Link>
  ) : (
    title
  );

  const renderTopRow = () => {
    return (
      <div className="flex-row">
        <h2 className="text-xl font-semibold">
          {titleElement}
          {topRight}
        </h2>
      </div>
    );
  };

  const renderDetails = () => {
    if (details) {
      return <div>{details}</div>;
    }
    return null;
  };

  return (
    <WidgetDiv className="pb-16">
      {renderTopRow()}
      {renderDetails()}
      {children}
    </WidgetDiv>
  );
};
