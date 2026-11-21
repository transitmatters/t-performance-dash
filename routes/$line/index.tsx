import { createFileRoute, redirect } from '@tanstack/react-router';
import { Layout } from '../../common/layouts/layoutTypes';
import type { LinePath } from '../../common/types/lines';
import { requireLine } from '../../common/utils/lineRoute';
import { redirectV3Route } from '../../common/utils/middleware';
import { linePathToKeyMap } from '../../common/utils/router';
import { validateLineSearch } from '../../common/utils/searchSchemas';
import { LINE_ENTRY_PATHS } from '../../modules/navigation/lineNav';
import { Overview } from '../../modules/overview/Overview';

export const Route = createFileRoute('/$line/')({
  validateSearch: validateLineSearch,
  beforeLoad: (context) => {
    // Ferry and The RIDE have no overview, so their line URL opens the page the nav links to.
    const entryPath = LINE_ENTRY_PATHS[linePathToKeyMap[context.params.line as LinePath]];
    if (entryPath) {
      const href = `${entryPath}${context.location.searchStr}`;
      throw redirect({ href, replace: true } as Parameters<typeof redirect>[0]);
    }
    requireLine('')(context);
    redirectV3Route(context);
  },
  staticData: { layout: Layout.Dashboard },
  component: Overview,
});
