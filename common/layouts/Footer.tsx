import Link from 'next/link';
import React from 'react';

import classNames from 'classnames';
import packageJson from '../../package.json';

interface FooterProps {
  isLanding?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ isLanding = false }) => {
  const { version } = packageJson;

  return (
    <footer
      className={classNames(
        'pb-safe mb-24 mt-5 text-center text-sm md:mb-0 md:pb-2 md:pl-64',
        isLanding && 'z-10'
      )}
    >
      Version:{' '}
      <Link
        href={`https://github.com/transitmatters/t-performance-dash/releases/tag/${version.substring(
          0,
          3
        )}`}
      >
        {version}
      </Link>{' '}
      |{' '}
      <Link
        className={'text-blue-600 hover:text-black dark:text-blue-500'}
        href="https://transitmatters.org/transitmatters-labs"
      >
        TransitMatters Labs
      </Link>{' '}
      |{' '}
      <Link
        className={'text-blue-600 hover:text-black dark:text-blue-500'}
        href="https://transitmatters.org/join"
      >
        Join TransitMatters
      </Link>{' '}
      |{' '}
      <Link
        className={'text-blue-600 hover:text-black dark:text-blue-500'}
        href="https://github.com/transitmatters/t-performance-dash"
      >
        Source code
      </Link>{' '}
      |{' '}
      <Link className={'text-blue-600 hover:text-black dark:text-blue-500'} href="/opensource">
        Attributions
      </Link>{' '}
      |{' '}
      <Link
        className={'text-blue-600 hover:text-black dark:text-blue-500'}
        href="mailto:labs@transitmatters.org?subject=[Data%20Dashboard%20Feedback]%20-%20"
      >
        Send feedback
      </Link>
    </footer>
  );
};
