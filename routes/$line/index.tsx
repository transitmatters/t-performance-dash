import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '../../common/layouts/layoutTypes';
import { hasKey } from '../../common/utils/hasKey';
import { hrefRedirect } from '../../common/utils/hrefRedirect';
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
    const { line } = context.params;
    const entryPath = hasKey(linePathToKeyMap, line)
      ? LINE_ENTRY_PATHS[linePathToKeyMap[line]]
      : undefined;
    if (entryPath) {
      const href = `${entryPath}${context.location.searchStr}`;
      throw hrefRedirect(href);
    }
    requireLine('')(context);
    redirectV3Route(context);
  },
  staticData: { layout: Layout.Dashboard },
  component: Overview,
});
