import { capitalize } from 'lodash';
import { useRouter } from 'next/router';
import { DataPage } from '../../types/dataPages';
import { Line, LineMetadata, LinePath, LineShort } from '../../types/lines';

const linePathToKeyMap: Record<string, Line> = {
  red: 'RL',
  orange: 'OL',
  green: 'GL',
  blue: 'BL',
  bus: 'BUS',
};
export type Route = {
  line: Line | undefined;
  linePath: LinePath;
  lineShort: LineShort;
  datapage: DataPage;
};

export const useDelimitatedRoute = (): Route => {
  const router = useRouter();
  const path = router.asPath;
  const pathItems = path.split('/');

  return {
    line: linePathToKeyMap[pathItems[1]],
    linePath: pathItems[1] as LinePath, //TODO: Remove as
    lineShort: capitalize(pathItems[1]) as LineShort, //TODO: Remove as
    datapage: pathItems[2] as DataPage, //TODO: Remove as
  };
};

// If a datapage is selected, stay on that datapage. If the current line is selected, go to overview.
export const getLineSelectionItemHref = (metadata: LineMetadata, route: Route): string => {
  let href = `/${metadata.path}`;
  if (metadata.key !== route.line && route.datapage) {
    href += `/${route.datapage}`;
  }
  return href;
};
