import type { WatermarkOptions } from '@transitmatters/stripmap';
import { WATERMARK, watermarkSize } from '../constants/charts';

export const abbreviateStationName = ({ stationName }: { stationName: string }) => {
  if (stationName.startsWith('JFK')) {
    return 'JFK';
  }
  return stationName
    .replace('Downtown Crossing', 'Dwntn Crossing')
    .replace('Boston University', 'BU')
    .replace('Hynes Convention Center', 'Hynes')
    .replace('Government Center', "Gov't Center")
    .replace('Northeastern University', 'Northeastern')
    .replace('Museum of Fine Arts', 'MFA')
    .replace('Massachusetts Avenue', 'Mass Ave')
    .replace('North Quincy', 'N. Quincy');
};

// Green is wide enough that stripmap's default minimum horizontal scale (1.8) shrinks its station
// names to about 7px, too small to read at 45°. Zoom it to match the other lines; the map scrolls instead.
export const getMinHorizontalScale = (lineName: string) => (lineName === 'Green' ? 2.4 : undefined);

export const getStripMapWatermark = (isHorizontal: boolean, isDark: boolean): WatermarkOptions => ({
  // Vertical maps end at a terminal label in the bottom-right corner
  position: isHorizontal ? 'bottom-right' : 'bottom-left',
  opacity: WATERMARK.opacity,
  content: (
    <img
      src={WATERMARK.src[isDark ? 'dark' : 'light']}
      alt="TransitMatters"
      // Vertical maps are the narrow, phone layout
      width={watermarkSize(!isHorizontal).width}
    />
  ),
});
