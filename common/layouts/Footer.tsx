import Link from 'next/link';
import React from 'react';

import { version } from '../../package.json';

export const Footer: React.FC = () => {
  return (
    <footer className={'mt-5 text-center text-sm'}>
      <Link
        className={'text-blue-600 hover:text-black dark:text-blue-500'}
        href="https://transitmatters.org/transitmatters-labs"
      >
        TransitMatters Labs
      </Link>{' '}
      |{' '}
      <Link
        className={'text-blue-600 hover:text-black dark:text-blue-500'}
        href="https://transitmatters.org/blog/slowzones"
      >
        Release blog
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
        🚀 Send feedback
      </Link>
      <div className={'mt-1'}>
        Version:{' '}
        <Link
          href={`https://github.com/transitmatters/t-performance-dash/releases/tag/${version.substring(
            0,
            3
          )}`}
        >
          {version}
        </Link>
      </div>
    </footer>
  );
};
