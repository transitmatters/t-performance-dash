import { ALL_LINE_PATHS } from '../../common/types/lines';
import { SlowZonesDetails } from '../../modules/slowzones/SlowZonesDetails';

export async function getStaticProps() {
  return { props: {} };
}

export async function getStaticPaths() {
  return {
    paths: ALL_LINE_PATHS.filter((p) => p.params.line !== 'green'),
    fallback: false,
  };
}

export default SlowZonesDetails;
