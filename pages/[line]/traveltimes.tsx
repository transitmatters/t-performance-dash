import { ALL_LINE_PATHS, BUS_PATH } from '../../common/types/lines';
import { TravelTimesDetails } from '../../modules/traveltimes/TravelTimesDetails';

export async function getStaticProps() {
  return { props: {} };
}

export async function getStaticPaths() {
  return {
    paths: [...ALL_LINE_PATHS, BUS_PATH],
    fallback: false,
  };
}

export default TravelTimesDetails;
