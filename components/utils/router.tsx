import { useRouter } from 'next/router';
import { DataPage } from '../../constants/datapages';
import { Line, LinePath } from '../../constants/lines';

const linePathToKeyMap: Record<string, Line> = {
  red: 'RL',
  orange: 'OL',
  green: 'GL',
  blue: 'BL',
  bus: 'BUS',
};

export const useDelimitatedRoute = (): { line: Line; linePath: LinePath; datapage: DataPage } => {
  const router = useRouter();
  const path = router.asPath;
  const pathItems = path.split('/');

  return {
    line: linePathToKeyMap[pathItems[1]] as Line,
    linePath: pathItems[1] as LinePath,
    datapage: pathItems[2] as DataPage,
  };
};
