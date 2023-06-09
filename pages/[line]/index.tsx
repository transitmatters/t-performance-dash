import { ALL_LINE_PATHS } from '../../common/types/lines';
import { Overview } from '../../modules/dashboard/Overview';

export async function getStaticProps() {
  return { props: {} };
}

export async function getStaticPaths() {
  return {
    paths: [...ALL_LINE_PATHS],
    fallback: false,
  };
}

export default Overview;
