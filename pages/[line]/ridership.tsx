import {
  ALL_LINE_PATHS,
  BUS_PATH,
  COMMUTER_RAIL_PATH,
  THE_RIDE_PATH,
  FERRY_PATH,
} from '../../common/types/lines';
import { RidershipDetails } from '../../modules/ridership/RidershipDetails';

export async function getStaticProps() {
  return { props: {} };
}

export async function getStaticPaths() {
  return {
    paths: [...ALL_LINE_PATHS, BUS_PATH, COMMUTER_RAIL_PATH, FERRY_PATH, THE_RIDE_PATH],
    fallback: false,
  };
}

export default RidershipDetails;
