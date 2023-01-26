import { useRouter } from 'next/router';
import { DataPage } from '../../constants/datapages';
import { Line } from '../../constants/lines';

export const useDelimitatedRoute = (): { line: Line; datapage: DataPage } => {
  const router = useRouter();
  const path = router.asPath;
  const pathItems = path.split('/');

  return {
    line: pathItems[1] as Line,
    datapage: pathItems[2] as DataPage,
  };
};
