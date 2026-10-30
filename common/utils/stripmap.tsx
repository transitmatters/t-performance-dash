import type { WatermarkOptions } from '@transitmatters/stripmap';

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

export const getStripMapWatermark = (isHorizontal: boolean, isDark: boolean): WatermarkOptions => ({
  // Vertical maps end at a terminal label in the bottom-right corner
  position: isHorizontal ? 'bottom-right' : 'bottom-left',
  opacity: 0.2,
  content: (
    <img
      src={isDark ? '/Logo_wordmark_white.png' : '/Logo_wordmark.png'}
      alt="TransitMatters"
      width={isHorizontal ? 160 : 120}
    />
  ),
});
