import { ALL_LINE_PATHS } from '../../common/types/lines';
import { PredictionsDetails } from '../../modules/predictions/PredictionsDetails';

export async function getStaticProps() {
  return { props: {} };
}

export async function getStaticPaths() {
  return {
    paths: ALL_LINE_PATHS,
    fallback: false,
  };
}

export default PredictionsDetails;
