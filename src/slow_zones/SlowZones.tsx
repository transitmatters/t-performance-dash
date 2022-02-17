import { useEffect, useState } from "react";
import { ChartView, Direction, SlowZone } from "./types";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import xrange from "highcharts/modules/xrange";
import exporting from "highcharts/modules/exporting";

import {
  formatSlowZones,
  generateLineOptions,
  generateXrangeOptions,
  X_MIN,
} from "./formattingUtils";
import { APP_DATA_BASE_PATH } from "../constants";
xrange(Highcharts);
exporting(Highcharts);

export const SlowZones = () => {
  const [options, setOptions] = useState<Highcharts.Options>();
  const [chartView, setChartView] = useState<ChartView>("line");
  const [direction, setDirection] = useState<Direction>("southbound");

  useEffect(() => {
    if (chartView === "line") {
      const url = new URL(
        `${APP_DATA_BASE_PATH}/static/slowzones/delay_totals.json`,
        window.location.origin
      );
      fetch(url.toString())
        .then((resp) => resp.json())
        .then((data) => {
          const filteredData = data.filter(
            (d: any) => new Date(d.date) > X_MIN
          );
          const options = generateLineOptions(filteredData, setChartView);
          setOptions(options);
        });
    } else {
      const url = new URL(
        `${APP_DATA_BASE_PATH}/static/slowzones/all_slow.json`,
        window.location.origin
      );
      fetch(url.toString())
        .then((resp) => resp.json())
        .then((data) => {
          const formattedData = formatSlowZones(data);
          const filteredData = formattedData.filter(
            (d: SlowZone) => d.start > X_MIN
          );

          const options = generateXrangeOptions(
            filteredData.filter((d: SlowZone) => d.direction === direction),
            setChartView,
            direction,
            setDirection
          );
          setOptions(options);
        });
    }
  }, [chartView]);

  return (
    <HighchartsReact
      containerProps={{ style: { height: "75vh", paddingTop: "20px" } }}
      options={options}
      highcharts={Highcharts}
      immutable={true}
    />
  );
};
