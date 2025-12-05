import { ALL_LINE_PATHS, COMMUTER_RAIL_PATH } from '../../common/types/lines';
import { DelaysDetails } from '../../modules/delays/DelaysDetails';

export async function getStaticProps() {
  return { props: {} };
}

export async function getStaticPaths() {
  return {
    paths: [...ALL_LINE_PATHS, COMMUTER_RAIL_PATH],
    fallback: false,
  };
}

export default DelaysDetails;
