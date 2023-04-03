import { ALL_LINE_PATHS, BUS_PATH } from '../../common/types/lines';
import Today from '../../modules/dashboard/Today';

export async function getStaticProps() {
  return { props: {} };
}

export async function getStaticPaths() {
  return {
    paths: [...ALL_LINE_PATHS, BUS_PATH],
    fallback: false,
  };
}

export default Today;
