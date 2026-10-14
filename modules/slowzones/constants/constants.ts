import { i18n } from '../../../common/i18n';
import type { Direction } from '../../../common/types/dataPoints';

export const DirectionObject: { [key in Direction]: string } = {
  northbound: i18n.t('slowzones:directions.northbound'),
  southbound: i18n.t('slowzones:directions.southbound'),
};
