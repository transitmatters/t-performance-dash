import type { AnchorHTMLAttributes, ComponentProps, FC, Ref } from 'react';
import { Link as RouterLink } from '@tanstack/react-router';
import type { SearchObject } from '../../utils/searchParams';
import { parseSearch, stringifySearch } from '../../utils/searchParams';

/** A URL string, or the `{ pathname, query }` object form `useGenerateHref` builds. */
export type Href = string | { pathname: string; query?: SearchObject };

export const hrefToString = (href: Href) =>
  typeof href === 'string' ? href : `${href.pathname}${stringifySearch(href.query ?? {})}`;

const isExternal = (href: string) => /^([a-z][a-z\d+.-]*:|\/\/)/i.test(href);

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: Href;
  ref?: Ref<HTMLAnchorElement>;
};

export const Link: FC<LinkProps> = ({ href, ...props }) => {
  const url = hrefToString(href);
  if (isExternal(url)) return <a href={url} {...props} />;
  // Split into to/search/hash rather than passing `href`: Link memoizes its destination on those,
  // not on `href`, so an `href` that changes between renders would keep pointing at the old URL.
  const { pathname, search, hash } = new URL(url, 'http://placeholder');
  const routerProps = {
    to: pathname,
    search: parseSearch(search),
    hash: hash ? hash.slice(1) : undefined,
  } as unknown as ComponentProps<typeof RouterLink>;
  return <RouterLink {...routerProps} {...props} />;
};
