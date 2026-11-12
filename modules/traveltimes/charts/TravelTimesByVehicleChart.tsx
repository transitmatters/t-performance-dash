import { Bar } from '@chartjs-components';
import { useMemo, useRef } from 'react';
import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import { CHART_COLORS, LINE_COLORS } from '../../../common/constants/colors';
import { watermarkLayout } from '../../../common/constants/charts';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { useChartTheme } from '../../../common/utils/chartTheme';
import { ChartDiv } from '../../../common/components/charts/ChartDiv';
import { ChartStack } from '../../../common/components/charts/ChartStack';
import { DownloadButton } from '../../../common/components/buttons/DownloadButton';
import { SaveChartImageButton } from '../../../common/components/buttons/SaveChartImageButton';
import type { Location } from '../../../common/types/charts';
import type { Line } from '../../../common/types/lines';
import { hexWithAlpha } from '../../../common/utils/general';
import { useLineColorKey } from '../../../common/utils/router';
import { getFormattedTimeString } from '../../../common/utils/time';
import type { FleetType } from '../../fleet/constants/fleetTypes';
import type { VehicleTravelTime } from '../utils/byVehicle';
import { MIXED_FLEET } from '../utils/byVehicle';

interface TravelTimesByVehicleChartProps {
  data: VehicleTravelTime[];
  line: Line | undefined;
  carTypes: FleetType[] | undefined;
  vehicleNoun: 'Train' | 'Bus';
  date: string;
  location: Location;
}

interface BarGroup {
  key: string | null;
  label: string;
  color: string;
}

/**
 * One bar group per car type seen, tinted by age like the fleet mix chart, so a type keeps its
 * colour across pages, and is named even when it is the only one. Trains of more than one type,
 * and cars outside every known range, are grey.
 */
const getBarGroups = (
  data: VehicleTravelTime[],
  carTypes: FleetType[] | undefined,
  lineColor: string
): BarGroup[] => {
  const seen = new Set(data.map((vehicle) => vehicle.fleet_type));
  const typeGroups = (carTypes ?? [])
    .map((type, index, types) => ({
      key: type.key,
      label: type.label,
      color: hexWithAlpha(lineColor, 0.25 + (0.75 * index) / Math.max(types.length - 1, 1)),
    }))
    .filter((group) => seen.has(group.key));
  const otherGroups = [
    { key: MIXED_FLEET, label: 'Mixed', color: CHART_COLORS.BLOCKS_SOLID },
    { key: null, label: 'Unknown', color: CHART_COLORS.BLOCKS_SOLID },
  ].filter((group) => seen.has(group.key));
  const groups = [...typeGroups, ...otherGroups];
  // With no known car type, there is nothing to label: one group in the line colour.
  return typeGroups.length > 0 ? groups : [{ key: null, label: 'All', color: lineColor }];
};

export const TravelTimesByVehicleChart = ({
  data,
  line,
  carTypes,
  vehicleNoun,
  date,
  location,
}: TravelTimesByVehicleChartProps) => {
  const ref = useRef(null);
  const chartTheme = useChartTheme();
  const isMobile = !useBreakpoint('md');
  const colorKey = useLineColorKey(line);
  const lineColor = LINE_COLORS[colorKey ?? 'default'];
  // Bus stops have no stored distances, so buses are compared by travel time instead.
  const showSpeed = data.every((vehicle) => vehicle.median_speed_mph !== null);
  const groups = useMemo(
    () => getBarGroups(data, carTypes, lineColor),
    [data, carTypes, lineColor]
  );
  const showLegend = groups.some((group) => group.key !== null);
  const noun = vehicleNoun.toLowerCase();

  const getValue = (vehicle: VehicleTravelTime) =>
    showSpeed ? vehicle.median_speed_mph : vehicle.median_travel_time_sec / 60;

  return (
    <ChartStack>
      <ChartDiv isMobile={isMobile}>
        <Bar
          id={`traveltimes-by-${noun}`}
          ref={ref}
          height={isMobile ? 200 : 240}
          redraw={true}
          data={{
            labels: data.map((vehicle) => vehicle.vehicle),
            datasets: groups.map((group) => ({
              label: group.label,
              backgroundColor: group.color,
              borderRadius: 4,
              data: data.map((vehicle) =>
                !showLegend || vehicle.fleet_type === group.key ? getValue(vehicle) : null
              ),
            })),
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            // @ts-expect-error The watermark plugin doesn't have typescript support
            watermark: watermarkLayout(isMobile),
            plugins: {
              legend: {
                display: showLegend,
                position: 'bottom',
                labels: { boxWidth: 15, color: chartTheme.tick },
              },
              tooltip: {
                callbacks: {
                  hoverCard: (items) => {
                    const item = items.find((i) => i.parsed.y !== null);
                    if (!item) return null;
                    const vehicle = data[item.dataIndex];
                    const group = groups.find((g) => g.key === vehicle.fleet_type) ?? groups[0];
                    const rows = [
                      { label: 'Trips', value: vehicle.trips.toLocaleString() },
                      ...(showLegend ? [{ label: 'Type', value: group.label }] : []),
                      ...(vehicle.cars && vehicle.cars !== vehicle.vehicle
                        ? [{ label: 'Cars', value: vehicle.cars }]
                        : []),
                    ];
                    return {
                      title: `${vehicleNoun} ${vehicle.vehicle}`,
                      hero: showSpeed
                        ? {
                            value: `${vehicle.median_speed_mph}`,
                            unit: 'mph',
                            caption: 'Median speed',
                            color: group.color,
                          }
                        : {
                            value: getFormattedTimeString(vehicle.median_travel_time_sec),
                            caption: 'Median travel time',
                            color: group.color,
                          },
                      rows,
                    };
                  },
                },
              },
            },
            scales: {
              x: {
                stacked: true,
                grid: { display: false },
                ticks: { color: chartTheme.tick },
                title: {
                  display: true,
                  text: vehicleNoun === 'Bus' ? 'Bus number' : 'Lead car',
                  color: chartTheme.tick,
                },
              },
              y: {
                stacked: true,
                beginAtZero: true,
                grid: { color: chartTheme.grid },
                ticks: {
                  color: chartTheme.tick,
                  callback: (value) =>
                    typeof value === 'number' && !showSpeed
                      ? getFormattedTimeString(value, 'minutes')
                      : value,
                },
                title: {
                  display: true,
                  text: showSpeed ? 'Miles per hour' : 'Minutes',
                  color: chartTheme.tick,
                },
              },
            },
          }}
          plugins={[ChartjsPluginWatermark]}
        />
      </ChartDiv>
      <div className="flex flex-row justify-end">
        <div className="-mr-2.5 flex shrink-0 flex-row items-center gap-x-0.5 whitespace-nowrap">
          <SaveChartImageButton
            chartRef={ref}
            datasetName="traveltimes-by-vehicle"
            location={location}
            includeBothStopsForLocation={true}
            startDate={date}
          />
          <DownloadButton
            data={data}
            datasetName={`traveltimes by ${noun}`}
            location={location}
            includeBothStopsForLocation={true}
            startDate={date}
          />
        </div>
      </div>
    </ChartStack>
  );
};
