import { ALL_LINE_PATHS } from '../../../common/types/lines';
import DwellsDetails from '../../../modules/dwells/DwellsDetails';

export async function getStaticProps() {
  return { props: {} };
}

export async function getStaticPaths() {
  return {
    paths: [...ALL_LINE_PATHS],
    fallback: false,
  };
}

export default DwellsDetails;
