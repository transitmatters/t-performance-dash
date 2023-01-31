import { useRouter } from 'next/router';
import { DataPage } from '../../constants/datapages';
import { Line } from '../../constants/lines';

const linePathToKeyMap: Record<string, Line> = {
  red: 'RL',
  orange: 'OL',
  green: 'GL',
  blue: 'BL',
  bus: 'BUS',
};

export const useDelimitatedRoute = (): { line: Line; datapage: DataPage } => {
  const router = useRouter();
  const path = router.asPath;
  const pathItems = path.split('/');

  return {
    line: linePathToKeyMap[pathItems[1]] as Line,
    datapage: pathItems[2] as DataPage,
  };
};
