import { COMMUTER_RAIL_PATH, THE_RIDE_PATH } from '../../common/types/lines';
import { ReliabilityDetails } from '../../modules/reliability/ReliabilityDetails';

export async function getStaticProps() {
  return { props: {} };
}

export async function getStaticPaths() {
  return {
    paths: [COMMUTER_RAIL_PATH, THE_RIDE_PATH],
    fallback: false,
  };
}

export default ReliabilityDetails;
