import { ALL_LINE_PATHS } from '../../common/types/lines';
import { FleetDetails } from '../../modules/fleet/FleetDetails';

export async function getStaticProps() {
  return { props: {} };
}

export async function getStaticPaths() {
  return {
    paths: ALL_LINE_PATHS,
    fallback: false,
  };
}

export default FleetDetails;
