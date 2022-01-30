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
} from "./formattingUtils";
import { APP_DATA_BASE_PATH } from "../constants";
xrange(Highcharts);
exporting(Highcharts);

export const SlowZones = () => {
  const [options, setOptions] = useState<Highcharts.Options>();
  const [chartView, setChartView] = useState<ChartView>("line");
  const [direction, setDirection] = useState<Direction>("southbound");
  const [data, setData] = useState();

  useEffect(() => {
    const url = new URL(
      `${APP_DATA_BASE_PATH}/static/slow-zones/all_slow.json`,
      window.location.origin
    );
    fetch(url.toString())
      .then((resp) => resp.json())
      .then((data) => setData(data));
  }, []);

  useEffect(() => {
    if (data) {
      const xmin = new Date(2021, 1, 1);
      const formattedData = formatSlowZones(data);
      const filteredData = formattedData.filter(
        (d: SlowZone) => d.start > xmin
      );

      const options =
        chartView === "line"
          ? generateLineOptions(filteredData, setChartView)
          : generateXrangeOptions(
              filteredData.filter((d: SlowZone) => d.direction === direction),
              setChartView,
              direction,
              setDirection
            );
      setOptions(options);
    }
  }, [data, chartView, direction]);

  return (
    <HighchartsReact
      containerProps={{ style: { height: "75vh", paddingTop: "20px" } }}
      options={options}
      highcharts={Highcharts}
      immutable={true}
    />
  );
};
