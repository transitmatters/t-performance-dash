import type { FC } from 'react';
import { useDelimitatedRoute } from '../../utils/router';
import { Notice } from './Notice';

export const GreenLineSlowZoneNotice: FC = () => {
  const { line } = useDelimitatedRoute();

  if (line !== 'line-green') {
    return null;
  }

  return (
    <Notice variant="warning" title="Green Line slow zones are less precise">
      <p>
        Green Line service is more variable than on the heavy rail lines, and much of it runs on the
        street rather than on a{' '}
        <a href="https://en.wikipedia.org/wiki/Grade_separation">grade-separated</a> right-of-way.
        Slow zone detection here is more prone to error than on other lines.
      </p>
    </Notice>
  );
};
