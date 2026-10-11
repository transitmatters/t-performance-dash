import React from 'react';
import { useLocation } from '@tanstack/react-router';
import { getMetaTagEntries, getMetaTags, lineShortFor } from '../utils/metaTags';
import { useIsNotFound } from '../utils/router';
import { getParentStationForStopId } from '../utils/stations';

/** "Davis to Porter", when both stops resolve. Stop ids alone would say nothing to a reader. */
function getTripSummary(query: Record<string, unknown>, lineShort: string | undefined) {
  const from = typeof query.from === 'string' ? query.from : undefined;
  const to = typeof query.to === 'string' ? query.to : undefined;
  if (!from || !to) return undefined;
  try {
    const fromStation = getParentStationForStopId(from, lineShort as never);
    const toStation = getParentStationForStopId(to, lineShort as never);
    if (!fromStation?.stop_name || !toStation?.stop_name) return undefined;
    return `${fromStation.stop_name} to ${toStation.stop_name}`;
  } catch {
    return undefined;
  }
}

/** React 19 hoists these into <head>; the build prerenders the same tags for link crawlers. */
export const DynamicMetaTags: React.FC = () => {
  const { pathname, search, searchStr } = useLocation();
  const notFound = useIsNotFound();
  // A 404 carries the generic tags, as the prerendered 404.html does, whatever line the URL names.
  const tags = notFound
    ? getMetaTags('/404/')
    : getMetaTags(
        pathname,
        search,
        getTripSummary(search, lineShortFor(pathname.split('/')[1])),
        searchStr
      );

  return (
    <>
      {getMetaTagEntries(tags).map(([attribute, key, content]) => (
        <meta key={key} {...{ [attribute]: key }} content={content} />
      ))}
    </>
  );
};
