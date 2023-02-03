import { useRouter } from 'next/router';
import { DataPage } from '../../types/dataPages';
import { Line, LineMetadata, LinePath } from '../../types/lines';

const linePathToKeyMap: Record<string, Line> = {
  red: 'RL',
  orange: 'OL',
  green: 'GL',
  blue: 'BL',
  bus: 'BUS',
};
export type Route = {
  line: Line;
  linePath: LinePath;
  datapage: DataPage;
};

export const useDelimitatedRoute = (): Route => {
  const router = useRouter();
  const path = router.asPath;
  const pathItems = path.split('/');

  return {
    line: linePathToKeyMap[pathItems[1]] as Line,
    linePath: pathItems[1] as LinePath,
    datapage: pathItems[2] as DataPage,
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
