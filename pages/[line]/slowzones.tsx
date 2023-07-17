import { ALL_LINE_PATHS } from '../../common/types/lines';
import { SlowZonesDetails } from '../../modules/slowzones/SlowZonesDetails';

export async function getStaticProps() {
  return { props: {} };
}

export async function getStaticPaths() {
  return {
    paths: ALL_LINE_PATHS,
    fallback: false,
  };
}

export default SlowZonesDetails;
