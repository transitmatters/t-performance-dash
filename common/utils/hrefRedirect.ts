import { redirect } from '@tanstack/react-router';

/**
 * A redirect that replaces the current history entry with an app URL. TanStack's types require a
 * typed route `to`, but the router navigates to `href` alone.
 */
export const hrefRedirect = (href: string) =>
  // oxlint-disable-next-line typescript/consistent-type-assertions -- see above
  redirect({ href, replace: true } as Parameters<typeof redirect>[0]);
