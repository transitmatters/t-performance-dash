import { ALL_LINE_PATHS, BUS_PATH, COMMUTER_RAIL_PATH, FERRY_PATH } from '../../common/types/lines';
import { Overview } from '../../modules/dashboard/Overview';

export async function getStaticProps() {
  return { props: {} };
}

export async function getStaticPaths() {
  return {
    paths: [...ALL_LINE_PATHS, BUS_PATH, COMMUTER_RAIL_PATH, FERRY_PATH],
    fallback: false,
  };
}

export default Overview;
